namespace Calendiario.Modules.Auth;

public class ProfileService(ProfileRepository repository)
{
    private const string WrongPin = "PIN incorrecto";

    // Mismo coste que `bcrypt::DEFAULT_COST` en Rust (BCrypt.Net-Next usa 11).
    private const int BcryptWorkFactor = 12;

    public async Task<bool> ProfileExistsAsync()
    {
        var profile = await repository.GetProfileAsync();
        return profile is not null;
    }

    public async Task<bool> HasPinAsync()
    {
        var profile = await repository.GetProfileAsync();
        return profile?.PinHash is not null;
    }

    public async Task<bool> VerifyPinAsync(string pin)
    {
        var profile = await repository.GetProfileAsync();

        if (profile?.PinHash is not { } pinHash)
        {
            return false;
        }

        return await VerifyHashAsync(pin, pinHash);
    }

    public async Task CreateProfileAsync(string? pin)
    {
        if (await repository.GetProfileAsync() is not null)
        {
            throw new AppException("Ya existe un perfil.");
        }

        var pinHash = await HashPinAsync(pin);

        await repository.InsertProfileAsync(pinHash);
    }

    /// Cambia o quita el PIN. Si el perfil no tiene PIN, `currentPin` debe ir vacío.
    public async Task UpdatePinAsync(string currentPin, string? newPin)
    {
        var profile = await repository.GetProfileAsync()
            ?? throw new AppException(WrongPin);

        var matches = profile.PinHash is { } hash
            ? await VerifyHashAsync(currentPin, hash)
            : currentPin.Length == 0;
        if (!matches)
        {
            throw new AppException(WrongPin);
        }

        var pinHash = await HashPinAsync(newPin);

        await repository.UpdatePinHashAsync(pinHash);
    }

    // bcrypt es deliberadamente lento (CPU): se ejecuta en el pool de hilos para
    // no bloquear el hilo que atiende la petición (el `spawn_blocking` de Rust).

    private static async Task<string?> HashPinAsync(string? pin)
    {
        if (string.IsNullOrEmpty(pin))
        {
            return null;
        }

        return await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(pin, BcryptWorkFactor));
    }

    private static Task<bool> VerifyHashAsync(string pin, string pinHash) =>
        Task.Run(() => BCrypt.Net.BCrypt.Verify(pin, pinHash));
}
