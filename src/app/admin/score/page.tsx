import { redirect } from "next/navigation";

export default function LegacyScorePage() {
  redirect("/admin/client-score");
}
