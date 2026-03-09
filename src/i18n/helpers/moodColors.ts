// 영어 시맨틱 키 기반 MOOD_COLORS 매핑
// Gemini가 moodCategories로 반환하는 영어 카테고리 → 배경색

const MOOD_COLORS: Record<string, string> = {
  // 어두운/강렬한 계열
  chic: '#2D2D2D', dark: '#37474F', charisma: '#4A148C', passion: '#FFCDD2',
  sexy: '#E91E63', leather: '#3E2723', smoky: '#455A64',
  // 핑크/로맨틱 계열
  romantic: '#F8BBD0', cute: '#FCE4EC', soft: '#FDE7F0', love: '#F48FB1',
  sweet: '#F8BBD0', lovely: '#F48FB1',
  // 보라/몽환 계열
  dreamy: '#E1BEE7', elegant: '#F3E5F5', mysterious: '#D1C4E9', violet: '#CE93D8',
  // 파랑/청량 계열
  cool: '#B3E5FC', fresh: '#81D4FA', clean: '#E0F7FA', calm: '#B2DFDB',
  refreshing: '#80DEEA', clear: '#B3E5FC',
  // 초록/자연 계열
  relaxed: '#C8E6C9', free: '#A5D6A7', comfortable: '#C5E1A5', natural: '#AED581',
  herb: '#C5E1A5', green: '#DCEDC8', lush: '#C8E6C9',
  // 노랑/따뜻한 계열
  warm: '#FFCCBC', cozy: '#FFF9C4', bright: '#FFF176', lively: '#FFE082',
  vibrant: '#FFE0B2', citrusy: '#FFCC80', sunshine: '#FFF176', energy: '#FFD54F',
  // 베이지/세련 계열
  refined: '#CFD8DC', emotional: '#D7CCC8', vintage: '#EFEBE9', urban: '#ECEFF1',
  luxury: '#FFF8E1', classic: '#D7CCC8', modern: '#CFD8DC',
  // 순수/맑은 계열
  pure: '#E8EAF6', transparent: '#E3F2FD', light: '#F3E5F5',
  // 오렌지/과일 계열
  peppy: '#FFAB91', vitamin: '#FFB74D',
  // 갈색/나무 계열
  woody: '#BCAAA4', forest: '#81C784',
}

const DARK_CATEGORIES = new Set(['chic', 'dark', 'charisma', 'sexy', 'leather', 'smoky'])

/**
 * moodCategories 영어 키로 색상 조회 (Phase 4+)
 * 폴백: 한국어 키워드 기반 기존 매핑
 */
export function getMoodColorByCategory(category: string): string {
  const lower = category.toLowerCase()
  return MOOD_COLORS[lower] || '#F5F0E8'
}

export function getMoodTextColorByCategory(category: string): string {
  return DARK_CATEGORIES.has(category.toLowerCase()) ? '#fff' : '#333'
}

// 한국어 키워드 → 색상 폴백 (기존 호환)
const KOREAN_MOOD_COLORS: Record<string, string> = {
  시크: '#2D2D2D', 다크: '#37474F', 카리스마: '#4A148C', 열정: '#FFCDD2',
  섹시: '#E91E63', 레더: '#3E2723', 스모키: '#455A64',
  로맨틱: '#F8BBD0', 귀여운: '#FCE4EC', 부드러운: '#FDE7F0', 사랑: '#F48FB1',
  달콤: '#F8BBD0', 러블리: '#F48FB1',
  몽환: '#E1BEE7', 우아: '#F3E5F5', 신비: '#D1C4E9', 바이올렛: '#CE93D8',
  쿨: '#B3E5FC', 청량: '#81D4FA', 깔끔: '#E0F7FA', 차분: '#B2DFDB',
  시원: '#80DEEA', 맑은: '#B3E5FC',
  여유: '#C8E6C9', 자유: '#A5D6A7', 편안: '#C5E1A5', 자연: '#AED581',
  허브: '#C5E1A5', 풋풋: '#DCEDC8', 싱그러운: '#C8E6C9',
  따뜻: '#FFCCBC', 포근: '#FFF9C4', 밝은: '#FFF176', 활발: '#FFE082',
  화사: '#FFE0B2', 상큼: '#FFCC80', 햇살: '#FFF176', 에너지: '#FFD54F',
  세련: '#CFD8DC', 감성: '#D7CCC8', 빈티지: '#EFEBE9', 도시: '#ECEFF1',
  고급: '#FFF8E1', 클래식: '#D7CCC8', 모던: '#CFD8DC',
  순수: '#E8EAF6', 투명: '#E3F2FD', 깨끗: '#E0F7FA', 가벼운: '#F3E5F5',
  톡톡: '#FFAB91', 발랄: '#FFAB91', 비타민: '#FFB74D',
  우디: '#BCAAA4', 나무: '#A1887F', 포레스트: '#81C784',
}

const KOREAN_DARK_KEYWORDS = ['시크', '다크', '카리스마', '섹시', '레더', '스모키']

export function getMoodColorFallback(keyword: string): string {
  for (const [key, color] of Object.entries(KOREAN_MOOD_COLORS)) {
    if (keyword.includes(key)) return color
  }
  return '#F5F0E8'
}

export function getMoodTextColorFallback(keyword: string): string {
  for (const k of KOREAN_DARK_KEYWORDS) {
    if (keyword.includes(k)) return '#fff'
  }
  return '#333'
}
