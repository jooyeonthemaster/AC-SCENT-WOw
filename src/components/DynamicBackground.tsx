'use client'

interface DynamicBackgroundProps {
    fixed?: boolean
}

export function DynamicBackground({ fixed = false }: DynamicBackgroundProps) {
    return (
        <div style={{
            position: fixed ? 'fixed' : 'absolute',
            inset: 0,
            backgroundColor: '#F5F0E8',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
        }}>
            <svg
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

                {/* Base */}
                <rect width="100%" height="100%" fill="#F5F0E8" />

                {/* Grain texture */}
                <rect width="100%" height="100%" filter="url(#grain)" opacity="0.5" />
            </svg>
        </div>
    )
}
