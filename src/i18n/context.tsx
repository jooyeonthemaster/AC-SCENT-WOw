'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { Locale, TranslationMessages } from './types'
import { DEFAULT_LOCALE } from './config'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  isLocaleSelected: boolean
  messages: Record<string, TranslationMessages>
  isLoading: boolean
}

const NAMESPACES = ['common', 'home', 'results', 'perfumes', 'perfumeStories', 'scentHints'] as const

async function loadMessages(locale: Locale): Promise<Record<string, TranslationMessages>> {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => {
      try {
        const mod = await import(`./locales/${locale}/${ns}.json`)
        return [ns, mod.default] as const
      } catch {
        // 해당 로케일 파일 없으면 한국어 폴백
        if (locale !== 'ko') {
          try {
            const fallback = await import(`./locales/ko/${ns}.json`)
            return [ns, fallback.default] as const
          } catch {
            return [ns, {}] as const
          }
        }
        return [ns, {}] as const
      }
    })
  )
  return Object.fromEntries(entries)
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const SESSION_LOCALE_KEY = 'acscent-session-locale'

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [isLocaleSelected, setIsLocaleSelected] = useState(false)
  const [messages, setMessages] = useState<Record<string, TranslationMessages>>({})
  const [isLoading, setIsLoading] = useState(true)

  // 세션 내 새로고침 시 언어 복원 (탭 닫으면 자동 초기화 → 키오스크 적합)
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_LOCALE_KEY) as Locale | null
    if (saved) {
      setLocaleState(saved)
      setIsLocaleSelected(true)
      loadMessages(saved).then(msgs => {
        setMessages(msgs)
        setIsLoading(false)
      })
    } else {
      loadMessages(DEFAULT_LOCALE).then(msgs => {
        setMessages(msgs)
        setIsLoading(false)
      })
    }
  }, [])

  // Set data-locale on html + dynamically load locale-specific font
  useEffect(() => {
    document.documentElement.dataset.locale = locale

    const fontMap: Partial<Record<Locale, string>> = {
      ja: 'Noto+Sans+JP',
      'zh-CN': 'Noto+Sans+SC',
      'zh-TW': 'Noto+Sans+TC',
      th: 'Noto+Sans+Thai',
    }
    const fontName = fontMap[locale]
    if (fontName) {
      const linkId = `font-${locale}`
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;700&display=swap`
        document.head.appendChild(link)
      }
    }
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setIsLocaleSelected(true)
    sessionStorage.setItem(SESSION_LOCALE_KEY, newLocale)

    setIsLoading(true)
    loadMessages(newLocale).then(msgs => {
      setMessages(msgs)
      setIsLoading(false)
    })
  }, [])

  const value = useMemo(() => ({
    locale,
    setLocale,
    isLocaleSelected,
    messages,
    isLoading,
  }), [locale, setLocale, isLocaleSelected, messages, isLoading])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
