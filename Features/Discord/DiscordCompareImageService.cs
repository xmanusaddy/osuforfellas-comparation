using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public sealed class DiscordCompareImageService
{
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
        "heaven"
    };

    private readonly ChromiumScreenshotService _screenshots;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<DiscordCompareImageService> _logger;

    public DiscordCompareImageService(
        ChromiumScreenshotService screenshots,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<DiscordCompareImageService> logger)
    {
        _screenshots = screenshots;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task SendCompareImageAsync(
        string applicationId,
        string interactionToken,
        IReadOnlyList<string> players,
        string mode,
        string theme,
        string lang,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var normalizedPlayers = NormalizePlayers(players);
            var normalizedMode = NormalizeMode(mode);
            var normalizedTheme = NormalizeTheme(theme);
            var normalizedLang = NormalizeLang(lang);
            var renderUrl = BuildCompareUrl(normalizedPlayers, normalizedMode, normalizedTheme, normalizedLang, local: true, shareMode: true);
            var publicUrl = BuildCompareUrl(normalizedPlayers, normalizedMode, normalizedTheme, normalizedLang, local: false, shareMode: false);

            var image = await _screenshots.CapturePngAsync(
                renderUrl,
                width: 1280,
                height: 720,
                readyExpression: "window.__osuShareReady === true",
                readyTimeout: TimeSpan.FromSeconds(24),
                cancellationToken
            );

            await PatchOriginalResponseWithImageAsync(
                applicationId,
                interactionToken,
                image,
                normalizedPlayers,
                normalizedMode,
                publicUrl,
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Discord compare image generation failed.");
            await PatchOriginalResponseWithErrorAsync(applicationId, interactionToken, cancellationToken);
        }
    }

    private async Task PatchOriginalResponseWithImageAsync(
        string applicationId,
        string interactionToken,
        byte[] image,
        IReadOnlyList<string> players,
        string mode,
        string publicUrl,
        CancellationToken cancellationToken)
    {
        var playerText = string.Join(" vs ", players);
        var filename = $"osu-for-fellas-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}.png";
        var payload = JsonSerializer.Serialize(new
        {
            content = $"**{EscapeDiscordText(playerText)}** - {GetModeLabel(mode)}",
            attachments = new object[]
            {
                new
                {
                    id = 0,
                    filename,
                    description = "osu! for fellas comparison"
                }
            },
            components = new object[]
            {
                new
                {
                    type = 1,
                    components = new object[]
                    {
                        new
                        {
                            type = 2,
                            style = 5,
                            label = "Open full compare",
                            url = publicUrl
                        }
                    }
                }
            },
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(payload, Encoding.UTF8, "application/json"), "payload_json");

        using var imageContent = new ByteArrayContent(image);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(imageContent, "files[0]", filename);

        await PatchOriginalResponseAsync(applicationId, interactionToken, form, cancellationToken);
    }

    private async Task PatchOriginalResponseWithErrorAsync(
        string applicationId,
        string interactionToken,
        CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Serialize(new
        {
            content = "Could not generate the visual compare right now. Try again in a bit.",
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        await PatchOriginalResponseAsync(applicationId, interactionToken, content, cancellationToken);
    }

    private async Task PatchOriginalResponseAsync(
        string applicationId,
        string interactionToken,
        HttpContent content,
        CancellationToken cancellationToken)
    {
        var endpoint = $"https://discord.com/api/v10/webhooks/{Uri.EscapeDataString(applicationId)}/{Uri.EscapeDataString(interactionToken)}/messages/@original";
        using var request = new HttpRequestMessage(HttpMethod.Patch, endpoint)
        {
            Content = content
        };

        var http = _httpClientFactory.CreateClient();
        using var response = await http.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode)
            return;

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        _logger.LogWarning(
            "Discord compare response patch failed with status {StatusCode}: {ResponseBody}",
            (int)response.StatusCode,
            responseBody
        );
    }

    private string BuildCompareUrl(
        IReadOnlyList<string> players,
        string mode,
        string theme,
        string lang,
        bool local,
        bool shareMode)
    {
        var baseUrl = local ? GetLocalBaseUrl() : GetPublicBaseUrl();
        var query = new List<string>
        {
            $"mode={Uri.EscapeDataString(mode)}",
            $"theme={Uri.EscapeDataString(theme)}",
            $"lang={Uri.EscapeDataString(lang)}"
        };

        if (shareMode)
            query.Insert(0, "share=compare");

        query.AddRange(players.Select(player => $"player={Uri.EscapeDataString(player)}"));
        var hash = shareMode ? string.Empty : "#/results";
        return $"{baseUrl}/?{string.Join("&", query)}{hash}";
    }

    private string GetLocalBaseUrl()
    {
        var port = Environment.GetEnvironmentVariable("PORT");
        if (string.IsNullOrWhiteSpace(port))
            port = "8080";

        return $"http://127.0.0.1:{port}";
    }

    private string GetPublicBaseUrl()
    {
        var publicBaseUrl = _config["App:PublicBaseUrl"]?.TrimEnd('/');
        return string.IsNullOrWhiteSpace(publicBaseUrl)
            ? "https://osu-comparison-api.onrender.com"
            : publicBaseUrl;
    }

    public static List<string> NormalizePlayers(IEnumerable<string?> players)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var result = new List<string>();

        foreach (var player in players)
        {
            var clean = player?.Trim();
            if (string.IsNullOrWhiteSpace(clean) || !seen.Add(clean))
                continue;

            result.Add(clean);
            if (result.Count == 4)
                break;
        }

        return result;
    }

    public static string NormalizeMode(string? mode)
    {
        var clean = string.IsNullOrWhiteSpace(mode) ? "osu" : mode.Trim();
        return SupportedModes.Contains(clean) ? clean.ToLowerInvariant() : "osu";
    }

    public static string NormalizeTheme(string? theme)
    {
        var clean = string.IsNullOrWhiteSpace(theme) ? "cyberpunk" : theme.Trim();
        return SupportedThemes.Contains(clean) ? clean.ToLowerInvariant() : "cyberpunk";
    }

    public static string NormalizeLang(string? lang)
    {
        return lang?.Trim().ToLowerInvariant() switch
        {
            "en" => "en",
            "de" => "de",
            _ => "es"
        };
    }

    private static string EscapeDiscordText(string value)
    {
        return value
            .Replace("\\", "\\\\")
            .Replace("*", "\\*")
            .Replace("_", "\\_")
            .Replace("~", "\\~")
            .Replace("`", "\\`");
    }

    private static string GetModeLabel(string mode)
    {
        return mode switch
        {
            "taiko" => "osu!taiko",
            "fruits" => "osu!catch",
            "mania" => "osu!mania",
            _ => "osu!"
        };
    }
}
