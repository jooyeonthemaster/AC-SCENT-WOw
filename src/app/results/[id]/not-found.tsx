import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        결과를 찾을 수 없습니다
      </h2>
      <p className="text-gray-600 mb-8">
        분석 결과가 만료되었거나 존재하지 않습니다.
        <br />
        새로운 이미지로 다시 분석해보세요.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
