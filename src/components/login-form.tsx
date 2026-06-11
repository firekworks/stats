"use client";

import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient, getSupabaseBrowserConfigError } from "@/lib/supabase/browser";

export function LoginForm({
  usernameLabel = "Usuario",
  passwordLabel = "Contraseña",
  buttonLabel = "Entrar",
  invalidMessage = "Usuario o contraseña incorrectos"
}: {
  usernameLabel?: string;
  passwordLabel?: string;
  buttonLabel?: string;
  invalidMessage?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/username-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password, remember })
    });
    const payload = (await response.json()) as {
      adminSession?: boolean;
      accessToken?: string;
      refreshToken?: string;
      route?: string;
      error?: string;
    };

    if (!response.ok) {
      setLoading(false);
      setMessage(payload.error || invalidMessage);
      return;
    }

    if (payload.adminSession) {
      localStorage.setItem("stats.rememberDevice", String(remember));
      setLoading(false);
      router.push(payload.route || "/admin");
      router.refresh();
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !payload.accessToken || !payload.refreshToken) {
      setLoading(false);
      setMessage(
        getSupabaseBrowserConfigError() ||
          "No se pudo crear la sesión. Revisa la configuración de Supabase."
      );
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: payload.accessToken,
      refresh_token: payload.refreshToken
    });

    setLoading(false);

    if (error) {
      setMessage("No se pudo guardar la sesión");
      return;
    }

    localStorage.setItem("stats.rememberDevice", String(remember));
    router.push(payload.route || "/client");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="username">{usernameLabel}</label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6e6e73]"
            size={18}
          />
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="login-input w-full pl-[52px] pr-4"
            autoComplete="username"
            required
            placeholder={usernameLabel}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">{passwordLabel}</label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6e6e73]"
            size={18}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="login-input login-password-input w-full"
            autoComplete="current-password"
            minLength={8}
            required
          />
          <button
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            className="icon-button login-eye-button absolute right-4 top-1/2 -translate-y-1/2"
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

      <button className="button login-submit justify-center" disabled={loading} type="submit">
        <ShieldCheck size={18} />
        {loading ? "Entrando..." : buttonLabel}
      </button>
    </form>
  );
}
