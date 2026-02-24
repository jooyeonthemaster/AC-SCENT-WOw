'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '@/lib/utils/logger'
import { DynamicBackground } from '@/components/DynamicBackground'
import { LetterJourney } from './components/LetterJourney'
import {
  type JourneyPhase,
  PHASE_TIMING,
  MIN_DISPLAY_TIME,
  COMPLETE_TRANSITION_DELAY,
  ERROR_MESSAGES,
} from './constants'


export default function AnalyzingPage() {
  const router = useRouter()
  const params = useParams()
  const analysisId = params.id as string

  const [phase, setPhase] = useState<JourneyPhase>('sending')
  const [error, setError] = useState<string | null>(null)
  const [userImage, setUserImage] = useState<string | null>(null)

  const [apiResultId, setApiResultId] = useState<string | null>(null)

  const pageStartTime = useRef(Date.now())
  const isMountedRef = useRef(true)

  const navigateToResults = useCallback((resultId: string) => {
    router.push(`/results/${resultId}`)
  }, [router])

  const navigateToHome = useCallback(() => {
    router.push('/')
  }, [router])

  // Phase 타이머 - 항상 시간순으로 phase 전환
  useEffect(() => {
    const timers = [
      setTimeout(() => {
        if (isMountedRef.current) setPhase(prev => prev === 'sending' ? 'arriving' : prev)
      }, PHASE_TIMING.arriving),
      setTimeout(() => {
        if (isMountedRef.current) setPhase(prev =>
          prev === 'arriving' ? 'reading' : prev
        )
      }, PHASE_TIMING.reading),
      setTimeout(() => {
        if (isMountedRef.current) setPhase(prev =>
          prev === 'reading' ? 'writing' : prev
        )
      }, PHASE_TIMING.writing),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // API 완료 감지 → complete phase 전환
  useEffect(() => {
    if (!apiResultId) return
    if (phase === 'complete' || phase === 'error') return

    const elapsed = Date.now() - pageStartTime.current
    const delay = Math.max(0, MIN_DISPLAY_TIME - elapsed)

    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setPhase('complete')
        setTimeout(() => {
          if (isMountedRef.current) {
            navigateToResults(apiResultId)
          }
        }, COMPLETE_TRANSITION_DELAY)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [apiResultId, phase, navigateToResults])

  // API 호출
  useEffect(() => {
    const abortController = new AbortController()

    const startAnalysis = async () => {
      try {
        const pendingKey = `analysis-pending-${analysisId}`
        const pendingData = sessionStorage.getItem(pendingKey)

        if (!pendingData) {
          setError(ERROR_MESSAGES.NO_IMAGE)
          setPhase('error')
          return
        }

        const { uploadedImage } = JSON.parse(pendingData)
        setUserImage(uploadedImage)

        const apiStartTime = Date.now()
        logger.log(`[Analysis] Starting Gemini API call... (ID: ${analysisId})`)

        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: uploadedImage,
            options: { language: 'ko' },
          }),
          signal: abortController.signal,
        })

        const data = await response.json()

        const apiDuration = ((Date.now() - apiStartTime) / 1000).toFixed(2)
        logger.log(`[Analysis] API completed in ${apiDuration}s (ID: ${analysisId})`)

        if (!data.success) {
          throw new Error(data.error || ERROR_MESSAGES.ANALYSIS_FAILED)
        }

        if (!isMountedRef.current) return

        // 결과 저장
        const resultAnalysisId = data.data.analysisId
        sessionStorage.setItem(`analysis-${resultAnalysisId}`, JSON.stringify({
          ...data.data,
          uploadedImage,
        }))
        sessionStorage.removeItem(pendingKey)

        // API 완료 → state 변경으로 useEffect 트리거
        setApiResultId(resultAnalysisId)

      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          logger.log('[Analysis] Request aborted (component unmounted)')
          return
        }
        logger.error('Analysis error:', err)
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : ERROR_MESSAGES.ANALYSIS_FAILED)
          setPhase('error')
        }
      }
    }

    startAnalysis()

    return () => {
      isMountedRef.current = false
      abortController.abort()
    }
  }, [analysisId])

  return (
    <div
      className="relative min-h-dvh flex items-center justify-center p-4"
      style={{ overflow: 'hidden' }}
    >
      <DynamicBackground showHeroText={false} />

      <AnimatePresence mode="wait">
        <motion.div
          key={phase === 'complete' ? 'complete' : phase === 'error' ? 'error' : 'journey'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <LetterJourney
            phase={phase}
            userImage={userImage}
            error={error}
            onRetry={navigateToHome}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
