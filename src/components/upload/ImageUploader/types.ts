export interface ImageUploaderProps {
  onUploadComplete?: (analysisId: string) => void
  className?: string
}

export interface UseImageUploadReturn {
  file: File | null
  preview: string | null
  isUploading: boolean
  error: string | null
  handleFileSelect: (files: File[]) => void
  analyzeImage: () => Promise<void>
  clearImage: () => void
}
