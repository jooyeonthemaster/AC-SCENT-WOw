'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Home, Share2 } from 'lucide-react'
import { CharacteristicsChart } from '@/components/results/CharacteristicsChart'
import { TraitsChart } from '@/components/results/TraitsChart'
import { ShareModal } from './components/ShareModal'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'
import type { Perfume } from '@/lib/data/perfumes'
import type { TraitScores, ScentCategoryScores } from '@/types/analysis'

interface AnalysisData {
  analysisId: string
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

// Create a fake perfume object for chart display using analysis data
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
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
  }
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    // Load data from sessionStorage
    const storedData = sessionStorage.getItem(`analysis-${id}`)

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)

        // Handle legacy format (single perfume) - convert to new format (array)
        if (parsedData.perfume && !parsedData.recommendations) {
          parsedData.recommendations = [
            {
              perfume: parsedData.perfume,
              matchConfidence: parsedData.matchConfidence,
              reasoning: parsedData.reasoning,
            },
          ]
          delete parsedData.perfume
          delete parsedData.matchConfidence
          delete parsedData.reasoning
        }

        setData(parsedData)
      } catch (error) {
        console.error('Failed to parse stored data:', error)
      }
    }

    setLoading(false)
  }, [id])

  // Warn user before leaving the page
  useEffect(() => {
    // External navigation (refresh, close tab, external links)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
      return e.returnValue
    }

    // Browser back button - prevent default and show confirm
    const handlePopState = (e: PopStateEvent) => {
      // Push state back immediately to stay on current page
      window.history.pushState(null, '', window.location.pathname)

      // Show confirmation dialog
      const confirmLeave = window.confirm(
        '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
      )

      if (confirmLeave) {
        // User confirmed - actually go back
        window.removeEventListener('popstate', handlePopState)
        window.history.back()
      }
      // If canceled, we already pushed state back so we stay on current page
    }

    // Push initial state to enable popstate detection
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
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <p className="text-base md:text-lg text-gray-600">
            결과를 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            결과를 찾을 수 없습니다
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-8">
            분석 결과가 만료되었거나 존재하지 않습니다.
            <br />
            새로운 이미지로 다시 분석해보세요.
          </p>
          <button
            onClick={() => router.push('/')}
            className="min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const { analysis, recommendations, uploadedImage } = data
  const analysisPerfume = createAnalysisPerfume(analysis)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div id="results-container" className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            당신을 위한 향수 추천
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            AI가 분석한 결과를 확인해보세요
          </p>
        </div>

        {/* Uploaded Image Section */}
        {uploadedImage && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
              분석한 이미지
            </h2>
            <div className="relative w-full max-w-md mx-auto">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={uploadedImage}
                  alt="분석한 이미지"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            AI 분석 결과
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-4">
            {analysis.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.mood.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Charts Section - Show analysis charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
              향의 특성
            </h3>
            <CharacteristicsChart perfume={analysisPerfume} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
              성격 특성
            </h3>
            <TraitsChart perfume={analysisPerfume} />
          </div>
        </div>

        {/* Perfume Recommendations Section - 3 cards */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            추천 향수 ({recommendations.length}개)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={rec.perfume.id}
                className="rounded-lg shadow-md p-4 md:p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${rec.perfume.primaryColor}, ${rec.perfume.secondaryColor})`,
                }}
              >
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  {rec.perfume.name}
                </h3>
                <p className="text-sm md:text-base mb-3">{rec.perfume.id}</p>
                <p className="text-xs md:text-sm mb-4">
                  {rec.perfume.description}
                </p>
                <div className="space-y-2 text-xs md:text-sm">
                  <p>
                    <strong>메인 향:</strong> {rec.perfume.mainScent.name}
                  </p>
                  <p>
                    <strong>서브 향:</strong> {rec.perfume.subScent1.name},{' '}
                    {rec.perfume.subScent2.name}
                  </p>
                  <p>
                    <strong>분위기:</strong> {rec.perfume.mood}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <p className="text-xs">{rec.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="
              min-h-[48px] px-8 py-4 rounded-2xl font-bold text-lg
              bg-gradient-to-r from-pink-500 to-orange-500
              hover:from-pink-600 hover:to-orange-600
              text-white shadow-lg
              active:scale-[0.98]
              transition-all duration-200
              flex items-center justify-center gap-3
            "
          >
            <Share2 className="w-6 h-6" />
            <span>결과 공유하기</span>
          </button>
        </div>

        {/* Share Modal */}
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

        {/* Home Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const confirmLeave = window.confirm(
                '결과를 저장하지 않으면 사라집니다. 페이지를 떠나시겠습니까?'
              )
              if (confirmLeave) {
                router.push('/')
              }
            }}
            className="
              min-h-[48px] px-6 py-3 rounded-lg font-semibold
              text-sm md:text-base
              bg-gray-600 text-white
              hover:bg-gray-700
              active:scale-[0.98]
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <Home className="w-4 h-4 md:w-5 md:h-5" />
            <span>홈으로 돌아가기</span>
          </button>
        </div>
      </div>
    </div>
  )
}
