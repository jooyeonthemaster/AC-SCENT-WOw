'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UPLOAD_CONSTRAINTS, ERROR_MESSAGES } from '../constants'
import { logger } from '@/lib/utils/logger'

interface UseImageUploadReturn {
  file: File | null
  preview: string | null
  isUploading: boolean
  error: string | null
  handleFileSelect: (acceptedFiles: File[]) => void
  analyzeImage: () => Promise<void>
  clearImage: () => void
}

export function useImageUpload(): UseImageUploadReturn {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback((acceptedFiles: File[]) => {
    setError(null)

    if (acceptedFiles.length === 0) {
      setError(ERROR_MESSAGES.INVALID_TYPE)
      return
    }

    const selectedFile = acceptedFiles[0]

    // Validate file type
    if (!UPLOAD_CONSTRAINTS.acceptedTypes.includes(selectedFile.type)) {
      setError(ERROR_MESSAGES.INVALID_TYPE)
      return
    }

    // Validate file size
    if (selectedFile.size > UPLOAD_CONSTRAINTS.maxSize) {
      setError(ERROR_MESSAGES.FILE_TOO_LARGE)
      return
    }

    setFile(selectedFile)

    // Generate preview using FileReader
    const reader = new FileReader()

    reader.onloadend = () => {
      const result = reader.result as string

      // Validate that we got a proper data URL
      if (!result || !result.startsWith('data:image/')) {
        logger.error('Invalid data URL generated:', result?.substring(0, 50))
        setError(ERROR_MESSAGES.UNKNOWN_ERROR)
        return
      }

      setPreview(result)
    }

    reader.onerror = (e) => {
      console.error('FileReader error:', e)
      setError(ERROR_MESSAGES.UNKNOWN_ERROR)
    }

    reader.readAsDataURL(selectedFile)
  }, [])

  const analyzeImage = useCallback(async () => {
    if (!preview) {
      setError(ERROR_MESSAGES.NO_FILE)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Generate a temporary analysis ID
      const analysisId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Store only the image in sessionStorage (analysis will happen in the loading page)
      sessionStorage.setItem(`analysis-pending-${analysisId}`, JSON.stringify({
        uploadedImage: preview,
        timestamp: Date.now()
      }))

      // Navigate to analyzing page immediately (analysis will happen there)
      router.push(`/analyzing/${analysisId}`)
    } catch (err) {
      console.error('Navigation error:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR)
      setIsUploading(false)
    }
  }, [preview, router])

  const clearImage = useCallback(() => {
    setFile(null)
    setPreview(null)
    setError(null)
  }, [])

  return {
    file,
    preview,
    isUploading,
    error,
    handleFileSelect,
    analyzeImage,
    clearImage,
  }
}
