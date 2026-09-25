using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Calendiario.Data;

// Punto único de acceso a `calendiario.db`: carpeta de datos, migraciones y
// conexiones para Dapper.
public sealed class Database
{
    public string ConnectionString { get; }

    private Database(string dbPath)
    {
        ConnectionString = new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            Mode = SqliteOpenMode.ReadWriteCreate,
        }.ToString();
    }

    /// Carpeta de datos de la app (`%APPDATA%\com.calendiario.dotnet` en Windows).
    ///
    /// Distinta de la de la versión en Rust (`com.calendiario.desktop`): las dos
    /// apps pueden convivir sin tocarse los datos. En compilaciones Debug se usa
    /// una carpeta hermana con sufijo `.dev`, para que las pruebas nunca pisen la
    /// base de datos de la app de uso real.
    public static string DataDir()
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
#if DEBUG
        return Path.Combine(appData, "com.calendiario.dotnet.dev");
#else
        return Path.Combine(appData, "com.calendiario.dotnet");
#endif
    }

    /// Abre (o crea) `calendiario.db` dentro de `dir` y aplica las migraciones
    /// pendientes de Data/Migrations.
    public static Database Init(string dir)
    {
        Directory.CreateDirectory(dir);
        var db = new Database(Path.Combine(dir, "calendiario.db"));

        var options = new DbContextOptionsBuilder<CalendiarioDbContext>()
            .UseSqlite(db.ConnectionString)
            .Options;
        using (var context = new CalendiarioDbContext(options))
        {
            context.Database.Migrate();
        }

        return db;
    }

    // Conexión nueva por operación: Microsoft.Data.Sqlite ya mantiene un pool
    // por debajo, y Dapper la abre y la cierra solo.
    public SqliteConnection CreateConnection() => new(ConnectionString);
}
