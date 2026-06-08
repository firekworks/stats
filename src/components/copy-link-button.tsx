"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => null);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="button button-secondary" type="button" onClick={copy}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copiado" : "Copiar enlace"}
    </button>
  );
}
