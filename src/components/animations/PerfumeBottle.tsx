'use client'

import { motion } from 'framer-motion'
import { useCallback, useRef, useState, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import { getEnvelopeStyle } from '@/lib/utils/envelopeColor'
import { serifFont } from '@/lib/constants/styles'
import { PerfumeDetailModal } from '@/components/modals/PerfumeDetailModal'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'

interface EnvelopeCardProps {
  perfumeName: string
  index: number
  recommendation: PerfumeRecommendation
  onOpen: () => void
  uploadedImage?: string
  analysisDate?: number
}

type Phase = 'closed' | 'opening' | 'opened'

export function EnvelopeCard({ perfumeName, index, recommendation, onOpen, uploadedImage, analysisDate }: EnvelopeCardProps) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [showDetail, setShowDetail] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Preload envelope video on mount
  useEffect(() => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.src = '/images/envelope2_cropped.mp4'
    video.load()
  }, [])

  // Play video when phase becomes 'opening'
  useLayoutEffect(() => {
    if (phase === 'opening' && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {
        // Fallback: skip to opened if autoplay fails
        setPhase('opened')
        onOpen()
        setTimeout(() => setShowDetail(true), 100)
      })
    }
  }, [phase, onOpen])

  const handleClick = () => {
    if (phase === 'opening') return

    if (phase === 'opened') {
      setShowDetail(true)
      return
    }

    // First time — play opening video in place
    setPhase('opening')
  }

  const handleVideoEnd = useCallback(() => {
    setPhase('opened')
    onOpen()
    setTimeout(() => setShowDetail(true), 200)
  }, [onOpen])

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
  }, [])

  const displayNumber = String(index + 1).padStart(2, '0')
  const { perfume } = recommendation
  const { hueColor, saturateFilter, accent: accentColor } = getEnvelopeStyle(perfume.primaryColor)

  return (
    <>
      {/* Envelope area */}
      <div
        className="relative flex-1 flex flex-col items-center cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative w-full" style={{ aspectRatio: '1', maxHeight: '100%' }}>
          {/*
            Layer stack (bottom → top):
              1. Closed envelope  (z-0) — base, fades out when opening starts
              2. Opened envelope  (z-1) — sits behind video
              3. Opening video    (z-2) — plays on top, fades out revealing opened image
              4. Hue overlay      (z-3) — mix-blend-mode:hue로 봉투 색 변환
          */}

          {/* Layer 1: Closed envelope */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              opacity: phase === 'closed' ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            <Image
              src="/images/envelope_closed_new.png"
              fill
              quality={80}
              style={{ objectFit: 'contain', filter: saturateFilter }}
              alt={perfumeName}
              sizes="(max-width: 768px) 30vw, 120px"
            />
          </div>

          {/* Layer 2: Opened envelope */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              opacity: phase !== 'closed' ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Image
              src="/images/envelope_opened_new.png"
              fill
              quality={80}
              style={{ objectFit: 'contain', filter: saturateFilter }}
              alt={`${perfumeName} 열린 봉투`}
              sizes="(max-width: 768px) 30vw, 120px"
            />
          </div>

          {/* Layer 3: Opening video */}
          <video
            ref={videoRef}
            src="/images/envelope2_cropped.mp4"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 2,
              opacity: phase === 'opening' ? 1 : 0,
              transition: phase === 'opened' ? 'opacity 0.4s ease' : 'opacity 0.1s ease',
              pointerEvents: 'none',
              filter: saturateFilter,
            }}
            playsInline
            muted
            preload="auto"
            onEnded={handleVideoEnd}
          />

          {/* Layer 4: Hue 오버레이 — 봉투 색상 변환 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              backgroundColor: hueColor,
              mixBlendMode: 'hue',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Label */}
        <span
          className={`mt-1 text-[10px] tracking-wider font-semibold ${phase === 'opened' ? '' : 'text-[#999]'}`}
          style={{ ...serifFont, ...(phase === 'opened' ? { color: accentColor } : {}) }}
        >
          {phase === 'opened' ? 'TAP TO VIEW' : `NO.${displayNumber}`}
        </span>
      </div>

      {/* Perfume detail modal */}
      <PerfumeDetailModal
        isOpen={showDetail}
        onClose={handleCloseDetail}
        recommendation={recommendation}
        index={index}
        accentColor={accentColor}
        uploadedImage={uploadedImage}
        analysisDate={analysisDate}
      />
    </>
  )
}

// Backward-compatible export for dynamic import
export { EnvelopeCard as PerfumeBottle }
