// Letter Journey 애니메이션 관련 상수

/**
 * Phase 타입 정의
 */
export type JourneyPhase = 'sending' | 'arriving' | 'reading' | 'writing' | 'complete' | 'error'

/**
 * Phase 전환 타이밍 (ms)
 */
export const PHASE_TIMING = {
  sending: 0,
  arriving: 2500,
  reading: 5000,
  writing: 9000,
} as const

/**
 * 최소 체류 시간 - API가 빨리 끝나도 최소 이 시간은 보여줌
 */
export const MIN_DISPLAY_TIME = 4000

/**
 * 완료 후 결과 페이지 전환 딜레이
 */
export const COMPLETE_TRANSITION_DELAY = 1500

/**
 * 각 Phase별 메인 메시지
 */
export const PHASE_MESSAGES: Record<Exclude<JourneyPhase, 'error'>, string> = {
  sending: '편지를 보내는 중...',
  arriving: '최애에게 편지가 도착했어요',
  reading: '당신의 마음을 읽고 있어요...',
  writing: '',  // Phase 4는 그룹 메시지 사용
  complete: '답장이 도착했어요!',
}

/**
 * Phase 4 (writing) 텍스트 그룹 - 루프
 */
export const WRITING_MESSAGE_GROUPS = [
  ['향기로 표현하면 어떨까...', '당신에게 어울리는 향을 고르는 중...'],
  ['이 향이 좋을 것 같아요...', '특별한 향수를 준비하고 있어요'],
  ['거의 다 됐어요', '조금만 더 기다려주세요...'],
] as const

/**
 * 텍스트 그룹 전환 간격 (ms)
 */
export const WRITING_GROUP_INTERVAL = 4000

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  NO_IMAGE: '이미지를 찾을 수 없습니다. 다시 업로드해주세요.',
  ANALYSIS_FAILED: '분석 중 오류가 발생했습니다. 다시 시도해주세요.',
  EXPIRED: '세션이 만료되었습니다. 다시 시도해주세요.',
} as const

/**
 * Phase 순서 (점 인디케이터용)
 */
export const PHASE_ORDER: Exclude<JourneyPhase, 'complete' | 'error'>[] = [
  'sending', 'arriving', 'reading', 'writing',
]
