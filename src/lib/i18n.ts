import { en } from "./translations/en"
import { pt } from "./translations/pt"

const translations = { en, pt } as const
export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof en

export const defaultLocale: Locale = "pt"

export function t(key: TranslationKey, locale: Locale = defaultLocale): string {
  return translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key
}
