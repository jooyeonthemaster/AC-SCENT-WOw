'use client'

import { WritingStep } from '@/components/letter/WritingStep'
import { DynamicBackground } from '@/components/DynamicBackground'

export default function HomePage() {
  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <DynamicBackground />
      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        <WritingStep />
      </div>
    </div>
  )
}
