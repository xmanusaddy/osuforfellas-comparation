using System.Text.Json.Serialization;

public sealed class OsuUserSessionService
{
    private const string AccessTokenKey = "osu_access_token";
    private const string RefreshTokenKey = "osu_refresh_token";
    private const string ExpiresAtKey = "osu_token_expires_at";
    private const string UserKey = "osu_user";
    private const string TokenUrl = "https://osu.ppy.sh/oauth/token";

    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public OsuUserSessionService(IHttpContextAccessor httpContextAccessor, IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpContextAccessor = httpContextAccessor;
        _http = httpClientFactory.CreateClient();
        _config = config;
    }

    public bool IsAuthenticated =>
        !string.IsNullOrWhiteSpace(Session?.GetString(UserKey));

    public async Task<string?> GetValidAccessTokenAsync()
    {
        var session = Session;
        if (session == null || string.IsNullOrWhiteSpace(session.GetString(UserKey)))
            return null;

        var accessToken = session.GetString(AccessTokenKey);
        var expiresAtRaw = session.GetString(ExpiresAtKey);

        if (!string.IsNullOrWhiteSpace(accessToken) &&
            long.TryParse(expiresAtRaw, out var expiresAt) &&
            DateTimeOffset.UtcNow.ToUnixTimeSeconds() < expiresAt)
        {
            return accessToken;
        }

        var refreshToken = session.GetString(RefreshTokenKey);
        if (string.IsNullOrWhiteSpace(refreshToken))
            return null;

        var refreshed = await RefreshToken(refreshToken);
        if (refreshed?.AccessToken == null)
            return null;

        StoreRefreshedToken(session, refreshed);
        return refreshed.AccessToken;
    }

    private ISession? Session => _httpContextAccessor.HttpContext?.Session;

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

    private static void StoreRefreshedToken(ISession session, OsuTokenResponse token)
    {
        session.SetString(AccessTokenKey, token.AccessToken!);
        if (!string.IsNullOrWhiteSpace(token.RefreshToken))
            session.SetString(RefreshTokenKey, token.RefreshToken);

        var expiresAt = DateTimeOffset.UtcNow
            .AddSeconds(Math.Max(0, token.ExpiresIn - 60))
            .ToUnixTimeSeconds()
            .ToString();

        session.SetString(ExpiresAtKey, expiresAt);
    }

    private sealed class OsuTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
