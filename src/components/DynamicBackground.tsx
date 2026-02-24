'use client'

import { Nanum_Pen_Script } from 'next/font/google'

// Check validation of font loading
const nanumPen = Nanum_Pen_Script({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    fallback: ['cursive'], // Fallback
})

interface DynamicBackgroundProps {
    showHeroText?: boolean
    fixed?: boolean
}

export function DynamicBackground({ showHeroText = true, fixed = false }: DynamicBackgroundProps) {
    return (
        <div style={{
            position: fixed ? 'fixed' : 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
        }}>
            <svg
                id="bg-svg"
                width="100%"
                height="100%"
                viewBox="0 0 1080 1920"
                preserveAspectRatio="xMidYMin meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="grain" x="0" y="0">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0" />
                    </filter>
                </defs>

                {/* Content Background: White */}
                <rect width="100%" height="100%" fill="#FFFFFF" />

                {/* Subtle Noise Texture */}
                <rect width="100%" height="100%" filter="url(#grain)" opacity="0.6" />

                {/* === Design Layer 1: Background decoration === */}

                {/* Geometric Grid Lines */}
                <line x1="40" y1="220" x2="1040" y2="220" stroke="#333" strokeWidth="2" opacity="0.1" />
                <line x1="40" y1="1700" x2="1040" y2="1700" stroke="#333" strokeWidth="2" opacity="0.1" />

                {/* === Design Layer 2: Typography (Background) === */}
                <text x="50" y="500" fontSize="280" fill="#222" opacity="0.03" className="font-serif font-bold" transform="rotate(-90 50 500)" style={{ fontFamily: 'Times New Roman, serif' }}>LOVE</text>
                <text x="1030" y="500" fontSize="280" fill="#222" opacity="0.03" className="font-serif font-bold" transform="rotate(90 1030 500)" style={{ fontFamily: 'Times New Roman, serif' }}>LETTER</text>

                {/* === Design Layer 3: Typography (Contextual) === */}
                {/* Top Header Area */}
                <text x="540" y="140" fontSize="64" fill="#111" textAnchor="middle" className="font-serif font-bold" letterSpacing="4" style={{ fontFamily: 'Times New Roman, serif' }}>AC&apos;SCENT</text>

                {/* KOREAN PHRASE: "최애에게 보내는 마음" */}
                {showHeroText && (
                    <g className={nanumPen.className}>
                        <text x="545" y="465" fontSize="130" fill="#DDD" textAnchor="middle" opacity="0.8">최애에게 보내는 마음</text>
                        <text x="542" y="462" fontSize="130" fill="#900" textAnchor="middle" opacity="0.3">최애에게 보내는 마음</text>
                        <text x="540" y="460" fontSize="130" fill="#111" textAnchor="middle">최애에게 보내는 마음</text>
                    </g>
                )}

                {/* Subtext */}
                {showHeroText && (
                    <text x="540" y="530" fontSize="24" fill="#555" textAnchor="middle" className="font-sans" letterSpacing="8" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>SEND YOUR HEART</text>
                )}

                {/* Middle Area Graphics (Abstract) */}
                <path d="M -50 480 Q 270 380 540 480 T 1130 480" stroke="#333" strokeWidth="2" fill="none" opacity="0.08" />

                {/* Red Point Accents */}
                <circle cx="540" cy="180" r="4" fill="#B00" />
                {showHeroText && <circle cx="540" cy="470" r="3" fill="#B00" />}

                {/* === Scattered Elements (visible when showHeroText is off - results page) === */}
                {!showHeroText && (
                    <>
                        {/* Mid-upper area decorative elements */}
                        <line x1="80" y1="500" x2="250" y2="500" stroke="#333" strokeWidth="1.5" opacity="0.06" />
                        <line x1="830" y1="560" x2="1000" y2="560" stroke="#333" strokeWidth="1.5" opacity="0.06" />

                        {/* Red accent dots scattered across viewport */}
                        <circle cx="120" cy="420" r="3" fill="#B00" opacity="0.5" />
                        <circle cx="960" cy="680" r="2.5" fill="#B00" opacity="0.4" />
                        <circle cx="200" cy="1100" r="3" fill="#B00" opacity="0.35" />
                        <circle cx="880" cy="1350" r="2.5" fill="#B00" opacity="0.4" />
                        <circle cx="540" cy="960" r="3.5" fill="#B00" opacity="0.3" />

                        {/* Subtle crosshair marks */}
                        <g opacity="0.06">
                            <line x1="530" y1="700" x2="550" y2="700" stroke="#333" strokeWidth="1.5" />
                            <line x1="540" y1="690" x2="540" y2="710" stroke="#333" strokeWidth="1.5" />
                        </g>
                        <g opacity="0.06">
                            <line x1="150" y1="1300" x2="170" y2="1300" stroke="#333" strokeWidth="1.5" />
                            <line x1="160" y1="1290" x2="160" y2="1310" stroke="#333" strokeWidth="1.5" />
                        </g>
                        <g opacity="0.06">
                            <line x1="900" y1="1000" x2="920" y2="1000" stroke="#333" strokeWidth="1.5" />
                            <line x1="910" y1="990" x2="910" y2="1010" stroke="#333" strokeWidth="1.5" />
                        </g>

                        {/* Decorative curves in middle zone */}
                        <path d="M -30 900 Q 300 850 540 920 T 1110 880" stroke="#333" strokeWidth="1.5" fill="none" opacity="0.05" />
                        <path d="M -30 1400 Q 400 1350 700 1420 T 1110 1380" stroke="#333" strokeWidth="1.5" fill="none" opacity="0.05" />

                        {/* Small corner brackets scattered */}
                        <path d="M 100 650 L 100 620 L 130 620" stroke="#B00" strokeWidth="3" fill="none" opacity="0.15" />
                        <path d="M 950 1150 L 980 1150 L 980 1180" stroke="#B00" strokeWidth="3" fill="none" opacity="0.15" />
                        <path d="M 130 1500 L 100 1500 L 100 1470" stroke="#B00" strokeWidth="3" fill="none" opacity="0.12" />
                        <path d="M 950 400 L 980 400 L 980 430" stroke="#B00" strokeWidth="3" fill="none" opacity="0.12" />

                        {/* Grid lines in middle */}
                        <line x1="40" y1="960" x2="1040" y2="960" stroke="#333" strokeWidth="1" opacity="0.04" />
                    </>
                )}

            </svg>
        </div>
    )
}
