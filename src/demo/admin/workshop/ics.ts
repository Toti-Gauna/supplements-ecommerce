import { brand } from "@/config/brand";
/** Exportación a Google Calendar / iCal (.ics, RFC 5545): un evento de día completo por entrega comprometida. */
export interface CalendarEvent {
  uid: string;
  /** AAAA-MM-DD */
  day: string;
  title: string;
  description: string;
}

const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const compact = (day: string) => day.replace(/-/g, "");

function nextDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Líneas de más de 75 caracteres se parten con un espacio al inicio de la siguiente (RFC 5545 §3.1). */
function fold(line: string): string {
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 70) parts.push(line.slice(i, i + 70));
  return parts.join("\r\n ");
}

export function toIcs(events: CalendarEvent[], stamp: Date): string {
  const dtstamp = stamp.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${brand.name}//Panel demo//ES`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${brand.name} · Entregas (demo)`,
    ...events.flatMap((e) => [
      "BEGIN:VEVENT", `UID:${e.uid}@${brand.id}-demo`, `DTSTAMP:${dtstamp}`, `DTSTART;VALUE=DATE:${compact(e.day)}`, `DTEND;VALUE=DATE:${compact(nextDay(e.day))}`,
      `SUMMARY:${escape(e.title)}`, `DESCRIPTION:${escape(e.description)}`, "TRANSP:TRANSPARENT", "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
