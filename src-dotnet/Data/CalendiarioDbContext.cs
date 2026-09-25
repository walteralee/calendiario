using Calendiario.Modules.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Calendiario.Data;

// EF Core se usa SOLO para el esquema (migraciones versionadas). Las consultas
// de la app van por Dapper con SQL explícito en cada repositorio.
public class CalendiarioDbContext(DbContextOptions<CalendiarioDbContext> options)
    : DbContext(options)
{
    public DbSet<Profile> Profiles => Set<Profile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Profile>(profile =>
        {
            // Perfil local único: el CHECK (id = 1) garantiza a nivel de BD que
            // nunca puede haber más de una fila.
            profile.ToTable("profile", t => t.HasCheckConstraint("CK_profile_id", "id = 1"));

            profile.HasKey(p => p.Id);
            profile.Property(p => p.Id).HasColumnName("id").ValueGeneratedNever();
            profile.Property(p => p.PinHash).HasColumnName("pin_hash");
            profile.Property(p => p.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("datetime('now')");
        });
    }
}

// Lo usa `dotnet ef` al generar migraciones. Sin esto, la herramienta
// ejecutaría Program.Main para obtener el contexto, y eso abriría la ventana.
public class CalendiarioDbContextFactory : IDesignTimeDbContextFactory<CalendiarioDbContext>
{
    public CalendiarioDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<CalendiarioDbContext>()
            .UseSqlite("Data Source=design-time.db")
            .Options;
        return new CalendiarioDbContext(options);
    }
}
