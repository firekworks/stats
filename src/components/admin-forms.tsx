"use client";

import { useState, type FormEvent } from "react";
import { FilePlus2, FolderOpen, Loader2, Plus, ReceiptText, Save } from "lucide-react";
import type { Campaign, Client } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";

export function NewClientForm() {
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries()))
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      setMessage(await readError(response));
      return;
    }

    setState("done");
    setMessage("Cliente creado. Recarga la cartera para verlo en la lista.");
    event.currentTarget.reset();
  }

  return (
    <details className="inline-form">
      <summary>
        <Plus size={16} />
        Nuevo cliente
      </summary>
      <form className="form mt-4" onSubmit={submit}>
        <div className="form-grid">
          <Field name="publicName" label="Nombre comercial" required />
          <Field name="industry" label="Sector" />
          <Field name="city" label="Ciudad" />
          <Field name="contactName" label="Contacto" />
          <Field name="phone" label="Teléfono" />
          <Field name="email" label="Email" type="email" />
          <label className="field">
            <span>Pack</span>
            <select name="pack" defaultValue="390">
              <option value="390">Pack 390 - Base local</option>
              <option value="590">Pack 590 - Crecimiento local</option>
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Estado</span>
            <select name="status" defaultValue="active">
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
              <option value="paused">Pausado</option>
            </select>
          </label>
          <label className="field">
            <span>Tipo</span>
            <select name="type" defaultValue="real">
              <option value="real">Real</option>
              <option value="demo">Demo</option>
            </select>
          </label>
          <Field name="driveFolderId" label="Carpeta Drive vinculada" />
          <Field name="instagramUrl" label="Cuenta Instagram" />
          <Field name="facebookUrl" label="Página Facebook" />
          <Field name="googleBusinessProfileUrl" label="Google Business Profile" />
        </div>
        <details className="compact-disclosure">
          <summary>Datos internos y fiscales</summary>
          <div className="form-grid mt-4">
            <Field name="legalName" label="Razón social" />
            <Field name="taxId" label="NIF/CIF" />
            <Field name="address" label="Dirección" />
            <Field name="monthlyFee" label="Fee manual" type="number" />
            <Field name="adBudget" label="Ads manual" type="number" />
          </div>
          <TextArea name="internalNotes" label="Notas internas" rows={3} />
        </details>
        <SubmitButton icon="plus" label="Crear cliente" state={state} />
        <FormMessage message={message} state={state} />
      </form>
    </details>
  );
}

export function ClientSettingsForm({ client }: { client: Client }) {
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries()))
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      setMessage(await readError(response));
      return;
    }

    setState("done");
    setMessage("Guardado.");
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <Field name="publicName" label="Nombre comercial" defaultValue={client.publicName} required />
        <Field name="slug" label="Slug" defaultValue={client.slug} />
        <Field name="legalName" label="Razón social" defaultValue={client.legalName} />
        <Field name="taxId" label="NIF/CIF" defaultValue={client.taxId ?? ""} />
        <Field name="industry" label="Sector" defaultValue={client.industry} />
        <Field name="city" label="Ciudad" defaultValue={client.city} />
        <Field name="address" label="Dirección" defaultValue={client.billingAddress ?? ""} />
        <Field name="contactName" label="Contacto" defaultValue={client.contactName ?? ""} />
        <Field name="email" label="Email" type="email" defaultValue={client.billingEmail ?? ""} />
        <Field name="phone" label="Teléfono" defaultValue={client.phone ?? ""} />
        <label className="field">
          <span>Pack</span>
          <select name="pack" defaultValue={String(client.monthlyFee >= 540 ? 590 : 390)}>
            <option value="390">Pack 390 - Base local</option>
            <option value="590">Pack 590 - Crecimiento local</option>
          </select>
        </label>
        <Field name="planName" label="Nombre pack" defaultValue={client.planName} />
        <Field name="monthlyFee" label="Fee mensual" type="number" defaultValue={String(client.monthlyFee)} />
        <Field name="adBudget" label="Presupuesto anuncios" type="number" defaultValue={String(client.adBudget ?? 0)} />
        <Field name="driveFolderId" label="Carpeta Drive" defaultValue={client.driveFolderId ?? ""} />
        <Field name="instagramUrl" label="Instagram" defaultValue={client.instagramUrl ?? ""} />
        <Field name="facebookUrl" label="Facebook" defaultValue={client.facebookUrl ?? ""} />
        <Field name="googleBusinessProfileUrl" label="Google Business Profile" defaultValue={client.googleBusinessProfileUrl ?? ""} />
      </div>
      <label className="field">
        <span>Estado</span>
        <select name="status" defaultValue={client.status}>
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
          <option value="churned">Baja</option>
        </select>
      </label>
      <TextArea name="internalNotes" label="Notas internas" defaultValue={client.internalNotes ?? ""} rows={4} />
      <SubmitButton icon="save" label="Guardar cambios" state={state} />
      <FormMessage message={message} state={state} />
    </form>
  );
}

export function NewInvoiceForm({ client }: { client: Client }) {
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, ...Object.fromEntries(form.entries()) })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      setMessage(await readError(response));
      return;
    }

    setState("done");
    setMessage("Factura creada. Recarga la ficha para descargar el PDF.");
    event.currentTarget.reset();
  }

  return (
    <details className="inline-form">
      <summary>
        <ReceiptText size={16} />
        Nueva factura
      </summary>
      <form className="form mt-4" onSubmit={submit}>
        <div className="form-grid">
          <Field name="concept" label="Concepto" defaultValue={`Gestión mensual ${client.planName}`} />
          <Field name="base" label="Base imponible" type="number" defaultValue={String(client.monthlyFee || 0)} required />
          <Field name="vatRate" label="IVA %" type="number" defaultValue="21" />
          <Field name="withholdingRate" label="Retención %" type="number" defaultValue="0" />
          <Field name="issueDate" label="Fecha emisión" type="date" />
          <Field name="dueDate" label="Vencimiento" type="date" />
        </div>
        <SubmitButton icon="invoice" label="Crear factura" state={state} />
        <FormMessage message={message} state={state} />
      </form>
    </details>
  );
}

export function NewContentPieceForm({
  client,
  campaigns
}: {
  client: Client;
  campaigns: Campaign[];
}) {
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, ...Object.fromEntries(form.entries()) })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      setMessage(await readError(response));
      return;
    }

    setState("done");
    setMessage("Pieza creada. Recarga la ficha para verla en la biblioteca.");
    event.currentTarget.reset();
  }

  return (
    <details className="inline-form">
      <summary>
        <FilePlus2 size={16} />
        Nueva pieza
      </summary>
      <form className="form mt-4" onSubmit={submit}>
        <div className="form-grid">
          <label className="field">
            <span>Formato</span>
            <select name="format" defaultValue="Reel">
              <option>Reel</option>
              <option>Post</option>
              <option>Carrusel</option>
              <option>Story</option>
              <option>Creatividad</option>
            </select>
          </label>
          <Field name="title" label="Título" required />
          <Field name="objective" label="Objetivo" />
          <Field name="hook" label="Gancho" />
          <Field name="cta" label="CTA" />
          <Field name="date" label="Fecha" type="date" />
        </div>
        <label className="field">
          <span>Campaña del mes</span>
          <select name="campaignId" defaultValue={campaigns[0]?.id ?? ""}>
            <option value="">Sin campaña</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Guion / copy</span>
          <textarea name="copy" rows={4} />
        </label>
        <div className="form-grid">
          <Field name="driveFileUrl" label="Archivo Drive URL" />
          <Field name="canvaUrl" label="Canva URL" />
          <Field name="budget" label="Presupuesto promocionado" type="number" />
        </div>
        <label className="field">
          <span>Estado</span>
          <select name="status" defaultValue="idea">
            <option value="idea">Idea</option>
            <option value="recorded">Grabar</option>
            <option value="editing">Editar</option>
            <option value="pending_approval">Revisar</option>
            <option value="scheduled">Programado</option>
            <option value="published">Publicado</option>
          </select>
        </label>
        <label className="check-field">
          <input name="promoted" type="checkbox" value="true" />
          <span>Promocionado</span>
        </label>
        <label className="check-field">
          <input name="clientVisible" type="checkbox" value="true" />
          <span>Visible en portal cliente</span>
        </label>
        <SubmitButton icon="plus" label="Crear pieza" state={state} />
        <FormMessage message={message} state={state} />
      </form>
    </details>
  );
}

export function DriveAssetsPanel({ client }: { client: Client }) {
  const [state, setState] = useState<RequestState>("idle");
  const [files, setFiles] = useState<Array<{ id: string; name: string; webViewLink: string }>>([]);
  const [message, setMessage] = useState("");

  async function loadFiles() {
    setState("loading");
    setMessage("");
    const response = await fetch(
      `/api/google/drive-files?clientId=${client.id}&folderId=${client.driveFolderId ?? ""}`
    ).catch(() => null);

    if (!response?.ok) {
      setState("error");
      setMessage(await readError(response));
      return;
    }

    const body = (await response.json()) as {
      files?: Array<{ id: string; name: string; webViewLink: string }>;
      reason?: string | null;
    };
    setFiles(body.files ?? []);
    setState("done");
    setMessage(body.reason === "not_connected" ? "Google Drive no conectado." : "");
  }

  return (
    <div className="drive-panel">
      <button className="button button-secondary" type="button" onClick={loadFiles}>
        {state === "loading" ? <Loader2 className="animate-spin" size={16} /> : <FolderOpen size={16} />}
        Ver archivos Drive
      </button>
      <FormMessage message={message} state={state} />
      {files.length ? (
        <div className="drive-file-list">
          {files.slice(0, 6).map((file) => (
            <a href={file.webViewLink} key={file.id} rel="noreferrer" target="_blank">
              {file.name}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = false
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required} />
    </label>
  );
}

function TextArea({
  name,
  label,
  defaultValue = "",
  rows = 4
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} />
    </label>
  );
}

function SubmitButton({
  icon,
  label,
  state
}: {
  icon: "plus" | "save" | "invoice";
  label: string;
  state: RequestState;
}) {
  const Icon = state === "loading" ? Loader2 : icon === "save" ? Save : icon === "invoice" ? ReceiptText : Plus;

  return (
    <button className="button" disabled={state === "loading"} type="submit">
      <Icon className={state === "loading" ? "animate-spin" : ""} size={16} />
      {state === "loading" ? "Guardando..." : label}
    </button>
  );
}

function FormMessage({ message, state }: { message: string; state: RequestState }) {
  if (!message) return null;

  return (
    <span className={state === "error" ? "form-message form-message-error" : "form-message"}>
      {message}
    </span>
  );
}

async function readError(response: Response | null) {
  const body = await response?.json().catch(() => null);
  return typeof body?.error === "string" ? body.error : "No se pudo guardar.";
}
