using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public sealed class ChromiumScreenshotService
{
    private static readonly TimeSpan BrowserStartupTimeout = TimeSpan.FromSeconds(8);

    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ChromiumScreenshotService> _logger;

    public ChromiumScreenshotService(
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        ILogger<ChromiumScreenshotService> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<byte[]> CapturePngAsync(
        string url,
        int width,
        int height,
        string readyExpression,
        TimeSpan readyTimeout,
        CancellationToken cancellationToken)
    {
        EnsureLocalCaptureUrl(url);

        var executable = FindChromiumExecutable();
        if (string.IsNullOrWhiteSpace(executable))
            throw new InvalidOperationException("Chromium was not found. Set Screenshot:ChromiumPath or CHROMIUM_PATH.");

        var port = GetFreePort();
        var userDataDir = Path.Combine(Path.GetTempPath(), $"osu-fellas-chromium-{Guid.NewGuid():N}");
        Directory.CreateDirectory(userDataDir);

        using var process = StartChromium(executable, port, userDataDir);
        try
        {
            await WaitForDevToolsAsync(port, cancellationToken);
            var pageWebSocketUrl = await CreatePageAsync(port, url, cancellationToken);

            using var socket = new ClientWebSocket();
            await socket.ConnectAsync(new Uri(pageWebSocketUrl), cancellationToken);

            var commandId = 0;
            await SendCommandAsync(socket, commandId: ++commandId, "Page.enable", null, cancellationToken);
            await SendCommandAsync(socket, commandId: ++commandId, "Runtime.enable", null, cancellationToken);
            await SendCommandAsync(socket, commandId: ++commandId, "Emulation.setDeviceMetricsOverride", new
            {
                width,
                height,
                deviceScaleFactor = 1,
                mobile = false
            }, cancellationToken);

            await SendCommandAsync(socket, commandId: ++commandId, "Page.navigate", new { url }, cancellationToken);
            await WaitForExpressionAsync(socket, commandId, readyExpression, readyTimeout, cancellationToken);

            commandId += 1000;
            await SendCommandAsync(socket, commandId: ++commandId, "Runtime.evaluate", new
            {
                expression = "document.fonts ? document.fonts.ready.then(() => true) : true",
                awaitPromise = true,
                returnByValue = true
            }, cancellationToken);

            await Task.Delay(650, cancellationToken);

            var screenshot = await SendCommandAsync(socket, commandId: ++commandId, "Page.captureScreenshot", new
            {
                format = "png",
                fromSurface = true,
                captureBeyondViewport = false
            }, cancellationToken);

            var data = screenshot
                .GetProperty("result")
                .GetProperty("data")
                .GetString();

            if (string.IsNullOrWhiteSpace(data))
                throw new InvalidOperationException("Chromium returned an empty screenshot.");

            return Convert.FromBase64String(data);
        }
        finally
        {
            TryStopChromium(process);
            TryDeleteDirectory(userDataDir);
        }
    }

    private static void EnsureLocalCaptureUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            || !IsLoopbackHost(uri.Host))
        {
            throw new InvalidOperationException("Screenshot capture is restricted to loopback URLs.");
        }
    }

    private static bool IsLoopbackHost(string host)
    {
        return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase)
            || IPAddress.TryParse(host, out var address) && IPAddress.IsLoopback(address);
    }

    private Process StartChromium(string executable, int port, string userDataDir)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = executable,
            RedirectStandardError = true,
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        startInfo.ArgumentList.Add("--headless=new");
        startInfo.ArgumentList.Add("--disable-gpu");
        startInfo.ArgumentList.Add("--disable-dev-shm-usage");
        startInfo.ArgumentList.Add("--disable-extensions");
        startInfo.ArgumentList.Add("--disable-background-networking");
        startInfo.ArgumentList.Add("--hide-scrollbars");
        startInfo.ArgumentList.Add("--mute-audio");
        startInfo.ArgumentList.Add("--no-first-run");
        startInfo.ArgumentList.Add("--no-sandbox");
        startInfo.ArgumentList.Add("--disable-setuid-sandbox");
        startInfo.ArgumentList.Add($"--remote-debugging-port={port}");
        startInfo.ArgumentList.Add($"--user-data-dir={userDataDir}");
        startInfo.ArgumentList.Add("about:blank");

        var process = Process.Start(startInfo)
            ?? throw new InvalidOperationException("Could not start Chromium.");

        process.ErrorDataReceived += (_, args) =>
        {
            if (!string.IsNullOrWhiteSpace(args.Data))
                _logger.LogDebug("Chromium stderr: {Line}", args.Data);
        };
        process.OutputDataReceived += (_, args) =>
        {
            if (!string.IsNullOrWhiteSpace(args.Data))
                _logger.LogDebug("Chromium stdout: {Line}", args.Data);
        };
        process.BeginErrorReadLine();
        process.BeginOutputReadLine();

        return process;
    }

    private async Task WaitForDevToolsAsync(int port, CancellationToken cancellationToken)
    {
        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(BrowserStartupTimeout);

        var http = _httpClientFactory.CreateClient();
        var url = $"http://127.0.0.1:{port}/json/version";

        while (!timeoutCts.IsCancellationRequested)
        {
            try
            {
                using var response = await http.GetAsync(url, timeoutCts.Token);
                if (response.IsSuccessStatusCode)
                    return;
            }
            catch when (!timeoutCts.IsCancellationRequested)
            {
                await Task.Delay(150, timeoutCts.Token);
            }
        }

        throw new TimeoutException("Chromium DevTools did not start in time.");
    }

    private async Task<string> CreatePageAsync(int port, string url, CancellationToken cancellationToken)
    {
        var http = _httpClientFactory.CreateClient();
        var endpoint = $"http://127.0.0.1:{port}/json/new?{Uri.EscapeDataString(url)}";
        using var request = new HttpRequestMessage(HttpMethod.Put, endpoint);
        using var response = await http.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Chromium could not create a page: {(int)response.StatusCode} {content}");

        using var document = JsonDocument.Parse(content);
        var webSocketUrl = document.RootElement.GetProperty("webSocketDebuggerUrl").GetString();
        return webSocketUrl
            ?? throw new InvalidOperationException("Chromium did not return a page websocket URL.");
    }

    private static async Task WaitForExpressionAsync(
        ClientWebSocket socket,
        int baseCommandId,
        string expression,
        TimeSpan timeout,
        CancellationToken cancellationToken)
    {
        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(timeout);

        var commandId = baseCommandId;
        while (!timeoutCts.IsCancellationRequested)
        {
            var response = await SendCommandAsync(socket, ++commandId, "Runtime.evaluate", new
            {
                expression,
                returnByValue = true
            }, timeoutCts.Token);

            if (TryReadBooleanResult(response, out var value) && value)
                return;

            await Task.Delay(250, timeoutCts.Token);
        }

        throw new TimeoutException("The share page did not finish rendering in time.");
    }

    private static async Task<JsonElement> SendCommandAsync(
        ClientWebSocket socket,
        int commandId,
        string method,
        object? parameters,
        CancellationToken cancellationToken)
    {
        var payload = parameters is null
            ? JsonSerializer.Serialize(new { id = commandId, method })
            : JsonSerializer.Serialize(new { id = commandId, method, @params = parameters });

        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        await socket.SendAsync(
            payloadBytes,
            WebSocketMessageType.Text,
            endOfMessage: true,
            cancellationToken
        );

        while (true)
        {
            var message = await ReceiveMessageAsync(socket, cancellationToken);
            using var document = JsonDocument.Parse(message);
            var root = document.RootElement;

            if (!root.TryGetProperty("id", out var idProperty) || idProperty.GetInt32() != commandId)
                continue;

            if (root.TryGetProperty("error", out var error))
                throw new InvalidOperationException($"Chrome DevTools command failed: {error}");

            return root.Clone();
        }
    }

    private static async Task<string> ReceiveMessageAsync(ClientWebSocket socket, CancellationToken cancellationToken)
    {
        var buffer = new byte[16 * 1024];
        using var stream = new MemoryStream();

        while (true)
        {
            var result = await socket.ReceiveAsync(buffer, cancellationToken);
            if (result.MessageType == WebSocketMessageType.Close)
                throw new WebSocketException("Chrome DevTools websocket closed unexpectedly.");

            stream.Write(buffer, 0, result.Count);
            if (result.EndOfMessage)
                return Encoding.UTF8.GetString(stream.ToArray());
        }
    }

    private static bool TryReadBooleanResult(JsonElement response, out bool value)
    {
        value = false;

        if (!response.TryGetProperty("result", out var result)
            || !result.TryGetProperty("result", out var inner)
            || !inner.TryGetProperty("value", out var valueElement)
            || valueElement.ValueKind != JsonValueKind.True && valueElement.ValueKind != JsonValueKind.False)
        {
            return false;
        }

        value = valueElement.GetBoolean();
        return true;
    }

    private string? FindChromiumExecutable()
    {
        var configured = _config["Screenshot:ChromiumPath"];
        var env = Environment.GetEnvironmentVariable("CHROMIUM_PATH");

        foreach (var candidate in EnumerateChromiumCandidates(configured, env))
        {
            if (!string.IsNullOrWhiteSpace(candidate) && File.Exists(candidate))
                return candidate;
        }

        return null;
    }

    private static IEnumerable<string?> EnumerateChromiumCandidates(params string?[] configured)
    {
        foreach (var candidate in configured)
            yield return candidate;

        if (OperatingSystem.IsWindows())
        {
            var programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            var programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
            var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

            yield return Path.Combine(programFiles, "Google", "Chrome", "Application", "chrome.exe");
            yield return Path.Combine(programFilesX86, "Google", "Chrome", "Application", "chrome.exe");
            yield return Path.Combine(programFiles, "Microsoft", "Edge", "Application", "msedge.exe");
            yield return Path.Combine(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe");
            yield return Path.Combine(localAppData, "Google", "Chrome", "Application", "chrome.exe");
        }
        else
        {
            yield return "/usr/bin/chromium";
            yield return "/usr/bin/chromium-browser";
            yield return "/usr/bin/google-chrome";
            yield return "/usr/bin/google-chrome-stable";
        }
    }

    private static int GetFreePort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        return port;
    }

    private static void TryStopChromium(Process process)
    {
        try
        {
            if (process.HasExited)
                return;

            process.Kill(entireProcessTree: true);
            process.WaitForExit(3000);
        }
        catch
        {
            // Best effort cleanup only.
        }
    }

    private static void TryDeleteDirectory(string path)
    {
        try
        {
            if (Directory.Exists(path))
                Directory.Delete(path, recursive: true);
        }
        catch
        {
            // Chromium can keep a few handles briefly on Windows.
        }
    }
}
