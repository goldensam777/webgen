"use client";
import { createContext, useContext } from "react";

export interface FieldStyle {
  fontSize?: string;
  fontWeight?: string;
}

interface EditableCtx {
  isEditing: boolean;
  fieldStyles: Record<string, FieldStyle>;
  onUpdate:      (field: string, value: string) => void;
  onStyleUpdate: (field: string, style: FieldStyle) => void;
}

export const EditableContext = createContext<EditableCtx>({
  isEditing: false,
  fieldStyles: {},
  onUpdate:      () => {},
  onStyleUpdate: () => {},
});

export function useEditable() {
  return useContext(EditableContext);
}
