import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Download, Loader2 } from 'lucide-react'
import { ShareCardNew } from '../../ShareCardNew'
import { ShareCardProps } from '../types'
import { PREVIEW_SCALE } from '../constants'

const serifFont = { fontFamily: 'Times New Roman, Georgia, serif' }

interface PreviewModalProps extends ShareCardProps {
  isOpen: boolean
  isGenerating: boolean
  previewCardRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onDownload: () => void
}

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
          {/* 미리보기 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
            style={{ zIndex: 99995 }}
          />

          {/* 미리보기 콘텐츠 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 99996 }}
          >
            <div className="w-full max-w-[455px] h-full flex flex-col bg-black">
              {/* 상단 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 bg-black">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={20} className="text-white" />
                </button>
                <span
                  className="text-xs tracking-[0.2em] text-white/80 font-medium"
                  style={serifFont}
                >
                  PREVIEW
                </span>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* ShareCardNew 컴포넌트 직접 렌더링 */}
              <div className="flex-1 overflow-auto flex items-center justify-center py-4">
                <div
                  className="origin-center"
                  style={{ transform: `scale(${PREVIEW_SCALE})` }}
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
                  className="w-full py-4 px-6 border-2 border-white text-white font-semibold tracking-wider disabled:opacity-50 transition-colors duration-150 active:bg-white active:text-black flex items-center justify-center gap-2"
                  style={serifFont}
                >
                  {isGenerating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {isGenerating ? 'SAVING...' : 'SAVE IMAGE'}
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
