'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'

export default function NotFound() {
  const { t } = useTranslation('results')
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {t('notFound')}
      </h2>
      <p className="text-gray-600 mb-8 whitespace-pre-line">
        {t('notFoundDescription')}
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t('notFoundAction')}
      </Link>
    </div>
  )
}
