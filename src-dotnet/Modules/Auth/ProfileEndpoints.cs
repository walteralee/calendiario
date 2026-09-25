namespace Calendiario.Modules.Auth;

// Equivalente de commands.rs: cada endpoint solo traduce HTTP ↔ service.
public static class ProfileEndpoints
{
    public record PinRequest(string? Pin);

    public record UpdatePinRequest(string? CurrentPin, string? NewPin);

    public static void MapProfileEndpoints(this RouteGroupBuilder api)
    {
        var profile = api.MapGroup("/profile");

        profile.MapGet("/exists", (ProfileService service) => service.ProfileExistsAsync());

        profile.MapGet("/has-pin", (ProfileService service) => service.HasPinAsync());

        profile.MapPost("/verify-pin", (PinRequest body, ProfileService service) =>
            service.VerifyPinAsync(body.Pin ?? throw new AppException("Falta el PIN.")));

        profile.MapPost("", async (PinRequest body, ProfileService service) =>
        {
            await service.CreateProfileAsync(body.Pin);
            return Results.NoContent();
        });

        profile.MapPut("/pin", async (UpdatePinRequest body, ProfileService service) =>
        {
            await service.UpdatePinAsync(
                body.CurrentPin ?? throw new AppException("Falta el PIN actual."),
                body.NewPin);
            return Results.NoContent();
        });
    }
}
