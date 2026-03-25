"use client";
import React, { useState, useRef, useEffect } from "react";
import { EditableText } from "../editor/EditableText";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  greeting?:     string;
  placeholder?:  string;
  buttonLabel?:  string;
  siteSlug?:     string;
  primaryColor?: string;
}

export function ChatWidget({
  greeting    = "Bonjour ! Comment puis-je vous aider ?",
  placeholder = "Posez votre question…",
  buttonLabel = "Chat",
  siteSlug,
  primaryColor = "var(--color-primary)",
}: ChatWidgetProps) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sessionId]             = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Greeting initial
  const allMessages: Message[] = messages.length === 0
    ? [{ role: "assistant", content: greeting }]
    : messages;

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const next = [...(messages.length === 0 ? [] : messages), userMsg];
    // Replace greeting placeholder with actual history
    const history = messages.length === 0 ? [userMsg] : next;
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${siteSlug ?? "demo"}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history, sessionId }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? "Désolé, une erreur est survenue.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Impossible de joindre l'assistant." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <div
        style={{
          position:   "fixed",
          bottom:     24,
          right:      24,
          zIndex:     1000,
        }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width:           52,
            height:          52,
            borderRadius:    "50%",
            border:          "none",
            cursor:          "pointer",
            backgroundColor: primaryColor,
            color:           "#fff",
            fontSize:        22,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            boxShadow:       "0 4px 16px rgba(0,0,0,0.2)",
            transition:      "transform 0.2s",
          }}
          title={buttonLabel}
        >
          {open ? "✕" : "💬"}
        </button>

        {/* Panel */}
        {open && (
          <div
            style={{
              position:        "absolute",
              bottom:          64,
              right:           0,
              width:           340,
              maxHeight:       480,
              borderRadius:    16,
              backgroundColor: "var(--color-surface, #fff)",
              border:          "1px solid var(--color-border, #e5e7eb)",
              boxShadow:       "0 8px 32px rgba(0,0,0,0.15)",
              display:         "flex",
              flexDirection:   "column",
              overflow:        "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding:         "14px 16px",
                backgroundColor: primaryColor,
                color:           "#fff",
                fontWeight:      700,
                fontSize:        15,
                display:         "flex",
                alignItems:      "center",
                gap:             8,
              }}
            >
              <span>💬</span>
              <EditableText field="buttonLabel" value={buttonLabel} />
            </div>

            {/* Messages */}
            <div
              style={{
                flex:       1,
                overflowY:  "auto",
                padding:    "14px 12px",
                display:    "flex",
                flexDirection: "column",
                gap:        10,
              }}
            >
              {allMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf:       msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth:        "80%",
                    padding:         "9px 13px",
                    borderRadius:    msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    backgroundColor: msg.role === "user" ? primaryColor : "var(--color-background, #f9fafb)",
                    color:           msg.role === "user" ? "#fff" : "var(--color-text, #111827)",
                    fontSize:        14,
                    lineHeight:      1.5,
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    padding:   "9px 13px",
                    borderRadius: "14px 14px 14px 4px",
                    backgroundColor: "var(--color-background, #f9fafb)",
                    color: "var(--color-text-muted, #6b7280)",
                    fontSize: 13,
                  }}
                >
                  …
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding:     "10px 12px",
                borderTop:   "1px solid var(--color-border, #e5e7eb)",
                display:     "flex",
                gap:         8,
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={placeholder}
                style={{
                  flex:            1,
                  border:          "1px solid var(--color-border, #e5e7eb)",
                  borderRadius:    8,
                  padding:         "8px 12px",
                  fontSize:        14,
                  outline:         "none",
                  backgroundColor: "var(--color-background, #f9fafb)",
                  color:           "var(--color-text, #111827)",
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  padding:         "8px 14px",
                  borderRadius:    8,
                  border:          "none",
                  cursor:          "pointer",
                  backgroundColor: primaryColor,
                  color:           "#fff",
                  fontSize:        18,
                  lineHeight:      1,
                  opacity:         loading || !input.trim() ? 0.5 : 1,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
