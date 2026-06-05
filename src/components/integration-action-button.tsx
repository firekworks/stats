"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function IntegrationActionButton({
  endpoint,
  body,
  label,
  variant = "secondary"
}: {
  endpoint: string;
  body: Record<string, unknown>;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function runAction() {
    setState("loading");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).catch(() => null);

    setState(response?.ok ? "done" : "error");
  }

  const className =
    variant === "primary"
      ? "button"
      : variant === "ghost"
        ? "button button-ghost"
        : "button button-secondary";

  return (
    <button
      className={className}
      type="button"
      onClick={runAction}
      disabled={state === "loading"}
      title={state === "error" ? "No se pudo completar la accion" : undefined}
    >
      {state === "loading" ? <Loader2 className="animate-spin" size={16} /> : null}
      {state === "done" ? "Hecho" : state === "error" ? "Reintentar" : label}
    </button>
  );
}
