import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile, hasPin, profileExists, verifyPin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GRID_COLS = 7;
const GRID_ROWS = 4;

// Casillas destacadas del grid decorativo (fila-columna, 0-indexado): evocan
// un calendario con días marcados, como los que se guardan en Calendiario.
const HIGHLIGHTED_CELLS = new Set([
  "0-2",
  "0-6",
  "1-2",
  "1-6",
  "2-2",
  "2-6",
  "3-3",
]);

// Qué muestra el panel derecho según el perfil guardado en la BD.
// "cargando": aún no se sabe → no se pinta nada (evita parpadeos).
// "error": no se pudo leer el perfil → mensaje + botón para reintentar.
type Modo = "cargando" | "crear" | "login" | "error";

const INPUT_CLASS = "h-14 rounded-xl border-neutral-200 px-5 text-base";
const BOTON_CLASS =
  "h-14 rounded-xl bg-[#8a3a1e] text-base text-white hover:bg-[#732f18]";

function Welcome() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("cargando");
  // Cambiarlo vuelve a lanzar la comprobación del perfil (botón "Reintentar").
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    async function decidir() {
      try {
        const existe = await profileExists();
        if (!existe) {
          setModo("crear");
          return;
        }
        const conPin = await hasPin();
        if (conPin) {
          setModo("login");
        } else {
          navigate("/app", { replace: true });
        }
      } catch {
        setModo("error");
      }
    }
    void decidir();
  }, [navigate, intento]);

  function reintentar() {
    setModo("cargando");
    setIntento((n) => n + 1);
  }

  if (modo === "cargando") return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ef] p-4">
      <div className="grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-black/5 md:grid-cols-2 md:divide-x md:divide-neutral-200">
        {/* Bienvenida: grid decorativo + texto */}
        <div className="p-10 sm:p-14">
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
              const row = Math.floor(i / GRID_COLS);
              const col = i % GRID_COLS;
              const highlighted = HIGHLIGHTED_CELLS.has(`${row}-${col}`);

              return (
                <div
                  key={i}
                  className={
                    highlighted
                      ? "aspect-square rounded-xl bg-[#d9603a] transition-transform duration-300 hover:scale-105"
                      : "aspect-square rounded-xl border border-neutral-200 bg-neutral-50 transition-transform duration-300 hover:scale-105"
                  }
                />
              );
            })}
          </div>

          <div className="mt-10">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
              Bienvenido a Calendiario
            </h1>
            <p className="mt-3 text-base leading-relaxed text-neutral-500">
              Guarda tu año, día a día.
            </p>
          </div>
        </div>

        {/* Acceso: crear el PIN la primera vez, o introducirlo después */}
        <div className="flex flex-col justify-center p-10 sm:p-14">
          {modo === "crear" && <CrearPerfil onHecho={() => navigate("/app")} />}
          {modo === "login" && (
            <IniciarSesion onHecho={() => navigate("/app")} />
          )}
          {modo === "error" && (
            <div className="flex flex-col gap-4">
              <p role="alert" className="text-base text-neutral-700">
                No se pudo comprobar tu perfil. Inténtalo de nuevo.
              </p>
              <Button onClick={reintentar} className={BOTON_CLASS}>
                Reintentar
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CrearPerfil({ onHecho }: { onHecho: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmarPin, setConfirmarPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pin && pin !== confirmarPin) {
      setError("El PIN y su confirmación no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await createProfile(pin || null);
      onHecho();
    } catch (err) {
      setError(typeof err === "string" ? err : "No se pudo crear el perfil.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="password"
        placeholder="PIN (opcional)"
        autoComplete="new-password"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          setError(null);
        }}
        className={INPUT_CLASS}
      />
      {pin && (
        <Input
          type="password"
          placeholder="Confirmar PIN"
          autoComplete="new-password"
          value={confirmarPin}
          aria-invalid={error !== null}
          onChange={(e) => {
            setConfirmarPin(e.target.value);
            setError(null);
          }}
          className={INPUT_CLASS}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={enviando} className={BOTON_CLASS}>
        Empezar
      </Button>
    </form>
  );
}

function IniciarSesion({ onHecho }: { onHecho: () => void }) {
  const [pin, setPin] = useState("");
  const [incorrecto, setIncorrecto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setEnviando(true);
    try {
      const coincide = await verifyPin(pin);
      if (coincide) {
        onHecho();
      } else {
        setIncorrecto(true);
      }
    } catch {
      setIncorrecto(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="password"
        placeholder="PIN"
        autoComplete="current-password"
        autoFocus
        value={pin}
        aria-invalid={incorrecto}
        onChange={(e) => {
          setPin(e.target.value);
          setIncorrecto(false);
        }}
        className={INPUT_CLASS}
      />
      {incorrecto && <p className="text-sm text-destructive">PIN incorrecto</p>}
      <Button type="submit" disabled={enviando} className={BOTON_CLASS}>
        Iniciar sesión
      </Button>
    </form>
  );
}

export default Welcome;
