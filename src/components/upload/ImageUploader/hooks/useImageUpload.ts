'use client'

import { useState, useCallback, useRef } from 'react'
import { UPLOAD_CONSTRAINTS } from '../constants'
import { useLocale } from '@/i18n/context'
import { useTranslation } from '@/i18n/useTranslation'
import { logger } from '@/lib/utils/logger'

const STORAGE_MAX_DIMENSION = 1200

function compressForStorage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > STORAGE_MAX_DIMENSION || height > STORAGE_MAX_DIMENSION) {
        const ratio = Math.min(STORAGE_MAX_DIMENSION / width, STORAGE_MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

interface UseImageUploadReturn {
  file: File | null
  preview: string | null
  isUploading: boolean
  isAnalyzing: boolean
  resultId: string | null
  error: string | null
  handleFileSelect: (acceptedFiles: File[]) => void
  analyzeImage: () => Promise<void>
  clearImage: () => void
  abortAnalysis: () => void
}

export function useImageUpload(): UseImageUploadReturn {
  const { locale } = useLocale()
  const { t } = useTranslation('common')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resultId, setResultId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleFileSelect = useCallback((acceptedFiles: File[]) => {
    setError(null)

    if (acceptedFiles.length === 0) {
      setError(t('errors.invalidType'))
      return
    }

    const selectedFile = acceptedFiles[0]

    if (!UPLOAD_CONSTRAINTS.acceptedTypes.includes(selectedFile.type)) {
      setError(t('errors.invalidType'))
      return
    }

    if (selectedFile.size > UPLOAD_CONSTRAINTS.maxSize) {
      setError(t('errors.fileTooLarge', { maxSize: UPLOAD_CONSTRAINTS.maxSizeMB }))
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()

    reader.onloadend = () => {
      const result = reader.result as string

      if (!result || !result.startsWith('data:image/')) {
        logger.error('Invalid data URL generated:', result?.substring(0, 50))
        setError(t('errors.unknownError'))
        return
      }

      setPreview(result)
    }

    reader.onerror = (e) => {
      logger.error('FileReader error:', e)
      setError(t('errors.unknownError'))
    }

    reader.readAsDataURL(selectedFile)
  }, [t])

  const analyzeImage = useCallback(async () => {
    if (!preview) {
      setError(t('errors.noFile'))
      return
    }

    setIsAnalyzing(true)
    setError(null)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const compressed = await compressForStorage(preview)

      logger.log('[Analysis] Starting API call...')
      const apiStart = Date.now()

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: compressed,
          options: { language: locale },
        }),
        signal: abortController.signal,
      })

      const data = await response.json()

      const duration = ((Date.now() - apiStart) / 1000).toFixed(2)
      logger.log(`[Analysis] API completed in ${duration}s`)

      if (!data.success) {
        throw new Error(data.error || t('errors.uploadFailed'))
      }

      const id = data.data.analysisId
      sessionStorage.setItem(`analysis-${id}`, JSON.stringify({
        ...data.data,
        uploadedImage: compressed,
      }))

      setResultId(id)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.log('[Analysis] Request aborted')
        return
      }
      logger.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'))
      setIsAnalyzing(false)
    }
  }, [preview, locale, t])

  const abortAnalysis = useCallback(() => {
    abortRef.current?.abort()
    setIsAnalyzing(false)
    setError(null)
  }, [])

  const clearImage = useCallback(() => {
    setFile(null)
    setPreview(null)
    setError(null)
  }, [])

  return {
    file,
    preview,
    isUploading,
    isAnalyzing,
    resultId,
    error,
    handleFileSelect,
    analyzeImage,
    clearImage,
    abortAnalysis,
  }
}
