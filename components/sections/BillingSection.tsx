"use client";
import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface Plan {
  name: string;
  price: number | string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
}

interface BillingSectionProps {
  currentPlan?: string;
  plans?: Plan[];
  invoices?: Invoice[];
  paymentMethod?: {
    type: "card" | "mobile";
    last4?: string;
    expiry?: string;
    label?: string;
  };
  onChangePlan?: (plan: string) => void;
  onUpdatePayment?: () => void;
  onCancelPlan?: () => void;
  bgColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

const statusStyles = {
  paid:    "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed:  "bg-red-100 text-red-600",
};

const statusLabels = {
  paid:    "Payé",
  pending: "En attente",
  failed:  "Échoué",
};

function CardIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24"
      stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

export function BillingSection({
  currentPlan,
  plans = [],
  invoices = [],
  paymentMethod,
  onChangePlan,
  onUpdatePayment,
  onCancelPlan,
  bgColor = "bg-gray-50",
  cardBgColor = "bg-white",
  borderColor = "border-gray-200",
  titleColor = "text-gray-900",
  subtitleColor = "text-gray-500",
}: BillingSectionProps) {
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className={`${bgColor} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div>
          <h1 className={`text-2xl font-bold ${titleColor}`}>Facturation</h1>
          <p className={`mt-1 text-sm ${subtitleColor}`}>
            Gérez votre abonnement et vos paiements
          </p>
        </div>

        {/* ── Plan actuel ────────────────────────────────────── */}
        {currentPlan && (
          <Card bgColor={cardBgColor} borderColor={borderColor} shadow="sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide
                  ${subtitleColor}`}>Plan actuel</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className={`text-xl font-bold ${titleColor}`}>
                    {currentPlan}
                  </h2>
                  <Badge bgColor="bg-green-50" textColor="text-green-700"
                    borderColor="border-green-200" size="sm">
                    Actif
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCancel(true)}
                  className={`text-sm ${subtitleColor} hover:text-red-500
                    transition-colors`}>
                  Annuler
                </button>
              </div>
            </div>

            {/* Cancel confirm */}
            {showCancel && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border
                border-red-200 flex items-center justify-between gap-4">
                <p className="text-sm text-red-700 font-medium">
                  Confirmer l&apos;annulation de votre abonnement ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancel(false)}
                    className="text-sm text-gray-600 hover:text-gray-900
                      transition-colors">
                    Non
                  </button>
                  <button
                    onClick={() => { onCancelPlan?.(); setShowCancel(false); }}
                    className="text-sm text-red-600 font-semibold
                      hover:text-red-800 transition-colors">
                    Oui, annuler
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── Plans ──────────────────────────────────────────── */}
        {plans.length > 0 && (
          <div>
            <h2 className={`text-base font-semibold mb-4 ${titleColor}`}>
              Changer de plan
            </h2>
            <div className={`grid gap-4
              ${plans.length <= 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-3"
              }`}>
              {plans.map((plan, i) => (
                <Card
                  key={i}
                  bgColor={plan.highlighted ? "bg-blue-600" : cardBgColor}
                  borderColor={plan.highlighted
                    ? "border-blue-600"
                    : borderColor
                  }
                  shadow={plan.highlighted ? "lg" : "sm"}
                  className="flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold
                      ${plan.highlighted ? "text-white/80" : subtitleColor}`}>
                      {plan.name}
                    </span>
                    {plan.current && (
                      <Badge
                        bgColor={plan.highlighted
                          ? "bg-white/20" : "bg-blue-50"}
                        textColor={plan.highlighted
                          ? "text-white" : "text-blue-700"}
                        borderColor="border-transparent"
                        size="sm"
                      >
                        Actuel
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className={`text-3xl font-bold
                      ${plan.highlighted ? "text-white" : titleColor}`}>
                      {typeof plan.price === "number"
                        ? `${plan.price.toLocaleString()} FCFA`
                        : plan.price
                      }
                    </span>
                    {plan.period && (
                      <span className={`text-sm ml-1
                        ${plan.highlighted
                          ? "text-white/60" : subtitleColor}`}>
                        /{plan.period}
                      </span>
                    )}
                  </div>

                  {plan.description && (
                    <p className={`text-xs mb-4
                      ${plan.highlighted
                        ? "text-white/70" : subtitleColor}`}>
                      {plan.description}
                    </p>
                  )}

                  <ul className="flex flex-col gap-2 mb-6 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <svg className={`w-4 h-4 mt-0.5 shrink-0
                          ${plan.highlighted
                            ? "text-white" : "text-blue-500"}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.highlighted
                          ? "text-white/80" : subtitleColor}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={plan.current}
                    onClick={() => onChangePlan?.(plan.name)}
                    className={`w-full py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${plan.current
                        ? "opacity-50 cursor-not-allowed"
                        : plan.highlighted
                          ? "bg-white text-blue-600 hover:bg-blue-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {plan.current
                      ? "Plan actuel"
                      : plan.ctaLabel ?? "Choisir ce plan"
                    }
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Moyen de paiement ──────────────────────────────── */}
        {paymentMethod && (
          <Card bgColor={cardBgColor} borderColor={borderColor} shadow="sm">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide
                  mb-2 ${subtitleColor}`}>
                  Moyen de paiement
                </p>
                <div className="flex items-center gap-3">
                  <CardIcon />
                  <div>
                    <p className={`text-sm font-medium ${titleColor}`}>
                      {paymentMethod.type === "card"
                        ? `•••• •••• •••• ${paymentMethod.last4}`
                        : paymentMethod.label
                      }
                    </p>
                    {paymentMethod.expiry && (
                      <p className={`text-xs ${subtitleColor}`}>
                        Expire {paymentMethod.expiry}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onUpdatePayment}
                className={`text-sm text-blue-600 font-medium
                  hover:underline transition-colors`}>
                Modifier
              </button>
            </div>
          </Card>
        )}

        {/* ── Historique factures ────────────────────────────── */}
        {invoices.length > 0 && (
          <Card bgColor={cardBgColor} borderColor={borderColor} shadow="sm">
            <h2 className={`text-base font-semibold mb-4 ${titleColor}`}>
              Historique des factures
            </h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {invoices.map((inv) => (
                <div key={inv.id}
                  className="flex items-center justify-between py-3
                    first:pt-0 last:pb-0 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${titleColor}`}>
                      Facture #{inv.id}
                    </p>
                    <p className={`text-xs ${subtitleColor}`}>{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${titleColor}`}>
                      {inv.amount}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5
                      rounded-full text-xs font-medium
                      ${statusStyles[inv.status]}`}>
                      {statusLabels[inv.status]}
                    </span>
                    {inv.downloadUrl && (
                          <a
                        href={inv.downloadUrl}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
