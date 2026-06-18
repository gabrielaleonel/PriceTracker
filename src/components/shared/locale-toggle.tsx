"use client"

import { useLocale } from "@/lib/locale-context"
import { Languages } from "lucide-react"

export function LocaleToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "pt" ? "en" : "pt")}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/65 hover:text-foreground"
      title={locale === "pt" ? "English" : "Português"}
    >
      <Languages className="h-4 w-4" />
      <span className="ml-1 text-[0.6rem] font-bold uppercase">{locale}</span>
    </button>
  )
}
