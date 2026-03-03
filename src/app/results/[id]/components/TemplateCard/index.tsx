'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'

import { StatBars } from '../StatBars'
import { serifFont } from '@/lib/constants/styles'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { TraitScores } from '@/types/analysis'

import { ASSETS, ACTIONS } from './constants'

const EnvelopeCard = dynamic(
  () => import('@/components/animations/PerfumeBottle').then(m => ({ default: m.EnvelopeCard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full animate-pulse" style={{
          aspectRatio: '1',
          borderRadius: 12,
          backgroundColor: '#EDE9E1',
        }} />
      </div>
    ),
  }
)

// Auto font-size (same pattern as PerfumeDetailModal getStoryFontSize)
function fitFontSize(
  text: string,
  boxWidth: number,
  boxHeight: number,
  maxFont: number,
  minFont: number,
): number {
  if (!text) return maxFont
  for (let size = maxFont; size >= minFont; size--) {
    const charsPerLine = Math.floor(boxWidth / (size * 0.55))
    const lineCount = Math.ceil(text.length / charsPerLine)
    const totalHeight = lineCount * size * 1.5
    if (totalHeight <= boxHeight) return size
  }
  return minFont
}


// mainScent 이름 → 이모지 + 짧은 힌트
const SCENT_HINTS: Record<string, string> = {
  블랙베리: '🫐 달콤~', 만다린: '🍊 상큼!', 스트로베리: '🍓 달달♡', 베르가못: '🍋 싱그러운~',
  오렌지: '🍊 톡 쏘는!', 캐럿: '🥕 풋풋한~', 로즈: '🌹 우아하게~', 튜베로즈: '🤍 황홀한~',
  블라썸: '🌼 화사한~', 튤립: '🌷 사랑스러운♡', 라임: '💚 청량!', 은방울꽃: '🔔 맑은~',
  유자: '🍋 새콤달콤!', 민트: '🧊 시원~', 페티그레인: '🍃 깔끔한~', 샌달우드: '🪵 포근한~',
  레몬: '🍋 톡톡!', 핑크페퍼: '🌶️ 스파이시~', 바다: '🌊 시원한~', 타임: '🌿 허브향~',
  머스크: '☁️ 부드러운~', 화이트로즈: '🤍 순수한♡', 스웨이드: '🧸 따뜻한~', 라벤더: '💜 편안한~',
  사이프러스: '🌲 깊은~', 스모키: '🖤 묵직한~', 레더: '🖤 시크!', 바이올렛: '💜 몽환적~',
  무화과: '🍈 달콤한~', 페퍼: '🌶️ 스파이시!',
}

function getScentHint(mainScentName: string): string {
  for (const [key, hint] of Object.entries(SCENT_HINTS)) {
    if (mainScentName.includes(key)) return hint
  }
  return '어떤 향?'
}

const boxStyle: React.CSSProperties = {
  border: '2px solid #333',
  borderRadius: 16,
  backgroundColor: '#FFFDF8',
  boxShadow: '3px 3px 0px #333',
}

// 키워드 → 배경색 매핑
const MOOD_COLORS: Record<string, string> = {
  // 어두운/강렬한 계열
  시크: '#2D2D2D', 다크: '#37474F', 카리스마: '#4A148C', 열정: '#FFCDD2',
  섹시: '#E91E63', 레더: '#3E2723', 스모키: '#455A64',
  // 핑크/로맨틱 계열
  로맨틱: '#F8BBD0', 귀여운: '#FCE4EC', 부드러운: '#FDE7F0', 사랑: '#F48FB1',
  달콤: '#F8BBD0', 러블리: '#F48FB1',
  // 보라/몽환 계열
  몽환: '#E1BEE7', 우아: '#F3E5F5', 신비: '#D1C4E9', 바이올렛: '#CE93D8',
  // 파랑/청량 계열
  쿨: '#B3E5FC', 청량: '#81D4FA', 깔끔: '#E0F7FA', 차분: '#B2DFDB',
  시원: '#80DEEA', 맑은: '#B3E5FC',
  // 초록/자연 계열
  여유: '#C8E6C9', 자유: '#A5D6A7', 편안: '#C5E1A5', 자연: '#AED581',
  허브: '#C5E1A5', 풋풋: '#DCEDC8', 싱그러운: '#C8E6C9',
  // 노랑/따뜻한 계열
  따뜻: '#FFCCBC', 포근: '#FFF9C4', 밝은: '#FFF176', 활발: '#FFE082',
  화사: '#FFE0B2', 상큼: '#FFCC80', 햇살: '#FFF176', 에너지: '#FFD54F',
  // 베이지/세련 계열
  세련: '#CFD8DC', 감성: '#D7CCC8', 빈티지: '#EFEBE9', 도시: '#ECEFF1',
  고급: '#FFF8E1', 클래식: '#D7CCC8', 모던: '#CFD8DC',
  // 순수/맑은 계열
  순수: '#E8EAF6', 투명: '#E3F2FD', 깨끗: '#E0F7FA', 가벼운: '#F3E5F5',
  // 오렌지/과일 계열
  톡톡: '#FFAB91', 발랄: '#FFAB91', 비타민: '#FFB74D',
  // 갈색/나무 계열
  우디: '#BCAAA4', 나무: '#A1887F', 포레스트: '#81C784',
}

function getMoodColor(keyword: string): string {
  for (const [key, color] of Object.entries(MOOD_COLORS)) {
    if (keyword.includes(key)) return color
  }
  return '#F5F0E8'
}

function getMoodTextColor(keyword: string): string {
  const darkKeywords = ['시크', '다크', '카리스마', '섹시', '레더', '스모키']
  for (const k of darkKeywords) {
    if (keyword.includes(k)) return '#fff'
  }
  return '#333'
}

interface TemplateCardProps {
  analysis: {
    description: string
    traits: TraitScores
    personality: string
    mood?: string[]
  }
  recommendations: PerfumeRecommendation[]
  uploadedImage?: string
  timestamp?: number
  onShareOpen: () => void
  onHomeClick: () => void
}

export function TemplateCard({
  analysis,
  recommendations,
  uploadedImage,
  timestamp,
  onShareOpen,
  onHomeClick,
}: TemplateCardProps) {
  const [openedBoxes, setOpenedBoxes] = useState<boolean[]>([false, false, false])
  const [imgPosition, setImgPosition] = useState<string>('center')

  // 항상 상단 유지, 하단 크롭
  useEffect(() => {
    if (!uploadedImage) return
    setImgPosition('top center')
  }, [uploadedImage])

  // 1.5배 키운 px 값 → dvh 변환 (기준 뷰포트 850px)
  const storyFontPx = fitFontSize(analysis.personality, 160, 100, 27, 14)
  const storyFontSize = `${(storyFontPx / 850 * 100).toFixed(2)}dvh`

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      style={{
        width: '100%',
        height: '100dvh',
        backgroundColor: '#F5F0E8',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Logo — ~8% */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2dvh 16px 3.5dvh',
      }}>
        <img
          src="/images/logo2.PNG"
          alt="AC'SCENT"
          style={{ height: '4dvh', objectFit: 'contain', filter: 'invert(1)' }}
        />
      </div>

      {/* Two-column area */}
      <div style={{
        flex: '38 1 0',
        display: 'flex',
        gap: 10,
        minHeight: 0,
        minWidth: 0,
        padding: '0 16px',
      }}>

        {/* Left: Polaroid photo frame — 45:55 ratio */}
        <div
          style={{
            flex: '55 0 0',
            minWidth: 0,
            border: '2px solid #333',
            borderRadius: 16,
            padding: 6,
            backgroundColor: '#FFFDF8',
            boxShadow: '3px 3px 0px #333',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Inner frame — 컨테이너 잔여 공간 기반 */}
          <div
            style={{
              width: '100%',
              flex: '4 1 0',
              minHeight: 0,
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
            }}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="분석한 이미지"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: imgPosition,
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, color: '#bbb' }}>PHOTO</span>
              </div>
            )}
          </div>
          {/* Polaroid bottom strip — 플로팅 해시태그 */}
          <div style={{
            flex: '1 0 0',
            minHeight: '3.5dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            position: 'relative',
            zIndex: 10,
          }}>
            {(analysis.mood ?? []).slice(0, 2).map((keyword, i) => {
              const rotations = [-2.5, 1.5]
              const offsets = [-1, 2]
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 'clamp(9px, 2.8vw, 13px)',
                    color: getMoodTextColor(keyword),
                    fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    backgroundColor: getMoodColor(keyword),
                    border: '1.5px solid #333',
                    borderRadius: 999,
                    padding: '3px clamp(6px, 2vw, 12px)',
                    boxShadow: '1.5px 1.5px 0px #333',
                    transform: `rotate(${rotations[i]}deg) translateY(${offsets[i]}px)`,
                  }}
                >
                  #{keyword.length > 6 ? keyword.slice(0, 6) + '..' : keyword}
                </span>
              )
            })}
          </div>
        </div>

        {/* Right column — Image Story (전체) */}
        <div style={{ flex: '45 0 0', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <img
            src={ASSETS.story}
            alt="Image Story"
            style={{ height: '3.4dvh', objectFit: 'contain', alignSelf: 'center', marginBottom: '0.5dvh' }}
          />
          <div
            style={{
              ...boxStyle,
              flex: 1,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                fontSize: storyFontSize,
                lineHeight: 1.5,
                color: '#333',
                margin: 0,
                textAlign: 'center',
                wordBreak: 'keep-all',
                fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
              }}
            >
              {analysis.personality}
            </p>
          </div>
        </div>
      </div>

      {/* Image Profile section */}
      <div style={{
        flex: '14 0 0',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1dvh',
        minHeight: 0,
        padding: '0 16px',
      }}>
        <img
          src={ASSETS.profile}
          alt="Image Profile"
          style={{ height: '3.4dvh', objectFit: 'contain', alignSelf: 'center', marginBottom: '0.5dvh', flexShrink: 0 }}
        />
        <div
          style={{
            ...boxStyle,
            flex: 1,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <StatBars traits={analysis.traits} />
        </div>
      </div>

      {/* Recommendations section */}
      <div style={{
        flex: '25.5 1 0',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1dvh',
        minHeight: 0,
        padding: '0 16px',
      }}>
        <img
          src={ASSETS.reco}
          alt="Recommendations"
          style={{ height: '2.5dvh', objectFit: 'contain', alignSelf: 'center', marginBottom: '0.5dvh', flexShrink: 0 }}
        />
        <div
          style={{
            ...boxStyle,
            flex: 1,
            padding: '8px 10px 6px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <p style={{
            fontSize: '1.95dvh',
            color: '#333',
            textAlign: 'center',
            margin: '0 0 0.5dvh',
            flexShrink: 0,
            fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
            letterSpacing: '0.03em',
          }}>
            편지를 눌러서 답장을 확인해보세요 💌
          </p>
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              alignItems: 'flex-end',
              minHeight: 0,
            }}
          >
            {recommendations.slice(0, 3).map((rec, idx) => (
              <EnvelopeCard
                key={idx}
                perfumeName={rec.perfume.name}
                index={idx}
                recommendation={rec}
                hint={getScentHint(rec.perfume.mainScent?.name || '')}
                uploadedImage={uploadedImage}
                analysisDate={timestamp}
                onOpen={() => {
                  setOpenedBoxes(prev => {
                    const next = [...prev]
                    next[idx] = true
                    return next
                  })
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: ACTIONS.gap,
          padding: '1dvh 16px',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onShareOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 20px',
            height: '4.5dvh',
            borderRadius: 20,
            backgroundColor: '#BB0000',
            border: '2px solid #333',
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #333',
            ...serifFont,
          }}
        >
          <Share2 size={14} />
          <span>SHARE</span>
        </motion.button>
        <button
          onClick={onHomeClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 20px',
            height: '4.5dvh',
            borderRadius: 20,
            backgroundColor: '#FFFDF8',
            border: '2px solid #333',
            color: '#333',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #333',
            ...serifFont,
          }}
        >
          <Home size={14} />
          <span>HOME</span>
        </button>
      </div>

      {/* Footer */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', paddingBottom: '1.5dvh' }}>
        <img
          src={ASSETS.footer}
          alt="Ac'scent wow"
          style={{ height: '1.3dvh', objectFit: 'contain', opacity: 0.6 }}
        />
      </div>
    </motion.div>
  )
}
