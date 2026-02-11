import { GeminiAnalysisResult } from '@/types/gemini'
import { Perfume } from '@/lib/data/perfumes'

export interface AnalysisRequestBody {
  image: string
  options?: {
    language?: 'ko' | 'en'
  }
}

export interface PerfumeRecommendation {
  perfume: Perfume
  matchConfidence: number
  reasoning: string
}

export interface AnalysisResponseData {
  analysisId: string
  analysis: GeminiAnalysisResult
  recommendations: PerfumeRecommendation[]
}

export interface CachedResult {
  analysis: GeminiAnalysisResult
  recommendations: PerfumeRecommendation[]
  timestamp: number
}
