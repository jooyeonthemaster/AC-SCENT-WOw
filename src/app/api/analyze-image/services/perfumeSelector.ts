import type { MatchingPerfume } from '@/types/gemini'
import { logger } from '@/lib/utils/logger'

// 선택 설정
const SELECTION_CONFIG = {
  // 정석 추천 온도 (낮을수록 상위 점수 편향)
  standardTemperature: 0.15,
  // 서프라이즈 온도 (높을수록 균등 분포)
  surpriseTemperature: 0.5,
  // 다양성 선택 최소 후보 수
  minCandidatesForDiversity: 4,
  standardCount: 2,
  surpriseCount: 1,
}

/**
 * Gemini의 8개 후보에서 softmax 가중 랜덤으로 3개 선택.
 *
 * - standard 2개: 온도 0.15 (상위 점수 강하게 편향)
 * - surprise 1개: 온도 0.5 (균등에 가까움)
 *
 * 100명이 같은 사진 → ~10개 다른 향수가 추천되도록 분산.
 */
export function selectDiverseRecommendations(
  candidates: MatchingPerfume[]
): MatchingPerfume[] {
  if (candidates.length <= 3) {
    logger.log(`📊 [Selector] ${candidates.length}개 후보만 있어 다양성 선택 스킵`)
    return candidates.slice(0, 3)
  }

  const deduped = deduplicateCandidates(candidates)
  deduped.sort((a, b) => b.score - a.score)

  const standardPool = deduped.filter(c => !c.isSurprise)
  const surprisePool = deduped.filter(c => c.isSurprise)

  const selected: MatchingPerfume[] = []
  const usedIds = new Set<string>()

  // Step 1: 정석 추천 2개 선택
  for (let i = 0; i < SELECTION_CONFIG.standardCount; i++) {
    const available = standardPool.filter(c => !usedIds.has(c.perfumeId))
    if (available.length === 0) break

    const pick = softmaxWeightedSelect(available, SELECTION_CONFIG.standardTemperature)
    if (pick) {
      selected.push({ ...pick, isSurprise: false })
      usedIds.add(pick.perfumeId)
    }
  }

  // Step 2: 서프라이즈 1개 선택
  const availableSurprises = surprisePool.filter(c => !usedIds.has(c.perfumeId))
  if (availableSurprises.length > 0) {
    const pick = softmaxWeightedSelect(availableSurprises, SELECTION_CONFIG.surpriseTemperature)
    if (pick) {
      selected.push({ ...pick, isSurprise: true })
      usedIds.add(pick.perfumeId)
    }
  }

  // Step 3: 부족하면 남은 후보에서 채움
  while (selected.length < 3) {
    const remaining = deduped.filter(c => !usedIds.has(c.perfumeId))
    if (remaining.length === 0) break

    const pick = softmaxWeightedSelect(remaining, SELECTION_CONFIG.standardTemperature)
    if (pick) {
      selected.push({ ...pick, isSurprise: selected.length >= 2 })
      usedIds.add(pick.perfumeId)
    }
  }

  logger.log(
    `📊 [Selector] ${candidates.length}개 후보 → ${selected.length}개 선택:`,
    selected.map(s => `${s.perfumeId}(${s.score.toFixed(2)}, surprise=${s.isSurprise})`).join(', ')
  )

  return selected
}

/**
 * Softmax 가중 랜덤 선택.
 * 온도가 낮으면 최고 점수 편향, 높으면 균등 분포.
 */
function softmaxWeightedSelect(
  candidates: MatchingPerfume[],
  temperature: number
): MatchingPerfume | null {
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  const expScores = candidates.map(c => Math.exp(c.score / temperature))
  const sumExp = expScores.reduce((a, b) => a + b, 0)
  const probabilities = expScores.map(e => e / sumExp)

  const random = Math.random()
  let cumulative = 0

  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i]
    if (random <= cumulative) {
      return candidates[i]
    }
  }

  return candidates[candidates.length - 1]
}

/**
 * 중복 perfumeId 제거 (높은 점수 유지).
 */
function deduplicateCandidates(candidates: MatchingPerfume[]): MatchingPerfume[] {
  const seen = new Map<string, MatchingPerfume>()
  for (const c of candidates) {
    const existing = seen.get(c.perfumeId)
    if (!existing || c.score > existing.score) {
      seen.set(c.perfumeId, c)
    }
  }
  return Array.from(seen.values())
}
