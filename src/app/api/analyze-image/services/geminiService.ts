import { GoogleGenerativeAI } from '@google/generative-ai'
import { GeminiAnalysisResult } from '@/types/gemini'
import { buildAnalysisPrompt } from '../prompts/promptBuilder'

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
    console.error('Gemini API error:', error)
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
    console.error('Failed to parse Gemini response:', text)
    throw new Error('AI 응답을 파싱하는 중 오류가 발생했습니다')
  }
}

function validateAnalysisResult(result: any): void {
  // ===== 기본 검증 (필수 필드 및 범위) =====
  const required = ['description', 'traits', 'characteristics', 'mood', 'personality']

  for (const field of required) {
    if (!(field in result)) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Validate trait scores (0-10)
  const traitKeys = [
    'sexy', 'cute', 'charisma', 'darkness', 'freshness',
    'elegance', 'freedom', 'luxury', 'purity', 'uniqueness',
  ]

  for (const key of traitKeys) {
    const value = result.traits[key]
    if (typeof value !== 'number' || value < 0 || value > 10) {
      throw new Error(`Invalid trait value for ${key}: ${value}`)
    }
  }

  // Validate characteristics scores (0-10)
  const charKeys = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy']

  for (const key of charKeys) {
    const value = result.characteristics[key]
    if (typeof value !== 'number' || value < 0 || value > 10) {
      throw new Error(`Invalid characteristic value for ${key}: ${value}`)
    }
  }

  // Validate mood array
  if (!Array.isArray(result.mood) || result.mood.length === 0) {
    throw new Error('Mood must be a non-empty array')
  }

  // ===== 추가 검증 (일관성 및 품질 체크) =====
  // 아래 검증은 경고만 출력하고 예외를 발생시키지 않습니다.
  // 사용자 경험을 해치지 않으면서도 프롬프트 개선에 필요한 데이터를 수집합니다.

  const traits = result.traits
  const traitValues = Object.values(traits) as number[]

  // 1. 상충 관계 검사
  if (traits.cute > 7 && traits.sexy > 6) {
    console.warn('⚠️ Inconsistency detected: High cute and sexy scores together', {
      cute: traits.cute,
      sexy: traits.sexy,
    })
  }

  if (traits.darkness > 7 && traits.freshness > 5) {
    console.warn('⚠️ Inconsistency detected: High darkness and freshness scores together', {
      darkness: traits.darkness,
      freshness: traits.freshness,
    })
  }

  if (traits.purity > 7 && traits.luxury > 6) {
    console.warn('⚠️ Inconsistency detected: High purity and luxury scores together', {
      purity: traits.purity,
      luxury: traits.luxury,
    })
  }

  // 2. 극단값 방지 (점수 분포 균형)
  const highScores = traitValues.filter((v) => v >= 7).length
  const lowScores = traitValues.filter((v) => v <= 3).length

  if (highScores > 6) {
    console.warn('⚠️ Score distribution too extreme: Too many high scores (>= 7)', {
      highScores,
      traitValues,
    })
  }

  if (lowScores > 6) {
    console.warn('⚠️ Score distribution too extreme: Too many low scores (<= 3)', {
      lowScores,
      traitValues,
    })
  }

  // 3. 10점 만점 제한
  const maxScores = traitValues.filter((v) => v >= 9).length
  if (maxScores > 2) {
    console.warn('⚠️ Too many maximum scores (>= 9)', {
      maxScores,
      traitValues,
    })
  }

  // 4. Characteristics와 Traits 일관성 (샘플 체크)
  const chars = result.characteristics

  // citrus는 freshness와 freedom에서 도출되어야 함
  const expectedCitrus = traits.freshness * 0.6 + traits.freedom * 0.4
  if (Math.abs(chars.citrus - expectedCitrus) > 3) {
    console.warn('⚠️ Citrus score inconsistent with traits', {
      citrus: chars.citrus,
      expectedCitrus: expectedCitrus.toFixed(1),
      freshness: traits.freshness,
      freedom: traits.freedom,
    })
  }

  // musky는 sexy와 darkness에서 도출되어야 함
  const expectedMusky = traits.sexy * 0.5 + traits.darkness * 0.3
  if (Math.abs(chars.musky - expectedMusky) > 3) {
    console.warn('⚠️ Musky score inconsistent with traits', {
      musky: chars.musky,
      expectedMusky: expectedMusky.toFixed(1),
      sexy: traits.sexy,
      darkness: traits.darkness,
    })
  }

  // 5. 전체 점수가 너무 평균적인지 체크 (차별성 부족)
  const mean = traitValues.reduce((sum, v) => sum + v, 0) / traitValues.length
  const variance =
    traitValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / traitValues.length
  const stdDev = Math.sqrt(variance)

  if (stdDev < 1.5) {
    console.warn('⚠️ Low score variance: All traits are too similar (stdDev < 1.5)', {
      stdDev: stdDev.toFixed(2),
      mean: mean.toFixed(2),
      traitValues,
    })
  }

  // 검증 완료 로그 (디버깅용)
  console.log('✅ Analysis result validated successfully', {
    traitsRange: `${Math.min(...traitValues)}-${Math.max(...traitValues)}`,
    stdDev: stdDev.toFixed(2),
    highScores,
    maxScores,
  })
}
