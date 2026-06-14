using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/osu")]
public class OsuController : ControllerBase
{
    private readonly OsuApiService _osuApi;

    public OsuController(OsuApiService osuApi)
    {
        _osuApi = osuApi;
    }

    // GET /api/osu/{mode}/{username}
    [HttpGet("{mode}/{username}")]
    public async Task<IActionResult> GetUser(string mode, string username)
    {
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
        var result = await _osuApi.GetRecentScoresJsonAsync(mode, username, limit);
        if (!result.Success)
            return StatusCode(result.StatusCode);

        return Content(result.Content, "application/json");
    }
}
