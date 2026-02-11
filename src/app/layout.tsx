import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: "AC'SCENT - AI 향수 추천",
  description: '좋아하는 셀럽의 사진으로 나에게 어울리는 향수를 찾아보세요',
  openGraph: {
    title: "AC'SCENT - AI 향수 추천",
    description: '좋아하는 셀럽의 사진으로 나에게 어울리는 향수를 찾아보세요',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">AC&apos;SCENT</h1>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
