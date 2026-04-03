// app/auth/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";
import { useHydrated } from "@/lib/use-hydrated";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode]         = useState<Mode>("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const { user, setAuth } = useAuthStore();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/dashboard";
  const hydrated     = useHydrated();

  // Redirect already-logged-in users
  useEffect(() => {
    if (hydrated && user) router.replace(redirectTo);
  }, [hydrated, user, router, redirectTo]);

  // Handle Google OAuth callback (?code=...)
  useEffect(() => {
    if (!hydrated || user) return;
    const code = searchParams.get("code");
    if (!code) return;

    const run = async () => {
      setOauthLoading(true);
      setError("");
      try {
        const client = getBrowserSupabaseClient();
        if (!client) {
          throw new Error("Configuration Supabase incomplète (clé anon manquante).");
        }

        const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code);
        if (exchangeError || !data.session?.access_token) {
          throw new Error(exchangeError?.message ?? "Connexion Google impossible.");
        }

        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: data.session.access_token }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Connexion Google impossible.");

        setAuth(payload.user, payload.token);
        router.replace(redirectTo);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Connexion Google impossible.");
      } finally {
        setOauthLoading(false);
      }
    };

    void run();
  }, [hydrated, user, searchParams, setAuth, router, redirectTo]);

  if (!hydrated) return <div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body     = mode === "login"
      ? { email, password }
      : { email, password, name };

    try {
      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      setAuth(data.user, data.token);
      router.push(redirectTo);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setName("");
  };

  const signInWithGoogle = async () => {
    setError("");
    setOauthLoading(true);
    try {
      const client = getBrowserSupabaseClient();
      if (!client) {
        throw new Error("Configuration Supabase incomplète (clé anon manquante).");
      }

      const redirectUrl = `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectTo)}`;
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw new Error(error.message);
    } catch (e: unknown) {
      setOauthLoading(false);
      setError(e instanceof Error ? e.message : "Impossible de lancer Google.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}
    >
      {/* Navbar */}
      <header
        className="px-6 h-14 flex items-center justify-between border-b"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <Link href="/" className="font-bold text-xl" style={{ color: "var(--wg-green)" }}>
          Webgenx
        </Link>
      </header>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl border p-8"
          style={{
            backgroundColor: "var(--wg-bg-2)",
            borderColor:     "var(--wg-border)",
            boxShadow:       "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ backgroundColor: "var(--wg-bg-3)" }}
          >
            {(["login", "register"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: mode === m ? "var(--wg-bg-2)"  : "transparent",
                  color:           mode === m ? "var(--wg-text)"   : "var(--wg-text-2)",
                  boxShadow:       mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--wg-text)" }}>
            {mode === "login" ? "Content de vous revoir" : "Créez votre compte"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--wg-text-2)" }}>
            {mode === "login"
              ? "Connectez-vous pour accéder à vos sites."
              : "Rejoignez Webgenx et créez des sites en secondes."}
          </p>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading || oauthLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              borderColor: "var(--wg-border)",
              backgroundColor: "var(--wg-bg)",
              color: "var(--wg-text)",
            }}
          >
            {oauthLoading ? "Connexion Google…" : "Continuer avec Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "var(--wg-border)" }} />
            <span className="text-xs" style={{ color: "var(--wg-text-3)" }}>ou</span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--wg-border)" }} />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Samuel Yevi"
                  required
                  className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-shadow"
                  style={{
                    backgroundColor: "var(--wg-bg)",
                    borderColor:     "var(--wg-border)",
                    color:           "var(--wg-text)",
                  }}
                  onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.18)")}
                  onBlur={e =>  (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-shadow"
                style={{
                  backgroundColor: "var(--wg-bg)",
                  borderColor:     "var(--wg-border)",
                  color:           "var(--wg-text)",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.18)")}
                onBlur={e =>  (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === "register" ? "6 caractères minimum" : "••••••••"}
                required
                className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-shadow"
                style={{
                  backgroundColor: "var(--wg-bg)",
                  borderColor:     "var(--wg-border)",
                  color:           "var(--wg-text)",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.18)")}
                onBlur={e =>  (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            {error && (
              <p
                className="text-sm px-3 py-2.5 rounded-lg"
                style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="btn-green w-full py-2.5 rounded-lg text-sm font-semibold mt-2"
            >
              {loading
                ? "Chargement…"
                : mode === "login" ? "Se connecter →" : "Créer mon compte →"}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "var(--wg-text-3)" }}>
            {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--wg-green)" }}
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
