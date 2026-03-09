import { Link2, Image, Download, Loader2, Check } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'

interface ShareButtonsProps {
  copied: boolean
  isGenerating: boolean
  onLinkShare: () => void
  onImageShare: () => void
  onPreview: () => void
}

const btnBase: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 16px',
  borderRadius: 14,
  backgroundColor: '#FFFDF8',
  border: '2px solid #333',
  boxShadow: '3px 3px 0px #333',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'transform 0.1s',
}

const iconBox: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1.5px solid #333',
  flexShrink: 0,
}

export function ShareButtons({
  copied,
  isGenerating,
  onLinkShare,
  onImageShare,
  onPreview,
}: ShareButtonsProps) {
  const { t } = useTranslation('common')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 링크 공유 */}
      <button
        onClick={onLinkShare}
        disabled={isGenerating}
        style={{
          ...btnBase,
          opacity: isGenerating ? 0.5 : 1,
        }}
      >
        <span style={{ ...iconBox, backgroundColor: copied ? '#BB0000' : '#E8F5E9' }}>
          {copied ? (
            <Check size={18} color="#fff" />
          ) : (
            <Link2 size={18} color="#333" />
          )}
        </span>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#333', margin: 0 }}>
            {copied ? t('shareButtons.linkCopied') : t('shareButtons.linkShare')}
          </p>
          <p style={{ fontSize: 14, color: '#333', margin: 0, marginTop: 2 }}>
            {t('shareButtons.linkShareDesc')}
          </p>
        </div>
      </button>

      {/* 이미지 공유 */}
      <button
        onClick={onImageShare}
        disabled={isGenerating}
        style={{
          ...btnBase,
          opacity: isGenerating ? 0.5 : 1,
        }}
      >
        <span style={{ ...iconBox, backgroundColor: '#E3F2FD' }}>
          {isGenerating ? (
            <Loader2 size={18} color="#999" className="animate-spin" />
          ) : (
            <Image size={18} color="#333" />
          )}
        </span>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#333', margin: 0 }}>
            {t('shareButtons.imageShare')}
          </p>
          <p style={{ fontSize: 14, color: '#333', margin: 0, marginTop: 2 }}>
            {t('shareButtons.imageShareDesc')}
          </p>
        </div>
      </button>

      {/* 이미지 저장 */}
      <button
        onClick={onPreview}
        disabled={isGenerating}
        style={{
          ...btnBase,
          opacity: isGenerating ? 0.5 : 1,
        }}
      >
        <span style={{ ...iconBox, backgroundColor: '#FFF3E0' }}>
          {isGenerating ? (
            <Loader2 size={18} color="#999" className="animate-spin" />
          ) : (
            <Download size={18} color="#333" />
          )}
        </span>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#333', margin: 0 }}>
            {t('shareButtons.imageSave')}
          </p>
          <p style={{ fontSize: 14, color: '#333', margin: 0, marginTop: 2 }}>
            {t('shareButtons.imageSaveDesc')}
          </p>
        </div>
      </button>
    </div>
  )
}
