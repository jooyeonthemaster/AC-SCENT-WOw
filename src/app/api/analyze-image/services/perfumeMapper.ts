import { Perfume, perfumes } from '@/lib/data/perfumes'
import { GeminiAnalysisResult } from '@/types/gemini'
import { PerfumeMatchResult } from '@/types/analysis'
import { TRAIT_LABELS, CHARACTERISTIC_LABELS } from '@/lib/constants/labels'

export function findBestPerfumeMatch(
  analysis: GeminiAnalysisResult
): PerfumeMatchResult[] {
  // Calculate scores for all perfumes
  const scores = perfumes.map((perfume) => ({
    perfume,
    score: calculateMatchScore(analysis, perfume),
  }))

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score)

  // Get top 10 candidates for more diversity
  const topCandidates = scores.slice(0, 10)

  // Use softmax with higher temperature (3.5) for better diversity
  const temperature = 3.5
  const expScores = topCandidates.map((c) => Math.exp(c.score / temperature))
  const sumExp = expScores.reduce((sum, exp) => sum + exp, 0)
  const probabilities = expScores.map((exp) => exp / sumExp)

  const selectedMatches: PerfumeMatchResult[] = []
  const usedIndices = new Set<number>()

  // Select 2 perfumes from top 10 (no duplicates)
  for (let i = 0; i < 2; i++) {
    const random = Math.random()
    let cumulative = 0
    let selectedIndex = 0

    // Weighted random selection, skipping already selected
    for (let j = 0; j < probabilities.length; j++) {
      if (usedIndices.has(j)) continue

      cumulative += probabilities[j]
      if (random <= cumulative) {
        selectedIndex = j
        break
      }
    }

    usedIndices.add(selectedIndex)
    const selected = topCandidates[selectedIndex]

    selectedMatches.push({
      perfume: selected.perfume,
      confidence: Math.round(selected.score * 100) / 100,
      reasoning: generateMatchReasoning(analysis, selected.perfume, false),
    })
  }

  // Select 1 surprise perfume from rank 11-30
  if (scores.length > 10) {
    const surpriseCandidates = scores.slice(10, 30)
    const surpriseIndex = Math.floor(Math.random() * surpriseCandidates.length)
    const surprise = surpriseCandidates[surpriseIndex]

    selectedMatches.push({
      perfume: surprise.perfume,
      confidence: Math.round(surprise.score * 100) / 100,
      reasoning: generateMatchReasoning(analysis, surprise.perfume, true),
    })
  }

  return selectedMatches
}

function calculateMatchScore(
  analysis: GeminiAnalysisResult,
  perfume: Perfume
): number {
  // Convert traits to vectors
  const analysisTraitVector = Object.values(analysis.traits)
  const perfumeTraitVector = Object.values(perfume.traits)

  // Convert characteristics to vectors
  const analysisCharVector = Object.values(analysis.characteristics)
  const perfumeCharVector = Object.values(perfume.characteristics)

  // Calculate similarities
  const traitSimilarity = cosineSimilarity(
    analysisTraitVector,
    perfumeTraitVector
  )
  const charSimilarity = cosineSimilarity(analysisCharVector, perfumeCharVector)
  const moodMatch = calculateMoodOverlap(analysis.mood, perfume.keywords)

  // Weighted combination (traits: 40%, characteristics: 40%, mood: 20%)
  return traitSimilarity * 0.4 + charSimilarity * 0.4 + moodMatch * 0.2
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))

  if (magA === 0 || magB === 0) {
    return 0
  }

  return dotProduct / (magA * magB)
}

function calculateMoodOverlap(
  analysisKeywords: string[],
  perfumeKeywords: string[]
): number {
  // Count how many mood keywords match (including partial matches)
  const matches = analysisKeywords.filter((ak) =>
    perfumeKeywords.some((pk) => pk.includes(ak) || ak.includes(pk))
  )

  // Return ratio of matches
  return matches.length / Math.max(analysisKeywords.length, 1)
}

function generateMatchReasoning(
  analysis: GeminiAnalysisResult,
  perfume: Perfume,
  isSurprise: boolean = false
): string {
  // Find top 3 traits from analysis
  const traitEntries = Object.entries(analysis.traits)
  traitEntries.sort((a, b) => b[1] - a[1])
  const topTraits = traitEntries.slice(0, 3)

  // Find top 2 characteristics
  const charEntries = Object.entries(analysis.characteristics)
  charEntries.sort((a, b) => b[1] - a[1])
  const topChars = charEntries.slice(0, 2)

  // Korean trait names with adjective form
  const traitNamesAdj: Record<string, string> = {
    sexy: '섹시한',
    cute: '귀여운',
    charisma: '카리스마 넘치는',
    darkness: '신비로운',
    freshness: '상쾌한',
    elegance: '우아한',
    freedom: '자유로운',
    luxury: '고급스러운',
    purity: '순수한',
    uniqueness: '독특한',
  }

  const traitText = topTraits.map(([k]) => traitNamesAdj[k]).join(', ')
  const charText = topChars.map(([k]) => CHARACTERISTIC_LABELS[k as keyof typeof CHARACTERISTIC_LABELS]).join(', ')

  // Different message for surprise recommendations
  if (isSurprise) {
    return `당신의 ${traitText} 매력과는 조금 다른 느낌이지만, ${perfume.name}의 ${charText} 향도 새로운 매력을 발견하게 해줄 거예요! ${perfume.mood} 분위기로 평소와 다른 나를 표현해보세요.`
  }

  return `당신의 ${traitText} 매력은 ${perfume.name}의 ${charText} 향과 완벽하게 어울려요! ${perfume.mood} 분위기가 당신의 특별한 개성을 한층 더 돋보이게 해줄 거예요.`
}
