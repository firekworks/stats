"use client";

import { Clipboard, KeyRound, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { Client } from "@/lib/types";

export function ClientAccessForm({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const selectedClient = clients.find((client) => client.id === clientId) || clients[0];
  const suggestedUsername = useMemo(
    () => slugify(selectedClient?.publicName || selectedClient?.legalName || "cliente"),
    [selectedClient]
  );
  const [username, setUsername] = useState(suggestedUsername);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<{
    username: string;
    temporaryPassword: string;
    clientName: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setCredentials(null);

    const response = await fetch("/api/admin/client-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientId, username, password, fullName })
    });
    const payload = (await response.json()) as {
      username?: string;
      temporaryPassword?: string;
      clientName?: string;
      error?: string;
    };

    setSaving(false);

    if (!response.ok || !payload.username || !payload.temporaryPassword || !payload.clientName) {
      setMessage(payload.error || "No se pudo crear el acceso");
      return;
    }

    setCredentials({
      username: payload.username,
      temporaryPassword: payload.temporaryPassword,
      clientName: payload.clientName
    });
    setPassword("");
    setMessage("Acceso creado y portal habilitado");
  }

  function handleClientChange(nextClientId: string) {
    const nextClient = clients.find((client) => client.id === nextClientId);
    setClientId(nextClientId);
    setUsername(slugify(nextClient?.publicName || nextClient?.legalName || "cliente"));
  }

  async function copyCredentials() {
    if (!credentials) return;
    await navigator.clipboard.writeText(
      `Firekworks Stats\nCliente: ${credentials.clientName}\nUsuario: ${credentials.username}\nContraseña temporal: ${credentials.temporaryPassword}`
    );
    setMessage("Credenciales copiadas");
  }

  return (
    <section className="grid grid-2">
      <form className="card form" onSubmit={handleSubmit}>
        <div className="card-header">
          <div>
            <span className="eyebrow">Acceso cliente</span>
            <h2 className="m-0 text-[1.18rem] font-[850]">Crear usuario</h2>
          </div>
          <KeyRound size={22} />
        </div>

        <div className="field">
          <label htmlFor="clientId">Cliente</label>
          <select id="clientId" value={clientId} onChange={(event) => handleClientChange(event.target.value)}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.publicName}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="username">Usuario</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]" size={18} />
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(slugify(event.target.value))}
              className="w-full pl-11"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="fullName">Nombre visible</label>
          <input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña temporal</label>
          <input
            id="password"
            type="password"
            minLength={10}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        {message ? <p className="m-0 text-sm text-[#6e6e73]">{message}</p> : null}

        <button className="button justify-center" disabled={saving || !clientId} type="submit">
          <KeyRound size={18} />
          {saving ? "Creando..." : "Crear acceso"}
        </button>
      </form>

      <section className="card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Entrega</span>
            <h2 className="m-0 text-[1.18rem] font-[850]">Credenciales</h2>
          </div>
          <Clipboard size={22} />
        </div>
        {credentials ? (
          <div className="mt-5 grid gap-3">
            <Credential label="Cliente" value={credentials.clientName} />
            <Credential label="Usuario" value={credentials.username} />
            <Credential label="Contraseña temporal" value={credentials.temporaryPassword} />
            <button className="button button-secondary justify-center" type="button" onClick={copyCredentials}>
              <Clipboard size={17} />
              Copiar
            </button>
          </div>
        ) : (
          <p className="m-0 mt-5 text-[#6e6e73]">
            El email tecnico queda oculto para el cliente. Solo se entrega usuario y contraseña temporal.
          </p>
        )}
      </section>
    </section>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="list-item">
      <div className="list-item-main">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function slugify(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 32);

  return normalized || "cliente";
}
