import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">Título da Página</h1>
      <p className="text-muted-foreground">Editado via Claude Code</p>
    </div>
  );
}

