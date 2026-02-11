import { useState, useCallback } from 'react'
import { logger } from '@/lib/utils/logger'
import { COPY_SUCCESS_DURATION } from '../constants'

interface UseShareActionsProps {
  shareUrl?: string
  perfumeName: string
  twitterName: string
  generateImage: (element: HTMLElement | null) => Promise<Blob | null>
}

/**
 * 공유 액션 관련 훅
 */
export function useShareActions({
  shareUrl,
  perfumeName,
  twitterName,
  generateImage,
}: UseShareActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // 1. 링크 공유
  const handleLinkShare = useCallback(async () => {
    const fullUrl = shareUrl || window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: `AC'SCENT IDENTITY - ${perfumeName}`,
          text: twitterName,
          url: fullUrl,
        })
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // clipboard API 사용 가능한 경우
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), COPY_SUCCESS_DURATION)
      } else {
        // fallback: 텍스트 영역 생성 후 복사
        const textArea = document.createElement('textarea')
        textArea.value = fullUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), COPY_SUCCESS_DURATION)
        } catch (err) {
          logger.error('Fallback copy failed:', err)
          alert('링크가 복사되었습니다:\n' + fullUrl)
        }

        document.body.removeChild(textArea)
      }
    } catch (error) {
      // 사용자가 공유 취소한 경우 무시
      if ((error as Error).name !== 'AbortError') {
        logger.error('Link share error:', error)
        alert('공유 중 오류가 발생했습니다.')
      }
    }
  }, [shareUrl, perfumeName, twitterName])

  // 2. 이미지 공유 (인스타 스토리 등)
  const handleImageShare = useCallback(
    async (cardElement: HTMLElement | null, onFallback: () => void) => {
      setIsGenerating(true)

      try {
        const blob = await generateImage(cardElement)
        if (!blob) throw new Error('이미지 생성 실패')

        const file = new File([blob], `acscent_${Date.now()}.png`, {
          type: 'image/png',
        })

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `AC'SCENT IDENTITY`,
            text: twitterName,
          })
        } else {
          // 파일 공유 미지원 → 미리보기로 대체
          onFallback()
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          logger.error('Image share error:', error)
          alert('이미지 공유 중 오류가 발생했습니다.')
        }
      } finally {
        setIsGenerating(false)
      }
    },
    [twitterName, generateImage]
  )

  return {
    isGenerating,
    setIsGenerating,
    copied,
    handleLinkShare,
    handleImageShare,
  }
}
