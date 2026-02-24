'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Send, Camera, X } from 'lucide-react'
import { useImageUpload } from '@/components/upload/ImageUploader/hooks/useImageUpload'
import Image from 'next/image'

type Phase = 'closed' | 'opening' | 'open' | 'closing'

export function WritingStep() {
  const {
    file,
    preview,
    isUploading,
    error,
    handleFileSelect,
    analyzeImage,
    clearImage,
  } = useImageUpload()

  const [phase, setPhase] = useState<Phase>('closed')
  const openVideoRef = useRef<HTMLVideoElement>(null)
  const closeVideoRef = useRef<HTMLVideoElement>(null)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: 10 * 1024 * 1024,
    noDrag: true,
    disabled: !!file || isUploading || phase !== 'open',
  })

  // Preload videos on mount
  useEffect(() => {
    const preload = (src: string) => {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.src = src
      video.load()
    }
    preload('/images/envelope2_cropped.mp4')
    preload('/images/envelope2_close.mp4')
  }, [])

  // Play videos with useLayoutEffect (before browser paint)
  useLayoutEffect(() => {
    if (phase === 'opening' && openVideoRef.current) {
      openVideoRef.current.currentTime = 0
      openVideoRef.current.play().catch(() => setPhase('open'))
    }
  }, [phase])

  useLayoutEffect(() => {
    if (phase === 'closing' && closeVideoRef.current) {
      closeVideoRef.current.currentTime = 0
      closeVideoRef.current.play().catch(() => analyzeImage())
    }
  }, [phase, analyzeImage])

  // Tap closed envelope → play open animation
  const handleEnvelopeClick = useCallback(() => {
    if (phase !== 'closed') return
    setPhase('opening')
  }, [phase])

  // Open video ended → show upload UI
  const handleOpenVideoEnded = useCallback(() => {
    setPhase('open')
  }, [])

  // Send button → play close animation
  const handleSend = useCallback(() => {
    if (!preview || phase !== 'open') return
    setPhase('closing')
  }, [preview, phase])

  // Close video ended → navigate to analysis
  const handleCloseVideoEnded = useCallback(() => {
    analyzeImage()
  }, [analyzeImage])

  return (
    <div
      className="flex flex-col items-center relative w-full mx-auto"
      style={{ maxWidth: 'min(340px, 85vw)', width: '85vw', position: 'absolute', bottom: '25dvh', left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* === Video / Envelope Container === */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>

        {/* Closed: 정적 이미지 — closed/opening 시 보임 (영상이 위에서 덮음) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: phase === 'closed' || phase === 'opening' ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: phase === 'closed' ? 'auto' : 'none',
            cursor: phase === 'closed' ? 'pointer' : 'default',
          }}
          onClick={handleEnvelopeClick}
        >
          <Image
            src="/images/envelope_closed_new.png"
            fill
            quality={92}
            style={{ objectFit: 'contain' }}
            alt="닫힌 편지봉투"
            sizes="(max-width: 340px) 85vw, 340px"
          />
        </div>

        {/* Opening 영상 — 항상 DOM 유지, opacity로 전환 */}
        <video
          ref={openVideoRef}
          src="/images/envelope2_cropped.mp4"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: phase === 'opening' ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
          }}
          playsInline
          muted
          preload="auto"
          onEnded={handleOpenVideoEnded}
        />

        {/* Open: 정적 이미지 — open/closing 시 보임, preview 있으면 탭으로 보내기 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: phase === 'open' || phase === 'closing' ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: phase === 'open' && preview ? 'auto' : 'none',
            cursor: phase === 'open' && preview ? 'pointer' : 'default',
          }}
          onClick={handleSend}
        >
          <Image
            src="/images/envelope_opened_new.png"
            fill
            quality={92}
            style={{ objectFit: 'contain' }}
            alt="열린 편지봉투"
            sizes="(max-width: 340px) 85vw, 340px"
          />
        </div>

        {/* Closing 영상 — 항상 DOM 유지, opacity로 전환 */}
        <video
          ref={closeVideoRef}
          src="/images/envelope2_close.mp4"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: phase === 'closing' ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
          }}
          playsInline
          muted
          preload="auto"
          onEnded={handleCloseVideoEnded}
        />

        {/* Tap prompt */}
        <AnimatePresence>
          {phase === 'closed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap"
              style={{ bottom: '60%' }}
            >
              <motion.p
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="font-hand"
                style={{ color: '#6B3A2A', letterSpacing: '0.05em', fontSize: 'clamp(18px, 5vw, 24px)' }}
              >
                탭하여 편지를 열어보세요
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Upload prompt (open state, no preview) === */}
        <AnimatePresence>
          {phase === 'open' && !preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute z-10"
              style={{ top: '10%', left: '20%', right: '20%', bottom: '48%' }}
            >
              <div
                {...(getRootProps() as React.HTMLAttributes<HTMLDivElement>)}
                className="w-full h-full cursor-pointer flex flex-col items-center justify-center group"
                role="button"
                aria-label="사진 첨부하기"
              >
                <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex flex-col items-center"
                >
                  <Camera className="w-8 h-8 mb-3" style={{ color: '#6B3A2A' }} strokeWidth={1.5} />
                  <p className="font-hand" style={{ color: '#6B3A2A', fontSize: 'clamp(17px, 4.5vw, 22px)', letterSpacing: '0.05em' }}>
                    사진을 첨부해주세요
                  </p>
                  <p className="font-hand mt-1" style={{ color: '#9B7A6A', fontSize: 'clamp(14px, 3.8vw, 18px)' }}>
                    탭하여 선택
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Image preview (z-10) === */}
        <AnimatePresence>
          {phase === 'open' && preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className="absolute z-10 overflow-hidden cursor-pointer"
              style={{ top: '9%', left: '12%', right: '12%', bottom: '25%' }}
              onClick={handleSend}
            >
              <img
                src={preview}
                alt="첨부된 사진"
                className="w-full h-full object-contain pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Envelope body overlay (z-15) — 봉투 빨간 부분만 있는 투명 PNG === */}
        {phase === 'open' && preview && (
          <div
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15, clipPath: 'inset(20% 0 0 0)' }}
          >
            <Image
              src="/images/envelope_body.png"
              fill
              quality={92}
              style={{ objectFit: 'contain' }}
              alt=""
              sizes="(max-width: 340px) 85vw, 340px"
            />
          </div>
        )}

        {/* Delete button (z-25) */}
        <AnimatePresence>
          {phase === 'open' && preview && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
              onClick={clearImage}
              className="absolute w-10 h-10 rounded-full flex items-center justify-center
                active:scale-90 transition-transform"
              style={{
                top: '6%',
                right: '15%',
                zIndex: 25,
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
              aria-label="사진 삭제"
            >
              <X className="w-4 h-4" style={{ color: '#555' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 봉투 아래 콘텐츠 — absolute로 빼서 봉투 위치에 영향 없음 */}
      <div className="absolute w-full flex flex-col items-center" style={{ top: '100%' }}>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 px-4 py-2 text-center"
              style={{
                borderRadius: '14px',
                background: 'rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.15)',
              }}
              role="alert"
            >
              <p className="text-sm font-display" style={{ color: '#1A1A1A' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Button */}
        <AnimatePresence>
          {phase === 'open' && preview && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5, transition: { duration: 0.2 } }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
              onClick={handleSend}
              disabled={isUploading}
              className="mt-5 active:scale-[0.97] transition-transform duration-150 z-10
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="편지 보내기"
            >
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="font-hand flex items-center gap-2"
                style={{ color: '#6B3A2A', fontSize: 'clamp(17px, 4.5vw, 22px)', letterSpacing: '0.05em' }}
              >
                <Send className="w-5 h-5" />
                탭하여 편지 보내기
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Closing Status */}
        <AnimatePresence>
          {phase === 'closing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-center"
              role="status"
            >
              <p className="font-display" style={{ fontSize: 'clamp(14px, 3.8vw, 18px)', color: '#1A1A1A' }}>
                편지를 보내는 중...
              </p>
              <motion.div className="flex justify-center gap-1.5 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#B00' }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
