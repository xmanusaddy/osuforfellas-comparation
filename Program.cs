var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<OsuApiService>();
builder.Services.AddScoped<OsuUserSessionService>();
builder.Services.AddSingleton<DiscordSignatureVerifier>();
builder.Services.AddSingleton<ChromiumScreenshotService>();
builder.Services.AddScoped<DiscordCompareImageService>();
builder.Services.AddHostedService<DiscordCommandRegistrationService>();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".OsuForFellas.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.IdleTimeout = TimeSpan.FromDays(7);
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.Use(async (context, next) =>
{
    context.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");
    context.Response.Headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.TryAdd("X-Frame-Options", "DENY");
    context.Response.Headers.TryAdd("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    await next();
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseSession();

app.MapControllers();
app.MapGet("/terms", () => Results.File(Path.Combine(app.Environment.WebRootPath, "terms.html"), "text/html"));
app.MapGet("/privacy", () => Results.File(Path.Combine(app.Environment.WebRootPath, "privacy.html"), "text/html"));

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
