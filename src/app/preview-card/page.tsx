'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { domToPng } from 'modern-screenshot'
import { ShareCardNew } from '../results/[id]/components/ShareCardNew'
import { SHARE_CARD_DIMENSIONS } from '../results/[id]/components/ShareModal/constants'

const MOCK_DATA = {
  userImage: undefined,
  twitterName: '도시의 밤거리를 걷는 듯한 깊고 세련된 분위기가 느껴지는 인상입니다.',
  userName: '사용자',
  perfumeName: 'Midnight Velvet',
  perfumeBrand: "AC'SCENT 07",
  accentColor: '#BB0000',
  timestamp: Date.now(),
  analysisData: {
    traits: {
      sexy: 8.2,
      cute: 3.1,
      charisma: 7.5,
      darkness: 6.8,
      freshness: 4.2,
      elegance: 9.0,
      freedom: 5.5,
      luxury: 7.8,
      purity: 2.3,
      uniqueness: 6.1,
    },
    matchingPerfumes: [{
      persona: {
        id: 'ACSCENT07',
        mainScent: { name: 'Bergamot', category: 'citrus' as const },
        subScent1: { name: 'Jasmine', category: 'floral' as const },
        subScent2: { name: 'Sandalwood', category: 'woody' as const },
        keywords: ['elegant', 'mysterious'],
      },
      confidence: 0.85,
    }],
    scentCategories: {
      citrus: 7.5,
      floral: 6.2,
      woody: 8.1,
      musky: 5.0,
      fruity: 3.8,
      spicy: 4.5,
    },
    personalColor: undefined,
    matchingKeywords: ['elegant', 'mysterious', 'deep'],
    personality: '깊고 따뜻한 우디 향이 당신의 세련된 카리스마와 완벽하게 어우러집니다. 베르가못의 상쾌한 첫인상 뒤로 재스민의 우아함이 펼쳐지며, 샌달우드가 깊은 여운을 남깁니다.',
  },
}

export default function PreviewCardPage() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const generate = useCallback(async () => {
    setPreviewUrl(null)
    await new Promise(r => setTimeout(r, 300))
    if (!cardRef.current) return

    if (document.fonts?.ready) {
      await document.fonts.ready.catch(() => undefined)
    }
    const images = Array.from(cardRef.current.querySelectorAll('img'))
    await Promise.all(
      images.map(img => new Promise<void>(resolve => {
        if (img.complete && img.naturalWidth > 0) return resolve()
        img.onload = () => resolve()
        img.onerror = () => resolve()
      }))
    )
    await new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )

    const dataUrl = await domToPng(cardRef.current, {
      width: SHARE_CARD_DIMENSIONS.width,
      height: SHARE_CARD_DIMENSIONS.height,
      scale: SHARE_CARD_DIMENSIONS.scale,
      backgroundColor: '#F5F0E8',
    })

    setPreviewUrl(dataUrl)
  }, [])

  // 자동 생성
  useEffect(() => {
    generate()
  }, [generate, key])

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    }}>
      {/* 새로고침 버튼 */}
      <button
        onClick={() => setKey(k => k + 1)}
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          backgroundColor: '#BB0000',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        새로고침 (캡처 다시 생성)
      </button>

      {/* 숨긴 카드 (캡처용) */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <ShareCardNew key={key} ref={cardRef} {...MOCK_DATA} />
      </div>

      {/* 캡처 결과 미리보기 */}
      {previewUrl ? (
        <div style={{
          maxWidth: 430,
          width: '100%',
          borderRadius: 12,
          border: '2px solid #555',
          overflow: 'hidden',
        }}>
          <img
            src={previewUrl}
            alt="카드 미리보기"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </div>
      ) : (
        <p style={{ color: '#999', fontSize: 14 }}>캡처 생성 중...</p>
      )}
    </div>
  )
}
