import { NextRequest, NextResponse } from 'next/server'
import { validateImageRequest } from './utils/validator'
import { analyzeImageWithGemini, generateReasoningsWithGemini } from './services/geminiService'
import { findBestPerfumeMatch } from './services/perfumeMapper'
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

    // 2. [1차] Analyze image with Gemini AI (주접 스타일 description + fanLetter 포함)
    logger.log(`🔬 [API ${requestId}] Analyzing image with Gemini...`)
    const analysis = await analyzeImageWithGemini(body.image)
    logger.log(`✅ [API ${requestId}] Analysis complete`)

    // 3. Find top 3 perfume matches
    logger.log(`🔍 [API ${requestId}] Finding top 3 perfume matches...`)
    const matches = findBestPerfumeMatch(analysis)
    logger.log(`✅ [API ${requestId}] Matches:`, matches.map((m) => m.perfume.name).join(', '))

    // 4. [2차] Generate AI-powered 주접 reasoning for each perfume
    logger.log(`✍️ [API ${requestId}] Generating 주접 reasonings with Gemini...`)
    const aiReasonings = await generateReasoningsWithGemini(
      analysis,
      matches.map((m, idx) => ({
        perfume: m.perfume,
        isSurprise: idx === 2, // 3번째는 서프라이즈
      }))
    )
    logger.log(`✅ [API ${requestId}] Reasonings generated: ${aiReasonings.length > 0 ? 'AI' : 'fallback'}`)

    // 4.1. Convert to PerfumeRecommendation format
    const recommendations = matches.map((match, idx) => ({
      perfume: match.perfume,
      matchConfidence: match.confidence,
      // AI reasoning 성공 시 사용, 실패 시 fallback
      reasoning: aiReasonings[idx] || match.reasoning,
    }))

    // 4.2. Track recommendation stats
    recommendations.forEach((rec) => {
      const currentCount = recommendationStats.get(rec.perfume.id) || 0
      recommendationStats.set(rec.perfume.id, currentCount + 1)
    })

    // 5. Generate analysis ID
    const analysisId = crypto.randomUUID()

    // 6. Store result in cache
    const cachedResult: CachedResult = {
      analysis,
      recommendations,
      timestamp: Date.now(),
    }

    resultsCache.set(analysisId, cachedResult)

    // 7. Schedule cache cleanup after expiry time
    setTimeout(() => {
      resultsCache.delete(analysisId)
      logger.log(`🗑️ [API] Deleted expired result: ${analysisId}`)
    }, CACHE_EXPIRY_TIME)

    logger.log(`✅ [API ${requestId}] Successfully cached result (ID: ${analysisId})`)

    // 8. Return response
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
          fanLetter: analysis.fanLetter,
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
