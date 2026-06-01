using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;

[ApiController]
[Route("api/osu")]
public class OsuController : ControllerBase
{
    private readonly HttpClient _http = new HttpClient();
    private readonly IConfiguration _config;

    private static string _token;
    private static DateTime _expires;

    public OsuController(IConfiguration config)
    {
        _config = config;
    }

    private async Task<string> GetToken()
    {
        if (_token != null && DateTime.Now < _expires)
            return _token;

        var response = await _http.PostAsJsonAsync(
            "https://osu.ppy.sh/oauth/token",
            new
            {
                client_id = _config["OsuApi:ClientId"],
                client_secret = _config["OsuApi:ClientSecret"],
                grant_type = "client_credentials",
                scope = "public"
            }
        );

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        _token = json.GetProperty("access_token").GetString();
        _expires = DateTime.Now.AddSeconds(json.GetProperty("expires_in").GetInt32() - 60);

        return _token;
    }

    // GET /api/osu/{mode}/{username}
    [HttpGet("{mode}/{username}")]
    public async Task<IActionResult> GetUser(string mode, string username)
    {
        var token = await GetToken();

        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://osu.ppy.sh/api/v2/users/{Uri.EscapeDataString(username)}/{mode}"
        );
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        return Content(content, "application/json");
    }

    // GET /api/osu/{mode}/{username}/best
    // Returns the #1 best performance score for the user, including beatmap and beatmapset
    [HttpGet("{mode}/{username}/best")]
    public async Task<IActionResult> GetBestPlay(string mode, string username)
    {
        var token = await GetToken();

        // First resolve the user id (needed for scores endpoint)
        var userReq = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://osu.ppy.sh/api/v2/users/{Uri.EscapeDataString(username)}/{mode}"
        );
        userReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var userResp = await _http.SendAsync(userReq);
        if (!userResp.IsSuccessStatusCode)
            return StatusCode((int)userResp.StatusCode);

        var userJson = await userResp.Content.ReadFromJsonAsync<JsonElement>();
        var userId = userJson.GetProperty("id").GetInt64();

        // Fetch top 1 score with beatmap and beatmapset included
        var scoresReq = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://osu.ppy.sh/api/v2/users/{userId}/scores/best?mode={mode}&limit=1&include_fails=0"
        );
        scoresReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        scoresReq.Headers.Add("x-api-version", "20220705");

        var scoresResp = await _http.SendAsync(scoresReq);
        if (!scoresResp.IsSuccessStatusCode)
            return StatusCode((int)scoresResp.StatusCode);

        var content = await scoresResp.Content.ReadAsStringAsync();
        return Content(content, "application/json");
    }
}
