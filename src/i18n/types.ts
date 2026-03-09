// i18n 타입 정의

export type Locale = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'th' | 'id'

export type TranslationNamespace =
  | 'common'
  | 'home'
  | 'results'
  | 'perfumes'
  | 'perfumeStories'
  | 'scentHints'

export type TranslationMessages = Record<string, unknown>
