import type { Metadata, Viewport } from 'next'
import { Poppins, Noto_Sans_KR, Gamja_Flower, Jua } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

const gamjaFlower = Gamja_Flower({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-gamja',
  display: 'swap',
})

const jua = Jua({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jua',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "AC'SCENT - AI 향수 추천",
  description: '좋아하는 셀럽의 사진으로 나에게 어울리는 향수를 찾아보세요',
  openGraph: {
    title: "AC'SCENT - AI 향수 추천",
    description: '좋아하는 셀럽의 사진으로 나에게 어울리는 향수를 찾아보세요',
    type: 'website',
    images: [{ url: '/images/og_logo.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AC'SCENT - AI 향수 추천",
    description: '좋아하는 셀럽의 사진으로 나에게 어울리는 향수를 찾아보세요',
    images: ['/images/og_logo.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${poppins.variable} ${notoSansKR.variable} ${gamjaFlower.variable} ${jua.variable}`}>
      <body className="font-sans">
        <main>{children}</main>
      </body>
    </html>
  )
}
