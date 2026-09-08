import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Prueba del puente IPC: React -> comando `greet` de Rust -> respuesta.
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Calendiario</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fundación lista · React + Tauri + Tailwind + shadcn/ui
        </p>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void greet();
        }}
      >
        <input
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Tu nombre..."
        />
        <Button type="submit">Saludar</Button>
      </form>

      {greetMsg && <p className="text-sm text-muted-foreground">{greetMsg}</p>}
    </main>
  );
}

export default App;
