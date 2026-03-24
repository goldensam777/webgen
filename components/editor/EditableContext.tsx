"use client";
import { createContext, useContext } from "react";

export interface FieldStyle {
  fontSize?: string;
  fontWeight?: string;
}

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  fontWeight?: string;
  fontSize?: string;
  opacity?: string;
  hideOnMobile?: boolean;
}

interface EditableCtx {
  isEditing: boolean;
  canvasMode: boolean;
  fieldStyles: Record<string, FieldStyle>;
  elementStyles: Record<string, ElementStyle>;
  onUpdate:             (field: string, value: string) => void;
  onStyleUpdate:        (field: string, style: FieldStyle) => void;
  onElementStyleUpdate: (elementId: string, style: ElementStyle) => void;
}

export const EditableContext = createContext<EditableCtx>({
  isEditing: false,
  canvasMode: false,
  fieldStyles: {},
  elementStyles: {},
  onUpdate:             () => {},
  onStyleUpdate:        () => {},
  onElementStyleUpdate: () => {},
});

export function useEditable() {
  return useContext(EditableContext);
}
