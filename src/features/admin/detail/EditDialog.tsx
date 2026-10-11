"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";

interface Props {
  open: boolean;
  /** Nombre accesible del diálogo. */
  title: string;
  heading: string;
  /** Frase corta: qué se edita acá (8.3.17). */
  intro: string;
  dirty: boolean;
  /** Guardar habilitado aunque no haya cambios (por ejemplo, al crear). Por defecto, solo con cambios. */
  canSave?: boolean;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal centrado de edición breve (8.3.17); en el celular sube desde abajo con su propio scroll. Guardar y Cancelar
 * siempre a la vista; cerrar con cambios (Cancelar, Escape o la X) pide confirmar antes de descartarlos.
 */
export function EditDialog({ open, title, heading, intro, dirty, canSave = dirty, onSave, onClose, children }: Props) {
  const [ask, setAsk] = useState(false);
  const close = () => { setAsk(false); onClose(); };
  const request = () => (dirty ? setAsk(true) : close());
  return (
    <Sheet open={open} onClose={request} title={title} side="dialog" className="bg-bg">
      <form noValidate onSubmit={(e) => { e.preventDefault(); onSave(); }} className="flex max-h-[94dvh] flex-col sm:max-h-[90dvh]">
        <div className="flex flex-col gap-5 overflow-y-auto p-5 pt-7 sm:p-7">
          <div className="pr-12">
            <h2 className="font-display text-3xl">{heading}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{intro}</p>
          </div>
          {children}
        </div>
        <div className="border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          {ask ? (
            <div role="alertdialog" aria-label="Cambios sin guardar" className="flex flex-wrap items-center justify-end gap-2">
              <p className="mr-auto text-sm font-bold text-warning">Tenés cambios sin guardar.</p>
              <Button variant="ghost" onClick={() => setAsk(false)}>Seguir editando</Button>
              <Button variant="danger" onClick={close}>Descartar cambios</Button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={request}>Cancelar</Button>
              <Button type="submit" disabled={!canSave}>Guardar</Button>
            </div>
          )}
        </div>
      </form>
    </Sheet>
  );
}
