using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;

[ApiController]
public class AuthController : ControllerBase
{
    private const string AuthorizeUrl = "https://osu.ppy.sh/oauth/authorize";
    private const string TokenUrl = "https://osu.ppy.sh/oauth/token";
    private const string MeUrl = "https://osu.ppy.sh/api/v2/me/osu";
    private const string FriendsUrl = "https://osu.ppy.sh/api/v2/friends";

    private const string StateKey = "osu_oauth_state";
    private const string AccessTokenKey = "osu_access_token";
    private const string RefreshTokenKey = "osu_refresh_token";
    private const string ExpiresAtKey = "osu_token_expires_at";
    private const string UserKey = "osu_user";

    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public AuthController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _http = httpClientFactory.CreateClient();
        _config = config;
    }

    [HttpGet("/auth/osu/login")]
    public IActionResult Login()
    {
        var clientId = _config["OsuApi:ClientId"];
        var clientSecret = _config["OsuApi:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return Redirect("/?auth=missing_config");

        var state = CreateState();
        HttpContext.Session.SetString(StateKey, state);

        var query = BuildQuery(new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = GetRedirectUri(),
            ["response_type"] = "code",
            ["scope"] = "identify public friends.read",
            ["state"] = state
        });

        return Redirect($"{AuthorizeUrl}?{query}");
    }

    [HttpGet("/auth/osu/callback")]
    public async Task<IActionResult> Callback([FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error)
    {
        if (!string.IsNullOrWhiteSpace(error))
            return Redirect("/?auth=error");

        var expectedState = HttpContext.Session.GetString(StateKey);
        HttpContext.Session.Remove(StateKey);

        if (string.IsNullOrWhiteSpace(code) ||
            string.IsNullOrWhiteSpace(state) ||
            string.IsNullOrWhiteSpace(expectedState) ||
            !CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.UTF8.GetBytes(state),
                System.Text.Encoding.UTF8.GetBytes(expectedState)))
        {
            return Redirect("/?auth=error");
        }

        var token = await ExchangeCode(code);
        if (token?.AccessToken == null)
            return Redirect("/?auth=error");

        var userJson = await FetchOwnUser(token.AccessToken);
        if (string.IsNullOrWhiteSpace(userJson))
            return Redirect("/?auth=error");

        StoreSession(token, userJson);
        return Redirect("/?auth=success");
    }

    [HttpPost("/auth/logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return Ok(new { authenticated = false });
    }

    [HttpGet("/auth/logout")]
    public IActionResult LogoutRedirect()
    {
        HttpContext.Session.Clear();
        return Redirect("/");
    }

    [HttpGet("/api/me")]
    public IActionResult Me()
    {
        var userJson = HttpContext.Session.GetString(UserKey);
        if (string.IsNullOrWhiteSpace(userJson))
            return Ok(new { authenticated = false });

        using var doc = JsonDocument.Parse(userJson);
        return Ok(new
        {
            authenticated = true,
            user = doc.RootElement.Clone()
        });
    }

    [HttpGet("/api/me/friends")]
    public async Task<IActionResult> Friends()
    {
        if (string.IsNullOrWhiteSpace(HttpContext.Session.GetString(UserKey)))
            return Unauthorized(new { error = "not_authenticated" });

        var accessToken = await GetValidAccessToken();
        if (string.IsNullOrWhiteSpace(accessToken))
            return Unauthorized(new { error = "not_authenticated" });

        var request = new HttpRequestMessage(HttpMethod.Get, FriendsUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, content);

        return Content(content, "application/json");
    }

    private async Task<OsuTokenResponse?> ExchangeCode(string code)
    {
        var clientId = _config["OsuApi:ClientId"];
        var clientSecret = _config["OsuApi:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return null;

        var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["code"] = code,
            ["grant_type"] = "authorization_code",
            ["redirect_uri"] = GetRedirectUri()
        });

        var response = await _http.PostAsync(TokenUrl, form);
        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<OsuTokenResponse>();
    }

    private async Task<string?> FetchOwnUser(string accessToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, MeUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadAsStringAsync();
    }

    private async Task<string?> GetValidAccessToken()
    {
        var accessToken = HttpContext.Session.GetString(AccessTokenKey);
        var expiresAtRaw = HttpContext.Session.GetString(ExpiresAtKey);

        if (!string.IsNullOrWhiteSpace(accessToken) &&
            long.TryParse(expiresAtRaw, out var expiresAt) &&
            DateTimeOffset.UtcNow.ToUnixTimeSeconds() < expiresAt)
        {
            return accessToken;
        }

        var refreshToken = HttpContext.Session.GetString(RefreshTokenKey);
        if (string.IsNullOrWhiteSpace(refreshToken))
            return null;

        var refreshed = await RefreshToken(refreshToken);
        if (refreshed?.AccessToken == null)
            return null;

        var userJson = HttpContext.Session.GetString(UserKey) ?? "";
        StoreSession(refreshed, userJson);
        return refreshed.AccessToken;
    }

    private async Task<OsuTokenResponse?> RefreshToken(string refreshToken)
    {
        var clientId = _config["OsuApi:ClientId"];
        var clientSecret = _config["OsuApi:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return null;

        var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["refresh_token"] = refreshToken,
            ["grant_type"] = "refresh_token"
        });

        var response = await _http.PostAsync(TokenUrl, form);
        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<OsuTokenResponse>();
    }

    private void StoreSession(OsuTokenResponse token, string userJson)
    {
        HttpContext.Session.SetString(AccessTokenKey, token.AccessToken!);
        if (!string.IsNullOrWhiteSpace(token.RefreshToken))
            HttpContext.Session.SetString(RefreshTokenKey, token.RefreshToken);

        var expiresAt = DateTimeOffset.UtcNow
            .AddSeconds(Math.Max(0, token.ExpiresIn - 60))
            .ToUnixTimeSeconds()
            .ToString();

        HttpContext.Session.SetString(ExpiresAtKey, expiresAt);
        HttpContext.Session.SetString(UserKey, userJson);
    }

    private string GetRedirectUri()
    {
        var configured = _config["OsuApi:RedirectUri"];
        if (!string.IsNullOrWhiteSpace(configured))
            return configured;

        return $"{Request.Scheme}://{Request.Host}/auth/osu/callback";
    }

    private static string CreateState()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static string BuildQuery(Dictionary<string, string> values)
    {
        return string.Join("&", values.Select(pair =>
            $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value)}"));
    }

    private sealed class OsuTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string? TokenType { get; set; }
    }
}
