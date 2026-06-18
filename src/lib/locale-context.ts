"use client"

import { createContext, useContext } from "react"
import { t as baseT, type Locale, type TranslationKey } from "@/lib/i18n"

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "pt",
  setLocale: () => {},
  t: (key) => baseT(key, "pt"),
})

export function useLocale() {
  return useContext(LocaleContext)
}
