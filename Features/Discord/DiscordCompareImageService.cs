using System.Net.Http.Headers;
using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public sealed class DiscordCompareImageService
{
    private const int DiscordActionRow = 1;
    private const int DiscordButton = 2;
    private const int DiscordStringSelect = 3;
    private const int DiscordButtonPrimary = 1;
    private const int DiscordButtonSecondary = 2;
    private const int DiscordButtonLink = 5;
    private const int TopPlaysPageSize = 4;
    private const int RecentPageSize = 10;
    private static readonly TimeSpan ScreenshotReadyTimeout = TimeSpan.FromSeconds(42);
    private static readonly TimeSpan ScreenshotAttemptTimeout = TimeSpan.FromSeconds(70);
    private static readonly TimeSpan StateLifetime = TimeSpan.FromHours(6);
    private static readonly ConcurrentDictionary<string, DiscordCompareState> InteractionStates = new();

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

    private static readonly HashSet<string> SupportedViews = new(StringComparer.OrdinalIgnoreCase)
    {
        "profile",
        "top",
        "recent"
    };

    private readonly ChromiumScreenshotService _screenshots;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<DiscordCompareImageService> _logger;

    private sealed record DiscordCompareState(
        string Id,
        string[] Players,
        string Mode,
        string Theme,
        string Lang,
        DateTimeOffset CreatedAt
    );

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
            var stateId = StoreInteractionState(normalizedPlayers, normalizedMode, normalizedTheme, normalizedLang);
            var renderUrl = BuildCompareUrl(normalizedPlayers, normalizedMode, normalizedTheme, normalizedLang, local: true, shareMode: true);
            var fallbackRenderUrl = BuildCompareUrl(normalizedPlayers, normalizedMode, normalizedTheme, normalizedLang, local: false, shareMode: true);
            var publicUrl = BuildCompareUrl(normalizedPlayers, normalizedMode, normalizedTheme, normalizedLang, local: false, shareMode: false);

            var image = await CaptureSharePngAsync(
                renderUrl,
                fallbackRenderUrl,
                cancellationToken
            );

            await PatchOriginalResponseWithImageAsync(
                applicationId,
                interactionToken,
                image,
                normalizedPlayers,
                normalizedMode,
                publicUrl,
                stateId,
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Discord compare image generation failed.");
            await PatchOriginalResponseWithErrorAsync(applicationId, interactionToken, cancellationToken);
        }
    }

    public async Task SendCompareImageFromStateAsync(
        string applicationId,
        string interactionToken,
        string stateId,
        bool useFollowup = false,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetInteractionState(stateId, out var state))
        {
            await SendExpiredResponseAsync(applicationId, interactionToken, useFollowup, cancellationToken);
            return;
        }

        try
        {
            var renderUrl = BuildCompareUrl(state.Players, state.Mode, state.Theme, state.Lang, local: true, shareMode: true);
            var fallbackRenderUrl = BuildCompareUrl(state.Players, state.Mode, state.Theme, state.Lang, local: false, shareMode: true);
            var publicUrl = BuildCompareUrl(state.Players, state.Mode, state.Theme, state.Lang, local: false, shareMode: false);

            var image = await CaptureSharePngAsync(
                renderUrl,
                fallbackRenderUrl,
                cancellationToken
            );

            await SendCompareImageResponseAsync(
                applicationId,
                interactionToken,
                image,
                state.Players,
                state.Mode,
                publicUrl,
                state.Id,
                useFollowup,
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Discord compare image refresh failed.");
            await SendErrorResponseAsync(applicationId, interactionToken, useFollowup, cancellationToken);
        }
    }

    public async Task SendRoomImageAsync(
        string applicationId,
        string interactionToken,
        string stateId,
        string view,
        int playerIndex,
        int page,
        bool useFollowup = false,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetInteractionState(stateId, out var state))
        {
            await SendExpiredResponseAsync(applicationId, interactionToken, useFollowup, cancellationToken);
            return;
        }

        try
        {
            var normalizedView = NormalizeView(view);
            var safeIndex = Math.Clamp(playerIndex, 0, state.Players.Length - 1);
            var safePage = Math.Max(1, page);
            var username = state.Players[safeIndex];
            var renderUrl = BuildRoomUrl(username, normalizedView, state.Mode, state.Theme, state.Lang, safePage, local: true, shareMode: true);
            var fallbackRenderUrl = BuildRoomUrl(username, normalizedView, state.Mode, state.Theme, state.Lang, safePage, local: false, shareMode: true);
            var publicUrl = BuildRoomUrl(username, normalizedView, state.Mode, state.Theme, state.Lang, safePage, local: false, shareMode: false);

            _logger.LogInformation(
                "Generating Discord {View} image for player {Player}.",
                normalizedView,
                username
            );

            var image = await CaptureSharePngAsync(
                renderUrl,
                fallbackRenderUrl,
                cancellationToken
            );

            await SendRoomImageResponseAsync(
                applicationId,
                interactionToken,
                image,
                state,
                normalizedView,
                safeIndex,
                safePage,
                publicUrl,
                useFollowup,
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Discord room image generation failed for view {View}.", view);
            await SendErrorResponseAsync(applicationId, interactionToken, useFollowup, cancellationToken);
        }
    }

    private async Task<byte[]> CaptureSharePngAsync(
        string renderUrl,
        string fallbackRenderUrl,
        CancellationToken cancellationToken)
    {
        var preferPublic = ShouldPreferPublicCapture(renderUrl, fallbackRenderUrl);
        var primaryUrl = preferPublic ? fallbackRenderUrl : renderUrl;
        var secondaryUrl = preferPublic ? renderUrl : fallbackRenderUrl;

        try
        {
            return await CaptureSharePngFromUrlAsync(primaryUrl, cancellationToken);
        }
        catch (Exception ex) when (!string.Equals(primaryUrl, secondaryUrl, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning(ex, "Primary screenshot capture failed. Retrying with the alternate app URL.");
            return await CaptureSharePngFromUrlAsync(secondaryUrl, cancellationToken);
        }
    }

    private async Task<byte[]> CaptureSharePngFromUrlAsync(string renderUrl, CancellationToken cancellationToken)
    {
        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(ScreenshotAttemptTimeout);

        return await _screenshots.CapturePngAsync(
            renderUrl,
            width: 1280,
            height: 720,
            readyExpression: "window.__osuShareReady === true",
            readyTimeout: ScreenshotReadyTimeout,
            timeoutCts.Token
        );
    }

    private static bool ShouldPreferPublicCapture(string renderUrl, string fallbackRenderUrl)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        return !string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(renderUrl, fallbackRenderUrl, StringComparison.OrdinalIgnoreCase);
    }

    public static bool HasInteractionState(string stateId)
    {
        return TryGetInteractionState(stateId, out _);
    }

    private async Task PatchOriginalResponseWithImageAsync(
        string applicationId,
        string interactionToken,
        byte[] image,
        IReadOnlyList<string> players,
        string mode,
        string publicUrl,
        string stateId,
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
            components = BuildCompareComponents(stateId, players, publicUrl),
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

    private async Task SendCompareImageResponseAsync(
        string applicationId,
        string interactionToken,
        byte[] image,
        IReadOnlyList<string> players,
        string mode,
        string publicUrl,
        string stateId,
        bool useFollowup,
        CancellationToken cancellationToken)
    {
        if (!useFollowup)
        {
            await PatchOriginalResponseWithImageAsync(
                applicationId,
                interactionToken,
                image,
                players,
                mode,
                publicUrl,
                stateId,
                cancellationToken
            );
            return;
        }

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
            components = BuildCompareComponents(stateId, players, publicUrl),
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var form = CreateImageForm(payload, image, filename);
        await CreateFollowupResponseAsync(applicationId, interactionToken, form, cancellationToken);
    }

    private async Task PatchOriginalResponseWithRoomImageAsync(
        string applicationId,
        string interactionToken,
        byte[] image,
        DiscordCompareState state,
        string view,
        int playerIndex,
        int page,
        string publicUrl,
        CancellationToken cancellationToken)
    {
        var username = state.Players[playerIndex];
        var filename = $"osu-for-fellas-{view}-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}.png";
        var payload = JsonSerializer.Serialize(new
        {
            content = $"**{EscapeDiscordText(username)}** - {GetViewLabel(view)}",
            attachments = new object[]
            {
                new
                {
                    id = 0,
                    filename,
                    description = $"osu! for fellas {view}"
                }
            },
            components = BuildRoomComponents(state.Id, view, playerIndex, page, publicUrl),
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

    private async Task SendRoomImageResponseAsync(
        string applicationId,
        string interactionToken,
        byte[] image,
        DiscordCompareState state,
        string view,
        int playerIndex,
        int page,
        string publicUrl,
        bool useFollowup,
        CancellationToken cancellationToken)
    {
        if (!useFollowup)
        {
            await PatchOriginalResponseWithRoomImageAsync(
                applicationId,
                interactionToken,
                image,
                state,
                view,
                playerIndex,
                page,
                publicUrl,
                cancellationToken
            );
            return;
        }

        var username = state.Players[playerIndex];
        var filename = $"osu-for-fellas-{view}-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}.png";
        var payload = JsonSerializer.Serialize(new
        {
            content = $"**{EscapeDiscordText(username)}** - {GetViewLabel(view)}",
            attachments = new object[]
            {
                new
                {
                    id = 0,
                    filename,
                    description = $"osu! for fellas {view}"
                }
            },
            components = BuildRoomComponents(state.Id, view, playerIndex, page, publicUrl),
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var form = CreateImageForm(payload, image, filename);
        await CreateFollowupResponseAsync(applicationId, interactionToken, form, cancellationToken);
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

    private async Task SendErrorResponseAsync(
        string applicationId,
        string interactionToken,
        bool useFollowup,
        CancellationToken cancellationToken)
    {
        if (!useFollowup)
        {
            await PatchOriginalResponseWithErrorAsync(applicationId, interactionToken, cancellationToken);
            return;
        }

        var payload = JsonSerializer.Serialize(new
        {
            content = "Could not generate that visual view right now. Try again in a bit.",
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        await CreateFollowupResponseAsync(applicationId, interactionToken, content, cancellationToken);
    }

    private async Task PatchOriginalResponseWithExpiredAsync(
        string applicationId,
        string interactionToken,
        CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Serialize(new
        {
            content = "This visual menu expired. Run `/osu-compare` again to generate fresh buttons.",
            components = Array.Empty<object>(),
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        await PatchOriginalResponseAsync(applicationId, interactionToken, content, cancellationToken);
    }

    private async Task SendExpiredResponseAsync(
        string applicationId,
        string interactionToken,
        bool useFollowup,
        CancellationToken cancellationToken)
    {
        if (!useFollowup)
        {
            await PatchOriginalResponseWithExpiredAsync(applicationId, interactionToken, cancellationToken);
            return;
        }

        var payload = JsonSerializer.Serialize(new
        {
            content = "This visual menu expired. Run `/osu-compare` again to generate fresh buttons.",
            allowed_mentions = new
            {
                parse = Array.Empty<string>()
            }
        });

        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        await CreateFollowupResponseAsync(applicationId, interactionToken, content, cancellationToken);
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

    private async Task CreateFollowupResponseAsync(
        string applicationId,
        string interactionToken,
        HttpContent content,
        CancellationToken cancellationToken)
    {
        var endpoint = $"https://discord.com/api/v10/webhooks/{Uri.EscapeDataString(applicationId)}/{Uri.EscapeDataString(interactionToken)}";
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = content
        };

        var http = _httpClientFactory.CreateClient();
        using var response = await http.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode)
            return;

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        _logger.LogWarning(
            "Discord follow-up response failed with status {StatusCode}: {ResponseBody}",
            (int)response.StatusCode,
            responseBody
        );
    }

    private static MultipartFormDataContent CreateImageForm(string payload, byte[] image, string filename)
    {
        var form = new MultipartFormDataContent();
        form.Add(new StringContent(payload, Encoding.UTF8, "application/json"), "payload_json");

        var imageContent = new ByteArrayContent(image);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(imageContent, "files[0]", filename);

        return form;
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

    private string BuildRoomUrl(
        string username,
        string view,
        string mode,
        string theme,
        string lang,
        int page,
        bool local,
        bool shareMode)
    {
        var baseUrl = local ? GetLocalBaseUrl() : GetPublicBaseUrl();
        var room = GetRoomName(view);
        var query = new List<string>
        {
            $"mode={Uri.EscapeDataString(mode)}",
            $"theme={Uri.EscapeDataString(theme)}",
            $"lang={Uri.EscapeDataString(lang)}"
        };

        if (shareMode)
        {
            query.Insert(0, "share=room");
            query.Add($"room={Uri.EscapeDataString(room)}");
            query.Add($"player={Uri.EscapeDataString(username)}");
            if (view == "top")
            {
                query.Add($"page={Math.Max(1, page)}");
                query.Add($"pageSize={TopPlaysPageSize}");
            }

            if (view == "recent")
            {
                query.Add($"page={Math.Max(1, page)}");
                query.Add($"pageSize={RecentPageSize}");
            }

            return $"{baseUrl}/?{string.Join("&", query)}";
        }

        var hash = $"#/{room}/{Uri.EscapeDataString(username)}";
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

    public static string NormalizeView(string? view)
    {
        var clean = string.IsNullOrWhiteSpace(view) ? "profile" : view.Trim();
        return SupportedViews.Contains(clean) ? clean.ToLowerInvariant() : "profile";
    }

    private static string StoreInteractionState(
        IReadOnlyList<string> players,
        string mode,
        string theme,
        string lang)
    {
        CleanupExpiredStates();

        var stateId = CreateStateId();
        var state = new DiscordCompareState(
            stateId,
            players.ToArray(),
            mode,
            theme,
            lang,
            DateTimeOffset.UtcNow
        );

        InteractionStates[stateId] = state;
        return stateId;
    }

    private static bool TryGetInteractionState(string stateId, out DiscordCompareState state)
    {
        state = default!;
        if (string.IsNullOrWhiteSpace(stateId))
            return false;

        CleanupExpiredStates();

        if (!InteractionStates.TryGetValue(stateId, out var found))
            return false;

        if (DateTimeOffset.UtcNow - found.CreatedAt > StateLifetime)
        {
            InteractionStates.TryRemove(stateId, out _);
            return false;
        }

        state = found;
        return true;
    }

    private static void CleanupExpiredStates()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var pair in InteractionStates)
        {
            if (now - pair.Value.CreatedAt > StateLifetime)
                InteractionStates.TryRemove(pair.Key, out _);
        }
    }

    private static string CreateStateId()
    {
        Span<byte> bytes = stackalloc byte[12];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static object[] BuildCompareComponents(
        string stateId,
        IReadOnlyList<string> players,
        string publicUrl)
    {
        var options = new List<object>();
        for (var i = 0; i < players.Count; i++)
        {
            var player = players[i];
            options.Add(CreateSelectOption($"{player} - Profile", $"profile:{i}:1", "Open the full profile image."));
            options.Add(CreateSelectOption($"{player} - Top Plays", $"top:{i}:1", "Open the top plays image."));
            options.Add(CreateSelectOption($"{player} - Recent Plays", $"recent:{i}:1", "Open recent plays with pages."));
        }

        return new object[]
        {
            new
            {
                type = DiscordActionRow,
                components = new object[]
                {
                    new
                    {
                        type = DiscordButton,
                        style = DiscordButtonLink,
                        label = "Open visual compare",
                        url = publicUrl
                    },
                    new
                    {
                        type = DiscordButton,
                        style = DiscordButtonSecondary,
                        label = "Refresh image",
                        custom_id = $"ofc:refresh:{stateId}"
                    }
                }
            },
            new
            {
                type = DiscordActionRow,
                components = new object[]
                {
                    new
                    {
                        type = DiscordStringSelect,
                        custom_id = $"ofc:select:{stateId}",
                        placeholder = "Choose player/action",
                        min_values = 1,
                        max_values = 1,
                        options = options.ToArray()
                    }
                }
            }
        };
    }

    private static object[] BuildRoomComponents(
        string stateId,
        string view,
        int playerIndex,
        int page,
        string publicUrl)
    {
        var firstRow = new object[]
        {
            new
            {
                type = DiscordButton,
                style = DiscordButtonLink,
                label = "Open in website",
                url = publicUrl
            },
            CreateButton("Compare", DiscordButtonSecondary, $"ofc:refresh:{stateId}"),
            CreateButton("Profile", view == "profile" ? DiscordButtonPrimary : DiscordButtonSecondary, $"ofc:view:{stateId}:profile:{playerIndex}:1"),
            CreateButton("Top Plays", view == "top" ? DiscordButtonPrimary : DiscordButtonSecondary, $"ofc:view:{stateId}:top:{playerIndex}:1"),
            CreateButton("Recent", view == "recent" ? DiscordButtonPrimary : DiscordButtonSecondary, $"ofc:view:{stateId}:recent:{playerIndex}:1")
        };

        var secondRowComponents = view is "top" or "recent"
            ? new object[]
            {
                CreateButton("Prev", DiscordButtonSecondary, $"ofc:page:{stateId}:{view}:{playerIndex}:{Math.Max(1, page - 1)}", page <= 1),
                CreateButton("Next", DiscordButtonSecondary, $"ofc:page:{stateId}:{view}:{playerIndex}:{page + 1}"),
                CreateButton("Refresh", DiscordButtonSecondary, $"ofc:refreshview:{stateId}:{view}:{playerIndex}:{page}")
            }
            : new object[]
            {
                CreateButton("Refresh", DiscordButtonSecondary, $"ofc:refreshview:{stateId}:{view}:{playerIndex}:{page}")
            };

        return new object[]
        {
            new
            {
                type = DiscordActionRow,
                components = firstRow
            },
            new
            {
                type = DiscordActionRow,
                components = secondRowComponents
            }
        };
    }

    private static object CreateButton(string label, int style, string customId, bool disabled = false)
    {
        return new
        {
            type = DiscordButton,
            style,
            label,
            custom_id = customId,
            disabled
        };
    }

    private static object CreateSelectOption(string label, string value, string description)
    {
        return new
        {
            label = Truncate(label, 80),
            value,
            description = Truncate(description, 100)
        };
    }

    private static string Truncate(string value, int maxLength)
    {
        if (value.Length <= maxLength)
            return value;

        return value[..Math.Max(0, maxLength - 3)] + "...";
    }

    private static string GetRoomName(string view)
    {
        return view switch
        {
            "top" => "top-plays",
            "recent" => "recent",
            _ => "player"
        };
    }

    private static string GetViewLabel(string view)
    {
        return view switch
        {
            "top" => "Top Plays",
            "recent" => "Recent Plays",
            _ => "Profile"
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
