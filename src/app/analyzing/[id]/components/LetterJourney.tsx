'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  type JourneyPhase,
  PHASE_MESSAGES,
  PHASE_ORDER,
  WRITING_MESSAGE_GROUPS,
  WRITING_GROUP_INTERVAL,
} from '../constants'

interface LetterJourneyProps {
  phase: JourneyPhase
  userImage: string | null
  error: string | null
  onRetry: () => void
}

/** Phase 순서 인덱스 반환 */
function getPhaseIndex(phase: JourneyPhase): number {
  const idx = PHASE_ORDER.indexOf(phase as typeof PHASE_ORDER[number])
  return idx === -1 ? PHASE_ORDER.length : idx
}

export function LetterJourney({ phase, userImage, error, onRetry }: LetterJourneyProps) {
  const [writingGroupIndex, setWritingGroupIndex] = useState(0)
  const [envelopeState, setEnvelopeState] = useState<'closed' | 'flipping' | 'opened'>('closed')
  const phaseIndex = getPhaseIndex(phase)

  // Phase 3 봉투 flip 트리거
  useEffect(() => {
    if (phase === 'reading' && envelopeState === 'closed') {
      const timer = setTimeout(() => setEnvelopeState('flipping'), 400)
      return () => clearTimeout(timer)
    }
  }, [phase, envelopeState])

  // Flip 완료 후 opened 상태로
  useEffect(() => {
    if (envelopeState === 'flipping') {
      const timer = setTimeout(() => setEnvelopeState('opened'), 600)
      return () => clearTimeout(timer)
    }
  }, [envelopeState])

  // Phase 4 텍스트 그룹 로테이션
  useEffect(() => {
    if (phase !== 'writing') return
    setWritingGroupIndex(0)
    const interval = setInterval(() => {
      setWritingGroupIndex(prev => (prev + 1) % WRITING_MESSAGE_GROUPS.length)
    }, WRITING_GROUP_INTERVAL)
    return () => clearInterval(interval)
  }, [phase])

  // 에러 상태
  if (phase === 'error' && error) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          animate={{ rotate: [-3, 3, -3], y: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-6"
          style={{ width: 'min(220px, 58vw)', aspectRatio: '1/1', filter: 'grayscale(30%)' }}
        >
          <Image
            src="/images/envelope_closed_new.png"
            fill
            quality={92}
            style={{ objectFit: 'contain' }}
            alt="전달 실패한 편지"
            sizes="160px"
          />
        </motion.div>
        <p
          className="font-hand"
          style={{ color: '#6B3A2A', fontSize: 'clamp(20px, 5.5vw, 26px)' }}
        >
          편지가 길을 잃었어요...
        </p>
        <p
          className="font-hand mt-2"
          style={{ color: '#9B7A6A', fontSize: 'clamp(14px, 3.8vw, 18px)' }}
        >
          {error}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="mt-8 px-8 py-3 rounded-full font-hand active:scale-95 transition-transform"
          style={{
            backgroundColor: '#B00',
            color: 'white',
            fontSize: 'clamp(16px, 4.2vw, 20px)',
          }}
        >
          다시 보내기
        </motion.button>
      </div>
    )
  }

  // 완료 상태
  if (phase === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 flex flex-col items-center justify-center text-center"
      >
        {/* 봉투 + glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 18 }}
          className="relative mb-6"
          style={{ width: 'min(240px, 65vw)', aspectRatio: '1/1' }}
        >
          {/* Glow 효과 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 0px rgba(176,0,0,0)',
                '0 0 40px rgba(176,0,0,0.25)',
                '0 0 0px rgba(176,0,0,0)',
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
            sizes="180px"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-hand"
          style={{ color: '#6B3A2A', fontSize: 'clamp(22px, 6vw, 30px)' }}
        >
          답장이 도착했어요!
        </motion.p>
      </motion.div>
    )
  }

  // 메인 Journey (Phase 1-4)
  return (
    <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      {/* 봉투 영역 */}
      <motion.div
        layout
        className="relative"
        style={{
          width: phase === 'writing' ? 'min(160px, 42vw)' : 'min(260px, 68vw)',
          aspectRatio: '1/1',
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {/* Phase 1: 봉투 올라오기 + 떠다니기 */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="relative w-full h-full"
        >
          {/* 떠다니는 효과 (sending, arriving에서만) */}
          <motion.div
            animate={
              phase === 'sending' || phase === 'arriving'
                ? { y: [0, -8, 0] }
                : { y: 0 }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full h-full"
          >
            {/* 봉투 이미지 - flip 처리 */}
            <motion.div
              className="relative w-full h-full"
              animate={{
                scaleY: envelopeState === 'flipping' ? 0 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={envelopeState === 'opened'
                  ? '/images/envelope_opened_new.png'
                  : '/images/envelope_closed_new.png'
                }
                fill
                quality={92}
                style={{ objectFit: 'contain' }}
                alt="편지봉투"
                sizes="(max-width: 340px) 68vw, 260px"
              />
            </motion.div>

            {/* Phase 2: 도장/스탬프 효과 (SVG) */}
            <AnimatePresence>
              {(phase === 'arriving' || phase === 'reading' || phase === 'writing') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                  animate={{ opacity: 0.75, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 14 }}
                  className="absolute"
                  style={{ top: '8%', right: '5%', width: '30%', aspectRatio: '1/1' }}
                >
                  <svg viewBox="0 0 60 60" className="w-full h-full">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="#B00" strokeWidth="2.5" opacity="0.8" />
                    <circle cx="30" cy="30" r="20" fill="none" stroke="#B00" strokeWidth="1" opacity="0.5" />
                    <text x="30" y="27" textAnchor="middle" fill="#B00" fontSize="7" fontWeight="bold" fontFamily="serif">
                      AC&apos;SCENT
                    </text>
                    <text x="30" y="37" textAnchor="middle" fill="#B00" fontSize="5" opacity="0.7" fontFamily="serif">
                      DELIVERED
                    </text>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 3: 유저 사진 peek */}
            <AnimatePresence>
              {(phase === 'reading' || phase === 'writing') && envelopeState === 'opened' && userImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
                  className="absolute overflow-hidden rounded-sm"
                  style={{
                    top: '18%',
                    left: '15%',
                    right: '15%',
                    bottom: '30%',
                    zIndex: 10,
                  }}
                >
                  <img
                    src={userImage}
                    alt="첨부한 사진"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 봉투 바디 오버레이 — 봉투 빨간 부분으로 사진을 자연스럽게 가림 */}
            {(phase === 'reading' || phase === 'writing') && envelopeState === 'opened' && userImage && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 15,
                  clipPath: 'inset(20% 0 0 0)',
                }}
              >
                <Image
                  src="/images/envelope_body.png"
                  fill
                  quality={92}
                  style={{ objectFit: 'contain' }}
                  alt=""
                  sizes="(max-width: 340px) 68vw, 260px"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 메시지 영역 */}
      <div className="mt-8 text-center" style={{ minHeight: '80px' }}>
        <AnimatePresence mode="wait">
          {/* Phase 1-3: 단일 메시지 */}
          {(phase === 'sending' || phase === 'arriving' || phase === 'reading') && (
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="font-hand"
              style={{ color: '#6B3A2A', fontSize: 'clamp(18px, 5vw, 24px)' }}
            >
              {PHASE_MESSAGES[phase]}
            </motion.p>
          )}

          {/* Phase 4: 텍스트 그룹 로테이션 */}
          {phase === 'writing' && (
            <motion.div
              key={`writing-${writingGroupIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              {WRITING_MESSAGE_GROUPS[writingGroupIndex].map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.5, duration: 0.4 }}
                  className="font-hand"
                  style={{ color: '#6B3A2A', fontSize: 'clamp(16px, 4.2vw, 22px)' }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phase 점 인디케이터 */}
      <div className="flex gap-2.5 justify-center mt-6">
        {PHASE_ORDER.map((p, i) => (
          <motion.div
            key={p}
            className="rounded-full"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: phaseIndex >= i ? '#B00' : '#DDD',
            }}
            animate={
              phase === p
                ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }
                : { scale: 1, opacity: 1 }
            }
            transition={
              phase === p
                ? { duration: 1.2, repeat: Infinity }
                : { duration: 0.3 }
            }
          />
        ))}
      </div>
    </div>
  )
}
