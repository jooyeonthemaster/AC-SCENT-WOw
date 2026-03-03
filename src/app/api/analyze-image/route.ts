import { NextRequest, NextResponse } from 'next/server'
import { validateImageRequest } from './utils/validator'
import { analyzeImageWithGemini } from './services/geminiService'
import { getPerfumeById } from './services/perfumeFormatter'
import { selectDiverseRecommendations } from './services/perfumeSelector'
import { transformError } from './utils/errorHandler'
import { CACHE_EXPIRY_TIME } from '@/lib/constants/app'
import type { CachedResult } from './types'
import { logger } from '@/lib/utils/logger'
import { generateRequestId } from './constants'

// In-memory cache for analysis results (by analysisId)
export const resultsCache = new Map<string, CachedResult>()

// In-memory stats for perfume recommendations
export const recommendationStats = new Map<string, number>()

// Vercel timeout configuration (must be literal for Next.js)
// Pro 플랜: 최대 300초 (5분)
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()

  try {
    // 1. Parse and validate request
    const body = await req.json()
    const validation = validateImageRequest(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    logger.log(`🚀 [API ${requestId}] POST /api/analyze-image RECEIVED`)

    // 2. Analyze image with Gemini AI (단일 호출: 분석 + 향수 선택 + reasoning 모두 포함)
    logger.log(`🔬 [API ${requestId}] Analyzing image with Gemini (with perfume DB)...`)
    const analysis = await analyzeImageWithGemini(body.image)
    logger.log(`✅ [API ${requestId}] Analysis complete with ${analysis.matchingPerfumes?.length || 0} perfume candidates`)

    // 2.5. Apply diversity selection: pick 3 from Gemini's candidates
    const selectedPerfumes = selectDiverseRecommendations(analysis.matchingPerfumes || [])
    logger.log(`🎯 [API ${requestId}] Selected: ${selectedPerfumes.map(p => p.perfumeId).join(', ')}`)

    // 3. Resolve perfumeIds to full Perfume objects
    const recommendations = selectedPerfumes.map((mp) => {
      const perfume = getPerfumeById(mp.perfumeId)

      if (!perfume) {
        logger.warn(`⚠️ [API ${requestId}] Perfume not found: ${mp.perfumeId}`)
      }

      return {
        perfume: perfume!,
        matchConfidence: Math.round(mp.score * 100),
        reasoning: mp.matchReason,
      }
    }).filter((rec) => rec.perfume != null)

    // 3.1. Fallback: 향수를 찾지 못한 경우
    if (recommendations.length === 0) {
      logger.error(`❌ [API ${requestId}] No valid perfume matches found`)
      throw new Error('향수 매칭에 실패했습니다')
    }

    logger.log(`✅ [API ${requestId}] Matches:`, recommendations.map((r) => r.perfume.name).join(', '))

    // 3.2. Track recommendation stats
    recommendations.forEach((rec) => {
      const currentCount = recommendationStats.get(rec.perfume.id) || 0
      recommendationStats.set(rec.perfume.id, currentCount + 1)
    })

    // 4. Generate analysis ID
    const analysisId = crypto.randomUUID()

    // 5. Store result in cache
    const cachedResult: CachedResult = {
      analysis,
      recommendations,
      timestamp: Date.now(),
    }

    resultsCache.set(analysisId, cachedResult)

    // 6. Schedule cache cleanup after expiry time
    setTimeout(() => {
      resultsCache.delete(analysisId)
      logger.log(`🗑️ [API] Deleted expired result: ${analysisId}`)
    }, CACHE_EXPIRY_TIME)

    logger.log(`✅ [API ${requestId}] Successfully cached result (ID: ${analysisId})`)

    // 7. Return response
    return NextResponse.json({
      success: true,
      data: {
        analysisId,
        analysis: {
          description: analysis.description,
          traits: analysis.traits,
          characteristics: analysis.characteristics,
          mood: analysis.mood,
          personality: analysis.personality,
        },
        recommendations,
      },
    })
  } catch (error) {
    logger.error(`❌ [API ${requestId}] Analysis error:`, error)
    const errorMessage = transformError(error)

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
