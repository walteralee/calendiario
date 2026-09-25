namespace Calendiario;

// Error de negocio con un mensaje apto para mostrar al usuario (el `Err(String)`
// de los services en Rust). Los endpoints lo convierten en 4xx + { "error": ... };
// cualquier otra excepción es un fallo inesperado.
public class AppException(string message) : Exception(message);
