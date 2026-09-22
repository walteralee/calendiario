import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: conectar con el backend de auth (siguiente paso).
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f5f3ef] p-4">
      <Button
        variant="ghost"
        className="absolute top-6 left-6"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-10 shadow-xl shadow-black/5 sm:p-14">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Regístrate para empezar a guardar tu año, día a día.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Nombre"
            autoComplete="username"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="h-14 rounded-xl border-neutral-200 px-5 text-base"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 rounded-xl border-neutral-200 px-5 text-base"
          />
          <Input
            type="password"
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="h-14 rounded-xl border-neutral-200 px-5 text-base"
          />
          <Button
            type="submit"
            className="h-14 rounded-xl bg-[#8a3a1e] text-base text-white hover:bg-[#732f18]"
          >
            Crear cuenta
          </Button>
        </form>
      </div>
    </main>
  );
}

export default Register;
