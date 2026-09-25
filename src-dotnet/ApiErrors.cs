namespace Calendiario;

public static class ApiErrors
{
    /// Traduce las excepciones de cualquier endpoint del grupo a JSON { "error": ... }:
    /// - `AppException` → 400 con su mensaje (error de negocio, apto para el usuario).
    /// - Cualquier otra → 500 con un mensaje genérico. El detalle (SQL, bcrypt…)
    ///   va SOLO al log, nunca a la respuesta.
    public static RouteGroupBuilder WithApiErrors(this RouteGroupBuilder group)
    {
        group.AddEndpointFilter(async (context, next) =>
        {
            try
            {
                return await next(context);
            }
            catch (AppException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
            catch (Exception e)
            {
                var http = context.HttpContext;
                var logger = http.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("Calendiario.Api");
                logger.LogError(e, "Error inesperado en {Method} {Path}", http.Request.Method, http.Request.Path);

                return Results.Json(new { error = "Error interno." }, statusCode: StatusCodes.Status500InternalServerError);
            }
        });
        return group;
    }
}
