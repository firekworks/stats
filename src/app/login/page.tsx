import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="login-page">
      <Card className="login-card">
        <div className="login-grid">
          <section className="grid content-between gap-8">
            <div>
              <span className="eyebrow">Firekworks Stats</span>
              <h1 className="mt-3 text-[clamp(2.4rem,5vw,5rem)] font-[850] leading-none">
                Portal privado de resultados
              </h1>
            </div>
            <div className="grid gap-3 text-[#6e6e73]">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </section>

          <section className="card card-muted">
            <div className="mb-6">
              <span className="eyebrow">Acceso</span>
              <h2 className="m-0 mt-2 text-3xl font-[850]">
                Email y contraseña
              </h2>
            </div>
            <LoginForm />
          </section>
        </div>
      </Card>
    </main>
  );
}
