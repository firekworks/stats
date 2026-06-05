"use client";

import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("cliente@firekworks.demo");
  const [password, setPassword] = useState("StatsDemo2026!");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      localStorage.setItem("stats.rememberDevice", String(remember));
      router.push(email.includes("admin") ? "/admin" : "/client");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    localStorage.setItem("stats.rememberDevice", String(remember));
    router.push(email.includes("admin") ? "/admin" : "/client");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]"
            size={18}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full pl-11"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]"
            size={18}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-11"
            autoComplete="current-password"
            minLength={12}
            required
          />
          <button
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            className="icon-button absolute right-1 top-1/2 -translate-y-1/2 scale-90"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <label className="check-row">
        <input
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          type="checkbox"
        />
        Recordar este dispositivo
      </label>

      {message ? <p className="m-0 text-sm text-[#d92d20]">{message}</p> : null}

      <button className="button justify-center" disabled={loading} type="submit">
        <ShieldCheck size={18} />
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
