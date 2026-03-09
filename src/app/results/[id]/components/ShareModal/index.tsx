"use client"

import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Loader2, Share2 } from 'lucide-react'
import { domToPng } from 'modern-screenshot'
import { ShareCardNew } from '../ShareCardNew'
import { ShareModalProps } from './types'
import { SHARE_CARD_DIMENSIONS } from './constants'
import { useTranslation } from '@/i18n/useTranslation'

export function ShareModal({
  isOpen,
  onClose,
  userImage,
  twitterName,
  userName,
  userGender,
  perfumeName,
  perfumeBrand,
  analysisData,
  accentColor,
  timestamp,
}: ShareModalProps) {
  const { t } = useTranslation('common')
  const cardRef = useRef<HTMLDivElement>(null)
  const cachedBlobRef = useRef<Blob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // ── 모달 열릴 때 자동 이미지 생성 ──
  useEffect(() => {
    if (!isOpen) {
      cachedBlobRef.current = null
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setIsGenerating(false)
      return
    }

    let cancelled = false

    const generate = async () => {
      setIsGenerating(true)
      // 카드 렌더링 대기
      await new Promise(r => setTimeout(r, 500))
      if (cancelled || !cardRef.current) {
        setIsGenerating(false)
        return
      }

      try {
        // 폰트/이미지 로드 대기
        if (document.fonts?.ready) {
          await document.fonts.ready.catch(() => undefined)
        }
        const images = Array.from(cardRef.current.querySelectorAll('img'))
        await Promise.all(
          images.map(img => new Promise<void>(resolve => {
            if (img.complete && img.naturalWidth > 0) return resolve()
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }))
        )
        await new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )

        if (cancelled) return

        const dataUrl = await domToPng(cardRef.current, {
          width: SHARE_CARD_DIMENSIONS.width,
          height: SHARE_CARD_DIMENSIONS.height,
          scale: SHARE_CARD_DIMENSIONS.scale,
          backgroundColor: '#F5F0E8',
        })

        if (cancelled) return

        const response = await fetch(dataUrl)
        const blob = await response.blob()
        cachedBlobRef.current = blob

        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } catch (error) {
        console.error('Image generation error:', error)
      } finally {
        if (!cancelled) setIsGenerating(false)
      }
    }

    generate()
    return () => { cancelled = true }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── iOS Safari 배경 스크롤 차단 ──
  useEffect(() => {
    if (!isOpen) return

    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'

    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.overflow = ''
      html.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // ── blob → 다운로드 ──
  const downloadBlob = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `acscent_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  // ── 공유하기 (유저 제스처에서 직접 실행) ──
  const handleShare = async () => {
    const blob = cachedBlobRef.current
    if (!blob) return

    const file = new File([blob], `acscent_${Date.now()}.png`, {
      type: 'image/png',
    })

    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `AC'SCENT IDENTITY`,
          text: twitterName,
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
  }

  // ── 저장하기 ──
  const handleDownload = () => {
    const blob = cachedBlobRef.current
    if (!blob) return
    downloadBlob(blob)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 블러 */}
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(245, 240, 232, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 99990,
            }}
          />

          {/* 메인 콘텐츠 */}
          <motion.div
            key="share-preview"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99991,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'none',
            }}
          >
            {/* 숨긴 카드 (이미지 생성용) */}
            <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
              <ShareCardNew
                ref={cardRef}
                userImage={userImage}
                twitterName={twitterName}
                userName={userName}
                userGender={userGender}
                perfumeName={perfumeName}
                perfumeBrand={perfumeBrand}
                analysisData={analysisData}
                accentColor={accentColor}
                timestamp={timestamp}
              />
            </div>

            {/* 카드 미리보기 (스크롤 가능, 세로 중앙) */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                pointerEvents: 'auto',
                padding: '8px 12px 0',
              }}
            >
              {isGenerating ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 12,
                }}>
                  <Loader2
                    size={32}
                    color="#999"
                    className="animate-spin"
                  />
                  <span style={{
                    fontSize: 13,
                    color: '#888',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {t('generatingCard')}
                  </span>
                </div>
              ) : previewUrl ? (
                <div
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    border: '2px solid #333',
                    boxShadow: '4px 4px 0px #333',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="공유 카드 미리보기"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </div>
              ) : null}
            </div>

            {/* 하단 버튼 3개: 공유 / 저장 / 뒤로 */}
            <div style={{
              width: '100%',
              maxWidth: 420,
              marginTop: 8,
              display: 'flex',
              gap: 6,
              pointerEvents: 'auto',
              flexShrink: 0,
            }}>
              {/* 공유하기 */}
              <button
                onClick={handleShare}
                disabled={!previewUrl}
                style={{
                  flex: 1,
                  padding: 'clamp(8px, 1.5dvh, 13px) 8px',
                  borderRadius: 12,
                  backgroundColor: previewUrl ? '#BB0000' : '#ccc',
                  border: '2px solid #333',
                  boxShadow: '2px 2px 0px #333',
                  color: '#fff',
                  fontSize: 'clamp(11px, 1.6dvh, 14px)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: previewUrl ? 'pointer' : 'not-allowed',
                }}
              >
                <Share2 size={14} />
                {t('buttons.share')}
              </button>

              {/* 저장하기 */}
              <button
                onClick={handleDownload}
                disabled={!previewUrl}
                style={{
                  flex: 1,
                  padding: 'clamp(8px, 1.5dvh, 13px) 8px',
                  borderRadius: 12,
                  backgroundColor: previewUrl ? '#FFFDF8' : '#eee',
                  border: '2px solid #333',
                  boxShadow: '2px 2px 0px #333',
                  color: '#333',
                  fontSize: 'clamp(11px, 1.6dvh, 14px)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: previewUrl ? 'pointer' : 'not-allowed',
                }}
              >
                <Download size={14} />
                {t('buttons.save')}
              </button>

              {/* 뒤로가기 */}
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: 'clamp(8px, 1.5dvh, 13px) 8px',
                  borderRadius: 12,
                  backgroundColor: '#FFFDF8',
                  border: '2px solid #333',
                  boxShadow: '2px 2px 0px #333',
                  color: '#333',
                  fontSize: 'clamp(11px, 1.6dvh, 14px)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                {t('buttons.back')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
