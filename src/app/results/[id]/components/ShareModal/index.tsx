"use client"

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ShareCardNew } from '../ShareCardNew'
import { ShareModalProps } from './types'
import { useScrollLock } from './hooks/useScrollLock'
import { useImageGenerator } from './hooks/useImageGenerator'
import { useShareActions } from './hooks/useShareActions'
import { ShareButtons } from './components/ShareButtons'
import { PreviewModal } from './components/PreviewModal'
import { serifFont } from '@/lib/constants/styles'

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
  shareUrl,
}: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const previewCardRef = useRef<HTMLDivElement>(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Hooks
  useScrollLock(isOpen)
  const { generateImage, generateDataUrl } = useImageGenerator()
  const { isGenerating, setIsGenerating, copied, handleLinkShare, handleImageShare } =
    useShareActions({
      shareUrl,
      perfumeName,
      twitterName,
      generateImage,
    })

  // Handlers
  const handlePreview = () => {
    setPreviewMode(true)
  }

  const handleClosePreview = () => {
    setPreviewMode(false)
  }

  const handleDownloadFromPreview = async () => {
    if (!previewCardRef.current) return

    setIsGenerating(true)
    try {
      const dataUrl = await generateDataUrl(previewCardRef.current)
      if (!dataUrl) throw new Error('이미지 생성 실패')

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `acscent_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      alert('다운로드 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
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

          {/* 모달 */}
          <motion.div
            key="share-modal"
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
            {/* 빨간 코너 브래킷 */}
            <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#BB0000] z-10" />
            <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#BB0000] z-10" />
            <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#BB0000] z-10" />
            <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#BB0000] z-10" />

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-1.5 hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>

            {/* 스크롤 가능한 콘텐츠 */}
            <div
              className="overflow-y-auto px-6 py-8"
              style={{ maxHeight: 'calc(100dvh - 80px)', scrollbarWidth: 'none' }}
            >
              {/* 헤더: 라벨 + 디바이더 + 타이틀 */}
              <span className="text-xs tracking-[0.2em] text-[#BB0000] font-semibold" style={serifFont}>
                AC&apos;SCENT
              </span>
              <div className="w-8 h-[2px] bg-[#BB0000] mt-1 mb-4" />
              <h2
                className="text-2xl font-bold text-[#1A1A1A] mb-6"
                style={{ ...serifFont, letterSpacing: '-0.02em' }}
              >
                Share
              </h2>

              {/* 공유 카드 (숨김 처리 - 이미지 생성용) */}
              <div className="absolute -left-[9999px] -top-[9999px]">
                <ShareCardNew
                  ref={cardRef}
                  userImage={userImage}
                  twitterName={twitterName}
                  userName={userName}
                  userGender={userGender}
                  perfumeName={perfumeName}
                  perfumeBrand={perfumeBrand}
                  analysisData={analysisData}
                />
              </div>

              {/* 섹션 라벨 */}
              <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-3">OPTIONS</p>

              {/* 공유 버튼들 */}
              <ShareButtons
                copied={copied}
                isGenerating={isGenerating}
                onLinkShare={handleLinkShare}
                onImageShare={() => handleImageShare(cardRef.current, handlePreview)}
                onPreview={handlePreview}
              />

              {/* 안내 문구 */}
              <p className="text-center text-[10px] tracking-[0.1em] text-[#999] mt-5">
                친구에게 내 향수 결과를 공유해보세요
              </p>
            </div>
          </motion.div>

          {/* 이미지 미리보기 모달 */}
          <PreviewModal
            isOpen={previewMode}
            isGenerating={isGenerating}
            previewCardRef={previewCardRef}
            onClose={handleClosePreview}
            onDownload={handleDownloadFromPreview}
            userImage={userImage}
            twitterName={twitterName}
            userName={userName}
            userGender={userGender}
            perfumeName={perfumeName}
            perfumeBrand={perfumeBrand}
            analysisData={analysisData}
          />
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
