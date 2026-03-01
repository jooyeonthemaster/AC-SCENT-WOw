'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { TemplateCard } from './components/TemplateCard'

const ShareModal = dynamic(
  () => import('./components/ShareModal').then(m => ({ default: m.ShareModal })),
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

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Preload card templates
  useEffect(() => {
    const img1 = new window.Image()
    img1.src = '/images/result_template_display.webp'
    const img2 = new window.Image()
    img2.src = '/images/2_display.webp'
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
      <div className="flex items-center justify-center h-dvh bg-white">
        <p className="text-sm text-[#999] tracking-wider" style={serifFont}>Loading...</p>
      </div>
    )
  }

  if (!data || !data.recommendations || data.recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh px-8 text-center bg-white">
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
    <div className="h-dvh bg-white overflow-hidden">
      <TemplateCard
        analysis={analysis}
        recommendations={recommendations}
        uploadedImage={uploadedImage}
        timestamp={timestamp}
        onShareOpen={() => setIsShareModalOpen(true)}
        onHomeClick={() => {
          const confirmLeave = window.confirm(
            '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
          )
          if (confirmLeave) {
            router.push('/')
          }
        }}
      />

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
    </div>
  )
}
