"use client";
import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Divider } from "../ui/Divider";

type AuthMode = "login" | "register" | "forgot";

interface AuthFormProps {
  mode?: AuthMode;
  onLogin?: (data: { email: string; password: string }) => void;
  onRegister?: (data: { name: string; email: string; password: string }) => void;
  onForgot?: (data: { email: string }) => void;
  onGoogleAuth?: () => void;
  onGithubAuth?: () => void;
  showSocial?: boolean;
  showToggle?: boolean;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  bgColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  linkColor?: string;
}

export function AuthForm({
  mode: initialMode = "login",
  onLogin,
  onRegister,
  onForgot,
  onGoogleAuth,
  onGithubAuth,
  showSocial = true,
  showToggle = true,
  logo,
  title,
  subtitle,
  bgColor = "bg-gray-50",
  cardBgColor = "bg-white",
  borderColor = "border-gray-200",
  titleColor = "text-gray-900",
  subtitleColor = "text-gray-500",
  linkColor = "text-blue-600",
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "register" && !name.trim())
      e.name = "Nom requis";
    if (!email.trim())
      e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email invalide";
    if (mode !== "forgot") {
      if (!password)
        e.password = "Mot de passe requis";
      else if (password.length < 8)
        e.password = "8 caractères minimum";
    }
    if (mode === "register" && password !== confirm)
      e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") onLogin?.({ email, password });
      else if (mode === "register") onRegister?.({ name, email, password });
      else onForgot?.({ email });
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    login: "Connexion",
    register: "Créer un compte",
    forgot: "Mot de passe oublié",
  };

  const subtitles: Record<AuthMode, string> = {
    login: "Bienvenue sur Webgen",
    register: "Commencez gratuitement",
    forgot: "Entrez votre email pour réinitialiser",
  };

  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const GithubIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );

  return (
    <section className={`min-h-screen flex items-center justify-center px-4 ${bgColor}`}>
      <div className={`w-full max-w-md ${cardBgColor} border ${borderColor}
        rounded-2xl shadow-sm p-8`}>

        {/* Logo */}
        {logo && (
          <div className="flex justify-center mb-6">{logo}</div>
        )}

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold ${titleColor}`}>
            {title ?? titles[mode]}
          </h1>
          <p className={`mt-1 text-sm ${subtitleColor}`}>
            {subtitle ?? subtitles[mode]}
          </p>
        </div>

        {/* Social */}
        {showSocial && mode !== "forgot" && (
          <>
            <div className="flex gap-3 mb-4">
              {onGoogleAuth && (
                <button
                  onClick={onGoogleAuth}
                  className={`flex-1 flex items-center justify-center gap-2
                    px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium
                    text-gray-700 hover:bg-gray-50 transition-colors`}
                >
                  <GoogleIcon />
                  Google
                </button>
              )}
              {onGithubAuth && (
                <button
                  onClick={onGithubAuth}
                  className={`flex-1 flex items-center justify-center gap-2
                    px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium
                    text-gray-700 hover:bg-gray-50 transition-colors`}
                >
                  <GithubIcon />
                  GitHub
                </button>
              )}
            </div>
            <Divider label="ou" labelColor="text-gray-400" />
            <div className="mb-4" />
          </>
        )}

        {/* Form */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {mode === "register" && (
            <Input
              label="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              error={errors.name}
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            error={errors.email}
          />
          {mode !== "forgot" && (
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
            />
          )}
          {mode === "register" && (
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              error={errors.confirm}
            />
          )}

          {/* Forgot link */}
          {mode === "login" && (
            <div className="flex justify-end -mt-2">
              <button
                onClick={() => setMode("forgot")}
                className={`text-xs ${linkColor} hover:underline`}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <Button isDefault={false} className="w-full justify-center mt-1" type="submit">
            {loading
              ? "Chargement..."
              : mode === "login"
                ? "Se connecter"
                : mode === "register"
                  ? "Créer mon compte"
                  : "Envoyer le lien"
            }
          </Button>
        </form>

        {/* Toggle */}
        {showToggle && (
          <p className={`mt-6 text-center text-sm ${subtitleColor}`}>
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  onClick={() => setMode("register")}
                  className={`${linkColor} font-medium hover:underline`}
                >
                  S&apos;inscrire
                </button>
              </>
            ) : mode === "register" ? (
              <>
                Déjà un compte ?{" "}
                <button
                  onClick={() => setMode("login")}
                  className={`${linkColor} font-medium hover:underline`}
                >
                  Se connecter
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode("login")}
                className={`${linkColor} font-medium hover:underline`}
              >
                ← Retour à la connexion
              </button>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
