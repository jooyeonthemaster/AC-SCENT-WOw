import { Perfume, perfumes } from '@/lib/data/perfumes'
import { GeminiAnalysisResult } from '@/types/gemini'
import { PerfumeMatchResult } from '@/types/analysis'

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

// Fallback reasoning (AI 생성 실패 시 사용)
function generateMatchReasoning(
  analysis: GeminiAnalysisResult,
  perfume: Perfume,
  isSurprise: boolean = false
): string {
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

  const traitEntries = Object.entries(analysis.traits)
  traitEntries.sort((a, b) => b[1] - a[1])
  const topTrait = traitNamesAdj[traitEntries[0][0]] || '특별한'

  if (isSurprise) {
    return `${topTrait} 느낌에 ${perfume.name} 향이라니 ㄹㅇ 의외인데?? 🤔 근데 생각할수록 갓벽 조합이야!! 이거 새로운 매력 발견할 듯 ✨`
  }

  return `${topTrait} 에너지에서 ${perfume.name} 향 안 나면 말이 안 됨 ㄹㅇ 🔥 이 향수 뿌리면 진심 지나가는 사람마다 뒤돌아볼 거 장담함!! 💯`
}
