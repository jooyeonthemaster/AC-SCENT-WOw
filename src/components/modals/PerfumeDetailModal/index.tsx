'use client'

import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useScrollLock } from '@/app/results/[id]/components/ShareModal/hooks/useScrollLock'
const cardFont = { fontFamily: '"Poppins", "Noto Sans KR", sans-serif' } as const
import { ScentProfileGrid } from './ScentProfileGrid'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'

// Template: 2.jpeg (3072 x 5504) → display at 320 x 573
// Scale factor: 9.6 (3072 / 320)
const CARD_WIDTH = 320
const CARD_HEIGHT = 573

// Two-tier template loading: light WebP for display, original JPEG for saving
const TEMPLATE_DISPLAY = '/images/2_display.webp' // ~21KB
const TEMPLATE_HIRES = '/images/2.jpeg'           // ~6.2MB (for image save)

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
const STORY_MAX_FONT = 11
const STORY_MIN_FONT = 7

// Content box dimensions
const BOX_LEFT = 20
const BOX_WIDTH = 280

function getStoryFontSize(text: string): number {
  if (!text) return STORY_MAX_FONT
  for (let size = STORY_MAX_FONT; size >= STORY_MIN_FONT; size--) {
    const charsPerLine = Math.floor(BOX_WIDTH / (size * 0.55))
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

export function PerfumeDetailModal({
  isOpen,
  onClose,
  recommendation,
  index,
  accentColor = '#BB0000',
  uploadedImage,
  analysisDate,
}: PerfumeDetailModalProps) {
  useScrollLock(isOpen)

  const cardRef = useRef<HTMLDivElement>(null)
  const templateRef = useRef<HTMLImageElement>(null)
  const [cardScale, setCardScale] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current || !templateRef.current) return
    setIsSaving(true)

    try {
      // Swap to high-res template for capture
      const origSrc = templateRef.current.src
      templateRef.current.src = TEMPLATE_HIRES
      await new Promise<void>((resolve, reject) => {
        templateRef.current!.onload = () => resolve()
        templateRef.current!.onerror = () => reject()
        // If already cached, onload won't fire
        if (templateRef.current!.complete) resolve()
      })

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      // Restore display template
      templateRef.current.src = origSrc

      const fileName = `${recommendation.perfume.id || 'scent-card'}.png`
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return

      // Mobile: try Web Share API (share sheet → save to gallery)
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
        const file = new File([blob], fileName, { type: 'image/png' })
        await navigator.share({ files: [file] }).catch(() => {})
        return
      }

      // Fallback: download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = fileName
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsSaving(false)
    }
  }, [recommendation.perfume.id])

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

  if (typeof document === 'undefined') return null

  const { perfume, reasoning } = recommendation

  const d = analysisDate ? new Date(analysisDate) : new Date()
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

  return createPortal(
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
              backgroundColor: '#000000',
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
            {/* Card container (captured for image save) */}
            <div
              ref={cardRef}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background template image (display: WebP 21KB, save: JPEG 6.2MB) */}
              <img
                ref={templateRef}
                src={TEMPLATE_DISPLAY}
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

              {/* === Dynamic content === */}

              {/* User photo (inner frame: x=20, y=79, w=83, h=111 — 3:4 ratio) */}
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
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                  }}>
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

              {/* Scent Information — name/ID above underline 1 */}
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

              {/* Notes: Top / Middle / Base above underlines 2-4 */}
              {[
                { label: 'Top', value: perfume.mainScent.name, y: 122 },
                { label: 'Middle', value: perfume.subScent1.name, y: 144 },
                { label: 'Base', value: perfume.subScent2.name, y: 166 },
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
                  top: 322,
                  left: BOX_LEFT,
                  width: BOX_WIDTH,
                  height: STORY_BOX_HEIGHT,
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                <p style={{
                  fontSize: getStoryFontSize(reasoning),
                  lineHeight: STORY_LINE_HEIGHT,
                  color: '#000',
                  margin: 0,
                  ...cardFont,
                }}>
                  {reasoning}
                </p>
              </div>

              {/* How to text (box: y=438~523) */}
              <div
                style={{
                  position: 'absolute',
                  top: 444,
                  left: BOX_LEFT,
                  width: BOX_WIDTH,
                  height: 75,
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                <p style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: '#000',
                  margin: 0,
                  ...cardFont,
                }}>
                  매장 내 향 오르간에서 이 향을 직접 만나보세요.
                  선반 위 시향 용기를 들어올리면 모니터에 향 정보와
                  미디어아트가 표시됩니다. 용기의 뚜껑을 열어
                  향을 맡아보세요.
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
            </div>

            {/* Action buttons below card */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginTop: 10,
              height: 38,
            }}>
              <button
                onClick={handleSaveImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 16px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                  ...cardFont,
                }}
              >
                <Download size={14} />
                <span>저장</span>
              </button>
              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 16px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                  ...cardFont,
                }}
              >
                <X size={14} />
                <span>닫기</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
