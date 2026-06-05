import { FirekworksMark } from "@/components/firekworks-mark";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui";
import { getStatsLoginTexts } from "@/lib/app-texts";

const oldSubtitle = "Accede con tu usuario de cliente.";

export default async function LoginPage() {
  const { texts, pendingMigration } = await getStatsLoginTexts();
  const subtitle =
    texts.subtitle === oldSubtitle
      ? "Accede a tus métricas, informes y facturas desde un único panel."
      : texts.subtitle;

  return (
    <main className="login-page">
      <Card className="login-card">
        <div className="login-grid">
          <section className="login-intro">
            <div>
              <div className="login-brand-row">
                <FirekworksMark />
                <span>Firekworks Stats</span>
              </div>
              <h1 className="login-title">
                {texts.title}
              </h1>
              <p className="login-subtitle">{subtitle}</p>
            </div>
          </section>

          <section className="login-form-panel">
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
