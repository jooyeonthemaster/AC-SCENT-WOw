/**
 * 결과 페이지 템플릿 카드 — CSS 박스 + 이미지 에셋 방식
 *
 * 박스/레이아웃은 CSS로 구성, 필기체 라벨만 이미지 에셋 사용
 * PerfumeDetailModal과 동일한 cardScale 패턴으로 반응형 처리
 */

export const CARD_WIDTH = 320
export const CARD_HEIGHT = 573

// 필기체 에셋 경로 (원본 PNG)
export const ASSETS = {
  logo: '/images/template/logo.png',
  story: '/images/template/story.png',
  profile: '/images/template/profile.png',
  reco: '/images/template/recommendations.png',
  footer: '/images/template/footer.png',
} as const

// 카드 아래 SHARE/HOME 버튼
export const ACTIONS = {
  marginTop: 10,
  height: 36,
  gap: 12,
} as const
