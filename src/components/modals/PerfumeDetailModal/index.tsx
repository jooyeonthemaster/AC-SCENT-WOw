'use client'

import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, Loader2 } from 'lucide-react'
import { domToPng } from 'modern-screenshot'
import { useScrollLock } from '@/app/results/[id]/components/ShareModal/hooks/useScrollLock'
const cardFont = { fontFamily: 'var(--font-sans)' } as const
import NextImage from 'next/image'
import { ScentProfileGrid } from './ScentProfileGrid'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import { useTranslation } from '@/i18n/useTranslation'
import { useLocalizedPerfume } from '@/i18n/helpers/localizedPerfume'

// Template: 2.jpeg (3072 x 5504) → display at 320 x 573
// Scale factor: 9.6 (3072 / 320)
const CARD_WIDTH = 320
const CARD_HEIGHT = 573

// Template: original JPEG for capture, Next.js Image optimization for display
const TEMPLATE_HIRES = '/images/2.jpeg' // original for capture (6.2MB → domToPng)

/*
  Pixel-measured coordinates (2.jpeg @ 3072x5504, scale=9.6):

  Photo frame inner:   img(196,758)~(984,2028)  → display(20,79) w=82,h=132
  Info underline 1:    img y=1120  → display y=117  → text at y≈109
  Info underline 2:    img y=1335  → display y=139  → text at y≈131
  Info underline 3:    img y=1545  → display y=161  → text at y≈153
  Info underline 4:    img y=1760  → display y=183  → text at y≈175
  Box left inner:      img x=158   → display x=16
  Box right inner:     img x=2914  → display x=303  → content width≈287
  Scent Profile box:   img y=2155~2670  → display y=225~278
  Scent Story box:     img y=3030~3850  → display y=316~401
  How to box:          img y=4200~5025  → display y=438~523
  Footer text:         img y≈5250  → display y≈547
  Date area:           img x≈2071~2900  → display right≈18
*/

// Scent Story box constraints
const STORY_BOX_HEIGHT = 78 // 401-316 = 85, with padding ~78
const STORY_LINE_HEIGHT = 1.5
const STORY_MAX_FONT = 12
const STORY_MIN_FONT = 7

// Content box dimensions
const BOX_LEFT = 20
const BOX_WIDTH = 280

function getStoryFontSize(text: string): number {
  if (!text) return STORY_MAX_FONT
  const wideChars = (text.match(/[\u2E80-\u9FFF\uF900-\uFAFF\u0E00-\u0E7F\uAC00-\uD7AF]/g) || []).length
  const charWidth = 0.55 + (wideChars / text.length) * 0.45
  for (let size = STORY_MAX_FONT; size >= STORY_MIN_FONT; size--) {
    const charsPerLine = Math.floor(BOX_WIDTH / (size * charWidth))
    const lineCount = Math.ceil(text.length / charsPerLine)
    const totalHeight = lineCount * size * STORY_LINE_HEIGHT
    if (totalHeight <= STORY_BOX_HEIGHT) return size
  }
  return STORY_MIN_FONT
}

interface PerfumeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  recommendation: PerfumeRecommendation
  index: number
  accentColor?: string
  uploadedImage?: string
  analysisDate?: number
}

/** Card content shared between hidden capture div and display modal */
function CardContent({
  perfume,
  reasoning,
  uploadedImage,
  accentColor,
  dateStr,
  templateSrc,
  forCapture,
}: {
  perfume: PerfumeRecommendation['perfume']
  reasoning: string
  uploadedImage?: string
  accentColor: string
  dateStr: string
  templateSrc: string
  forCapture?: boolean
}) {
  const { t } = useTranslation('results')
  const { getMainScent, getSubScent1, getSubScent2 } = useLocalizedPerfume()
  return (
    <>
      {/* Background template image */}
      {forCapture ? (
        <img
          src={templateSrc}
          alt="template"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            zIndex: 0,
          }}
        />
      ) : (
        <NextImage
          src={TEMPLATE_HIRES}
          alt="template"
          fill
          quality={80}
          sizes="320px"
          style={{ objectFit: 'fill', zIndex: 0 }}
          priority
        />
      )}

      {/* User photo (inner frame: x=20, y=79, w=83, h=102.5) */}
      <div
        style={{
          position: 'absolute',
          top: 79,
          left: 20,
          width: 83,
          height: 102.5,
          zIndex: 10,
          clipPath: 'inset(0)',
        }}
      >
        {uploadedImage ? (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img
              src={uploadedImage}
              alt="Your photo"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 8, color: '#bbb', ...cardFont }}>PHOTO</span>
          </div>
        )}
      </div>

      {/* Scent Information — name/ID */}
      <span
        style={{
          position: 'absolute',
          top: 100,
          left: 130,
          width: 170,
          zIndex: 10,
          fontSize: 12,
          color: '#000',
          ...cardFont,
        }}
      >
        {perfume.id}
      </span>

      {/* Notes: Top / Middle / Base */}
      {[
        { label: 'Top', value: getMainScent(perfume.id), y: 122 },
        { label: 'Middle', value: getSubScent1(perfume.id), y: 144 },
        { label: 'Base', value: getSubScent2(perfume.id), y: 166 },
      ].map(({ label, value, y }) => (
        <div
          key={label}
          style={{
            position: 'absolute',
            top: y,
            left: 130,
            width: 170,
            zIndex: 10,
            display: 'flex',
            alignItems: 'baseline',
            ...cardFont,
          }}
        >
          <span style={{ color: '#000', fontSize: 11, width: 45, flexShrink: 0 }}>
            {label}
          </span>
          <span style={{ color: '#000', fontSize: 12 }}>
            {value}
          </span>
        </div>
      ))}

      {/* Scent Profile circles (box: y=225~278) */}
      <div
        style={{
          position: 'absolute',
          top: 232,
          left: BOX_LEFT,
          width: BOX_WIDTH,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ScentProfileGrid
          characteristics={perfume.characteristics}
          accentColor={accentColor}
          circleSize={32}
        />
      </div>

      {/* Scent Story text (box: y=316~401) */}
      <div
        style={{
          position: 'absolute',
          top: 316,
          left: BOX_LEFT,
          width: BOX_WIDTH,
          height: 85,
          zIndex: 10,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          boxSizing: 'border-box',
        }}
      >
        <p style={{
          fontSize: getStoryFontSize(reasoning),
          lineHeight: STORY_LINE_HEIGHT,
          color: '#000',
          margin: 0,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          width: '100%',
          ...cardFont,
        }}>
          {reasoning}
        </p>
      </div>

      {/* How to text (box: y=438~523) */}
      <div
        style={{
          position: 'absolute',
          top: 438,
          left: BOX_LEFT,
          width: BOX_WIDTH,
          height: 85,
          zIndex: 10,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          boxSizing: 'border-box',
        }}
      >
        <p style={{
          fontSize: 11,
          lineHeight: 1.5,
          color: '#000',
          margin: 0,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          width: '100%',
          ...cardFont,
        }}>
          {t('perfumeDetail.howTo')}
        </p>
      </div>

      {/* Date in footer — right side */}
      <span
        style={{
          position: 'absolute',
          top: 538,
          right: 18,
          zIndex: 10,
          fontSize: 10,
          color: '#999',
          letterSpacing: '0.05em',
          ...cardFont,
        }}
      >
        {dateStr}
      </span>
    </>
  )
}

export function PerfumeDetailModal({
  isOpen,
  onClose,
  recommendation,
  index,
  accentColor = '#BB0000',
  uploadedImage,
  analysisDate,
}: PerfumeDetailModalProps) {
  const { t: tc } = useTranslation('common')
  useScrollLock(isOpen)

  const hiddenCardRef = useRef<HTMLDivElement>(null)
  const cachedBlobRef = useRef<Blob | null>(null)
  const [cardScale, setCardScale] = useState(1)
  const [isReady, setIsReady] = useState(false)
  const [showHiddenCard, setShowHiddenCard] = useState(false)

  const { perfume, reasoning } = recommendation

  const d = analysisDate ? new Date(analysisDate) : new Date()
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

  // ── Defer hidden card rendering to avoid network contention ──
  useEffect(() => {
    const delay = 3000 + index * 1500 // stagger: 3s, 4.5s, 6s per card
    const timer = setTimeout(() => setShowHiddenCard(true), delay)
    return () => clearTimeout(timer)
  }, [index])

  // ── Pre-generate image after hidden card is rendered ──
  useEffect(() => {
    if (!showHiddenCard) return
    let cancelled = false

    const generate = async () => {
      // Wait for hidden card ref to be attached (poll up to 3s)
      for (let i = 0; i < 30; i++) {
        if (cancelled) return
        if (hiddenCardRef.current) break
        await new Promise(r => setTimeout(r, 100))
      }
      if (cancelled || !hiddenCardRef.current) return

      try {
        // Wait for fonts
        if (document.fonts?.ready) {
          await document.fonts.ready.catch(() => undefined)
        }

        // Wait for all images in hidden card to load
        const images = Array.from(hiddenCardRef.current.querySelectorAll('img'))
        await Promise.all(
          images.map(img => new Promise<void>(resolve => {
            if (img.complete && img.naturalWidth > 0) return resolve()
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }))
        )

        // Extra frame for rendering
        await new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )

        if (cancelled) return

        const dataUrl = await domToPng(hiddenCardRef.current, {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          scale: 2,
          backgroundColor: null,
        })

        if (cancelled) return

        const response = await fetch(dataUrl)
        const blob = await response.blob()
        cachedBlobRef.current = blob
        if (!cancelled) setIsReady(true)
      } catch (error) {
        console.error('Pre-generation error:', error)
      }
    }

    generate()
    return () => { cancelled = true }
  }, [showHiddenCard]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Responsive scale ──
  useEffect(() => {
    function updateScale() {
      const padding = 24
      const availW = window.innerWidth - padding
      const availH = window.innerHeight - 40
      const scaleW = availW / CARD_WIDTH
      const scaleH = availH / CARD_HEIGHT
      setCardScale(Math.min(scaleW, scaleH, 1.2))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // ── Download helper ──
  const downloadBlob = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${perfume.id || 'scent-card'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [perfume.id])

  // ── Share handler ──
  const handleShare = useCallback(async () => {
    const blob = cachedBlobRef.current
    if (!blob) return

    const file = new File([blob], `${perfume.id || 'scent-card'}.png`, { type: 'image/png' })

    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `AC'SCENT IDENTITY`,
          text: perfume.id,
        })
      } else {
        downloadBlob(blob)
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error)
        downloadBlob(blob)
      }
    }
  }, [perfume.id, downloadBlob])

  // ── Download handler ──
  const handleDownload = useCallback(() => {
    const blob = cachedBlobRef.current
    if (!blob) return
    downloadBlob(blob)
  }, [downloadBlob])

  if (typeof document === 'undefined') return null

  const btnEnabled = isReady

  return createPortal(
    <>
      {/* Hidden card for image capture — deferred to avoid network contention */}
      {showHiddenCard && (
        <div style={{ position: 'absolute', left: -9999, top: -9999, pointerEvents: 'none' }}>
          <div
            ref={hiddenCardRef}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent
              perfume={perfume}
              reasoning={reasoning}
              uploadedImage={uploadedImage}
              accentColor={accentColor}
              dateStr={dateStr}
              templateSrc={TEMPLATE_HIRES}
              forCapture
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="perfume-detail-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(245, 240, 232, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 99990,
              }}
            />

            {/* Modal wrapper — card + buttons */}
            <motion.div
              key="perfume-detail-modal"
              initial={{ opacity: 0, y: 60, scale: 0.95 * cardScale }}
              animate={{ opacity: 1, y: 0, scale: cardScale }}
              exit={{ opacity: 0, y: 40, scale: 0.97 * cardScale }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-1/2 left-1/2"
              style={{
                zIndex: 99991,
                width: CARD_WIDTH,
                marginLeft: -CARD_WIDTH / 2,
                marginTop: -(CARD_HEIGHT + 48) / 2,
              }}
            >
              {/* Live display card (Next.js optimized image for sharp rendering) */}
              <div
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 16,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                }}
              >
                <CardContent
                  perfume={perfume}
                  reasoning={reasoning}
                  uploadedImage={uploadedImage}
                  accentColor={accentColor}
                  dateStr={dateStr}
                  templateSrc={TEMPLATE_HIRES}
                />
              </div>

              {/* Action buttons: 공유 / 저장 / 닫기 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginTop: 10,
                height: 38,
              }}>
                {/* 공유 */}
                <button
                  onClick={handleShare}
                  disabled={!btnEnabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '0 14px',
                    borderRadius: 20,
                    backgroundColor: btnEnabled ? '#BB0000' : '#ccc',
                    border: '2px solid #333',
                    boxShadow: '2px 2px 0px #333',
                    color: '#fff',
                    fontSize: 12,
                    cursor: btnEnabled ? 'pointer' : 'not-allowed',
                    ...cardFont,
                  }}
                >
                  {!btnEnabled ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
                  <span>{tc('buttons.share')}</span>
                </button>

                {/* 저장 */}
                <button
                  onClick={handleDownload}
                  disabled={!btnEnabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '0 14px',
                    borderRadius: 20,
                    backgroundColor: btnEnabled ? '#FFFDF8' : '#eee',
                    border: '2px solid #333',
                    boxShadow: '2px 2px 0px #333',
                    color: '#333',
                    fontSize: 12,
                    cursor: btnEnabled ? 'pointer' : 'not-allowed',
                    ...cardFont,
                  }}
                >
                  <Download size={13} />
                  <span>{tc('buttons.save')}</span>
                </button>

                {/* 닫기 */}
                <button
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '0 14px',
                    borderRadius: 20,
                    backgroundColor: '#FFFDF8',
                    border: '2px solid #333',
                    boxShadow: '2px 2px 0px #333',
                    color: '#333',
                    fontSize: 12,
                    cursor: 'pointer',
                    ...cardFont,
                  }}
                >
                  <X size={13} />
                  <span>{tc('buttons.close')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}
