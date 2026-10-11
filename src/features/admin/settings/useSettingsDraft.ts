"use client";
import type { DemoSettings } from "@/demo/fixtures/commerce";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

/** Ajustes guardados y una forma de guardar solo una parte (con el aviso de que vive en esta demo). */
export function useSettingsDraft() {
  const settings = useAdmin((s) => s.data.settings);
  const saveSettings = useAdmin((s) => s.saveSettings);
  const save = useDemoSave();
  return { settings, commit: (title: string, patch: Partial<DemoSettings>) => save(title, () => saveSettings(patch)) };
}
