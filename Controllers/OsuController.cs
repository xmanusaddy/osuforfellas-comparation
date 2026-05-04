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

    [HttpGet("{mode}/{username}")]
    public async Task<IActionResult> GetUser(string mode, string username)
    {
        var token = await GetToken();

        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://osu.ppy.sh/api/v2/users/{username}/{mode}"
        );

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _http.SendAsync(request);

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();

        return Content(content, "application/json");
    }
}