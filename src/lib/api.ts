// Puente con el backend en C# (ASP.NET Core, mismo origen que la página).
// Una función por operación. Si la respuesta no es 2xx se lanza el string del
// campo "error" del JSON, igual que hacía `invoke()` de Tauri al fallar: los
// componentes pueden seguir haciendo `catch (err) { typeof err === "string" … }`.

async function request<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    // Respaldo por si el cuerpo no trae { error } (p. ej. JSON mal formado).
    let message = `Error ${res.status}`;
    try {
      const data: unknown = await res.json();
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
      ) {
        message = data.error;
      }
    } catch {
      // Cuerpo vacío o no JSON: se queda el mensaje de respaldo.
    }
    throw message;
  }

  // 204 No Content: operaciones sin valor de retorno (el `()` de Rust).
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function profileExists(): Promise<boolean> {
  return request("GET", "/api/profile/exists");
}

export function hasPin(): Promise<boolean> {
  return request("GET", "/api/profile/has-pin");
}

export function verifyPin(pin: string): Promise<boolean> {
  return request("POST", "/api/profile/verify-pin", { pin });
}

export function createProfile(pin: string | null): Promise<void> {
  return request("POST", "/api/profile", { pin });
}

export function updatePin(
  currentPin: string,
  newPin: string | null,
): Promise<void> {
  return request("PUT", "/api/profile/pin", { currentPin, newPin });
}
