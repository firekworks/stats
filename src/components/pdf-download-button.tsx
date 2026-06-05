"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export function PdfDownloadButton({
  href,
  label,
  variant = "primary"
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(href);
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("application/pdf")) {
        setError("No se pudo generar el PDF. Revisa la configuración.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = getFileName(response.headers.get("content-disposition"));
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="pdf-download-wrap">
      <button
        className={variant === "secondary" ? "button button-secondary" : "button"}
        disabled={loading}
        onClick={handleClick}
        type="button"
      >
        <Download size={16} />
        {loading ? "Generando..." : label}
      </button>
      {error ? <span className="pdf-download-error">{error}</span> : null}
    </span>
  );
}

function getFileName(disposition: string | null) {
  const fallback = "firekworks-stats.pdf";
  const match = disposition?.match(/filename=\"?([^\";]+)\"?/i);
  return match?.[1] || fallback;
}
