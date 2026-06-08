import { Card, ButtonLink } from "@/components/ui";

export default function AccessDeniedPage() {
  return (
    <main className="login-page">
      <Card className="login-card">
        <span className="eyebrow">Acceso denegado</span>
        <h1 className="login-title mt-4">No tienes permisos para esta zona.</h1>
        <p className="login-subtitle">
          Tu sesión está activa, pero Stats solo permite entrar al panel interno
          con un usuario administrador.
        </p>
        <div className="public-actions mt-6">
          <ButtonLink href="/client" variant="secondary">
            Ir a portal cliente
          </ButtonLink>
          <ButtonLink href="/login">
            Cambiar usuario
          </ButtonLink>
        </div>
      </Card>
    </main>
  );
}
