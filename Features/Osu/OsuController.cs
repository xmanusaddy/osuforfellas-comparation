using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/osu")]
public class OsuController : ControllerBase
{
    private const int MaxUsernameLength = 100;

    private static readonly HashSet<string> SupportedModes = new(StringComparer.OrdinalIgnoreCase)
    {
        "osu",
        "taiko",
        "fruits",
        "mania"
    };

    private readonly OsuApiService _osuApi;
    private readonly OsuUserSessionService _userSession;

    public OsuController(OsuApiService osuApi, OsuUserSessionService userSession)
    {
        _osuApi = osuApi;
        _userSession = userSession;
    }

    // GET /api/osu/{mode}/{username}
    [HttpGet("{mode}/{username}")]
    public async Task<IActionResult> GetUser(string mode, string username)
    {
        if (!IsValidRequest(mode, username))
            return BadRequest(new { error = "invalid_request" });

        var result = await _osuApi.GetUserJsonAsync(mode, username);
        if (!result.Success)
            return StatusCode(result.StatusCode);

        return Content(result.Content, "application/json");
    }

    // GET /api/osu/{mode}/{username}/best?limit=10
    // Returns best performance scores for the user, including beatmap and beatmapset
    [HttpGet("{mode}/{username}/best")]
    public async Task<IActionResult> GetBestPlay(string mode, string username, [FromQuery] int limit = 1)
    {
        if (!IsValidRequest(mode, username))
            return BadRequest(new { error = "invalid_request" });

        var result = await _osuApi.GetBestScoresJsonAsync(mode, username, limit);
        if (!result.Success)
            return StatusCode(result.StatusCode);

        return Content(result.Content, "application/json");
    }

    // GET /api/osu/{mode}/{username}/recent
    // Returns recent scores for the user, including beatmap and beatmapset when available
    [HttpGet("{mode}/{username}/recent")]
    public async Task<IActionResult> GetRecentPlays(string mode, string username, [FromQuery] int? limit = null)
    {
        if (!IsValidRequest(mode, username))
            return BadRequest(new { error = "invalid_request" });

        var result = await _osuApi.GetRecentScoresJsonAsync(mode, username, limit);
        if (!result.Success)
            return StatusCode(result.StatusCode);

        return Content(result.Content, "application/json");
    }

    // GET /api/osu/beatmaps/123456?mode=osu
    [HttpGet("beatmaps/{beatmapId:long}")]
    public async Task<IActionResult> GetBeatmap(long beatmapId, [FromQuery] string? mode = null)
    {
        if (!IsValidBeatmapId(beatmapId) || (!string.IsNullOrWhiteSpace(mode) && !SupportedModes.Contains(mode)))
            return BadRequest(new { error = "invalid_request" });

        var result = await _osuApi.GetBeatmapJsonAsync(beatmapId, mode);
        if (!result.Success)
            return StatusCode(result.StatusCode);

        return Content(result.Content, "application/json");
    }

    // GET /api/osu/osu/beatmaps/123456/scores?type=global|friend
    [HttpGet("{mode}/beatmaps/{beatmapId:long}/scores")]
    public async Task<IActionResult> GetBeatmapScores(string mode, long beatmapId, [FromQuery] string type = "global")
    {
        if (!SupportedModes.Contains(mode) || !IsValidBeatmapId(beatmapId) || !IsValidLeaderboardType(type))
            return BadRequest(new { error = "invalid_request" });

        var accessToken = await _userSession.GetValidAccessTokenAsync();
        if (string.Equals(type, "friend", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(accessToken))
                return Unauthorized(new { error = "not_authenticated" });
        }

        var result = await _osuApi.GetBeatmapScoresJsonAsync(beatmapId, mode, type, accessToken);
        if (!result.Success)
            return StatusCode(result.StatusCode);

        return Content(result.Content, "application/json");
    }

    private static bool IsValidRequest(string mode, string username)
    {
        return SupportedModes.Contains(mode)
            && !string.IsNullOrWhiteSpace(username)
            && username.Length <= MaxUsernameLength;
    }

    private static bool IsValidBeatmapId(long beatmapId) => beatmapId > 0;

    private static bool IsValidLeaderboardType(string type)
    {
        return string.Equals(type, "global", StringComparison.OrdinalIgnoreCase)
            || string.Equals(type, "friend", StringComparison.OrdinalIgnoreCase);
    }
}
