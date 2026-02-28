'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Home, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DynamicBackground } from '@/components/DynamicBackground'

import { StatBars } from './components/StatBars'

const ShareModal = dynamic(
  () => import('./components/ShareModal').then(m => ({ default: m.ShareModal })),
  { ssr: false }
)
const EnvelopeCard = dynamic(
  () => import('@/components/animations/PerfumeBottle').then(m => ({ default: m.EnvelopeCard })),
  { ssr: false }
)

import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { TraitScores, ScentCategoryScores } from '@/types/analysis'
import { logger } from '@/lib/utils/logger'
import { serifFont } from '@/lib/constants/styles'

interface AnalysisData {
  analysisId: string
  timestamp?: number
  analysis: {
    description: string
    traits: TraitScores
    characteristics: ScentCategoryScores
    mood: string[]
    personality: string
  }
  recommendations: PerfumeRecommendation[]
  uploadedImage?: string
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(187, 0, 0, 0.25)',
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [openedBoxes, setOpenedBoxes] = useState<boolean[]>([false, false, false])

  // Preload card template for PerfumeDetailModal
  useEffect(() => {
    const img = new window.Image()
    img.src = '/images/2_display.webp'
  }, [])

  // Load data
  useEffect(() => {
    const storedData = sessionStorage.getItem(`analysis-${id}`)
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (parsedData.perfume && !parsedData.recommendations) {
          parsedData.recommendations = [{
            perfume: parsedData.perfume,
            matchConfidence: parsedData.matchConfidence,
            reasoning: parsedData.reasoning,
          }]
          delete parsedData.perfume
          delete parsedData.matchConfidence
          delete parsedData.reasoning
        }
        setData(parsedData)
      } catch (error) {
        logger.error('Failed to parse stored data:', error)
      }
    }
    setLoading(false)
  }, [id])

  // Warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
      return e.returnValue
    }
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname)
      const confirmLeave = window.confirm(
        '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
      )
      if (confirmLeave) {
        window.removeEventListener('popstate', handlePopState)
        window.history.back()
      }
    }
    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <p className="text-sm text-[#999] tracking-wider" style={serifFont}>Loading...</p>
      </div>
    )
  }

  if (!data || !data.recommendations || data.recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh px-8 text-center">
        <h1 className="text-lg text-[#1A1A1A] mb-3" style={serifFont}>결과를 찾을 수 없습니다</h1>
        <p className="text-xs text-[#888] mb-6 leading-relaxed">분석 결과가 만료되었거나 존재하지 않습니다.</p>
        <button
          onClick={() => router.push('/')}
          className="min-h-[44px] px-6 py-3 bg-[#1A1A1A] text-white text-sm tracking-wider"
          style={serifFont}
        >
          HOME
        </button>
      </div>
    )
  }

  const { analysis, recommendations, uploadedImage, timestamp } = data

  return (
    <>
      <DynamicBackground showHeroText={false} fixed />

      {/* Viewport-fit container (no scroll) */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 75px)',
          left: 32,
          right: 32,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <div
          className="max-w-md mx-auto"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '1.2dvh',
          }}
        >

          {/* Character Portrait Card — 3:4 ratio, proportional flex */}
          {uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                ...cardStyle,
                flex: '4 4 0',
                minHeight: 0,
                padding: '3%',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <div
                className="relative"
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  height: '100%',
                  aspectRatio: '3 / 4',
                  maxWidth: '100%',
                }}
              >
                <Image
                  src={uploadedImage}
                  fill
                  className="object-cover"
                  style={{ borderRadius: 12 }}
                  alt="분석한 이미지"
                  unoptimized
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </motion.div>
          )}

          {/* Personality one-liner Card */}
          {analysis.personality && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                ...cardStyle,
                flex: '1.5 1.5 0',
                minHeight: 0,
                padding: '1.2dvh 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <p className="text-[17px] text-[#555] leading-snug text-center" style={{ fontFamily: 'var(--font-gamja), cursive', wordBreak: 'keep-all' }}>
                {analysis.personality}
              </p>
            </motion.div>
          )}

          {/* STATUS Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              ...cardStyle,
              flex: '2 2 0',
              minHeight: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              className="absolute left-1/2 -translate-x-1/2 text-[20px] tracking-[0.25em] text-[#BB0000] font-bold uppercase"
              style={{ ...serifFont, top: -7, padding: '0 10px', zIndex: 1 }}
            >
              Status
            </span>
            <div style={{ padding: '4px 16px', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
              <StatBars traits={analysis.traits} />
            </div>
          </motion.div>

          {/* RECOMMENDATIONS Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              ...cardStyle,
              flex: '4 4 0',
              minHeight: 0,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              className="absolute left-1/2 -translate-x-1/2 text-[20px] tracking-[0.25em] text-[#1A1A1A] font-bold uppercase"
              style={{ ...serifFont, top: -7, padding: '0 10px', zIndex: 1 }}
            >
              Recommendations
            </span>
            <p className="text-[20px] tracking-wider text-[#999] text-center mt-5 mb-1" style={serifFont}>
              편지를 눌러서 답장을 확인해보세요
            </p>
            <div style={{ padding: '0 16px 6px', flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div className="flex gap-4 justify-center px-2" style={{ marginBottom: '0.4dvh', flex: '0 1 auto', maxHeight: '85%', alignItems: 'stretch' }}>
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <EnvelopeCard
                    key={idx}
                    perfumeName={rec.perfume.name}
                    index={idx}
                    recommendation={rec}
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
              <p className="text-[10px] tracking-[0.2em] text-[#AAA] text-center">
                {openedBoxes.filter(Boolean).length} / {Math.min(recommendations.length, 3)} REVEALED
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3" style={{ flex: '0.7 0.7 0', minHeight: 36 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 px-4 text-[#BB0000] text-sm tracking-wider flex items-center justify-center gap-2 transition-colors active:bg-[#BB0000] active:text-white"
              style={{ ...serifFont, ...cardStyle, border: '2px solid #BB0000', height: '100%' }}
            >
              <Share2 className="w-4 h-4" />
              <span>SHARE</span>
            </motion.button>
            <button
              onClick={() => {
                const confirmLeave = window.confirm(
                  '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
                )
                if (confirmLeave) {
                  router.push('/')
                }
              }}
              className="flex-1 px-4 text-[#555] text-sm tracking-wider flex items-center justify-center gap-2 transition-colors active:bg-[#E5E5E5]"
              style={{ ...serifFont, ...cardStyle, height: '100%' }}
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </button>
          </div>

        </div>
      </div>

      {/* === Overlays === */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userImage={uploadedImage}
        twitterName={analysis.description}
        userName="사용자"
        userGender="Unisex"
        perfumeName={recommendations[0]?.perfume.name || "향수"}
        perfumeBrand={recommendations[0]?.perfume.id || "브랜드"}
        analysisData={{
          traits: analysis.traits,
          matchingPerfumes: recommendations.map(rec => ({
            persona: {
              id: rec.perfume.id,
              mainScent: rec.perfume.mainScent,
              subScent1: rec.perfume.subScent1,
              subScent2: rec.perfume.subScent2,
              keywords: rec.perfume.keywords || []
            },
            confidence: rec.matchConfidence
          })),
          scentCategories: analysis.characteristics,
          personalColor: undefined,
          matchingKeywords: analysis.mood
        }}
      />
    </>
  )
}
