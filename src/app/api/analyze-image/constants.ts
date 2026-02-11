// API 라우트 관련 상수

/**
 * 요청 ID 생성 (디버깅용)
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(7)
}
