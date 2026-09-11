import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Welcome() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: conectar con el backend de auth (siguiente paso).
  }

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

        {/* Login: acceso directo a la app */}
        <div className="flex flex-col justify-center p-10 sm:p-14">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl border-neutral-200 px-5 text-base"
            />
            <Input
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-xl border-neutral-200 px-5 text-base"
            />
            <Button
              type="submit"
              className="h-14 rounded-xl bg-[#8a3a1e] text-base text-white hover:bg-[#732f18]"
            >
              Iniciar sesión
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-xl border-neutral-200 text-base text-neutral-700 hover:bg-neutral-50"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Welcome;
