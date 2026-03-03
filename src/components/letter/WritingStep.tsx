'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Camera, X, Send } from 'lucide-react'
import { useImageUpload } from '@/components/upload/ImageUploader/hooks/useImageUpload'
import Image from 'next/image'

type Phase = 'idle' | 'letter' | 'hasImage' | 'analyzing' | 'done'

const ANALYZING_MESSAGES = [
  '편지를 보내는 중이에요...',
  '최애가 편지를 받았어요!',
  '사진을 보고 있어요...',
  '어떤 향이 어울릴까 고민 중...',
  '이 향이 딱이야! 하고 고르는 중...',
  '답장을 쓰고 있어요...',
  '거의 다 됐어요!',
]

const MESSAGE_INTERVAL = 3000

const DONE_DISPLAY_MS = 1500

export function WritingStep() {
  const router = useRouter()
  const {
    preview,
    isAnalyzing,
    resultId,
    error,
    handleFileSelect,
    analyzeImage,
    clearImage,
  } = useImageUpload()

  const [phase, setPhase] = useState<Phase>('idle')
  const [messageIndex, setMessageIndex] = useState(0)

  // preview 변경 → letter→hasImage 전환
  useEffect(() => {
    if (preview && phase === 'letter') {
      setPhase('hasImage')
    }
  }, [preview, phase])

  // isAnalyzing 감지 → analyzing 전환
  useEffect(() => {
    if (isAnalyzing) {
      setPhase('analyzing')
      setMessageIndex(0)
    }
  }, [isAnalyzing])

  // 멘트 로테이션
  useEffect(() => {
    if (phase !== 'analyzing') return
    const interval = setInterval(() => {
      setMessageIndex(prev =>
        prev < ANALYZING_MESSAGES.length - 1 ? prev + 1 : prev
      )
    }, MESSAGE_INTERVAL)
    return () => clearInterval(interval)
  }, [phase])

  // resultId 감지 → done 전환 → 결과 페이지 이동
  useEffect(() => {
    if (!resultId) return
    setPhase('done')
    const timer = setTimeout(() => {
      router.push(`/results/${resultId}`)
    }, DONE_DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [resultId, router])

  // 에러 → hasImage 복귀
  useEffect(() => {
    if (error && phase === 'analyzing') {
      setPhase('hasImage')
    }
  }, [error, phase])

  const handleMailboxTap = useCallback(() => {
    if (phase === 'idle') setPhase('letter')
  }, [phase])

  const handleClearImage = useCallback(() => {
    clearImage()
    setPhase('letter')
  }, [clearImage])

  const handleSend = useCallback(() => {
    if (!preview) return
    analyzeImage()
  }, [preview, analyzeImage])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: 10 * 1024 * 1024,
    noDrag: true,
    disabled: phase !== 'letter',
  })

  const isOverlay = phase === 'analyzing' || phase === 'done'

  return (
    <div className="relative w-full h-full flex flex-col">

      {/* === 메인 콘텐츠 (블러 대상) === */}
      <div
        className="flex-1 flex flex-col items-center px-6 pt-14 pb-8"
        style={{
          filter: isOverlay ? 'blur(12px)' : 'none',
          transition: 'filter 0.4s ease',
          pointerEvents: isOverlay ? 'none' : 'auto',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* 헤더 로고 */}
        <div className="text-center" style={{ marginTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', flexShrink: 0 }}>
          <Image
            src="/images/logo2.PNG"
            alt="AC'SCENT"
            width={240}
            height={60}
            style={{
              filter: 'invert(1)',
              objectFit: 'contain',
              height: 'clamp(29px, 7.2vw, 38px)',
              width: 'auto',
            }}
            priority
          />
        </div>

        {/* 히어로 텍스트 */}
        <div className="flex items-center justify-center" style={{ margin: '2dvh 0', flexShrink: 0 }}>
          <img
            src="/images/55555.png"
            alt="최애 향기를 찾아라"
            style={{
              width: 'clamp(240px, 65vw, 340px)',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* 변동 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center w-full" style={{ minHeight: 0 }}>
          <AnimatePresence mode="wait">

            {/* === idle: 우체통 === */}
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full"
              >
                <p
                  className="text-center mb-6"
                  style={{
                    fontSize: 'clamp(14px, 3.8vw, 17px)',
                    color: '#666',
                    lineHeight: 1.6,
                  }}
                >
                  우체통을 터치해서
                  <br />
                  사진을 첨부해주세요
                </p>

                {/* 우체통 이미지 */}
                <motion.div
                  onClick={handleMailboxTap}
                  whileTap={{ scale: 0.96 }}
                  className="cursor-pointer"
                >
                  <img
                    src="/images/post (2).png"
                    alt="우체통"
                    style={{
                      width: 'clamp(200px, 56vw, 360px)',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* === letter: 편지지 + 이미지 입력 === */}
            {phase === 'letter' && (
              <motion.div
                key="letter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full"
              >
                <div
                  {...(getRootProps() as React.HTMLAttributes<HTMLDivElement>)}
                  className="cursor-pointer relative flex flex-col items-center justify-center"
                  style={{
                    width: '64vw',
                    height: '44dvh',
                    maxWidth: 288,
                    borderRadius: 16,
                    backgroundColor: '#FFFDF8',
                    border: '2px solid #333',
                    boxShadow: '4px 4px 0px #333',
                    marginBottom: 14,
                  }}
                >
                  <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
                  <p
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 20,
                      margin: 0,
                      fontSize: 'clamp(15px, 4vw, 19px)',
                      color: '#333',
                      fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    To : My Muse ♥
                  </p>
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-3"
                  >
                    <Camera className="w-8 h-8" style={{ color: '#AAA' }} strokeWidth={1.5} />
                    <p style={{ fontSize: 'clamp(14px, 3.8vw, 16px)', color: '#999', margin: 0 }}>
                      탭하여 사진 선택
                    </p>
                  </motion.div>
                  <p
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      right: 20,
                      margin: 0,
                      fontSize: 'clamp(15px, 4vw, 19px)',
                      color: '#333',
                      fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    From : Me 🖊️
                  </p>
                </div>

                <div className="flex items-center justify-center" style={{ height: 90 }}>
                  <p
                    className="text-center"
                    style={{
                      fontSize: 'clamp(18px, 5vw, 22px)',
                      color: '#333',
                      lineHeight: 1.5,
                    }}
                  >
                    최애 사진을 넣어서 편지를 완성해주세요
                  </p>
                </div>
              </motion.div>
            )}

            {/* === hasImage: 편지지 + 프리뷰 === */}
            {phase === 'hasImage' && preview && (
              <motion.div
                key="hasImage"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                <div
                  className="relative flex flex-col items-center"
                  style={{
                    width: '64vw',
                    height: '44dvh',
                    maxWidth: 288,
                    borderRadius: 16,
                    backgroundColor: '#FFFDF8',
                    border: '2px solid #333',
                    boxShadow: '4px 4px 0px #333',
                    overflow: 'hidden',
                    marginBottom: 14,
                  }}
                >
                  <p
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 20,
                      margin: 0,
                      zIndex: 10,
                      fontSize: 'clamp(15px, 4vw, 19px)',
                      color: '#333',
                      fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    To : My Muse ♥
                  </p>
                  <div
                    className="absolute overflow-hidden"
                    style={{ top: 48, left: 24, right: 24, bottom: 48, borderRadius: 12 }}
                  >
                    <img
                      src={preview}
                      alt="첨부된 사진"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      right: 20,
                      margin: 0,
                      zIndex: 10,
                      fontSize: 'clamp(15px, 4vw, 19px)',
                      color: '#333',
                      fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    From : Me 🖊️
                  </p>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    onClick={handleClearImage}
                    className="absolute w-7 h-7 rounded-full flex items-center justify-center active:scale-90 z-20"
                    style={{
                      top: 48,
                      right: 28,
                      background: '#fff',
                      border: '1.5px solid #333',
                      boxShadow: '2px 2px 0px #333',
                    }}
                    aria-label="사진 삭제"
                  >
                    <X className="w-3.5 h-3.5 text-[#333]" />
                  </motion.button>
                </div>

                <div className="flex flex-col items-center justify-center" style={{ height: 90 }}>
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                        style={{ fontSize: 13, color: '#CC0000', marginBottom: 8 }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={handleSend}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-8 py-3 rounded-full"
                    style={{
                      backgroundColor: '#BB0000',
                      color: '#fff',
                      fontSize: 'clamp(14px, 3.8vw, 16px)',
                      fontWeight: 600,
                      border: '2px solid #333',
                      boxShadow: '3px 3px 0px #333',
                    }}
                  >
                    <Send className="w-4 h-4" />
                    최애에게 편지 보내기
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 푸터 로고 */}
        <div className="text-center" style={{ flexShrink: 0, paddingBottom: 12, paddingTop: 8 }}>
          <img
            src="/images/template/footer.png"
            alt="Ac'scent wow"
            style={{
              objectFit: 'contain',
              height: 16,
              width: 'auto',
              opacity: 0.3,
              margin: '0 auto',
            }}
          />
        </div>
      </div>

      {/* === 분석 오버레이 === */}
      <AnimatePresence>
        {isOverlay && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(245, 240, 232, 0.85)',
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
              padding: '0 32px',
            }}
          >
              {phase === 'analyzing' && (
                <>
                  {/* 봉투 애니메이션 */}
                  <motion.div
                    className="relative mb-8"
                    style={{ width: 180, height: 180 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -12, 0],
                        rotate: [0, -3, 3, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="relative w-full h-full"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            '0 0 0px rgba(187,0,0,0)',
                            '0 0 30px rgba(187,0,0,0.2)',
                            '0 0 0px rgba(187,0,0,0)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ top: '10%', bottom: '10%', left: '10%', right: '10%' }}
                      />
                      <Image
                        src="/images/envelope_closed_new.png"
                        fill
                        quality={80}
                        style={{ objectFit: 'contain' }}
                        alt="편지"
                        sizes="180px"
                      />
                    </motion.div>

                    {[...Array(3)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-lg pointer-events-none"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          y: [0, -40],
                          x: [(i - 1) * 20, (i - 1) * 30],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.7,
                          ease: 'easeOut',
                        }}
                        style={{ top: '30%', left: '50%' }}
                      >
                        {['✨', '💌', '✨'][i]}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* 멘트 */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={messageIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      className="font-display"
                      style={{
                        fontSize: 'clamp(16px, 4.5vw, 20px)',
                        color: '#1A1A1A',
                      }}
                    >
                      {ANALYZING_MESSAGES[messageIndex]}
                    </motion.p>
                  </AnimatePresence>

                  {/* 프로그레스 dot */}
                  <div className="flex gap-2 mt-5">
                    {ANALYZING_MESSAGES.map((_, i) => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          backgroundColor: messageIndex >= i ? '#BB0000' : '#DDD',
                        }}
                        animate={
                          messageIndex === i
                            ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
                            : {}
                        }
                        transition={
                          messageIndex === i
                            ? { duration: 1, repeat: Infinity }
                            : { duration: 0.2 }
                        }
                      />
                    ))}
                  </div>
                </>
              )}

              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-6" style={{ width: 140, height: 140 }}>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(187,0,0,0)',
                          '0 0 40px rgba(187,0,0,0.25)',
                          '0 0 0px rgba(187,0,0,0)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ top: '10%', bottom: '10%', left: '10%', right: '10%' }}
                    />
                    <Image
                      src="/images/envelope_closed_new.png"
                      fill
                      quality={92}
                      style={{ objectFit: 'contain' }}
                      alt="답장이 도착한 편지"
                      sizes="140px"
                    />
                  </div>
                  <p
                    className="font-display"
                    style={{
                      fontSize: 'clamp(20px, 5.5vw, 26px)',
                      color: '#1A1A1A',
                    }}
                  >
                    답장이 도착했어요! 💌
                  </p>
                </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
