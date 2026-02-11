import { ShareAnalysisData } from '@/types/analysis'

export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  userImage?: string
  twitterName: string
  userName: string
  userGender: string
  perfumeName: string
  perfumeBrand: string
  analysisData: ShareAnalysisData
  shareUrl?: string
}

export interface ShareCardProps {
  userImage?: string
  twitterName: string
  userName: string
  userGender: string
  perfumeName: string
  perfumeBrand: string
  analysisData: ShareAnalysisData
}
