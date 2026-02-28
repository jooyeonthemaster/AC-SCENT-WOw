"use client"

import { forwardRef, useMemo } from 'react'
import { ShareAnalysisData, TraitScores, ScentCategoryScores, SEASON_LABELS, TONE_LABELS } from '@/types/analysis'
import { SHARE_CARD_DIMENSIONS } from '../ShareModal/constants'
import { TRAIT_KO_LABELS, SCENT_ORDER } from './constants'
import { calculateRadarPoints, calculateMarkerPoints } from './utils/radarChart'
import { formatDescription } from './utils/formatters'
import { ScentCategoriesSection } from './components/ScentCategoriesSection'

interface ShareCardProps {
    userImage?: string
    twitterName: string
    userName: string
    userGender?: string
    perfumeName?: string
    perfumeBrand?: string
    analysisData: ShareAnalysisData
}

export const ShareCardNew = forwardRef<HTMLDivElement, ShareCardProps>(
    function ShareCardNew({ userImage, twitterName, userName, perfumeName, perfumeBrand, analysisData }, ref) {
        const { traits, matchingPerfumes, scentCategories, personalColor } = analysisData
        const persona = matchingPerfumes?.[0]?.persona

        const polygonPoints = useMemo(() => calculateRadarPoints(traits, 60, 35), [traits])
        const markers = useMemo(() => calculateMarkerPoints(traits, 60, 35), [traits])

        // Notes Data
        const notesData = [
            { type: 'TOP', name: persona?.mainScent?.name || 'Top Note' },
            { type: 'MID', name: persona?.subScent1?.name || 'Middle Note' },
            { type: 'BASE', name: persona?.subScent2?.name || 'Base Note' }
        ]

        return (
            <div
                ref={ref}
                style={{
                    width: SHARE_CARD_DIMENSIONS.width,
                    height: SHARE_CARD_DIMENSIONS.height,
                    position: 'relative',
                    overflow: 'hidden',
                    fontFamily: 'var(--font-jua), "Jua", sans-serif',
                    backgroundColor: '#FFF'
                }}
            >
                {/* Background Image */}
                <img
                    src="/images/shareback/backimage.png"
                    alt="background"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        zIndex: 0
                    }}
                    crossOrigin="anonymous"
                />

                {/* Perfume ID */}
                <div
                    style={{
                        position: 'absolute',
                        top: 166,
                        left: '67%',
                        transform: 'translateX(-50%)',
                        width: 250,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                    }}
                >
                    <h2 style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: 0,
                        lineHeight: 1.1,
                        letterSpacing: -0.5
                    }}>
                        {persona?.id || perfumeBrand || '맞춤 향수'}
                    </h2>
                </div>

                {/* 분석 이미지 */}
                <div
                    style={{
                        position: 'absolute',
                        top: 210,
                        left: '50%',
                        transform: 'translateX(-61.5%)',
                        width: 130,
                        height: 173,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        overflow: 'hidden',
                        borderRadius: 4,
                    }}
                >
                    {userImage ? (
                        <img
                            src={userImage}
                            alt="분석 이미지"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                fontSize: 14,
                            }}
                        >
                            NO IMAGE
                        </div>
                    )}
                </div>

                {/* Name */}
                <div
                    style={{
                        position: 'absolute',
                        top: 385,
                        left: '50%',
                        transform: 'translateX(-52%)',
                        width: 320,
                        textAlign: 'center',
                        zIndex: 10,
                    }}
                >
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#000', margin: 0 }}>
                        {userName}
                    </h2>
                </div>

                {/* Description (Jujeop) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 425,
                        left: '50%',
                        transform: 'translateX(-55%)',
                        width: 290,
                        height: 75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        zIndex: 10,
                    }}
                >
                    <p
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#451a03',
                            lineHeight: 1.4,
                            margin: 0,
                            wordBreak: 'keep-all',
                            padding: '8px 16px',
                            backgroundColor: 'rgba(255, 251, 235, 0.85)',
                            borderRadius: 8
                        }}
                    >
                        {twitterName || `${userName}님만의 특별한 향기`}
                    </p>
                </div>

                {/* BOTTOM LEFT: Scent Categories */}
                <div
                    style={{
                        position: 'absolute',
                        top: 623,
                        left: 58,
                        width: 130,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ScentCategoriesSection scentCategories={scentCategories} />
                </div>

                {/* BOTTOM LEFT: Notes */}
                <div
                    style={{
                        position: 'absolute',
                        top: 555,
                        left: 115,
                        width: 100,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {notesData.map((note, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    height: 18,
                                    justifyContent: 'center',
                                    transform: idx === 0 ? 'translateY(-7px)' : idx === 1 ? 'translateY(-3px)' : 'translateY(2px)'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 900,
                                        color: '#334155',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%'
                                    }}
                                >
                                    {note.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTTOM RIGHT: Color Type & Radar Chart */}
                <div
                    style={{
                        position: 'absolute',
                        top: 550,
                        right: 40,
                        width: 155,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10
                    }}
                >
                    {/* Personal Color Info */}
                    {personalColor && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 5 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 10, fontWeight: 900, color: '#1e293b', transform: 'translate(29px, -5px)', textAlign: 'left' }}>
                                    {SEASON_LABELS[personalColor.season]} {TONE_LABELS[personalColor.tone]}
                                </div>
                                <div style={{ fontSize: 9, color: '#64748b', marginTop: 3, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.3, textAlign: 'left', transform: 'translateX(-35px)' }}>
                                    {formatDescription(personalColor.description)}
                                </div>
                            </div>

                            {/* Palette Swatches */}
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', transform: 'translateX(-40px)' }}>
                                {personalColor.palette.slice(0, 4).map((color, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 6,
                                            backgroundColor: color,
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            boxShadow: '1px 1px 0px rgba(0,0,0,0.2)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Radar Chart */}
                    <div
                        style={{
                            width: 130,
                            height: 130,
                            position: 'relative',
                            transform: 'translate(-40px, -20px)',
                            marginTop: 10
                        }}
                    >
                        <svg width="130" height="130" viewBox="0 0 120 120">
                            <defs>
                                <linearGradient id="shareChartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#F472B6" />
                                    <stop offset="50%" stopColor="#FACC15" />
                                    <stop offset="100%" stopColor="#60A5FA" />
                                </linearGradient>
                            </defs>

                            {/* Grid Circles */}
                            {[7, 14, 21, 28, 35].map(r => (
                                <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeOpacity="0.4" />
                            ))}
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
                                const angle = -Math.PI / 2 + i * (Math.PI * 2) / 10
                                const x2 = 60 + 35 * Math.cos(angle)
                                const y2 = 60 + 35 * Math.sin(angle)
                                return <line key={i} x1="60" y1="60" x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="0.5" strokeOpacity="0.4" />
                            })}

                            {/* Data Polygon */}
                            <polygon
                                points={polygonPoints}
                                fill="rgba(236, 72, 153, 0.25)"
                                stroke="url(#shareChartGradient)"
                                strokeWidth="1.5"
                            />

                            {/* Markers */}
                            {markers.map((pt, i) => (
                                <circle key={i} cx={pt.x} cy={pt.y} r="2" fill="url(#shareChartGradient)" stroke="#fff" strokeWidth="1" />
                            ))}

                            {/* Labels */}
                            {TRAIT_KO_LABELS.map((label, i) => {
                                const angle = -Math.PI / 2 + i * (Math.PI * 2) / 10
                                const labelRadius = 45
                                const x = 60 + labelRadius * Math.cos(angle)
                                const y = 60 + labelRadius * Math.sin(angle)
                                return (
                                    <text
                                        key={i}
                                        x={x}
                                        y={y}
                                        dominantBaseline="middle"
                                        textAnchor="middle"
                                        fontSize="6"
                                        fontWeight="700"
                                        fill="#64748b"
                                        style={{ fontFamily: 'var(--font-jua), "Jua", sans-serif' }}
                                    >
                                        {label}
                                    </text>
                                )
                            })}
                        </svg>
                    </div>

                    {/* Keywords */}
                    {(analysisData.matchingKeywords || persona?.keywords || []).slice(0, 3).map((keyword, idx) => (
                        <span key={idx} style={{
                            position: 'absolute',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            color: '#334155',
                            whiteSpace: 'nowrap',
                            top: 192,
                            left: idx === 0 ? -9 : idx === 1 ? 25 : 60
                        }}>
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
        )
    }
)
