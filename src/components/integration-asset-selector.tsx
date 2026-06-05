"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { ConnectedAssetOverviewRow } from "@/lib/integrations/overview";

export function IntegrationAssetSelector({
  clientId,
  assets
}: {
  clientId: string;
  assets: ConnectedAssetOverviewRow[];
}) {
  const initial = useMemo(
    () => assets.filter((asset) => asset.isSelected).map((asset) => asset.id),
    [assets]
  );
  const [selected, setSelected] = useState<string[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!assets.length) {
    return null;
  }

  function toggle(assetId: string) {
    setSelected((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId]
    );
    setState("idle");
  }

  async function save() {
    setState("saving");
    const response = await fetch("/api/integrations/meta/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        selectedAssetIds: selected
      })
    }).catch(() => null);

    setState(response?.ok ? "saved" : "error");
  }

  return (
    <div className="mt-3 grid gap-2">
      {assets.map((asset) => (
        <label className="small-stat flex cursor-pointer items-center gap-3" key={asset.id}>
          <input
            checked={selected.includes(asset.id)}
            className="h-4 w-4 accent-[#0071e3]"
            onChange={() => toggle(asset.id)}
            type="checkbox"
          />
          <span className="list-item-main">
            <strong>{asset.name}</strong>
            <span>{asset.assetType.replace(/_/g, " ")} · {asset.status}</span>
          </span>
        </label>
      ))}
      <button className="button button-secondary w-fit" type="button" onClick={save}>
        {state === "saving" ? <Loader2 className="animate-spin" size={16} /> : null}
        {state === "saved" ? <Check size={16} /> : null}
        {state === "error" ? "Reintentar guardado" : "Guardar activos"}
      </button>
    </div>
  );
}
