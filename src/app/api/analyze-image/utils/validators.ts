// 기본 검증 유틸리티
// Gemini AI 응답의 필수 필드 및 값 범위를 검증합니다.

/**
 * 필수 필드 존재 여부 검증
 */
export function validateRequiredFields(result: any): void {
  const required = ['description', 'traits', 'characteristics', 'mood', 'personality']

  for (const field of required) {
    if (!(field in result)) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

/**
 * Trait 점수 범위 검증 (0-10)
 */
export function validateTraitScores(traits: any): void {
  const traitKeys = [
    'sexy', 'cute', 'charisma', 'darkness', 'freshness',
    'elegance', 'freedom', 'luxury', 'purity', 'uniqueness',
  ]

  for (const key of traitKeys) {
    const value = traits[key]
    if (typeof value !== 'number' || value < 0 || value > 10) {
      throw new Error(`Invalid trait value for ${key}: ${value}`)
    }
  }
}

/**
 * Characteristic 점수 범위 검증 (0-10)
 */
export function validateCharacteristicScores(characteristics: any): void {
  const charKeys = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy']

  for (const key of charKeys) {
    const value = characteristics[key]
    if (typeof value !== 'number' || value < 0 || value > 10) {
      throw new Error(`Invalid characteristic value for ${key}: ${value}`)
    }
  }
}

/**
 * Mood 배열 검증
 */
export function validateMoodArray(mood: any): void {
  if (!Array.isArray(mood) || mood.length === 0) {
    throw new Error('Mood must be a non-empty array')
  }
}

/**
 * 분석 결과 전체 검증 (메인 함수)
 */
export function validateAnalysisResult(result: any): void {
  validateRequiredFields(result)
  validateTraitScores(result.traits)
  validateCharacteristicScores(result.characteristics)
  validateMoodArray(result.mood)
}
