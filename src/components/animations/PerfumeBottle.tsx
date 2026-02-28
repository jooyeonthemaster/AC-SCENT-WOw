'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useRef, useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useScrollLock } from '@/app/results/[id]/components/ShareModal/hooks/useScrollLock'
import { getEnvelopeStyle } from '@/lib/utils/envelopeColor'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'

interface PerfumeBottleProps {
  perfumeName: string
  index: number
  recommendation: PerfumeRecommendation
  onOpen: () => void
}

const serifFont = { fontFamily: 'Times New Roman, Georgia, serif' }

type Phase = 'closed' | 'opening' | 'opened'

export function PerfumeBottle({ perfumeName, index, recommendation, onOpen }: PerfumeBottleProps) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [showLetter, setShowLetter] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useScrollLock(showLetter)

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
        setTimeout(() => setShowLetter(true), 100)
      })
    }
  }, [phase, onOpen])

  const handleClick = () => {
    if (phase === 'opening') return

    if (phase === 'opened') {
      // Already opened — show letter directly
      setShowLetter(true)
      return
    }

    // First time — play opening video in place
    setPhase('opening')
  }

  const handleVideoEnd = useCallback(() => {
    setPhase('opened')
    onOpen()
    setTimeout(() => setShowLetter(true), 200)
  }, [onOpen])

  const handleCloseLetter = useCallback(() => {
    setShowLetter(false)
  }, [])

  const displayNumber = String(index + 1).padStart(2, '0')
  const { perfume, matchConfidence, reasoning } = recommendation
  const { hueColor, saturateFilter, accent: accentColor } = getEnvelopeStyle(perfume.primaryColor)

  return (
    <>
      {/* In-place envelope area */}
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
                 → 흰색 배경(채도=0)엔 효과 없음, 빨간 봉투(채도 높음)만 색 전환
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

      {/* Letter popup (portal) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showLetter && (
            <>
              {/* Backdrop */}
              <motion.div
                key="letter-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseLetter}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#000000',
                  zIndex: 99990,
                }}
              />

              {/* Letter modal */}
              <motion.div
                key="letter-modal"
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-40px)] max-w-[338px] overflow-hidden"
                style={{
                  zIndex: 99991,
                  backgroundColor: '#FFFFFF',
                  maxHeight: 'calc(100dvh - 80px)',
                  border: '1px solid #E5E5E5',
                }}
              >
                {/* Viewfinder corner brackets */}
                <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 z-10" style={{ borderColor: accentColor }} />
                <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 z-10" style={{ borderColor: accentColor }} />
                <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 z-10" style={{ borderColor: accentColor }} />
                <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 z-10" style={{ borderColor: accentColor }} />

                {/* Close button */}
                <button
                  onClick={handleCloseLetter}
                  className="absolute top-4 right-4 z-20 p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>

                {/* Scrollable content */}
                <div
                  className="overflow-y-auto px-6 py-8"
                  style={{ maxHeight: 'calc(100dvh - 80px)', scrollbarWidth: 'none' }}
                >
                  {/* Header: ID + Confidence */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs tracking-[0.2em] font-semibold" style={{ ...serifFont, color: accentColor }}>
                      {perfume.id || `AC'SCENT ${displayNumber}`}
                    </span>
                    <span className="text-xs tracking-wider text-[#555]" style={serifFont}>
                      MATCH {matchConfidence}%
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-8 h-[2px] mb-4" style={{ backgroundColor: accentColor }} />

                  {/* Perfume Name */}
                  <h2
                    className="text-2xl font-bold text-[#1A1A1A] mb-5"
                    style={{ ...serifFont, letterSpacing: '-0.02em' }}
                  >
                    {perfume.name}
                  </h2>

                  {/* Match Confidence Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] tracking-[0.15em] text-[#999] font-medium">CONFIDENCE</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{matchConfidence}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${matchConfidence}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="h-full"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>
                  </div>

                  {/* Scent Notes */}
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-3">NOTES</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-11 text-[10px] tracking-[0.1em] font-bold" style={{ color: accentColor }}>TOP</span>
                        <span className="flex-1 text-sm text-[#1A1A1A] font-medium">{perfume.mainScent.name}</span>
                      </div>
                      <div className="ml-14 h-[1px] bg-gray-100" />
                      <div className="flex items-center gap-3">
                        <span className="w-11 text-[10px] tracking-[0.1em] font-bold text-[#555]">MID</span>
                        <span className="flex-1 text-sm text-[#1A1A1A] font-medium">{perfume.subScent1.name}</span>
                      </div>
                      <div className="ml-14 h-[1px] bg-gray-100" />
                      <div className="flex items-center gap-3">
                        <span className="w-11 text-[10px] tracking-[0.1em] font-bold text-[#555]">BASE</span>
                        <span className="flex-1 text-sm text-[#1A1A1A] font-medium">{perfume.subScent2.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-2">MOOD</p>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.mood.split(',').map((m, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-medium text-[#1A1A1A] border border-gray-200"
                        >
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-2">WHY THIS PERFUME</p>
                    <div className="pl-3 border-l-2" style={{ borderColor: accentColor }}>
                      <p className="text-sm text-[#333] leading-relaxed">{reasoning}</p>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleCloseLetter}
                    className="w-full py-3 mt-2 border border-[#1A1A1A] text-[#1A1A1A] text-sm font-semibold tracking-wider active:bg-[#1A1A1A] active:text-white transition-colors duration-150"
                    style={serifFont}
                  >
                    CLOSE
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
