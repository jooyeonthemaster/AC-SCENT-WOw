import { useState } from 'react'
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
  const [isDownloading, setIsDownloading] = useState(false)
  const showLoading = isGenerating || isDownloading

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload()
    } finally {
      setIsDownloading(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 블러 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(245, 240, 232, 0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 99995,
            }}
          />

          {/* 미리보기 콘텐츠 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 99996, padding: '16px' }}
          >
            {/* 상단 헤더 */}
            <div style={{
              width: '100%',
              maxWidth: 420,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <button
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#FFFDF8',
                  border: '2px solid #333',
                  boxShadow: '2px 2px 0px #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} color="#333" />
              </button>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#333',
                fontFamily: 'var(--font-sans)',
              }}>
                미리보기
              </span>
              <button
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#FFFDF8',
                  border: '2px solid #333',
                  boxShadow: '2px 2px 0px #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="#333" />
              </button>
            </div>

            {/* ShareCardNew */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0,
            }}>
              <div style={{
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'center center',
                borderRadius: 12,
                border: '2px solid #333',
                boxShadow: '4px 4px 0px #333',
                overflow: 'hidden',
              }}>
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
            <div style={{ width: '100%', maxWidth: 420, marginTop: 12 }}>
              <button
                onClick={handleDownload}
                disabled={showLoading}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: 14,
                  backgroundColor: '#BB0000',
                  border: '2px solid #333',
                  boxShadow: '3px 3px 0px #333',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: showLoading ? 'not-allowed' : 'pointer',
                  opacity: showLoading ? 0.5 : 1,
                }}
              >
                {showLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {showLoading ? '저장 중...' : '이미지 저장'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
