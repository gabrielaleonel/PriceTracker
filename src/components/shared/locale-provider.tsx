"use client"

import type { ReactNode } from "react"
import { useState, useCallback } from "react"
import { LocaleContext } from "@/lib/locale-context"
import { t as baseT, type Locale, type TranslationKey } from "@/lib/i18n"

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt")

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  const tFn = useCallback((key: TranslationKey) => baseT(key, locale), [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </LocaleContext.Provider>
  )
}
