import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Download, Loader2 } from 'lucide-react'
import { ShareCardNew } from '../../ShareCardNew'
import { ShareCardProps } from '../types'
import { PREVIEW_SCALE } from '../constants'

interface PreviewModalProps extends ShareCardProps {
  isOpen: boolean
  isGenerating: boolean
  previewCardRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onDownload: () => void
}

/**
 * 이미지 미리보기 모달 (전체 화면)
 */
export function PreviewModal({
  isOpen,
  isGenerating,
  previewCardRef,
  onClose,
  onDownload,
  userImage,
  twitterName,
  userName,
  userGender,
  perfumeName,
  perfumeBrand,
  analysisData,
}: PreviewModalProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 미리보기 배경 - 전체 화면 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black"
          />

          {/* 미리보기 콘텐츠 - 455px 고정 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <div className="w-full max-w-[455px] h-full flex flex-col bg-black">
              {/* 상단 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 bg-black">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} className="text-white" />
                </button>
                <span className="text-white font-bold">미리보기</span>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              {/* ShareCardNew 컴포넌트 직접 렌더링 */}
              <div className="flex-1 overflow-auto flex items-center justify-center py-4">
                <div
                  className="origin-center"
                  style={{
                    transform: `scale(${PREVIEW_SCALE})`,
                  }}
                >
                  <ShareCardNew
                    ref={previewCardRef}
                    userImage={userImage}
                    twitterName={twitterName}
                    userName={userName}
                    userGender={userGender}
                    perfumeName={perfumeName}
                    perfumeBrand={perfumeBrand}
                    analysisData={analysisData}
                  />
                </div>
              </div>

              {/* 하단 저장 버튼 */}
              <div className="p-4 bg-black">
                <button
                  onClick={onDownload}
                  disabled={isGenerating}
                  className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Download size={20} />
                  )}
                  {isGenerating ? '저장 중...' : '이미지로 저장하기'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
