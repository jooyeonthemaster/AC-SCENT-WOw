import type { TraitScores } from '@/types/analysis'
import { TRAIT_ORDER } from '../constants'

export function calculateRadarPoints(traits: TraitScores, center: number = 60, maxRadius: number = 40): string {
    const points = TRAIT_ORDER.map((trait, index) => {
        const score = traits[trait] || 0
        const normalizedScore = score / 10
        const radius = normalizedScore * maxRadius

        const angleStart = -Math.PI / 2
        const angleStep = (Math.PI * 2) / 10
        const angle = angleStart + index * angleStep

        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)

        return `${x},${y}`
    })

    return points.join(' ')
}

export function calculateMarkerPoints(traits: TraitScores, center: number = 60, maxRadius: number = 40): { x: number; y: number }[] {
    return TRAIT_ORDER.map((trait, index) => {
        const score = traits[trait] || 0
        const normalizedScore = score / 10
        const radius = normalizedScore * maxRadius

        const angleStart = -Math.PI / 2
        const angleStep = (Math.PI * 2) / 10
        const angle = angleStart + index * angleStep

        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)

        return { x, y }
    })
}
