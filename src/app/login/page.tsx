import { BarChart3, CheckCircle2, FileText, ReceiptText } from "lucide-react";
import { FirekworksMark } from "@/components/firekworks-mark";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui";
import { getStatsLoginTexts } from "@/lib/app-texts";

const loginBenefits = [
  { label: "Metricas reales", icon: BarChart3 },
  { label: "Informes mensuales", icon: FileText },
  { label: "Facturas y proximos pasos", icon: ReceiptText }
];

export default async function LoginPage() {
  const { texts, pendingMigration } = await getStatsLoginTexts();

  return (
    <main className="login-page">
      <Card className="login-card">
        <div className="login-grid">
          <section className="grid content-between gap-8">
            <div>
              <div className="login-brand-row">
                <FirekworksMark />
                <span>Firekworks Stats</span>
              </div>
              <span className="eyebrow">{texts.badge}</span>
              <h1 className="mt-3 text-[clamp(2.4rem,5vw,5rem)] font-[850] leading-none">
                {texts.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-[#6e6e73]">{texts.subtitle}</p>
            </div>
            <ul className="login-benefits">
              {loginBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <li key={benefit.label}>
                    <span>
                      <Icon size={17} />
                    </span>
                    {benefit.label}
                    <CheckCircle2 size={17} className="ml-auto text-[#2f9e44]" />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card card-muted">
            <div className="mb-6">
              <span className="eyebrow">Acceso</span>
              <h2 className="m-0 mt-2 text-3xl font-[850]">
                Usuario y contraseña
              </h2>
            </div>
            {pendingMigration ? (
              <p className="mb-4 rounded-[18px] border border-[#e5e5ea] bg-white px-4 py-3 text-sm text-[#6e6e73]">
                Textos cargados en modo compatibilidad hasta aplicar la migración de Stats.
              </p>
            ) : null}
            <LoginForm
              usernameLabel={texts.usernameLabel}
              passwordLabel={texts.passwordLabel}
              buttonLabel={texts.button}
              invalidMessage={texts.errorInvalid}
            />
          </section>
        </div>
      </Card>
    </main>
  );
}
