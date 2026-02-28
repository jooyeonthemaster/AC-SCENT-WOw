import { buildSystemPromptWithPerfumes } from './systemPrompt'

export interface PromptOptions {
  language?: 'ko' | 'en'
  analysisDepth?: 'quick' | 'detailed'  // 분석 깊이 옵션
  enableCoT?: boolean  // Chain-of-Thought 활성화 여부
}

export function buildAnalysisPrompt(options?: PromptOptions): string {
  const basePrompt = buildSystemPromptWithPerfumes()

  // 언어 옵션에 따라 추가 지시사항 (현재는 한국어만 지원)
  const languageInstruction = options?.language === 'en'
    ? '\n\nPlease provide description and personality (image mood) in English.'
    : '\n\ndescription과 personality(이미지 분위기)는 한국어로 작성해주세요.'

  // Chain-of-Thought 활성화 시 사고 과정 강조
  const cotInstruction = options?.enableCoT
    ? '\n\n⚠️ 중요: 분석 전에 Step 1-5의 사고 과정을 내부적으로 반드시 수행한 후 최종 JSON만 출력하세요. 각 점수에 대한 근거를 명확히 한 후 출력하세요.'
    : ''

  // 상세 분석 모드
  const depthInstruction = options?.analysisDepth === 'detailed'
    ? '\n\n상세 분석 모드: 각 시각적 요소를 더욱 세밀하게 분석하고, 본질적 특성(얼굴, 눈빛, 분위기)에 특히 집중하세요.'
    : ''

  return basePrompt + languageInstruction + cotInstruction + depthInstruction
}
