import { ImageUploader } from '@/components/upload/ImageUploader'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          당신만의 향수를 찾아보세요
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          좋아하는 셀럽의 사진을 업로드하면 AI가 분석하여 어울리는 향수를 추천해드립니다
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
        <ImageUploader />
      </div>
    </div>
  )
}
