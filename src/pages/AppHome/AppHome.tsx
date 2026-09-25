import { useState } from "react";
import { updatePin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Placeholder temporal: solo confirma que el acceso funciona.
// Sustituir por YearView cuando exista de verdad.
function AppHome() {
  const [cambiandoPin, setCambiandoPin] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f5f3ef] p-4">
      <p className="text-lg text-neutral-700">Calendiario</p>
      {cambiandoPin ? (
        <CambiarPin onCerrar={() => setCambiandoPin(false)} />
      ) : (
        <Button variant="outline" onClick={() => setCambiandoPin(true)}>
          Cambiar PIN
        </Button>
      )}
    </main>
  );
}

function CambiarPin({ onCerrar }: { onCerrar: () => void }) {
  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setEnviando(true);
    try {
      await updatePin(pinActual, pinNuevo || null);
      onCerrar();
    } catch (err) {
      // Con el PIN actual mal, el backend ya responde "PIN incorrecto"; con
      // cualquier otro fallo se muestra su mensaje real, no uno inventado.
      console.error("[AppHome] No se pudo cambiar el PIN:", err);
      setError(typeof err === "string" ? err : "No se pudo cambiar el PIN.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-64 flex-col gap-2">
      <Input
        type="password"
        placeholder="PIN actual"
        autoComplete="current-password"
        value={pinActual}
        aria-invalid={error !== null}
        onChange={(e) => {
          setPinActual(e.target.value);
          setError(null);
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Input
        type="password"
        placeholder="PIN nuevo (opcional)"
        autoComplete="new-password"
        value={pinNuevo}
        onChange={(e) => setPinNuevo(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={enviando}>
          Guardar
        </Button>
        <Button type="button" variant="ghost" onClick={onCerrar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default AppHome;
