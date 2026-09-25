using Calendiario.Data;
using Dapper;

namespace Calendiario.Modules.Auth;

// Las columnas snake_case (pin_hash, created_at) se mapean a PinHash/CreatedAt
// gracias a `DefaultTypeMap.MatchNamesWithUnderscores`, activado al arrancar.
public class ProfileRepository(Database db)
{
    public async Task<Profile?> GetProfileAsync()
    {
        await using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Profile>(
            "SELECT id, pin_hash, created_at FROM profile WHERE id = 1");
    }

    public async Task InsertProfileAsync(string? pinHash)
    {
        await using var conn = db.CreateConnection();
        await conn.ExecuteAsync(
            "INSERT INTO profile (id, pin_hash) VALUES (1, @pinHash)",
            new { pinHash });
    }

    public async Task UpdatePinHashAsync(string? pinHash)
    {
        await using var conn = db.CreateConnection();
        await conn.ExecuteAsync(
            "UPDATE profile SET pin_hash = @pinHash WHERE id = 1",
            new { pinHash });
    }
}
