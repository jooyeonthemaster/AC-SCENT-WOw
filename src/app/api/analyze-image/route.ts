import { NextRequest, NextResponse } from 'next/server'
import { validateImageRequest } from './utils/validator'
import { analyzeImageWithGemini } from './services/geminiService'
import { findBestPerfumeMatch } from './services/perfumeMapper'
import { transformError } from './utils/errorHandler'
import { CACHE_EXPIRY_TIME } from '@/lib/constants/app'
import type { CachedResult } from './types'
import { logger } from '@/lib/utils/logger'

// In-memory cache for analysis results (by analysisId)
export const resultsCache = new Map<string, CachedResult>()

// In-memory stats for perfume recommendations
export const recommendationStats = new Map<string, number>()

// Vercel timeout configuration
export const maxDuration = 300 // 5 minutes

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)

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

    // 2. Analyze image with Gemini AI
    logger.log(`🔬 [API ${requestId}] Analyzing image with Gemini...`)
    const analysis = await analyzeImageWithGemini(body.image)
    logger.log(`✅ [API ${requestId}] Analysis complete`)

    // 3. Find top 3 perfume matches
    logger.log(`🔍 [API ${requestId}] Finding top 3 perfume matches...`)
    const matches = findBestPerfumeMatch(analysis)
    logger.log(`✅ [API ${requestId}] Matches:`, matches.map((m) => m.perfume.name).join(', '))

    // 3.1. Convert to PerfumeRecommendation format (confidence → matchConfidence)
    const recommendations = matches.map(match => ({
      perfume: match.perfume,
      matchConfidence: match.confidence,
      reasoning: match.reasoning
    }))

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
