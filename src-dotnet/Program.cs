using Calendiario.Data;
using Calendiario.Modules.Auth;
using Photino.NET;
using Serilog;
using Serilog.Events;

namespace Calendiario;

// Arquitectura: un solo proceso con dos piezas.
// - Kestrel (ASP.NET Core) en 127.0.0.1 sirve el frontend compilado (dist/ → wwwroot/)
//   y la API /api/*. Todo es mismo origen: sin IPC propio ni esquemas raros.
// - Photino solo abre una ventana nativa (WebView2) apuntando a esa URL.
public static class Program
{
    // La misma CSP que tenía tauri.conf.json, ahora todo a 'self' (mismo origen).
    // 'unsafe-inline' en style-src ya hacía falta antes (estilos inline de Radix/shadcn).
    private const string ContentSecurityPolicy =
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self' data:; " +
        "connect-src 'self'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'none'";

    // Puerto de la API en desarrollo. Si se cambia, cambiarlo también en el
    // proxy de vite.config.ts.
    private const int DevPort = 5180;

    // Photino (WebView2) exige un hilo STA en Windows.
    [STAThread]
    public static void Main(string[] args)
    {
        var dataDir = Database.DataDir();
        Directory.CreateDirectory(dataDir);

        // Log a fichero en la carpeta de datos, igual en Debug y en Release: en
        // Release no hay consola, y sin esto un fallo real sería invisible.
        // Un fichero por día (calendiario-AAAAMMDD.log), se guardan los 14 últimos.
        using var fileLog = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .WriteTo.File(
                Path.Combine(dataDir, "logs", "calendiario-.log"),
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14)
            .CreateLogger();

        try
        {
            Run(args, dataDir, fileLog);
        }
        catch (Exception e)
        {
            // Fallos de arranque (BD, migraciones, puerto…) antes de que exista el host.
            fileLog.Fatal(e, "La app se cerró por un error inesperado");
            throw;
        }
    }

    private static void Run(string[] args, string dataDir, Serilog.ILogger fileLog)
    {
        // Columnas snake_case (pin_hash) → propiedades PascalCase (PinHash) en Dapper.
        Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

        var db = Database.Init(dataDir);

        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = args,
            ContentRootPath = AppContext.BaseDirectory,
            // El frontend compilado se copia junto al ejecutable (ver .csproj).
            WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot"),
        });

        builder.Logging.AddSerilog(fileLog);

        // Solo loopback: nada escucha hacia fuera.
        // - Entorno Development (`dotnet run`, vía Properties/launchSettings.json):
        //   puerto fijo, el destino del proxy de Vite (vite.config.ts).
        // - Cualquier otro (el .exe, sea Debug o Release): puerto libre elegido por
        //   el sistema (0), sin choques con otro programa que use un puerto fijo.
        builder.WebHost.UseUrls(builder.Environment.IsDevelopment()
            ? $"http://127.0.0.1:{DevPort}"
            : "http://127.0.0.1:0");

        // Rechaza (400) cualquier petición cuya cabecera Host no sea local. Protege
        // contra DNS rebinding: una web abierta en el navegador con un dominio que
        // resuelva a 127.0.0.1 no puede hablar con esta API.
        builder.Configuration["AllowedHosts"] = "127.0.0.1;localhost";

        builder.Services.AddSingleton(db);
        builder.Services.AddSingleton<ProfileRepository>();
        builder.Services.AddSingleton<ProfileService>();

        var app = builder.Build();

        // CSP en todas las respuestas HTML (index.html, venga de estáticos o del
        // fallback de SPA). Se decide al empezar a enviar, cuando ya hay Content-Type.
        app.Use(async (context, next) =>
        {
            context.Response.OnStarting(() =>
            {
                if (context.Response.ContentType?.StartsWith("text/html") == true)
                {
                    context.Response.Headers.ContentSecurityPolicy = ContentSecurityPolicy;
                }
                return Task.CompletedTask;
            });
            await next();
        });

        app.UseStaticFiles();

        var api = app.MapGroup("/api").WithApiErrors();
        api.MapProfileEndpoints();
        // Cualquier /api/* desconocido es un 404 JSON, nunca el index.html de la SPA.
        api.Map("{**rest}", () => Results.NotFound(new { error = "Ruta no encontrada." }));

        // Fallback de SPA: cualquier otra ruta (/app, /lo-que-sea) devuelve index.html
        // y React Router decide qué pintar. Así recargar estando en /app funciona.
        app.MapFallbackToFile("index.html");

        app.StartAsync().GetAwaiter().GetResult();

        // Con el puerto 0, la dirección real solo se conoce tras arrancar.
        var url = app.Urls.First();
        fileLog.Information("Calendiario escuchando en {Url} · entorno {Environment} · datos en {DataDir}",
            url, app.Environment.EnvironmentName, dataDir);

        var window = new PhotinoWindow()
            .SetTitle("Calendiario")
            // Barra de título y barra de tareas. Photino.Native lo carga con
            // LoadImageW desde una ruta de fichero: tiene que ser un .ico.
            .SetIconFile(Path.Combine(AppContext.BaseDirectory, "Assets", "app-icon.ico"))
            .SetUseOsDefaultSize(false)
            .SetSize(1280, 800)
            .SetMinSize(900, 640)
            .SetResizable(true)
            .SetWebSecurityEnabled(true)
            .SetContextMenuEnabled(false)
#if DEBUG
            .SetDevToolsEnabled(true)
#else
            .SetDevToolsEnabled(false)
#endif
            .Load(new Uri(url));
        window.Centered = true;

        window.WaitForClose();

        app.StopAsync().GetAwaiter().GetResult();
    }
}
