import { PortalShell } from "@/components/portal-shell";
import { Card } from "@/components/ui";
import { getCurrentProfileOrNull } from "@/lib/auth";
import { getAdminPortalData } from "@/lib/data-access";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfileOrNull();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    return (
      <main className="login-page">
        <Card className="login-card">
          <span className="eyebrow">Acceso denegado</span>
          <h1 className="login-title mt-4">Stats es zona admin.</h1>
          <p className="login-subtitle">
            Tu sesión es válida, pero no tiene permisos de administrador para entrar en el panel interno.
          </p>
        </Card>
      </main>
    );
  }

  const data = await getAdminPortalData();

  return (
    <PortalShell mode="admin" client={data.selectedClient}>
      {children}
    </PortalShell>
  );
}
