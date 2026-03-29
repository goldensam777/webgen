"use client";
import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { EditableText } from "../editor/EditableText";
import { CanvasElement } from "../editor/CanvasElement";

interface ContactProps {
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  messagePlaceholder?: string;
  ctaLabel?: string;
  siteSlug?: string; // présent sur le site publié, absent dans l'éditeur
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export function Contact({
  title,
  subtitle,
  email,
  phone,
  address,
  namePlaceholder = "Votre nom",
  emailPlaceholder = "Votre email",
  messagePlaceholder = "Votre message...",
  ctaLabel = "Envoyer",
  siteSlug,
  onSubmit,
  bgColor = "var(--color-background)",
  titleColor = "var(--color-text)",
  subtitleColor = "var(--color-text-muted)",
}: ContactProps) {
  const [name, setName] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const hasInfo = email || phone || address;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ name, email: emailVal, message });
      return;
    }
    if (!siteSlug) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/submit/${siteSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: emailVal, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName(""); setEmailVal(""); setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className={`max-w-5xl mx-auto ${hasInfo ? "grid md:grid-cols-2 gap-14 items-start" : "max-w-xl"}`}>

        {/* Left: info + header */}
        <div className="min-w-0">
          {(title || subtitle) && (
            <div className="mb-10">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: titleColor }}>
                  <EditableText field="title" value={title} />
                </h2>
              )}
              {subtitle && (
                <p className="mt-4 text-lg break-words" style={{ color: subtitleColor }}>
                  <EditableText field="subtitle" value={subtitle} />
                </p>
              )}
            </div>
          )}

          {hasInfo && (
            <CanvasElement id="info">
              <div className="flex flex-col gap-5">
                {email && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">✉️</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: subtitleColor }}>Email</p>
                      <a href={`mailto:${email}`} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: titleColor }}>
                        <EditableText field="email" value={email} />
                      </a>
                    </div>
                  </div>
                )}
                {phone && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">📞</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: subtitleColor }}>Téléphone</p>
                      <a href={`tel:${phone}`} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: titleColor }}>
                        <EditableText field="phone" value={phone} />
                      </a>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">📍</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: subtitleColor }}>Adresse</p>
                      <p className="text-sm font-medium" style={{ color: titleColor }}>
                        <EditableText field="address" value={address} />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CanvasElement>
          )}
        </div>

        {/* Right: form */}
        <CanvasElement id="form">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 min-w-0">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
            />
            <Input
              label="Email"
              type="email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              placeholder={emailPlaceholder}
            />
            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={messagePlaceholder}
              rows={5}
            />
            <Button isDefault={false} className="w-full justify-center" disabled={status === "sending" || status === "sent"}>
              {status === "sending" ? "Envoi…" : status === "sent" ? "✓ Message envoyé !" : ctaLabel}
            </Button>
            {status === "error" && (
              <p className="text-sm text-center" style={{ color: "#ef4444" }}>
                Une erreur est survenue. Réessayez.
              </p>
            )}
          </form>
        </CanvasElement>

      </div>
    </section>
  );
}
