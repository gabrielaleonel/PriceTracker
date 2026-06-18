import { z } from "zod"

export const flightSearchSchema = z.object({
  origin: z
    .string()
    .length(3, "Código do aeroporto deve ter 3 caracteres")
    .toUpperCase(),
  destination: z
    .string()
    .length(3, "Código do aeroporto deve ter 3 caracteres")
    .toUpperCase(),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
  passengers: z.coerce.number().int().min(1).max(9).default(1),
  currency: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).optional(),
})

export const createAlertSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  originName: z.string().optional(),
  destination: z.string().length(3).toUpperCase(),
  destinationName: z.string().optional(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  maxPrice: z.coerce.number().positive(),
  currency: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
    email: z.string().email("Email inválido").toLowerCase(),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
    consentGiven: z.boolean().refine((v) => v === true, {
      message: "Você precisa aceitar os termos de privacidade",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase(),
  password: z.string().min(1, "Senha é obrigatória"),
})
