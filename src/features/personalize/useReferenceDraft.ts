"use client";
import { useState } from "react";
import { fileToThumbnail } from "@/lib/image";

export interface ReferenceDraft {
  thumbnail: string | null;
  notes: string;
  processing: boolean;
  error: string | null;
}

export function useReferenceDraft() {
  const [draft, setDraft] = useState<ReferenceDraft>({ thumbnail: null, notes: "", processing: false, error: null });
  const onFile = async (file: File) => {
    setDraft((d) => ({ ...d, processing: true, error: null }));
    try {
      const thumbnail = await fileToThumbnail(file, 480);
      setDraft((d) => ({ ...d, thumbnail, processing: false }));
    } catch {
      setDraft((d) => ({ ...d, processing: false, error: "No pudimos leer esa foto. Probá con otra en JPG o PNG." }));
    }
  };
  return { draft, onFile, setNotes: (notes: string) => setDraft((d) => ({ ...d, notes })) };
}
