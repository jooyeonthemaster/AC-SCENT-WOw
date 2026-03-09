// i18n 설정: 언어 목록, 표시명, 폰트 매핑

import type { Locale } from './types'

export interface LocaleConfig {
  code: Locale
  label: string
  nativeLabel: string
  flag: string
}

export const LOCALES: LocaleConfig[] = [
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeLabel: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: 'Chinese (Traditional)', nativeLabel: '繁體中文', flag: '🇹🇼' },
  { code: 'th', label: 'Thai', nativeLabel: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩' },
]

export const DEFAULT_LOCALE: Locale = 'ko'

export const LOCALE_STORAGE_KEY = 'acscent-locale'
