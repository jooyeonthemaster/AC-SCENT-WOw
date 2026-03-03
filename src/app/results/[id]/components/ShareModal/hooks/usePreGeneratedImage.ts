import { useState, useEffect, useCallback, useRef, RefObject } from 'react'
import { logger } from '@/lib/utils/logger'

interface UsePreGeneratedImageProps {
  cardRef: RefObject<HTMLDivElement | null>
  generateImage: (element: HTMLElement | null) => Promise<Blob | null>
  isOpen: boolean
}

/**
 * 모달이 열릴 때 공유 이미지를 미리 생성하는 훅
 */
export function usePreGeneratedImage({
  cardRef,
  generateImage,
  isOpen,
}: UsePreGeneratedImageProps) {
  const [preBlob, setPreBlob] = useState<Blob | null>(null)
  const [isPreGenerating, setIsPreGenerating] = useState(false)
  const blobUrlRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setPreBlob(null)
    setIsPreGenerating(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      cleanup()
      return
    }

    let cancelled = false
    setIsPreGenerating(true)

    const timer = setTimeout(async () => {
      try {
        const blob = await generateImage(cardRef.current)
        if (cancelled) return

        if (blob) {
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
          }
          blobUrlRef.current = URL.createObjectURL(blob)
          setPreBlob(blob)
        }
      } catch (error) {
        logger.error('Image pre-generation failed:', error)
      } finally {
        if (!cancelled) {
          setIsPreGenerating(false)
        }
      }
    }, 150)

    return () => {
      cancelled = true
      clearTimeout(timer)
      cleanup()
    }
  }, [isOpen, generateImage, cardRef, cleanup])

  return {
    preBlob,
    isPreGenerating,
  }
}
