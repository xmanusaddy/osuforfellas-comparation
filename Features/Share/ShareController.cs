using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/share")]
public class ShareController : ControllerBase
{
    private static readonly TimeSpan ScreenshotReadyTimeout = TimeSpan.FromSeconds(42);

    private static readonly HashSet<string> SupportedModes = new(StringComparer.OrdinalIgnoreCase)
    {
        "osu",
        "taiko",
        "fruits",
        "mania"
    };

    private static readonly HashSet<string> SupportedThemes = new(StringComparer.OrdinalIgnoreCase)
    {
        "cyberpunk",
        "heaven",
        "crimson"
    };

    private static readonly HashSet<string> SupportedLangs = new(StringComparer.OrdinalIgnoreCase)
    {
        "es",
        "en",
        "de"
    };

    private readonly ChromiumScreenshotService _screenshots;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ShareController> _logger;

    public ShareController(
        ChromiumScreenshotService screenshots,
        IConfiguration config,
        IWebHostEnvironment environment,
        ILogger<ShareController> logger)
    {
        _screenshots = screenshots;
        _config = config;
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("compare-image")]
    [RequestSizeLimit(16 * 1024)]
    public async Task<IActionResult> CreateCompareImage(
        [FromBody] ShareCompareImageRequest request,
        CancellationToken cancellationToken)
    {
        var players = NormalizePlayers(request.Players);
        if (players.Length == 0)
            return BadRequest(new { error = "players_required" });

        var mode = NormalizeMode(request.Mode);
        var theme = NormalizeTheme(request.Theme);
        var lang = NormalizeLang(request.Lang);
        var capture = NormalizeCapture(request.Capture);
        var scale = NormalizeScale(request.Scale);
        var renderUrl = BuildCompareCaptureUrl(players, mode, theme, lang, capture);

        try
        {
            var image = await _screenshots.CapturePngAsync(
                renderUrl,
                width: 1600,
                height: 900,
                readyExpression: "window.__osuShareReady === true",
                readyTimeout: ScreenshotReadyTimeout,
                cancellationToken,
                deviceScaleFactor: scale,
                captureBeyondViewport: true
            );

            var filename = BuildFilename(players, capture);
            return File(image, "image/png", filename);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Share compare capture failed for {Players}.", string.Join(", ", players));
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "capture_failed" });
        }
    }

    private string BuildCompareCaptureUrl(
        IReadOnlyList<string> players,
        string mode,
        string theme,
        string lang,
        string capture)
    {
        var query = new List<string>
        {
            "share=compare",
            "source=web",
            $"capture={Uri.EscapeDataString(capture)}",
            $"mode={Uri.EscapeDataString(mode)}",
            $"theme={Uri.EscapeDataString(theme)}",
            $"lang={Uri.EscapeDataString(lang)}"
        };
        query.AddRange(players.Select(player => $"player={Uri.EscapeDataString(player)}"));

        return $"{GetCaptureBaseUrl()}/?{string.Join("&", query)}";
    }

    private string GetCaptureBaseUrl()
    {
        var configured = _config["App:PublicBaseUrl"]?.TrimEnd('/');
        if (!_environment.IsDevelopment() && !string.IsNullOrWhiteSpace(configured))
            return configured;

        if (!_environment.IsDevelopment() && Request.Host.Host.Contains("onrender.com", StringComparison.OrdinalIgnoreCase))
            return $"https://{Request.Host}";

        return $"{Request.Scheme}://{Request.Host}";
    }

    private static string[] NormalizePlayers(IEnumerable<string>? players)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        return (players ?? [])
            .Select(player => (player ?? string.Empty).Trim())
            .Where(player => player.Length is > 0 and <= 100)
            .Where(player => seen.Add(player))
            .Take(4)
            .ToArray();
    }

    private static string NormalizeMode(string? mode)
    {
        var value = (mode ?? "osu").Trim();
        return SupportedModes.Contains(value) ? value.ToLowerInvariant() : "osu";
    }

    private string NormalizeTheme(string? theme)
    {
        var value = (theme ?? "cyberpunk").Trim();
        if (!SupportedThemes.Contains(value))
            return "cyberpunk";

        if (string.Equals(value, "crimson", StringComparison.OrdinalIgnoreCase) && !CanUseLockedThemes())
            return "cyberpunk";

        return value.ToLowerInvariant();
    }

    private bool CanUseLockedThemes()
    {
        if (_environment.IsDevelopment())
            return true;

        var host = Request.Host.Host;
        return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase)
            || string.Equals(host, "127.0.0.1", StringComparison.OrdinalIgnoreCase)
            || string.Equals(host, "::1", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeLang(string? lang)
    {
        var value = (lang ?? "es").Trim();
        return SupportedLangs.Contains(value) ? value.ToLowerInvariant() : "es";
    }

    private static string NormalizeCapture(string? capture)
    {
        return string.Equals(capture, "clean", StringComparison.OrdinalIgnoreCase)
            ? "clean"
            : "full";
    }

    private static double NormalizeScale(double? scale)
    {
        if (scale is null || double.IsNaN(scale.Value) || double.IsInfinity(scale.Value))
            return 1;

        return Math.Clamp(scale.Value, 1, 3);
    }

    private static string BuildFilename(IReadOnlyList<string> players, string capture)
    {
        var title = string.Join("-vs-", players.Select(Slugify)).Trim('-');
        if (string.IsNullOrWhiteSpace(title))
            title = "comparison";

        return $"osu-for-fellas-{title}-{capture}.png";
    }

    private static string Slugify(string value)
    {
        var chars = value
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
            .ToArray();

        var slug = new string(chars);
        while (slug.Contains("--", StringComparison.Ordinal))
            slug = slug.Replace("--", "-", StringComparison.Ordinal);

        return slug.Trim('-');
    }

    public sealed record ShareCompareImageRequest(
        string[]? Players,
        string? Mode,
        string? Theme,
        string? Lang,
        string? Capture,
        double? Scale
    );
}
