import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function Register() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-foreground">
      <Button
        variant="ghost"
        className="absolute top-6 left-6"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <p className="text-sm text-muted-foreground">
        Aquí irá el formulario de registro (siguiente paso).
      </p>
    </main>
  );
}

export default Register;
