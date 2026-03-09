// 향수 ID 기반 향 힌트 조회
// locale JSON에서 로드한 scentHints를 사용

/**
 * 향수 ID로 힌트 조회
 * @param perfumeId - "AC'SCENT 01" 형태의 ID
 * @param scentHints - locale JSON에서 로드한 힌트 데이터
 * @param fallback - 힌트 없을 때 기본값
 */
export function getScentHintById(
  perfumeId: string,
  scentHints: Record<string, string>,
  fallback: string = '?',
): string {
  return scentHints[perfumeId] || fallback
}
