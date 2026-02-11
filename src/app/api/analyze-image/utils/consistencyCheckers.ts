// 품질 검증 유틸리티
// 분석 결과의 일관성 및 품질을 체크합니다 (경고만 출력, 예외 발생 안 함).

import { logger } from '@/lib/utils/logger'

interface TraitScores {
  [key: string]: number
}

interface CharacteristicScores {
  [key: string]: number
}

/**
 * 상충되는 특성 조합 검사
 */
export function checkTraitConflicts(traits: TraitScores): void {
  if (traits.cute > 7 && traits.sexy > 6) {
    logger.warn('⚠️ Inconsistency detected: High cute and sexy scores together', {
      cute: traits.cute,
      sexy: traits.sexy,
    })
  }

  if (traits.darkness > 7 && traits.freshness > 5) {
    logger.warn('⚠️ Inconsistency detected: High darkness and freshness scores together', {
      darkness: traits.darkness,
      freshness: traits.freshness,
    })
  }

  if (traits.purity > 7 && traits.luxury > 6) {
    logger.warn('⚠️ Inconsistency detected: High purity and luxury scores together', {
      purity: traits.purity,
      luxury: traits.luxury,
    })
  }
}

/**
 * 점수 분포 극단값 검사
 */
export function checkScoreDistribution(traitValues: number[]): void {
  const highScores = traitValues.filter((v) => v >= 7).length
  const lowScores = traitValues.filter((v) => v <= 3).length

  if (highScores > 6) {
    logger.warn('⚠️ Score distribution too extreme: Too many high scores (>= 7)', {
      highScores,
      traitValues,
    })
  }

  if (lowScores > 6) {
    logger.warn('⚠️ Score distribution too extreme: Too many low scores (<= 3)', {
      lowScores,
      traitValues,
    })
  }

  // 10점 만점 제한
  const maxScores = traitValues.filter((v) => v >= 9).length
  if (maxScores > 2) {
    logger.warn('⚠️ Too many maximum scores (>= 9)', {
      maxScores,
      traitValues,
    })
  }
}

/**
 * Characteristics와 Traits 간 일관성 검사
 */
export function checkCharacteristicsConsistency(
  traits: TraitScores,
  chars: CharacteristicScores
): void {
  // citrus는 freshness와 freedom에서 도출되어야 함
  const expectedCitrus = traits.freshness * 0.6 + traits.freedom * 0.4
  if (Math.abs(chars.citrus - expectedCitrus) > 3) {
    logger.warn('⚠️ Citrus score inconsistent with traits', {
      citrus: chars.citrus,
      expectedCitrus: expectedCitrus.toFixed(1),
      freshness: traits.freshness,
      freedom: traits.freedom,
    })
  }

  // musky는 sexy와 darkness에서 도출되어야 함
  const expectedMusky = traits.sexy * 0.5 + traits.darkness * 0.3
  if (Math.abs(chars.musky - expectedMusky) > 3) {
    logger.warn('⚠️ Musky score inconsistent with traits', {
      musky: chars.musky,
      expectedMusky: expectedMusky.toFixed(1),
      sexy: traits.sexy,
      darkness: traits.darkness,
    })
  }
}

/**
 * 점수 분산 검사 (차별성 확인)
 */
export function checkScoreVariance(traitValues: number[]): number {
  const mean = traitValues.reduce((sum, v) => sum + v, 0) / traitValues.length
  const variance =
    traitValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / traitValues.length
  const stdDev = Math.sqrt(variance)

  if (stdDev < 1.5) {
    logger.warn('⚠️ Low score variance: All traits are too similar (stdDev < 1.5)', {
      stdDev: stdDev.toFixed(2),
      mean: mean.toFixed(2),
      traitValues,
    })
  }

  return stdDev
}

/**
 * 품질 검증 실행 (메인 함수)
 */
export function runQualityChecks(result: any): void {
  const traits = result.traits
  const traitValues = Object.values(traits) as number[]
  const chars = result.characteristics

  checkTraitConflicts(traits)
  checkScoreDistribution(traitValues)
  checkCharacteristicsConsistency(traits, chars)
  const stdDev = checkScoreVariance(traitValues)

  // 검증 완료 로그 (디버깅용)
  const highScores = traitValues.filter((v) => v >= 7).length
  const maxScores = traitValues.filter((v) => v >= 9).length

  logger.log('✅ Analysis result validated successfully', {
    traitsRange: `${Math.min(...traitValues)}-${Math.max(...traitValues)}`,
    stdDev: stdDev.toFixed(2),
    highScores,
    maxScores,
  })
}
