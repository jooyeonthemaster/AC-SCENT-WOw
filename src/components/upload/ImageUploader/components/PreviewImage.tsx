'use client'

import { X } from 'lucide-react'
import Image from 'next/image'

interface PreviewImageProps {
  preview: string
  fileName?: string
  onClear: () => void
  disabled?: boolean
}

export function PreviewImage({
  preview,
  fileName,
  onClear,
  disabled,
}: PreviewImageProps) {
  return (
    <div className="relative">
      {/* Image Container - 결과 페이지와 동일한 구조 */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt="업로드된 이미지 미리보기"
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      </div>

      {/* File Name */}
      {fileName && (
        <p className="text-sm text-gray-600 mt-2 text-center truncate">
          {fileName}
        </p>
      )}

      {/* Clear Button */}
      <button
        onClick={onClear}
        disabled={disabled}
        className={`
          absolute top-2 right-2 p-2 rounded-full bg-white shadow-md
          hover:bg-gray-100 transition-colors z-10
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="이미지 제거"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  )
}
