// Puente con el backend en C# (ASP.NET Core, mismo origen que la página).
// Una función por operación. Contrato: al fallar SIEMPRE se lanza un string,
// igual que hacía `invoke()` de Tauri:
// - respuesta no 2xx → el campo "error" del JSON (o un respaldo con el código);
// - sin respuesta (servidor caído) → mensaje de conexión;
// - 2xx que no es JSON → mensaje de respuesta inesperada.

async function request<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown,
): Promise<T> {
  const endpoint = `${method} ${path}`;

  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch solo rechaza si no hay respuesta (servidor caído, sin red…) y lo
    // hace con un TypeError: se convierte en string para cumplir el contrato.
    throw `No se pudo conectar con el servidor (${endpoint}).`;
  }

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

  // Un 2xx no garantiza JSON: si quien responde no es nuestro backend (p. ej.
  // el servidor de Vite devolviendo index.html), se detecta aquí con un mensaje
  // claro en vez de reventar con un SyntaxError al parsear.
  const contentType = res.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw `Respuesta inesperada del servidor en ${endpoint} (${contentType || "sin Content-Type"}). ¿Está arrancado el backend?`;
  }
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
