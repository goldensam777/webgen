"use client";
import React from "react";

interface StepItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  variant?: "circles" | "bullets" | "numbered";
  size?: "sm" | "md" | "lg";
  activeColor?: string;
  activeTextColor?: string;
  completedColor?: string;
  completedTextColor?: string;
  inactiveColor?: string;
  inactiveTextColor?: string;
  labelColor?: string;
  descriptionColor?: string;
  connectorColor?: string;
  completedConnectorColor?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  variant = "numbered",
  size = "md",
  activeColor = "bg-blue-600",
  activeTextColor = "text-white",
  completedColor = "bg-blue-600",
  completedTextColor = "text-white",
  inactiveColor = "bg-gray-200",
  inactiveTextColor = "text-gray-500",
  labelColor = "text-gray-800",
  descriptionColor = "text-gray-400",
  connectorColor = "bg-gray-200",
  completedConnectorColor = "bg-blue-600",
}: StepperProps) {
  const sizeStyles = {
    sm: { circle: "w-7 h-7 text-xs", label: "text-xs", desc: "text-xs" },
    md: { circle: "w-9 h-9 text-sm", label: "text-sm", desc: "text-xs" },
    lg: { circle: "w-11 h-11 text-base", label: "text-base", desc: "text-sm" },
  };

  const s = sizeStyles[size];

  const getStepState = (index: number) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "inactive";
  };

  const getCircleClass = (state: string) => {
    if (state === "completed") return `${completedColor} ${completedTextColor}`;
    if (state === "active") return `${activeColor} ${activeTextColor}`;
    return `${inactiveColor} ${inactiveTextColor}`;
  };

  const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
        d="M5 13l4 4L19 7" />
    </svg>
  );

  const renderCircle = (item: StepItem, index: number) => {
    const state = getStepState(index);
    return (
      <div className={`shrink-0 inline-flex items-center justify-center
        rounded-full font-semibold transition-all duration-300
        ${s.circle} ${getCircleClass(state)}`}>
        {state === "completed"
          ? <CheckIcon />
          : item.icon
            ? item.icon
            : variant === "numbered"
              ? index + 1
              : <span className="w-2 h-2 rounded-full bg-current" />
        }
      </div>
    );
  };

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col">
        {steps.map((item, index) => {
          const state = getStepState(index);
          const isLast = index === steps.length - 1;
          return (
            <div key={index} className="flex gap-4">
              {/* Circle + connector */}
              <div className="flex flex-col items-center">
                {renderCircle(item, index)}
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 transition-all duration-300
                    ${state === "completed"
                      ? completedConnectorColor
                      : connectorColor
                    }`} />
                )}
              </div>
              {/* Label */}
              <div className={`pb-6 ${isLast ? "" : ""}`}>
                <p className={`font-medium ${s.label}
                  ${state === "inactive" ? inactiveTextColor : labelColor}`}>
                  {item.label}
                </p>
                {item.description && (
                  <p className={`mt-0.5 ${s.desc} ${descriptionColor}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-start w-full">
      {steps.map((item, index) => {
        const state = getStepState(index);
        const isLast = index === steps.length - 1;
        return (
          <React.Fragment key={index}>
            {/* Step */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {renderCircle(item, index)}
              <div className="text-center">
                <p className={`font-medium ${s.label}
                  ${state === "inactive" ? inactiveTextColor : labelColor}`}>
                  {item.label}
                </p>
                {item.description && (
                  <p className={`mt-0.5 ${s.desc} ${descriptionColor} max-w-25`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            {/* Connector */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mt-4 mx-2 transition-all duration-300
                ${state === "completed"
                  ? completedConnectorColor
                  : connectorColor
                }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}