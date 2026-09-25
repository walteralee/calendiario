namespace Calendiario.Modules.Auth;

// Espejo de la tabla `profile`. Perfil local único: la BD fuerza id = 1.
// CreatedAt es texto porque SQLite lo guarda como TEXT (datetime('now')).
public record Profile(long Id, string? PinHash, string CreatedAt);
