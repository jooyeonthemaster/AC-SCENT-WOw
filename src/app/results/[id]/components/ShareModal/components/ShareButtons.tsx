import { Link2, Image, Download, Loader2, Check } from 'lucide-react'

const serifFont = { fontFamily: 'Times New Roman, Georgia, serif' }

interface ShareButtonsProps {
  copied: boolean
  isGenerating: boolean
  onLinkShare: () => void
  onImageShare: () => void
  onPreview: () => void
}

export function ShareButtons({
  copied,
  isGenerating,
  onLinkShare,
  onImageShare,
  onPreview,
}: ShareButtonsProps) {
  return (
    <div className="space-y-2">
      {/* 링크 공유 */}
      <button
        onClick={onLinkShare}
        disabled={isGenerating}
        className="w-full py-3.5 px-4 border border-[#E5E5E5] flex items-center gap-3 transition-colors duration-150 active:bg-[#F5F5F5] disabled:opacity-50"
      >
        <span className="w-8 h-8 flex items-center justify-center">
          {copied ? (
            <Check size={16} className="text-[#BB0000]" />
          ) : (
            <Link2 size={16} className="text-[#1A1A1A]" />
          )}
        </span>
        <div className="text-left">
          <p className="text-sm font-semibold tracking-wider text-[#1A1A1A]" style={serifFont}>
            {copied ? 'COPIED!' : 'LINK SHARE'}
          </p>
          <p className="text-[10px] tracking-[0.1em] text-[#999]">카카오톡, 메신저로 공유하기</p>
        </div>
      </button>

      {/* 이미지 공유 */}
      <button
        onClick={onImageShare}
        disabled={isGenerating}
        className="w-full py-3.5 px-4 border border-[#E5E5E5] flex items-center gap-3 transition-colors duration-150 active:bg-[#F5F5F5] disabled:opacity-50"
      >
        <span className="w-8 h-8 flex items-center justify-center">
          {isGenerating ? (
            <Loader2 size={16} className="text-[#999] animate-spin" />
          ) : (
            <Image size={16} className="text-[#1A1A1A]" />
          )}
        </span>
        <div className="text-left">
          <p className="text-sm font-semibold tracking-wider text-[#1A1A1A]" style={serifFont}>
            IMAGE SHARE
          </p>
          <p className="text-[10px] tracking-[0.1em] text-[#999]">인스타 스토리, SNS에 올리기</p>
        </div>
      </button>

      {/* 이미지 저장 */}
      <button
        onClick={onPreview}
        disabled={isGenerating}
        className="w-full py-3.5 px-4 border border-[#E5E5E5] flex items-center gap-3 transition-colors duration-150 active:bg-[#F5F5F5] disabled:opacity-50"
      >
        <span className="w-8 h-8 flex items-center justify-center">
          {isGenerating ? (
            <Loader2 size={16} className="text-[#999] animate-spin" />
          ) : (
            <Download size={16} className="text-[#1A1A1A]" />
          )}
        </span>
        <div className="text-left">
          <p className="text-sm font-semibold tracking-wider text-[#1A1A1A]" style={serifFont}>
            SAVE IMAGE
          </p>
          <p className="text-[10px] tracking-[0.1em] text-[#999]">갤러리에 저장하기</p>
        </div>
      </button>
    </div>
  )
}
