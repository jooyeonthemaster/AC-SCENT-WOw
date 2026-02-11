'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

const loadingMessages = [
  '이미지를 분석하고 있습니다...',
  '향의 특성을 파악하고 있습니다...',
  '당신에게 어울리는 향수를 찾고 있습니다...',
  '완벽한 매칭을 위해 최종 검토 중입니다...',
]

const ERROR_MESSAGES = {
  NO_IMAGE: '이미지를 찾을 수 없습니다. 다시 업로드해주세요.',
  ANALYSIS_FAILED: '분석 중 오류가 발생했습니다. 다시 시도해주세요.',
  EXPIRED: '세션이 만료되었습니다. 다시 시도해주세요.',
}


export default function AnalyzingPage() {
  const router = useRouter()
  const params = useParams()
  const analysisId = params.id as string

  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Navigation 함수들을 useCallback으로 분리하여 안정적인 참조 유지
  const navigateToResults = useCallback((resultId: string) => {
    router.push(`/results/${resultId}`)
  }, [router])

  const navigateToHome = useCallback(() => {
    router.push('/')
  }, [router])

  useEffect(() => {
    let isMounted = true
    let progressInterval: NodeJS.Timeout
    let messageInterval: NodeJS.Timeout
    const abortController = new AbortController()

    const startAnalysis = async () => {
      try {
        // Get pending image from sessionStorage
        const pendingKey = `analysis-pending-${analysisId}`
        const pendingData = sessionStorage.getItem(pendingKey)

        if (!pendingData) {
          setError(ERROR_MESSAGES.NO_IMAGE)
          setTimeout(() => {
            if (isMounted) navigateToHome()
          }, 2000)
          return
        }

        const { uploadedImage } = JSON.parse(pendingData)

        // Start progress animation (smooth but not tied to actual progress)
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            // Gradual slowdown to prevent stopping at 95%
            if (prev < 70) return prev + 2      // 0→70%: Fast (7 seconds)
            if (prev < 85) return prev + 1      // 70→85%: Medium (3 seconds)
            if (prev < 95) return prev + 0.5    // 85→95%: Slow (4 seconds)
            if (prev < 98) return prev + 0.1    // 95→98%: Very slow (6 seconds)
            return prev                          // Stop at 98% (last 2% reserved for API completion)
          })
        }, 200)

        // Change messages every 3 seconds
        messageInterval = setInterval(() => {
          setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
        }, 3000)

        // Call the actual analysis API
        const apiStartTime = Date.now()
        console.log(`🔍 [Analysis] Starting Gemini API call... (ID: ${analysisId})`)

        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: uploadedImage,
            options: { language: 'ko' },
          }),
          signal: abortController.signal,  // ✅ Abort signal 추가
        })

        const data = await response.json()

        const apiEndTime = Date.now()
        const apiDuration = ((apiEndTime - apiStartTime) / 1000).toFixed(2)
        console.log(`✅ [Analysis] API completed in ${apiDuration}s (ID: ${analysisId})`)

        if (!data.success) {
          throw new Error(data.error || ERROR_MESSAGES.ANALYSIS_FAILED)
        }

        if (!isMounted) return

        // Complete progress bar
        setProgress(100)

        // Store result in sessionStorage
        const resultAnalysisId = data.data.analysisId
        sessionStorage.setItem(`analysis-${resultAnalysisId}`, JSON.stringify({
          ...data.data,
          uploadedImage
        }))

        // Clean up pending data
        sessionStorage.removeItem(pendingKey)

        // Small delay to show 100% before redirecting
        setTimeout(() => {
          if (isMounted) {
            navigateToResults(resultAnalysisId)
          }
        }, 500)

      } catch (err) {
        // Ignore abort errors (expected during cleanup)
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🔍 [Analysis] Request aborted (component unmounted)')
          return
        }

        console.error('Analysis error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : ERROR_MESSAGES.ANALYSIS_FAILED)
          setTimeout(() => {
            if (isMounted) navigateToHome()
          }, 3000)
        }
      }
    }

    startAnalysis()

    return () => {
      isMounted = false
      abortController.abort()
      if (progressInterval) clearInterval(progressInterval)
      if (messageInterval) clearInterval(messageInterval)
    }
  }, [analysisId, navigateToResults, navigateToHome])

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500">
            잠시 후 홈으로 이동합니다...
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* 로딩 애니메이션 */}
      <div className="relative mb-12">
        {/* 외부 링 */}
        <div className="w-32 h-32 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin" />

        {/* 내부 링 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-20 h-20 border-6 border-pink-200 border-t-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>

        {/* 중앙 아이콘 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 메시지 */}
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 animate-pulse">
          {loadingMessages[messageIndex]}
        </h1>

        <p className="text-sm text-gray-600">
          잠시만 기다려주세요
        </p>
      </div>

      {/* 진행 바 */}
      <div className="w-full max-w-md mt-12">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-full transition-all duration-200 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>

      {/* 향수병 애니메이션 */}
      <div className="mt-16 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-8 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
