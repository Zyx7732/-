"use client"

import { useCallback, useEffect, useState } from "react"
import { isLocale, type Locale } from "@/lib/i18n"

const STORAGE_KEY = "admin-ui-locale"

export function useUiLocale(defaultLocale: Locale = "zh") {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (isLocale(stored)) setLocaleState(stored)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === "zh" ? "en" : "zh")
  }, [locale, setLocale])

  return { locale, setLocale, toggleLocale }
}
