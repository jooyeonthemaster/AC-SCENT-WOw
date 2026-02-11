'use client'

import { Loader2, Sparkles } from 'lucide-react'

interface UploadButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export function UploadButton({ onClick, isLoading, disabled }: UploadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full min-h-[48px] py-3 md:py-4 px-6 rounded-lg font-semibold text-white
        text-sm md:text-base
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        active:scale-[0.98]
        transition-all duration-200 transform hover:scale-[1.02]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-2
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          <span className="text-sm md:text-base">AI가 이미지를 분석하는 중...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">AI 분석 시작하기</span>
        </>
      )}
    </button>
  )
}
