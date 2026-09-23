import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
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
  const [incorrecto, setIncorrecto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setEnviando(true);
    try {
      await invoke("actualizar_pin", { pinActual, pinNuevo: pinNuevo || null });
      onCerrar();
    } catch {
      setIncorrecto(true);
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
        aria-invalid={incorrecto}
        onChange={(e) => {
          setPinActual(e.target.value);
          setIncorrecto(false);
        }}
      />
      {incorrecto && <p className="text-sm text-destructive">PIN incorrecto</p>}
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
