"use client"

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ShareCardNew } from '../ShareCardNew'
import { ShareModalProps } from './types'
import { useScrollLock } from './hooks/useScrollLock'
import { useImageGenerator } from './hooks/useImageGenerator'
import { useShareActions } from './hooks/useShareActions'
import { ShareButtons } from './components/ShareButtons'
import { PreviewModal } from './components/PreviewModal'

/**
 * 공유 모달 메인 컴포넌트
 */
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]
              w-full max-w-[400px] mx-4
              bg-white rounded-3xl shadow-2xl
              overflow-hidden
            "
            style={{
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(100vh - 32px)',
            }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">공유하기</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* 공유 카드 프리뷰 (숨김 처리) */}
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

            {/* 공유 옵션들 */}
            <ShareButtons
              copied={copied}
              isGenerating={isGenerating}
              onLinkShare={handleLinkShare}
              onImageShare={() => handleImageShare(cardRef.current, handlePreview)}
              onPreview={handlePreview}
            />

            {/* 안내 문구 */}
            <div className="px-5 pb-5">
              <p className="text-center text-xs text-slate-400">
                친구에게 내 향수 결과를 공유해보세요! ✨
              </p>
            </div>
          </motion.div>

          {/* 웹 UI 미리보기 모달 */}
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
    </AnimatePresence>
  )
}
