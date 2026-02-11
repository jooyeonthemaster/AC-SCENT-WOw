'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { UPLOAD_CONSTRAINTS } from '../constants'

interface DropZoneProps {
  onFileSelect: (files: File[]) => void
  disabled?: boolean
}

export function DropZone({ onFileSelect, disabled }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect(acceptedFiles)
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: UPLOAD_CONSTRAINTS.maxSize,
    multiple: false,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer
        transition-all duration-200 min-h-[200px] flex items-center justify-center
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 md:gap-4">
        <Upload
          className={`w-10 h-10 md:w-12 md:h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
        />
        <div>
          <p className="text-base md:text-lg font-medium text-gray-700">
            {isDragActive
              ? '이미지를 여기에 놓으세요'
              : '탭하여 이미지를 선택하세요'}
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
            JPEG, PNG, WebP (최대 {UPLOAD_CONSTRAINTS.maxSizeMB}MB)
          </p>
        </div>
      </div>
    </div>
  )
}
