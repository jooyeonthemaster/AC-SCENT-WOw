'use client'

import { useImageUpload } from './hooks/useImageUpload'
import { DropZone } from './components/DropZone'
import { PreviewImage } from './components/PreviewImage'
import { UploadButton } from './components/UploadButton'
import type { ImageUploaderProps } from './types'

export function ImageUploader({ onUploadComplete, className }: ImageUploaderProps) {
  const {
    file,
    preview,
    isUploading,
    error,
    handleFileSelect,
    analyzeImage,
    clearImage,
  } = useImageUpload()

  return (
    <div className={className}>
      {!preview ? (
        <DropZone onFileSelect={handleFileSelect} disabled={isUploading} />
      ) : (
        <div className="space-y-4">
          <PreviewImage
            preview={preview}
            fileName={file?.name}
            onClear={clearImage}
            disabled={isUploading}
          />
          <UploadButton
            onClick={analyzeImage}
            isLoading={isUploading}
            disabled={!preview}
          />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
