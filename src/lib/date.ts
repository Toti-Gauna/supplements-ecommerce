/** Fechas en español de Argentina, siempre en hora de Buenos Aires (determinista en cualquier equipo). */
const TZ = "America/Argentina/Buenos_Aires";
const dateTime = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });
const dateOnly = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDate(isoOrDay: string): string {
  return dateOnly.format(new Date(isoOrDay.length === 10 ? `${isoOrDay}T12:00:00-03:00` : isoOrDay));
}

/** "2026-10-04" en hora argentina. */
export function toDayKey(iso: string): string {
  return dayKey.format(new Date(iso));
}

const dayMonth = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: TZ });

/** "19 oct. – 31 oct." para un rango AAAA-MM-DD (sin año: las temáticas se repiten cada año). */
export function formatDayRange(from: string, to: string): string {
  const f = (d: string) => dayMonth.format(new Date(`${d}T12:00:00-03:00`));
  return `${f(from)} – ${f(to)}`;
}

const dayFormats = {
  short: new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
  month: new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }),
  dayMonth: new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" }),
};

/** Un día AAAA-MM-DD del calendario del taller: "jue, 8 oct" (short), "jueves, 8 de octubre" (long), "octubre de 2026" (month). */
export function formatDay(day: string, style: keyof typeof dayFormats = "short"): string {
  return dayFormats[style].format(new Date(`${day}T12:00:00Z`));
}
