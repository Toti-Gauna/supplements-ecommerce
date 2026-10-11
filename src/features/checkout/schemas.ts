import { z } from "zod";

const EMOJI = /\p{Extended_Pictographic}/u;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribí tu nombre y apellido.").max(60).refine((v) => !EMOJI.test(v), "El nombre no puede tener emoji."),
  email: z.string().trim().email("Revisá el email: falta algo (ej.: nombre@mail.com)."),
  phone: z.string().trim().regex(/^[\d\s+()-]{8,20}$/, "Escribí un teléfono con código de área (ej.: 223 555-1234)."),
});

export const addressSchema = z.object({
  street: z.string().trim().min(2, "Escribí la calle."),
  number: z.string().trim().min(1, "Escribí la altura."),
  city: z.string().trim().min(2, "Escribí la ciudad."),
  province: z.string().trim().min(2, "Escribí la provincia."),
  postalCode: z.string().trim().regex(/^\d{4}$|^[A-Za-z]\d{4}[A-Za-z]{3}$/, "Código postal de 4 dígitos (ej.: 7600)."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
