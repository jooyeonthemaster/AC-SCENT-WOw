import { NextResponse } from 'next/server'
import { recommendationStats } from '../analyze-image/route'

export async function GET() {
  // Convert Map to array and sort by count
  const stats = Array.from(recommendationStats.entries()).map(
    ([perfumeId, count]) => ({
      perfumeId,
      count,
    })
  )

  // Sort by count descending
  stats.sort((a, b) => b.count - a.count)

  return NextResponse.json({
    success: true,
    data: {
      stats,
      total: stats.reduce((sum, s) => sum + s.count, 0),
    },
  })
}

// Reset stats (optional)
export async function DELETE() {
  recommendationStats.clear()

  return NextResponse.json({
    success: true,
    message: 'Stats reset successfully',
  })
}
