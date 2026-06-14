using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("discord")]
public class DiscordController : ControllerBase
{
    private const int InteractionPing = 1;
    private const int InteractionApplicationCommand = 2;
    private const int ResponsePong = 1;
    private const int ResponseChannelMessage = 4;

    private readonly DiscordSignatureVerifier _signatureVerifier;
    private readonly OsuApiService _osuApi;
    private readonly IConfiguration _config;

    public DiscordController(
        DiscordSignatureVerifier signatureVerifier,
        OsuApiService osuApi,
        IConfiguration config)
    {
        _signatureVerifier = signatureVerifier;
        _osuApi = osuApi;
        _config = config;
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            ok = true,
            module = "discord",
            interactions = "/discord/interactions"
        });
    }

    [HttpPost("interactions")]
    public async Task<IActionResult> Interactions()
    {
        var timestamp = Request.Headers["X-Signature-Timestamp"].ToString();
        var signature = Request.Headers["X-Signature-Ed25519"].ToString();

        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();

        if (!_signatureVerifier.Verify(timestamp, body, signature))
            return Unauthorized();

        using var document = JsonDocument.Parse(body);
        var interaction = document.RootElement;
        var type = interaction.GetProperty("type").GetInt32();

        if (type == InteractionPing)
            return Ok(new Dictionary<string, object?> { ["type"] = ResponsePong });

        if (type != InteractionApplicationCommand)
            return Ok(CreateMessageResponse("That interaction is not supported yet.", ephemeral: true));

        var data = interaction.GetProperty("data");
        var commandName = data.GetProperty("name").GetString();

        return commandName switch
        {
            "osu-profile" => Ok(await HandleOsuProfile(data)),
            _ => Ok(CreateMessageResponse("Unknown command.", ephemeral: true))
        };
    }

    private async Task<Dictionary<string, object?>> HandleOsuProfile(JsonElement data)
    {
        var username = GetOptionString(data, "username");
        var mode = GetOptionString(data, "mode") ?? "osu";

        if (string.IsNullOrWhiteSpace(username))
            return CreateMessageResponse("Missing username.", ephemeral: true);

        var userResult = await _osuApi.GetUserAsync(mode, username);
        if (!userResult.Success || userResult.User is null)
            return CreateMessageResponse($"Player \"{username}\" was not found.", ephemeral: true);

        var user = userResult.User.Value;
        var stats = user.TryGetProperty("statistics", out var statistics) ? statistics : default;
        var userName = GetString(user, "username") ?? username;
        var avatarUrl = GetString(user, "avatar_url") ?? "https://osu.ppy.sh/images/layout/avatar-guest.png";
        var userId = GetNumber(user, "id");
        var countryCode = GetString(user, "country_code") ?? "??";
        var pp = GetDouble(stats, "pp");
        var globalRank = GetDouble(stats, "global_rank");
        var countryRank = GetDouble(stats, "country_rank");
        var accuracy = GetDouble(stats, "hit_accuracy");
        var playCount = GetDouble(stats, "play_count");
        var profileUrl = userId > 0
            ? $"https://osu.ppy.sh/users/{userId}/{mode}"
            : $"https://osu.ppy.sh/users/{Uri.EscapeDataString(userName)}/{mode}";
        var siteUrl = BuildSitePlayerUrl(userName);
        var fields = new List<object?>
        {
            CreateEmbedField("PP", pp > 0 ? $"{FormatNumber(pp)}pp" : "N/A", inline: true),
            CreateEmbedField("Global rank", globalRank > 0 ? $"#{FormatNumber(globalRank)}" : "N/A", inline: true),
            CreateEmbedField($"{countryCode} rank", countryRank > 0 ? $"#{FormatNumber(countryRank)}" : "N/A", inline: true),
            CreateEmbedField("Accuracy", accuracy > 0 ? $"{accuracy:0.00}%" : "N/A", inline: true),
            CreateEmbedField("Play count", playCount > 0 ? FormatNumber(playCount) : "N/A", inline: true)
        };

        var topPlayValue = await BuildTopPlayValue(mode, userName);
        if (!string.IsNullOrWhiteSpace(topPlayValue))
            fields.Add(CreateEmbedField("Top play", topPlayValue, inline: false));

        fields.Add(CreateEmbedField("Links", $"[Open in osu! for fellas]({siteUrl}) | [Open osu! profile]({profileUrl})", inline: false));

        var embed = new Dictionary<string, object?>
        {
            ["title"] = $"{userName} - {GetModeLabel(mode)}",
            ["url"] = profileUrl,
            ["description"] = "Profile snapshot from osu! for fellas.",
            ["color"] = IsCreatorUsername(userName) ? 0xFF3355 : 0xFF66AA,
            ["thumbnail"] = new Dictionary<string, object?>
            {
                ["url"] = avatarUrl
            },
            ["fields"] = fields.ToArray(),
            ["footer"] = new Dictionary<string, object?>
            {
                ["text"] = "osu! for fellas - /osu-profile"
            }
        };

        return CreateEmbedResponse(embed);
    }

    private async Task<string?> BuildTopPlayValue(string mode, string username)
    {
        try
        {
            var result = await _osuApi.GetBestScoresJsonAsync(mode, username, 1);
            if (!result.Success || string.IsNullOrWhiteSpace(result.Content))
                return null;

            using var scoresJson = JsonDocument.Parse(result.Content);
            if (scoresJson.RootElement.ValueKind != JsonValueKind.Array || scoresJson.RootElement.GetArrayLength() == 0)
                return null;

            var score = scoresJson.RootElement[0];
            var beatmapset = score.TryGetProperty("beatmapset", out var beatmapsetValue) ? beatmapsetValue : default;
            var beatmap = score.TryGetProperty("beatmap", out var beatmapValue) ? beatmapValue : default;
            var title = GetString(beatmapset, "title") ?? "Unknown map";
            var artist = GetString(beatmapset, "artist");
            var diff = GetString(beatmap, "version") ?? "?";
            var beatmapId = GetNumber(beatmap, "id");
            var mapLabel = string.IsNullOrWhiteSpace(artist)
                ? $"{EscapeMarkdown(title)} [{EscapeMarkdown(diff)}]"
                : $"{EscapeMarkdown(artist)} - {EscapeMarkdown(title)} [{EscapeMarkdown(diff)}]";
            var mapUrl = beatmapId > 0 ? $"https://osu.ppy.sh/b/{beatmapId}" : null;
            var mapText = mapUrl is null ? mapLabel : $"[{mapLabel}]({mapUrl})";
            var topPp = GetDouble(score, "pp");
            var topAccuracy = GetDouble(score, "accuracy");
            var rank = GetString(score, "rank") ?? "N/A";
            var mods = GetMods(score);
            var modText = mods.Count > 0 ? string.Join("", mods) : "NM";
            var ppText = topPp > 0 ? $"{Math.Round(topPp)}pp" : "N/A";
            var accText = topAccuracy > 0 ? $"{topAccuracy * 100:0.00}%" : "N/A";

            return $"{mapText}\n**{ppText}** - {accText} - {rank} - {modText}";
        }
        catch
        {
            return null;
        }
    }

    private string BuildSitePlayerUrl(string username)
    {
        var publicBaseUrl = _config["App:PublicBaseUrl"]?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(publicBaseUrl))
            publicBaseUrl = "https://osu-comparison-api.onrender.com";

        return $"{publicBaseUrl}/#/player/{Uri.EscapeDataString(username)}";
    }

    private static string? GetOptionString(JsonElement data, string name)
    {
        if (!data.TryGetProperty("options", out var options) || options.ValueKind != JsonValueKind.Array)
            return null;

        foreach (var option in options.EnumerateArray())
        {
            if (option.TryGetProperty("name", out var optionName)
                && optionName.GetString() == name
                && option.TryGetProperty("value", out var value))
            {
                return value.ToString();
            }
        }

        return null;
    }

    private static Dictionary<string, object?> CreateEmbedResponse(Dictionary<string, object?> embed)
    {
        return new Dictionary<string, object?>
        {
            ["type"] = ResponseChannelMessage,
            ["data"] = new Dictionary<string, object?>
            {
                ["embeds"] = new object?[] { embed },
                ["allowed_mentions"] = new Dictionary<string, object?>
                {
                    ["parse"] = Array.Empty<string>()
                }
            }
        };
    }

    private static Dictionary<string, object?> CreateMessageResponse(string content, bool ephemeral)
    {
        var data = new Dictionary<string, object?>
        {
            ["content"] = content,
            ["allowed_mentions"] = new Dictionary<string, object?>
            {
                ["parse"] = Array.Empty<string>()
            }
        };

        if (ephemeral)
            data["flags"] = 64;

        return new Dictionary<string, object?>
        {
            ["type"] = ResponseChannelMessage,
            ["data"] = data
        };
    }

    private static Dictionary<string, object?> CreateEmbedField(string name, string value, bool inline)
    {
        return new Dictionary<string, object?>
        {
            ["name"] = name,
            ["value"] = value,
            ["inline"] = inline
        };
    }

    private static string? GetString(JsonElement element, string property)
    {
        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(property, out var value)
            && value.ValueKind != JsonValueKind.Null
            ? value.GetString()
            : null;
    }

    private static double GetDouble(JsonElement element, string property)
    {
        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(property, out var value)
            && value.ValueKind == JsonValueKind.Number
            && value.TryGetDouble(out var number)
            ? number
            : 0;
    }

    private static long GetNumber(JsonElement element, string property)
    {
        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(property, out var value)
            && value.ValueKind == JsonValueKind.Number
            && value.TryGetInt64(out var number)
            ? number
            : 0;
    }

    private static List<string> GetMods(JsonElement score)
    {
        if (!score.TryGetProperty("mods", out var mods) || mods.ValueKind != JsonValueKind.Array)
            return [];

        var result = new List<string>();
        foreach (var mod in mods.EnumerateArray())
        {
            if (mod.ValueKind == JsonValueKind.String)
            {
                var value = mod.GetString();
                if (!string.IsNullOrWhiteSpace(value))
                    result.Add(value);
                continue;
            }

            if (mod.ValueKind == JsonValueKind.Object
                && mod.TryGetProperty("acronym", out var acronym)
                && acronym.ValueKind == JsonValueKind.String)
            {
                var value = acronym.GetString();
                if (!string.IsNullOrWhiteSpace(value))
                    result.Add(value);
            }
        }

        return result;
    }

    private static string FormatNumber(double value)
    {
        return Math.Round(value).ToString("N0");
    }

    private static string EscapeMarkdown(string value)
    {
        return value
            .Replace("\\", "\\\\")
            .Replace("*", "\\*")
            .Replace("_", "\\_")
            .Replace("~", "\\~")
            .Replace("`", "\\`")
            .Replace("[", "\\[")
            .Replace("]", "\\]")
            .Replace("(", "\\(")
            .Replace(")", "\\)");
    }

    private static bool IsCreatorUsername(string username)
    {
        return string.Equals(username.Trim(), "manu is washed", StringComparison.OrdinalIgnoreCase);
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
