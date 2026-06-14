using System.Net.Http.Headers;
using System.Text.Json;

public sealed class DiscordCommandRegistrationService : IHostedService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<DiscordCommandRegistrationService> _logger;

    public DiscordCommandRegistrationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<DiscordCommandRegistrationService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var applicationId = _config["Discord:ApplicationId"];
        var botToken = _config["Discord:BotToken"];

        if (string.IsNullOrWhiteSpace(applicationId) || string.IsNullOrWhiteSpace(botToken))
        {
            _logger.LogInformation("Discord command registration skipped because Discord credentials are incomplete.");
            return;
        }

        var commands = new object[]
        {
            new
            {
                name = "osu-profile",
                description = "Show an osu! player profile from osu! for fellas.",
                type = 1,
                integration_types = new[] { 0, 1 },
                contexts = new[] { 0, 1, 2 },
                options = new object[]
                {
                    new
                    {
                        name = "username",
                        description = "osu! username",
                        type = 3,
                        required = true
                    },
                    new
                    {
                        name = "mode",
                        description = "Game mode",
                        type = 3,
                        required = false,
                        choices = new object[]
                        {
                            new { name = "osu!", value = "osu" },
                            new { name = "Taiko", value = "taiko" },
                            new { name = "Catch", value = "fruits" },
                            new { name = "Mania", value = "mania" }
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(commands);
        using var request = new HttpRequestMessage(
            HttpMethod.Put,
            $"https://discord.com/api/v10/applications/{applicationId}/commands"
        );
        request.Headers.Authorization = new AuthenticationHeaderValue("Bot", botToken);
        request.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        var http = _httpClientFactory.CreateClient();
        var response = await http.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("Discord slash commands registered.");
            return;
        }

        _logger.LogWarning(
            "Discord slash command registration failed with status {StatusCode}: {ResponseBody}",
            (int)response.StatusCode,
            responseBody
        );
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
