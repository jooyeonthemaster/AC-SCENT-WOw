"use client"

import type { ScentCategoryScores } from '@/types/analysis'
import { CATEGORY_INFO } from '@/types/analysis'
import { SCENT_ORDER } from '../constants'
import { getCategoryStyles } from '../utils/categoryStyles'

interface ScentCategoriesSectionProps {
    scentCategories: ScentCategoryScores
}

export function ScentCategoriesSection({ scentCategories }: ScentCategoriesSectionProps) {
    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            padding: 6,
            boxShadow: '1px 1px 0px #000',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
        }}>
            {SCENT_ORDER.map((catKey) => {
                const info = CATEGORY_INFO[catKey]
                const score = scentCategories?.[catKey] || 0
                const styles = getCategoryStyles(catKey)

                const dots = []
                for (let i = 0; i < 8; i++) {
                    dots.push(i < score ? 'filled' : 'empty')
                }

                return (
                    <div key={catKey} style={{
                        position: 'relative',
                        borderRadius: 4,
                        padding: '2px 4px',
                        backgroundColor: styles.bg,
                        border: `0.5px solid ${styles.borderColor}`,
                        boxShadow: `0 0 0 0.5px #fff, 0 0 0 1.5px ${styles.ringColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                    }}>
                        {/* Icon & Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 28 }}>
                            <span style={{ fontSize: 8 }}>{info.icon}</span>
                            <span style={{ fontSize: 8, fontWeight: 'bold', color: styles.textColor }}>{info.name}</span>
                        </div>

                        {/* Dots */}
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {dots.map((status, dIdx) => (
                                <div
                                    key={dIdx}
                                    style={{
                                        width: 3,
                                        height: 3,
                                        borderRadius: '50%',
                                        backgroundColor: status === 'filled' ? styles.dotColor : '#e2e8f0',
                                        border: status === 'filled' ? '0.5px solid #0f172a' : '0.5px solid #cbd5e1',
                                        transform: status === 'empty' ? 'scale(0.4)' : 'none'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Score Badge */}
                        <div style={{
                            flexShrink: 0,
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            backgroundColor: styles.dotColor,
                            border: '1px solid #0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: 5, fontWeight: 900, color: '#fff' }}>{Math.min(score, 10)}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
