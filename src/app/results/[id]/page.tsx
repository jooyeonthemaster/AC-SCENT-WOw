'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Home, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DynamicBackground } from '@/components/DynamicBackground'

const TraitsChart = dynamic(
  () => import('@/components/results/TraitsChart').then(m => ({ default: m.TraitsChart })),
  { ssr: false }
)
const ShareModal = dynamic(
  () => import('./components/ShareModal').then(m => ({ default: m.ShareModal })),
  { ssr: false }
)
const PerfumeBottle = dynamic(
  () => import('@/components/animations/PerfumeBottle').then(m => ({ default: m.PerfumeBottle })),
  { ssr: false }
)
const PerfumeDetailPopup = dynamic(
  () => import('@/components/results/PerfumeDetailPopup').then(m => ({ default: m.PerfumeDetailPopup })),
  { ssr: false }
)
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { Perfume } from '@/lib/data/perfumes'
import type { TraitScores, ScentCategoryScores } from '@/types/analysis'
import { logger } from '@/lib/utils/logger'

interface AnalysisData {
  analysisId: string
  analysis: {
    description: string
    traits: TraitScores
    characteristics: ScentCategoryScores
    mood: string[]
    personality: string
    fanLetter?: string
  }
  recommendations: PerfumeRecommendation[]
  uploadedImage?: string
}

const serifFont = { fontFamily: 'Times New Roman, Georgia, serif' }

function createAnalysisPerfume(
  analysis: AnalysisData['analysis']
): Perfume {
  return {
    id: 'analysis',
    name: '분석 결과',
    description: analysis.description,
    mood: analysis.mood.join(', '),
    personality: analysis.personality,
    mainScent: { name: '' },
    subScent1: { name: '' },
    subScent2: { name: '' },
    characteristics: analysis.characteristics,
    category: '',
    recommendation: '',
    traits: analysis.traits,
    keywords: analysis.mood,
    primaryColor: '#1A1A1A',
    secondaryColor: '#B00',
  }
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Perfume bottle interaction state
  const [openedBoxes, setOpenedBoxes] = useState<boolean[]>([false, false, false])
  const [activePerfumeIndex, setActivePerfumeIndex] = useState(0)
  const [isPerfumeDetailOpen, setIsPerfumeDetailOpen] = useState(false)

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

  // Warn user before leaving
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

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <p className="text-sm text-[#999] tracking-wider" style={serifFont}>
          Loading...
        </p>
      </div>
    )
  }

  // --- Error state ---
  if (!data || !data.recommendations || data.recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh px-8 text-center">
        <h1 className="text-lg text-[#1A1A1A] mb-3" style={serifFont}>
          결과를 찾을 수 없습니다
        </h1>
        <p className="text-xs text-[#888] mb-6 leading-relaxed">
          분석 결과가 만료되었거나 존재하지 않습니다.
        </p>
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

  const { analysis, recommendations, uploadedImage } = data
  const analysisPerfume = createAnalysisPerfume(analysis)

  return (
    <>
      <DynamicBackground showHeroText={false} fixed />

      {/* Content container: full viewport scroll */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 56px)',
          left: 16,
          right: 16,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 10,
          scrollbarWidth: 'none',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-0">

            {/* === Section A: Analyzed Photo === */}
            {uploadedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-2" style={serifFont}>
                  Analyzed
                </p>
                <div className="relative w-full aspect-[3/4] bg-[#f5f5f5] overflow-hidden">
                  {/* Red corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B00] z-[1]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B00] z-[1]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B00] z-[1]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B00] z-[1]" />
                  <Image
                    src={uploadedImage}
                    fill
                    className="object-cover"
                    alt="분석한 이미지"
                    unoptimized
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </motion.div>
            )}

            {/* === Section B: AI Analysis === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="pt-6 border-t border-[#EEE]"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3" style={serifFont}>
                Analysis
              </p>
              <p className="text-sm text-[#1A1A1A] leading-relaxed mb-4">
                {analysis.description}
              </p>
              {analysis.personality && (
                <div className="border-l-2 border-[#B00] pl-3 mb-4">
                  <p className="text-xs text-[#555] italic" style={serifFont}>
                    {analysis.personality}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {analysis.mood.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 border border-[#DDD] text-[#1A1A1A] text-[11px] tracking-wide"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* === Section C: Fan Letter === */}
            {analysis.fanLetter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="pt-6 border-t border-[#EEE]"
              >
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3" style={serifFont}>
                  Fan Letter
                </p>
                <div className="bg-[#FAFAFA] p-4 border border-[#EEE]">
                  <p className="text-sm text-[#333] leading-relaxed italic" style={serifFont}>
                    &ldquo;{analysis.fanLetter}&rdquo;
                  </p>
                </div>
                <div className="flex justify-center mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B00]" />
                </div>
              </motion.div>
            )}

            {/* === Section D: Traits Chart === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="pt-6 border-t border-[#EEE]"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3" style={serifFont}>
                Traits
              </p>
              <TraitsChart perfume={analysisPerfume} />
            </motion.div>

            {/* === Section E: Perfume Gift Boxes === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="pt-6 border-t border-[#EEE]"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#B00] font-semibold mb-1" style={serifFont}>
                Recommendations
              </p>
              <p className="text-xs text-[#555] mb-4">
                향수를 터치하여 확인하세요
              </p>

              <div className="flex gap-3 justify-center items-stretch px-2 mb-4">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <PerfumeBottle
                    key={idx}
                    perfumeName={rec.perfume.name}
                    index={idx}
                    onOpen={() => {
                      setOpenedBoxes(prev => {
                        const next = [...prev]
                        next[idx] = true
                        return next
                      })
                      setActivePerfumeIndex(idx)
                      setIsPerfumeDetailOpen(true)
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-[10px] tracking-[0.2em] text-[#AAA]">
                  {openedBoxes.filter(Boolean).length} / {Math.min(recommendations.length, 3)} REVEALED
                </p>
              </div>
            </motion.div>

            {/* === Section F: Actions === */}
            <div className="pt-6 border-t border-[#EEE] flex gap-3 pb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 min-h-[48px] px-4 py-3 bg-white border-2 border-[#BB0000] text-[#BB0000] text-sm tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors active:bg-[#BB0000] active:text-white"
                style={serifFont}
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
                className="flex-1 min-h-[48px] px-4 py-3 bg-[#F5F5F5] border border-[#DDD] text-[#555] text-sm tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors active:bg-[#E5E5E5]"
                style={serifFont}
              >
                <Home className="w-4 h-4" />
                <span>HOME</span>
              </button>
            </div>

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

      <PerfumeDetailPopup
        isOpen={isPerfumeDetailOpen}
        recommendation={recommendations[activePerfumeIndex] || null}
        index={activePerfumeIndex}
        onClose={() => setIsPerfumeDetailOpen(false)}
      />
    </>
  )
}
