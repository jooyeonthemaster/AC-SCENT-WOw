/**
 * 향수별 봉투 색상 시스템 (mix-blend-mode: hue 방식)
 *
 * 기존 CSS filter 방식의 문제:
 * - hue-rotate는 진짜 HSL 회전이 아님 (빨강→노랑이 갈색이 됨)
 * - filter가 흰색 배경까지 변환시킴 (PNG 투명 여부와 관계없이)
 * - Next.js 이미지 최적화 파이프라인에서 알파 채널이 손실될 수 있음
 *
 * 새 접근법:
 * - 봉투 이미지 위에 컬러 오버레이 div를 올리고 mix-blend-mode: hue 적용
 * - hue 블렌드: 위에서 색조(hue)만, 아래에서 채도+밝기 유지
 * - 흰색(채도=0): hue 변경 효과 없음 → 배경 그대로 흰색 ✓
 * - 빨간 봉투(채도 높음): hue가 목표 색으로 전환 → 봉투만 색 변경 ✓
 * - filter: saturate(X)로 채도 추가 조절 (흰색엔 무영향)
 */

interface PerfumeEnvelopeStyle {
  /** mix-blend-mode:hue 오버레이에 쓸 색상 (hue만 사용됨, 채도/밝기 무관) */
  hueColor: string
  /** 이미지의 saturate 필터값 (0.1=거의 흰색, 1.0=원본, 1.3=더 선명) */
  saturate: number
  /** 모달 UI 강조색 */
  accent: string
}

/**
 * primaryColor (소문자) → 봉투 스타일
 * hueColor는 hue만 쓰이므로 원하는 색조의 완전 채도 색으로 지정
 */
const PERFUME_STYLES: Record<string, PerfumeEnvelopeStyle> = {
  // 01. 블랙베리 — 다크 퍼플
  '#1e1e24': { hueColor: 'hsl(270, 100%, 50%)', saturate: 0.9, accent: '#8B5CF6' },
  // 02. 만다린 오렌지 — 따뜻한 오렌지
  '#ff9f1c': { hueColor: 'hsl(30, 100%, 50%)', saturate: 1.0, accent: '#E08800' },
  // 03. 스트로베리 — 달콤한 핑크
  '#ff7e9d': { hueColor: 'hsl(345, 100%, 50%)', saturate: 0.75, accent: '#E04070' },
  // 04. 베르가못 — 골드
  '#f3ca40': { hueColor: 'hsl(45, 100%, 50%)', saturate: 1.1, accent: '#C09A00' },
  // 05. 비터 오렌지 — 불꽃 레드오렌지 (원본과 유사)
  '#ff4000': { hueColor: 'hsl(10, 100%, 50%)', saturate: 1.1, accent: '#D03500' },
  // 06. 캐럿 — 당근 오렌지
  '#ffa62b': { hueColor: 'hsl(25, 100%, 50%)', saturate: 1.0, accent: '#D08010' },
  // 07. 로즈 — 딥 로즈
  '#a8003d': { hueColor: 'hsl(340, 100%, 50%)', saturate: 1.0, accent: '#A8003D' },
  // 08. 튜베로즈 — 순백 크림
  '#f5f5f5': { hueColor: 'hsl(40, 100%, 50%)', saturate: 0.1, accent: '#B8956A' },
  // 09. 오렌지 블라썸 — 앰버 오렌지
  '#f9a03f': { hueColor: 'hsl(30, 100%, 50%)', saturate: 1.0, accent: '#D08020' },
  // 10. 튤립 — 소프트 핑크
  '#ffc0cb': { hueColor: 'hsl(350, 100%, 50%)', saturate: 0.45, accent: '#D06080' },
  // 11. 라임 — 라임 그린
  '#c4e17f': { hueColor: 'hsl(80, 100%, 50%)', saturate: 1.2, accent: '#5A9A20' },
  // 12. 은방울꽃 — 연라벤더
  '#f0f8ff': { hueColor: 'hsl(230, 100%, 50%)', saturate: 0.18, accent: '#7A6AAA' },
  // 13. 유자 — 밝은 노랑 ⭐
  '#f9db24': { hueColor: 'hsl(52, 100%, 50%)', saturate: 1.3, accent: '#B89800' },
  // 14. 민트 — 아이스 민트
  '#abdee6': { hueColor: 'hsl(185, 100%, 50%)', saturate: 0.65, accent: '#2098A8' },
  // 15. 페티그레인 — 스카이 블루
  '#82b1ff': { hueColor: 'hsl(215, 100%, 50%)', saturate: 0.9, accent: '#3A6ABA' },
  // 16. 샌달우드 — 따뜻한 브라운
  '#5d4037': { hueColor: 'hsl(16, 100%, 50%)', saturate: 0.55, accent: '#7A5540' },
  // 17. 레몬페퍼 — 일렉트릭 옐로
  '#ffeb3b': { hueColor: 'hsl(55, 100%, 50%)', saturate: 1.3, accent: '#B8A000' },
  // 18. 핑크페퍼 — 핑크 네온
  '#ff80ab': { hueColor: 'hsl(338, 100%, 50%)', saturate: 0.8, accent: '#D04080' },
  // 19. 바다소금 — 오션 블루
  '#00b4d8': { hueColor: 'hsl(195, 100%, 50%)', saturate: 1.1, accent: '#0088A8' },
  // 20. 타임 — 포레스트 그린
  '#3a5a40': { hueColor: 'hsl(135, 100%, 50%)', saturate: 0.7, accent: '#3A6A3A' },
  // 21. 머스크 — 샴페인 브론즈
  '#9c7a5b': { hueColor: 'hsl(28, 100%, 50%)', saturate: 0.4, accent: '#8A6A45' },
  // 22. 화이트로즈 — 순백 실크
  '#ffffff': { hueColor: 'hsl(0, 0%, 50%)', saturate: 0.06, accent: '#B0A090' },
  // 23. 스웨이드 — 토프
  '#a9927d': { hueColor: 'hsl(28, 100%, 50%)', saturate: 0.3, accent: '#7A6A5A' },
  // 24. 이탈리안만다린 — 피치 만다린
  '#ff9a62': { hueColor: 'hsl(22, 100%, 50%)', saturate: 1.0, accent: '#D07030' },
  // 25. 라벤더 — 라벤더 퍼플
  '#8b80f9': { hueColor: 'hsl(245, 100%, 50%)', saturate: 1.0, accent: '#6A5AD0' },
  // 26. 이탈리안사이프러스 — 미드나잇 틸
  '#1c2321': { hueColor: 'hsl(160, 100%, 50%)', saturate: 0.7, accent: '#5A8090' },
  // 27. 스모키 블렌드 우드 — 다크 웜 브라운
  '#4a4238': { hueColor: 'hsl(25, 100%, 50%)', saturate: 0.45, accent: '#A0844A' },
  // 28. 레더 — 가죽 브라운
  '#6b3d2e': { hueColor: 'hsl(15, 100%, 50%)', saturate: 0.6, accent: '#8B4B35' },
  // 29. 바이올렛 — 비비드 퍼플
  '#9370db': { hueColor: 'hsl(260, 100%, 50%)', saturate: 1.0, accent: '#7B2FBE' },
  // 30. 무화과 — 와인 브라운
  '#7e5546': { hueColor: 'hsl(15, 100%, 50%)', saturate: 0.5, accent: '#8A5540' },
}

/** 봉투에 적용할 스타일 반환 */
export function getEnvelopeStyle(primaryColor: string): {
  hueColor: string
  saturateFilter: string
  accent: string
} {
  const key = primaryColor.toLowerCase()
  const style = PERFUME_STYLES[key]

  if (style) {
    return {
      hueColor: style.hueColor,
      saturateFilter: style.saturate !== 1.0 ? `saturate(${style.saturate})` : 'none',
      accent: style.accent,
    }
  }

  // 미등록 색상 폴백
  const { h, s } = hexToHSL(primaryColor)
  return {
    hueColor: `hsl(${Math.round(h)}, 100%, 50%)`,
    saturateFilter: s < 0.2 ? `saturate(${(s * 2).toFixed(2)})` : 'none',
    accent: fallbackAccent(primaryColor),
  }
}

/** 하위 호환: 기존 getAccentColor 유지 */
export function getAccentColor(primaryColor: string): string {
  const key = primaryColor.toLowerCase()
  const style = PERFUME_STYLES[key]
  if (style) return style.accent
  return fallbackAccent(primaryColor)
}

// ─── 폴백 ───

function fallbackAccent(primaryColor: string): string {
  const { h, s, l } = hexToHSL(primaryColor)
  if (s < 0.1) return '#BB0000'
  const adjustedS = Math.max(s, 0.4)
  const adjustedL = l > 0.65 ? 0.4 : l < 0.2 ? 0.35 : l
  return hslToHex(h, adjustedS, adjustedL)
}

// ─── 색상 유틸 ───

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return { h: h * 360, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
