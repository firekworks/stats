"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  FilePlus2,
  FolderOpen,
  Loader2,
  Plus,
  ReceiptText,
  Save,
  Search
} from "lucide-react";
import type { Campaign, Client } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";
type LeadCandidate = {
  id: string;
  name: string;
  sector: string;
  city: string;
  phone: string;
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
  googleMapsUrl: string;
  contactName: string;
  score: number;
  status: string;
  notes: string;
};

type ClientDraft = {
  publicName: string;
  industry: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  pack: "390" | "590";
  status: "active" | "pending" | "paused";
  type: "real" | "demo";
  driveFolderId: string;
  canvaFolderUrl: string;
  canvaAccountUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  googleBusinessProfileUrl: string;
  whatsappUrl: string;
  legalName: string;
  taxId: string;
  address: string;
  monthlyFee: string;
  adBudget: string;
  internalNotes: string;
};

const emptyDraft: ClientDraft = {
  publicName: "",
  industry: "",
  city: "",
  contactName: "",
  phone: "",
  email: "",
  website: "",
  pack: "390",
  status: "active",
  type: "real",
  driveFolderId: "",
  canvaFolderUrl: "",
  canvaAccountUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  googleBusinessProfileUrl: "",
  whatsappUrl: "",
  legalName: "",
  taxId: "",
  address: "",
  monthlyFee: "",
  adBudget: "",
  internalNotes: ""
};

export function NewClientForm() {
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState<"manual" | "lead">("manual");
  const [draft, setDraft] = useState<ClientDraft>(emptyDraft);
  const [leadQuery, setLeadQuery] = useState("");
  const [leadResults, setLeadResults] = useState<LeadCandidate[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadCandidate | null>(null);
  const [leadMessage, setLeadMessage] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);

  const resolvedPlan = useMemo(() => {
    if (draft.pack === "590") {
      return {
        ads: draft.adBudget || "150",
        fee: draft.monthlyFee || "590",
        name: "Pack 590 - Crecimiento local"
      };
    }

    return {
      ads: draft.adBudget || "90",
      fee: draft.monthlyFee || "390",
      name: "Pack 390 - Base local"
    };
  }, [draft.adBudget, draft.monthlyFee, draft.pack]);

  useEffect(() => {
    if (origin !== "lead" || leadQuery.trim().length < 2) {
      setLeadResults([]);
      setLeadMessage("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLeadLoading(true);
      const response = await fetch(
        `/api/admin/leads/search?q=${encodeURIComponent(leadQuery)}`,
        { signal: controller.signal }
      ).catch(() => null);

      setLeadLoading(false);

      if (!response?.ok) {
        setLeadMessage("No se pudieron buscar leads.");
        return;
      }

      const payload = (await response.json()) as {
        leads?: LeadCandidate[];
        missing?: string[];
        error?: string;
      };

      setLeadResults(payload.leads ?? []);
      setLeadMessage(
        payload.missing?.length
          ? `Faltan variables: ${payload.missing.join(", ")}`
          : payload.error ?? ""
      );
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [leadQuery, origin]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    form.set("origin", origin);
    if (selectedLead) form.set("leadId", selectedLead.id);
    form.set("planName", resolvedPlan.name);
    form.set("monthlyFee", resolvedPlan.fee);
    form.set("adBudget", resolvedPlan.ads);
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
    const payload = (await response.json().catch(() => ({}))) as { reused?: boolean };
    setMessage(
      payload.reused
        ? "Este lead ya estaba convertido. Abre su ficha desde la lista."
        : "Cliente creado. Recarga la cartera para verlo en la lista."
    );
    event.currentTarget.reset();
    setDraft(emptyDraft);
    setSelectedLead(null);
  }

  function updateDraft<K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectLead(lead: LeadCandidate) {
    setSelectedLead(lead);
    setDraft((current) => ({
      ...current,
      publicName: lead.name,
      industry: lead.sector,
      city: lead.city,
      contactName: lead.contactName,
      phone: lead.phone,
      website: lead.website,
      instagramUrl: lead.instagramUrl,
      facebookUrl: lead.facebookUrl,
      googleBusinessProfileUrl: lead.googleMapsUrl,
      whatsappUrl: lead.whatsappUrl,
      internalNotes: lead.notes
    }));
  }

  return (
    <details className="inline-form client-create-panel">
      <summary>
        <Plus size={16} />
        Nuevo cliente
      </summary>
      <form className="form mt-4" onSubmit={submit}>
        <div className="new-client-grid">
          <aside className="client-live-preview">
            <span className="eyebrow">Ficha previa</span>
            <strong>{draft.publicName || "Nuevo cliente"}</strong>
            <p>
              {(draft.industry || "Sector pendiente")} ·{" "}
              {draft.city || "Ciudad pendiente"}
            </p>
            <div className="preview-lines">
              <span>{resolvedPlan.name}</span>
              <span>{draft.contactName || "Contacto pendiente"}</span>
              <span>{draft.phone || draft.email || "Sin contacto todavía"}</span>
            </div>
            {selectedLead ? (
              <div className="notice-card notice-success">
                <CheckCircle2 size={17} />
                <span>
                  Lead seleccionado: {selectedLead.status} · score{" "}
                  {selectedLead.score || 0}
                </span>
              </div>
            ) : null}
          </aside>

          <section className="new-client-form-body">
            <div className="form-grid">
              <label className="field">
                <span>Origen</span>
                <select
                  name="origin"
                  onChange={(event) => setOrigin(event.target.value as "manual" | "lead")}
                  value={origin}
                >
                  <option value="manual">Crear manualmente</option>
                  <option value="lead">Convertir desde Leads</option>
                </select>
              </label>
              <label className="field">
                <span>Pack</span>
                <select
                  name="pack"
                  onChange={(event) => updateDraft("pack", event.target.value as "390" | "590")}
                  value={draft.pack}
                >
                  <option value="390">Pack 390 - Base local</option>
                  <option value="590">Pack 590 - Crecimiento local</option>
                </select>
              </label>
            </div>

            {origin === "lead" ? (
              <div className="lead-picker">
                <label className="field">
                  <span>Buscar lead ganado</span>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]"
                      size={17}
                    />
                    <input
                      className="lead-search-input"
                      onChange={(event) => setLeadQuery(event.target.value)}
                      placeholder="Nombre, ciudad o sector"
                      type="search"
                      value={leadQuery}
                    />
                  </div>
                </label>
                {leadLoading ? (
                  <span className="form-message">Buscando leads ganados...</span>
                ) : null}
                {leadMessage ? <span className="form-message form-message-error">{leadMessage}</span> : null}
                {leadResults.length ? (
                  <div className="lead-result-list">
                    {leadResults.map((lead) => (
                      <button
                        className={selectedLead?.id === lead.id ? "lead-result lead-result-active" : "lead-result"}
                        key={lead.id}
                        onClick={() => selectLead(lead)}
                        type="button"
                      >
                        <strong>{lead.name}</strong>
                        <span>
                          {lead.sector} · {lead.city} · {lead.status}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="form-grid">
              <DraftField draftKey="publicName" label="Nombre comercial" required update={updateDraft} value={draft.publicName} />
              <DraftField draftKey="industry" label="Sector" update={updateDraft} value={draft.industry} />
              <DraftField draftKey="city" label="Ciudad" update={updateDraft} value={draft.city} />
              <DraftField draftKey="contactName" label="Contacto" update={updateDraft} value={draft.contactName} />
              <DraftField draftKey="phone" label="Teléfono" update={updateDraft} value={draft.phone} />
              <DraftField draftKey="email" label="Email" type="email" update={updateDraft} value={draft.email} />
              <DraftField draftKey="website" label="Web" update={updateDraft} value={draft.website} />
              <DraftField draftKey="whatsappUrl" label="WhatsApp URL" update={updateDraft} value={draft.whatsappUrl} />
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Estado</span>
                <select
                  name="status"
                  onChange={(event) => updateDraft("status", event.target.value as ClientDraft["status"])}
                  value={draft.status}
                >
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente datos fiscales</option>
                  <option value="paused">Pausado</option>
                </select>
              </label>
              <label className="field">
                <span>Tipo</span>
                <select
                  name="type"
                  onChange={(event) => updateDraft("type", event.target.value as ClientDraft["type"])}
                  value={draft.type}
                >
                  <option value="real">Real</option>
                  <option value="demo">Demo</option>
                </select>
              </label>
              <DraftField draftKey="driveFolderId" label="Carpeta Drive vinculada" update={updateDraft} value={draft.driveFolderId} />
              <DraftField draftKey="canvaFolderUrl" label="Carpeta Canva" update={updateDraft} value={draft.canvaFolderUrl} />
              <DraftField draftKey="canvaAccountUrl" label="Cuenta/Brand Canva" update={updateDraft} value={draft.canvaAccountUrl} />
              <DraftField draftKey="instagramUrl" label="Cuenta Instagram" update={updateDraft} value={draft.instagramUrl} />
              <DraftField draftKey="facebookUrl" label="Página Facebook" update={updateDraft} value={draft.facebookUrl} />
              <DraftField draftKey="googleBusinessProfileUrl" label="Google Maps / GBP" update={updateDraft} value={draft.googleBusinessProfileUrl} />
            </div>
            <details className="compact-disclosure">
              <summary>Datos internos y fiscales</summary>
              <div className="form-grid mt-4">
                <DraftField draftKey="legalName" label="Razón social" update={updateDraft} value={draft.legalName} />
                <DraftField draftKey="taxId" label="NIF/CIF" update={updateDraft} value={draft.taxId} />
                <DraftField draftKey="address" label="Dirección" update={updateDraft} value={draft.address} />
                <DraftField draftKey="monthlyFee" label="Fee manual" type="number" update={updateDraft} value={draft.monthlyFee} />
                <DraftField draftKey="adBudget" label="Ads manual" type="number" update={updateDraft} value={draft.adBudget} />
              </div>
              <label className="field mt-4">
                <span>Notas internas</span>
                <textarea
                  name="internalNotes"
                  onChange={(event) => updateDraft("internalNotes", event.target.value)}
                  rows={3}
                  value={draft.internalNotes}
                />
              </label>
            </details>
            <SubmitButton icon="plus" label="Crear cliente" state={state} />
            <FormMessage message={message} state={state} />
          </section>
        </div>
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
        <Field name="canvaFolderUrl" label="Carpeta Canva" defaultValue={client.canvaFolderUrl ?? ""} />
        <Field name="canvaAccountUrl" label="Cuenta/Brand Canva" defaultValue={client.canvaAccountUrl ?? ""} />
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

function DraftField<K extends keyof ClientDraft>({
  draftKey,
  label,
  type = "text",
  required = false,
  update,
  value
}: {
  draftKey: K;
  label: string;
  type?: string;
  required?: boolean;
  update: (key: K, value: ClientDraft[K]) => void;
  value: ClientDraft[K];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={String(draftKey)}
        onChange={(event) => update(draftKey, event.target.value as ClientDraft[K])}
        required={required}
        type={type}
        value={String(value)}
      />
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
