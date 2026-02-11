import { Link2, Image, Download, Loader2, Check } from 'lucide-react'

interface ShareButtonsProps {
  copied: boolean
  isGenerating: boolean
  onLinkShare: () => void
  onImageShare: () => void
  onPreview: () => void
}

/**
 * 공유 버튼 UI 컴포넌트
 */
export function ShareButtons({
  copied,
  isGenerating,
  onLinkShare,
  onImageShare,
  onPreview,
}: ShareButtonsProps) {
  return (
    <div className="p-5 space-y-3">
      {/* 링크 공유 */}
      <button
        onClick={onLinkShare}
        disabled={isGenerating}
        className="
          w-full flex items-center gap-4 p-4
          bg-gradient-to-r from-slate-50 to-slate-100
          hover:from-slate-100 hover:to-slate-200
          rounded-2xl transition-all
          disabled:opacity-50
        "
      >
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
          {copied ? (
            <Check size={22} className="text-white" />
          ) : (
            <Link2 size={22} className="text-white" />
          )}
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-900">
            {copied ? '복사 완료!' : '링크 공유'}
          </p>
          <p className="text-xs text-slate-500">카카오톡, 메신저로 공유하기</p>
        </div>
      </button>

      {/* 이미지 공유 */}
      <button
        onClick={onImageShare}
        disabled={isGenerating}
        className="
          w-full flex items-center gap-4 p-4
          bg-gradient-to-r from-pink-50 to-orange-50
          hover:from-pink-100 hover:to-orange-100
          rounded-2xl transition-all
          disabled:opacity-50
        "
      >
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
          {isGenerating ? (
            <Loader2 size={22} className="text-white animate-spin" />
          ) : (
            <Image size={22} className="text-white" />
          )}
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-900">이미지로 공유</p>
          <p className="text-xs text-slate-500">인스타 스토리, SNS에 올리기</p>
        </div>
      </button>

      {/* 이미지 다운로드 */}
      <button
        onClick={onPreview}
        disabled={isGenerating}
        className="
          w-full flex items-center gap-4 p-4
          bg-gradient-to-r from-yellow-50 to-amber-50
          hover:from-yellow-100 hover:to-amber-100
          rounded-2xl transition-all
          disabled:opacity-50
        "
      >
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
          {isGenerating ? (
            <Loader2 size={22} className="text-white animate-spin" />
          ) : (
            <Download size={22} className="text-white" />
          )}
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-900">이미지 저장</p>
          <p className="text-xs text-slate-500">갤러리에 저장하기</p>
        </div>
      </button>
    </div>
  )
}
