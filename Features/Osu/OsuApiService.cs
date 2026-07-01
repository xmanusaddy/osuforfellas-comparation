using System.Net.Http.Headers;
using System.Text.Json;

public sealed class OsuApiService
{
    private const int RecentPageSize = 20;
    private const int RecentMaxPages = 50;

    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    private static readonly SemaphoreSlim TokenLock = new(1, 1);
    private static string? _token;
    private static DateTime _expires;

    public OsuApiService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<(bool Success, int StatusCode, string Content)> GetUserJsonAsync(string mode, string username)
    {
        var token = await GetTokenAsync();
        var request = CreateAuthorizedRequest(
            token,
            $"https://osu.ppy.sh/api/v2/users/{Uri.EscapeDataString(username)}/{Uri.EscapeDataString(mode)}"
        );

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        return (response.IsSuccessStatusCode, (int)response.StatusCode, content);
    }

    public async Task<(bool Success, int StatusCode, JsonElement? User)> GetUserAsync(string mode, string username)
    {
        var result = await GetUserJsonAsync(mode, username);
        if (!result.Success)
            return (false, result.StatusCode, null);

        using var userJson = JsonDocument.Parse(result.Content);
        return (true, result.StatusCode, userJson.RootElement.Clone());
    }

    public async Task<(bool Success, int StatusCode, string Content)> GetBestScoresJsonAsync(string mode, string username, int limit)
    {
        var safeLimit = Math.Clamp(limit, 1, 20);
        var token = await GetTokenAsync();
        var user = await ResolveUserIdAsync(token, mode, username);
        if (!user.Success)
            return (false, user.StatusCode, string.Empty);

        var request = CreateUserScoresRequest(token, user.UserId, mode, "best", safeLimit, 0, includeFails: false);
        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        return (response.IsSuccessStatusCode, (int)response.StatusCode, content);
    }

    public async Task<(bool Success, int StatusCode, string Content)> GetRecentScoresJsonAsync(string mode, string username, int? limit = null)
    {
        var token = await GetTokenAsync();
        var user = await ResolveUserIdAsync(token, mode, username);
        if (!user.Success)
            return (false, user.StatusCode, string.Empty);

        if (limit.HasValue)
        {
            var safeLimit = Math.Clamp(limit.Value, 1, 20);
            var request = CreateUserScoresRequest(token, user.UserId, mode, "recent", safeLimit, 0, includeFails: true);
            var response = await _http.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();
            return (response.IsSuccessStatusCode, (int)response.StatusCode, content);
        }

        var allScores = new List<JsonElement>();

        for (var page = 0; page < RecentMaxPages; page++)
        {
            var offset = page * RecentPageSize;
            var request = CreateUserScoresRequest(token, user.UserId, mode, "recent", RecentPageSize, offset, includeFails: true);
            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return (false, (int)response.StatusCode, string.Empty);

            var content = await response.Content.ReadAsStringAsync();
            using var pageJson = JsonDocument.Parse(content);
            if (pageJson.RootElement.ValueKind != JsonValueKind.Array)
                return (true, (int)response.StatusCode, content);

            var pageCount = 0;
            foreach (var score in pageJson.RootElement.EnumerateArray())
            {
                allScores.Add(score.Clone());
                pageCount++;
            }

            if (pageCount < RecentPageSize)
                break;
        }

        return (true, StatusCodes.Status200OK, JsonSerializer.Serialize(allScores));
    }

    public async Task<(bool Success, int StatusCode, string Content)> GetBeatmapJsonAsync(long beatmapId, string? mode = null)
    {
        var token = await GetTokenAsync();
        var url = $"https://osu.ppy.sh/api/v2/beatmaps/{beatmapId}";

        var request = CreateAuthorizedRequest(token, url);
        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        return (response.IsSuccessStatusCode, (int)response.StatusCode, content);
    }

    public async Task<(bool Success, int StatusCode, string Content)> GetBeatmapScoresJsonAsync(
        long beatmapId,
        string mode,
        string type,
        string? accessToken = null)
    {
        var token = string.IsNullOrWhiteSpace(accessToken) ? await GetTokenAsync() : accessToken;
        var safeType = string.Equals(type, "friend", StringComparison.OrdinalIgnoreCase) ? "friend" : "global";
        var request = CreateAuthorizedRequest(
            token,
            $"https://osu.ppy.sh/api/v2/beatmaps/{beatmapId}/scores?mode={Uri.EscapeDataString(mode)}&type={Uri.EscapeDataString(safeType)}&legacy_only=0"
        );
        request.Headers.Add("x-api-version", "20220705");

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        return (response.IsSuccessStatusCode, (int)response.StatusCode, content);
    }

    private async Task<string> GetTokenAsync()
    {
        if (!string.IsNullOrEmpty(_token) && DateTime.Now < _expires)
            return _token;

        await TokenLock.WaitAsync();
        try
        {
            if (!string.IsNullOrEmpty(_token) && DateTime.Now < _expires)
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

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            _token = json.GetProperty("access_token").GetString()
                ?? throw new InvalidOperationException("osu! token response did not include an access token.");
            _expires = DateTime.Now.AddSeconds(json.GetProperty("expires_in").GetInt32() - 60);

            return _token;
        }
        finally
        {
            TokenLock.Release();
        }
    }

    private async Task<(bool Success, int StatusCode, long UserId)> ResolveUserIdAsync(string token, string mode, string username)
    {
        var request = CreateAuthorizedRequest(
            token,
            $"https://osu.ppy.sh/api/v2/users/{Uri.EscapeDataString(username)}/{Uri.EscapeDataString(mode)}"
        );

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return (false, (int)response.StatusCode, 0);

        var userJson = await response.Content.ReadFromJsonAsync<JsonElement>();
        return (true, StatusCodes.Status200OK, userJson.GetProperty("id").GetInt64());
    }

    private static HttpRequestMessage CreateUserScoresRequest(
        string token,
        long userId,
        string mode,
        string type,
        int limit,
        int offset,
        bool includeFails)
    {
        var request = CreateAuthorizedRequest(
            token,
            $"https://osu.ppy.sh/api/v2/users/{userId}/scores/{Uri.EscapeDataString(type)}?mode={Uri.EscapeDataString(mode)}&limit={limit}&offset={offset}&include_fails={(includeFails ? 1 : 0)}"
        );
        request.Headers.Add("x-api-version", "20220705");
        return request;
    }

    private static HttpRequestMessage CreateAuthorizedRequest(string token, string url)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return request;
    }
}
