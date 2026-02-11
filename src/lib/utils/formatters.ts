// Text formatting utilities

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatTraitName(trait: string): string {
  const traitNames: Record<string, string> = {
    sexy: '섹시함',
    cute: '귀여움',
    charisma: '카리스마',
    darkness: '신비로움',
    freshness: '상쾌함',
    elegance: '우아함',
    freedom: '자유로움',
    luxury: '고급스러움',
    purity: '순수함',
    uniqueness: '독특함',
  }
  return traitNames[trait] || trait
}

export function formatCharacteristicName(characteristic: string): string {
  const charNames: Record<string, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시',
  }
  return charNames[characteristic] || characteristic
}
