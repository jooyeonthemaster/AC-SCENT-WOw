// 분석 진행 관련 상수

/**
 * 로딩 메시지 배열
 */
export const LOADING_MESSAGES = [
  '이미지를 분석하고 있습니다...',
  '향의 특성을 파악하고 있습니다...',
  '당신에게 어울리는 향수를 찾고 있습니다...',
  '완벽한 매칭을 위해 최종 검토 중입니다...',
]

/**
 * 진행률 업데이트 관련
 */
export const PROGRESS_CONFIG = {
  /** 진행 단계별 목표 진행률 (%) */
  stages: [20, 50, 80, 95] as const,

  /** 메시지 변경 간격 (ms) */
  messageInterval: 4000,

  /** 진행률 업데이트 간격 (ms) */
  updateInterval: 100,

  /** 진행률 증가 속도 */
  incrementSpeed: 0.3,
}

/**
 * 타임아웃 설정 (ms)
 */
export const TIMEOUT_CONFIG = {
  /** API 요청 타임아웃 (25초) */
  apiTimeout: 25000,

  /** 에러 시 리다이렉트 지연 (3초) */
  errorRedirectDelay: 3000,
}
