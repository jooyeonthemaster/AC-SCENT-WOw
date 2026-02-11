import { useCallback } from 'react'
import { domToPng } from 'modern-screenshot'
import { logger } from '@/lib/utils/logger'
import { SHARE_CARD_DIMENSIONS } from '../constants'

/**
 * 이미지 생성 관련 훅
 */
export function useImageGenerator() {
  // 이미지/폰트 로드 대기
  const waitForAssets = useCallback(async (root?: HTMLElement | null) => {
    // 폰트 로드 대기
    if (document.fonts?.ready) {
      await document.fonts.ready.catch(() => undefined)
    }

    // 이미지 로드 대기
    const images = Array.from(root?.querySelectorAll('img') || [])
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) return resolve()
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
      )
    )

    // 레이아웃 안정화
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )
  }, [])

  // 이미지 생성
  const generateImage = useCallback(
    async (element: HTMLElement | null): Promise<Blob | null> => {
      if (!element) return null

      try {
        await waitForAssets(element)

        const dataUrl = await domToPng(element, {
          width: SHARE_CARD_DIMENSIONS.width,
          height: SHARE_CARD_DIMENSIONS.height,
          scale: SHARE_CARD_DIMENSIONS.scale,
          backgroundColor: 'transparent',
        })

        // dataUrl → Blob 변환
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        return blob
      } catch (error) {
        logger.error('Image generation error:', error)
        return null
      }
    },
    [waitForAssets]
  )

  // PNG DataUrl 생성 (다운로드용)
  const generateDataUrl = useCallback(
    async (element: HTMLElement | null): Promise<string | null> => {
      if (!element) return null

      try {
        await waitForAssets(element)

        const dataUrl = await domToPng(element, {
          width: SHARE_CARD_DIMENSIONS.width,
          height: SHARE_CARD_DIMENSIONS.height,
          scale: SHARE_CARD_DIMENSIONS.scale,
          backgroundColor: 'transparent',
        })

        return dataUrl
      } catch (error) {
        logger.error('DataUrl generation error:', error)
        return null
      }
    },
    [waitForAssets]
  )

  return {
    generateImage,
    generateDataUrl,
  }
}
