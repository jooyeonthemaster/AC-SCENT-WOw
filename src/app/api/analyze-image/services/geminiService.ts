import { GoogleGenerativeAI } from '@google/generative-ai'
import { GeminiAnalysisResult } from '@/types/gemini'
import { buildAnalysisPrompt } from '../prompts/promptBuilder'
import { validateAnalysisResult as validateBasic } from '../utils/validators'
import { runQualityChecks } from '../utils/consistencyCheckers'
import { logger } from '@/lib/utils/logger'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeImageWithGemini(
  imageBase64: string
): Promise<GeminiAnalysisResult> {
  try {
    // 1. Build analysis prompt (향수 DB 포함)
    const prompt = buildAnalysisPrompt({ language: 'ko' })

    // 2. Remove data URL prefix if present
    const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // 3. Get model
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    })

    // 4. Generate content (단일 호출로 분석 + 향수 선택 + reasoning 모두 처리)
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData,
        },
      },
    ])

    const response = result.response.text()

    // 5. Parse response
    const analysis = parseGeminiResponse(response)

    // 6. Validate
    validateAnalysisResult(analysis)

    return analysis
  } catch (error) {
    logger.error('Gemini API error:', error)
    throw new Error('이미지 분석 중 오류가 발생했습니다')
  }
}

function parseGeminiResponse(text: string): GeminiAnalysisResult {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim()
    cleaned = cleaned.replace(/```json\n?/g, '')
    cleaned = cleaned.replace(/```\n?/g, '')
    cleaned = cleaned.trim()

    // Parse JSON
    const parsed = JSON.parse(cleaned)
    return parsed as GeminiAnalysisResult
  } catch (error) {
    logger.error('Failed to parse Gemini response:', text)
    throw new Error('AI 응답을 파싱하는 중 오류가 발생했습니다')
  }
}

/**
 * 분석 결과 검증 (기본 + 품질 + matchingPerfumes)
 */
function validateAnalysisResult(result: any): void {
  // 기본 검증 (필수 필드 및 범위)
  validateBasic(result)

  // matchingPerfumes 검증
  if (!result.matchingPerfumes || !Array.isArray(result.matchingPerfumes)) {
    throw new Error('matchingPerfumes가 응답에 없습니다')
  }

  if (result.matchingPerfumes.length !== 3) {
    logger.warn(`⚠️ matchingPerfumes count: ${result.matchingPerfumes.length} (expected 3)`)
  }

  for (const mp of result.matchingPerfumes) {
    if (!mp.perfumeId || !mp.matchReason) {
      logger.warn('⚠️ matchingPerfume missing required fields:', mp)
    }
  }

  // 품질 검증 (일관성 체크, 경고만 출력)
  runQualityChecks(result)
}
