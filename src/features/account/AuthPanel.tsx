"use client";
import { Eye, EyeOff, Gift, MapPin, Package, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, describedBy } from "@/components/atoms/Field";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { cn } from "@/lib/cn";
import { useAccount } from "@/stores/account";
import { GoogleSimulated } from "./GoogleSimulated";
import { brand } from "@/config/brand";

type Mode = "login" | "signup";
type Errors = Partial<Record<"name" | "email" | "password", string>>;

const DEMO_USER = { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" };
const BENEFITS = [
  { icon: Package, text: "Seguí tus pedidos paso a paso" },
  { icon: Gift, text: "Tus regalos, enviados y recibidos" },
  { icon: Sparkles, text: "Misiones y premios del Club" },
  { icon: MapPin, text: "Tus direcciones guardadas" },
];

function validate(mode: Mode, v: { name: string; email: string; password: string }): Errors {
  const e: Errors = {};
  if (mode === "signup" && v.name.trim().length < 2) e.name = "Escribí tu nombre.";
  if (!v.email.trim()) e.email = "Escribí tu email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Ese email no parece válido.";
  if (!v.password) e.password = "Escribí una contraseña.";
  else if (v.password.length < (mode === "signup" ? 8 : 6)) e.password = mode === "signup" ? "Usá al menos 8 caracteres." : "La contraseña tiene al menos 6 caracteres.";
  return e;
}

/**
 * Ingreso y registro de la cuenta (8.2.12), de demostración: no hay autenticación real ni servidor. La contraseña
 * se valida en el momento y se descarta (nunca se guarda ni se envía); Google es una simulación explícita.
 */
export function AuthPanel() {
  const login = useAccount((s) => s.login);
  const [mode, setMode] = useState<Mode>("login");
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof values, v: string) => { setValues((s) => ({ ...s, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(mode, values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    // Pausa breve para que se vea el estado "entrando"; la contraseña no sale de este formulario.
    window.setTimeout(() => login({ name: values.name.trim() || values.email.split("@")[0]!, email: values.email.trim() }), 500);
  };
  const switchTo = (m: Mode) => { setMode(m); setErrors({}); setValues((s) => ({ ...s, password: "" })); };
  const fieldError = (k: keyof Errors, hint = false) => ({ "aria-invalid": errors[k] ? (true as const) : undefined, "aria-describedby": describedBy(`auth-${k}`, errors[k], hint) });
  return (
    <div className="grid overflow-hidden rounded-[2.5rem] bg-surface shadow-[var(--shadow-card)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative flex flex-col gap-6 overflow-hidden bg-night p-6 text-on-night sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand-glow)_40%,transparent),transparent)]" />
        <div className="relative">
          <p className="eyebrow text-volt">Cuenta {brand.name}</p>
          <h2 className="font-display mt-3 text-3xl leading-tight sm:text-5xl">Todo lo tuyo, <span className="italic text-volt">en un lugar.</span></h2>
        </div>
        <ul className="relative flex flex-col gap-3 max-sm:hidden">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[15px]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"><Icon size={17} aria-hidden="true" className="text-volt" /></span>{text}</li>
          ))}
        </ul>
        <div aria-hidden="true" className="relative mt-auto flex items-end gap-2 pt-4 max-sm:hidden">
          <Decor kind="shaker" className="h-24 w-24 -rotate-6 drop-shadow-[0_14px_20px_rgb(0_0_0/0.45)] sm:h-28 sm:w-28" />
          <Decor kind="kettlebell" className="h-20 w-20 rotate-3 drop-shadow-[0_14px_20px_rgb(0_0_0/0.45)] sm:h-24 sm:w-24" />
        </div>
        <p className="relative -mt-2 text-xs text-night-muted sm:mt-0">Demo: no hay registro real y nada sale de este navegador.</p>
      </aside>
      <div className="flex flex-col gap-5 p-6 sm:p-10">
        <div role="group" aria-label="Ingresar o crear cuenta" className="grid grid-cols-2 gap-1 rounded-full bg-bg p-1">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchTo(m)}
              className={cn("min-h-11 rounded-full text-sm font-bold transition-colors", mode === m ? "bg-night text-on-night shadow-[var(--shadow-card)]" : "text-muted hover:text-ink")}>
              {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>
        <form key={mode} noValidate autoComplete="off" onSubmit={submit} className="animate-fade-up flex flex-col gap-4">
          {mode === "signup" && (
            <Field id="auth-name" label="Nombre" error={errors.name}>
              <Input id="auth-name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} {...fieldError("name")} />
            </Field>
          )}
          <Field id="auth-email" label="Email" error={errors.email}>
            <Input id="auth-email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={(e) => set("email", e.target.value)} {...fieldError("email")} />
          </Field>
          <Field id="auth-password" label="Contraseña" error={errors.password} hint={mode === "signup" ? "Al menos 8 caracteres. En la demo no se guarda." : undefined}>
            <div className="relative">
              {/* Sin autocompletar: en la demo la contraseña no se guarda, tampoco en el navegador. */}
              <Input id="auth-password" type={show ? "text" : "password"} autoComplete="off" data-1p-ignore data-lpignore="true" value={values.password}
                onChange={(e) => set("password", e.target.value)} className="pr-12" {...fieldError("password", mode === "signup")} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink">
                {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </Field>
          <Button type="submit" size="lg" disabled={busy} aria-busy={busy}>{busy ? "Entrando…" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}</Button>
        </form>
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted"><span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" /></div>
        <GoogleSimulated onPick={() => login(DEMO_USER)} />
        <Button variant="secondary" size="lg" onClick={() => login(DEMO_USER)}>Entrar a la cuenta demo</Button>
        <p className="text-xs text-muted">Cuenta de demostración: cualquier email sirve; la contraseña no se guarda ni se envía a ningún lado.</p>
      </div>
    </div>
  );
}
