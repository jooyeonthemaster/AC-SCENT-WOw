import { GoogleGenerativeAI } from '@google/generative-ai'
import { GeminiAnalysisResult } from '@/types/gemini'
import { buildAnalysisPrompt } from '../prompts/promptBuilder'
import { REASONING_GENERATION_PROMPT } from '../prompts/systemPrompt'
import { validateAnalysisResult as validateBasic } from '../utils/validators'
import { runQualityChecks } from '../utils/consistencyCheckers'
import { logger } from '@/lib/utils/logger'
import type { Perfume } from '@/lib/data/perfumes'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeImageWithGemini(
  imageBase64: string
): Promise<GeminiAnalysisResult> {
  try {
    // 1. Build analysis prompt
    const prompt = buildAnalysisPrompt({ language: 'ko' })

    // 2. Remove data URL prefix if present
    const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // 3. Get model
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    })

    // 4. Generate content
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
 * 분석 결과 검증 (기본 + 품질)
 */
function validateAnalysisResult(result: any): void {
  // 기본 검증 (필수 필드 및 범위)
  validateBasic(result)

  // 품질 검증 (일관성 체크, 경고만 출력)
  runQualityChecks(result)
}

interface RecommendedPerfume {
  perfume: Perfume
  isSurprise: boolean
}

/**
 * 2차 Gemini 요청: 추천 향수별 주접 reasoning 생성
 */
export async function generateReasoningsWithGemini(
  analysis: GeminiAnalysisResult,
  recommendations: RecommendedPerfume[]
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    })

    // 분석 결과 요약
    const traitEntries = Object.entries(analysis.traits)
    traitEntries.sort((a, b) => b[1] - a[1])
    const topTraits = traitEntries.slice(0, 3).map(([k, v]) => `${k}: ${v}`)

    // 향수 정보 구성
    const perfumeInfos = recommendations.map((rec, idx) => {
      const p = rec.perfume
      return `${idx + 1}번 향수: ${p.name} (${p.id})
  - TOP: ${p.mainScent.name}, MID: ${p.subScent1.name}, BASE: ${p.subScent2.name}
  - 분위기: ${p.mood}
  - 키워드: ${p.keywords.join(', ')}
  - 서프라이즈 추천: ${rec.isSurprise ? 'YES (의외성 강조)' : 'NO (정규 추천)'}`
    }).join('\n\n')

    const userPrompt = `# 분석 결과
- 이미지 설명: ${analysis.description}
- 주요 특성: ${topTraits.join(', ')}
- 분위기: ${analysis.mood.join(', ')}

# 추천된 향수 3개
${perfumeInfos}

위 정보를 바탕으로 각 향수에 대한 주접 reasoning을 JSON으로 출력하세요.`

    const result = await model.generateContent([
      REASONING_GENERATION_PROMPT,
      userPrompt,
    ])

    const response = result.response.text()

    // Parse response
    let cleaned = response.trim()
    cleaned = cleaned.replace(/```json\n?/g, '')
    cleaned = cleaned.replace(/```\n?/g, '')
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned)

    if (parsed.reasonings && Array.isArray(parsed.reasonings)) {
      return parsed.reasonings
    }

    throw new Error('Invalid reasoning format')
  } catch (error) {
    logger.error('Reasoning generation failed, using fallback:', error)
    // 실패 시 빈 배열 반환 (route.ts에서 fallback 처리)
    return []
  }
}
