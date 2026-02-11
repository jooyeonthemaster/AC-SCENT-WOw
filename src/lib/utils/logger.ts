// 환경별 로깅 유틸리티
// 개발 환경에서만 로그를 출력하고, 프로덕션에서는 억제합니다.

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * 일반 로그 (개발 환경에서만)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * 경고 로그 (모든 환경)
   */
  warn: (...args: any[]) => {
    console.warn(...args)
  },

  /**
   * 에러 로그 (모든 환경)
   */
  error: (...args: any[]) => {
    console.error(...args)
  },

  /**
   * 디버그 로그 (개발 환경에서만, 더 상세)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  },

  /**
   * 정보 로그 (개발 환경에서만)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
}
