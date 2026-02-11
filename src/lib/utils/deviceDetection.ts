/**
 * 모바일 디바이스 감지 유틸리티
 */

export function isMobileDevice(): boolean {
  // SSR 환경 체크
  if (typeof window === 'undefined') return false

  // User Agent 체크
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i

  return mobileRegex.test(userAgent.toLowerCase())
}
