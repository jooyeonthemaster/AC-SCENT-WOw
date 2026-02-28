import { perfumes, Perfume } from '@/lib/data/perfumes'

// 토큰 최적화된 향수 데이터 (프롬프트용)
export interface OptimizedPerfume {
  id: string
  name: string
  traits: {
    sexy: number
    cute: number
    charisma: number
    darkness: number
    freshness: number
    elegance: number
    freedom: number
    luxury: number
    purity: number
    uniqueness: number
  }
  characteristics: {
    citrus: number
    floral: number
    woody: number
    musky: number
    fruity: number
    spicy: number
  }
  keywords: string[]
  mood: string
  personality: string
  mainScent: string
  subScent1: string
  subScent2: string
  category: string
  description: string
}

// 30개 향수를 프롬프트에 넣을 수 있는 형태로 변환
export function formatPerfumesForPrompt(): OptimizedPerfume[] {
  return perfumes.map((perfume: Perfume) => ({
    id: perfume.id,
    name: perfume.name,
    traits: perfume.traits,
    characteristics: perfume.characteristics,
    keywords: perfume.keywords,
    mood: perfume.mood,
    personality: perfume.personality,
    mainScent: perfume.mainScent.name,
    subScent1: perfume.subScent1.name,
    subScent2: perfume.subScent2.name,
    category: perfume.category,
    description: perfume.description.slice(0, 100),
  }))
}

// perfumeId로 전체 향수 데이터 가져오기
export function getPerfumeById(perfumeId: string): Perfume | undefined {
  return perfumes.find((p) => p.id === perfumeId)
}
