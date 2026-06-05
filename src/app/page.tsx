import { ArrowRight, ShieldCheck } from "lucide-react";
import { FirekworksMark } from "@/components/firekworks-mark";
import { ButtonLink, Card } from "@/components/ui";

export default function HomePage() {
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    "local";
  const environment = process.env.VERCEL_ENV ?? "local";

  return (
    <main className="public-home">
      <section className="public-home-inner">
        <div className="public-hero">
          <div className="login-brand-row">
            <FirekworksMark />
            <span>Firekworks Stats</span>
          </div>
          <h1>Firekworks Stats</h1>
          <p>
            Portal privado de resultados para clientes de Firekworks. La app se ha cargado correctamente.
          </p>
          <div className="public-actions">
            <ButtonLink href="/login">
              Acceso cliente
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/admin" variant="secondary">
              Admin
              <ShieldCheck size={18} />
            </ButtonLink>
          </div>
        </div>

        <Card className="public-status-card">
          <span className="eyebrow">Estado</span>
          <strong>App cargada correctamente</strong>
          <p>Build: {commit}</p>
          <p>Entorno: {environment}</p>
        </Card>
      </section>
    </main>
  );
}
