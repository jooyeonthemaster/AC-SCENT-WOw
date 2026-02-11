// Gemini API related types

export interface GeminiAnalysisResult {
  description: string
  traits: Traits
  characteristics: Characteristics
  mood: string[]
  personality: string
}

export interface Traits {
  sexy: number
  cute: number
  charisma: number
  darkness: number
  freshness: number
  elegance: number
  freedom: number
  luxury: number
  purity: number
  uniqueness: number
}

export interface Characteristics {
  citrus: number
  floral: number
  woody: number
  musky: number
  fruity: number
  spicy: number
}
