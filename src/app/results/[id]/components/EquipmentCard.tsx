'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Lock, ChevronDown, X } from 'lucide-react'
import { useScrollLock } from './ShareModal/hooks/useScrollLock'
import type { PerfumeRecommendation } from '@/app/api/analyze-image/types'

interface EquipmentCardProps {
  recommendation: PerfumeRecommendation
  index: number
  onReveal: () => void
}

const serifFont = { fontFamily: 'Times New Roman, Georgia, serif' }

export function EquipmentCard({ recommendation, index, onReveal }: EquipmentCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const displayNumber = String(index + 1).padStart(2, '0')
  const { perfume, matchConfidence, reasoning } = recommendation

  useScrollLock(showDetail)

  const handleTap = () => {
    if (!revealed) {
      setRevealed(true)
      onReveal()
    } else {
      setShowDetail(true)
    }
  }

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
  }, [])

  return (
    <>
      <motion.div
        onClick={handleTap}
        className="cursor-pointer overflow-hidden"
        whileTap={{ scale: 0.98 }}
        layout
        style={{
          border: revealed ? '1.5px solid #BB0000' : '1.5px solid #DDD',
          borderRadius: 8,
          backgroundColor: revealed ? '#FFFFFF' : '#F7F7F7',
        }}
      >
        {/* Header row (always visible) */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-sm"
              style={{ backgroundColor: revealed ? '#BB0000' : '#999' }}
            >
              #{displayNumber}
            </span>
            {revealed ? (
              <span className="text-xs font-bold text-[#1A1A1A]" style={serifFont}>
                {perfume.name}
              </span>
            ) : (
              <span className="text-xs text-[#999] tracking-wider" style={serifFont}>
                SEALED
              </span>
            )}
          </div>

          {revealed ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#BB0000]">MATCH {matchConfidence}%</span>
              <ChevronDown size={14} className="text-[#999]" />
            </div>
          ) : (
            <Lock size={14} className="text-[#BBB]" />
          )}
        </div>

        {/* Expanded content (revealed) */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2.5">
                {/* Match confidence bar */}
                <div className="flex gap-[2px]">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-[1px]"
                      style={{
                        backgroundColor: i < Math.round(matchConfidence / 10) ? '#BB0000' : '#EBEBEB',
                      }}
                    />
                  ))}
                </div>

                {/* Scent notes */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-[#BB0000]" style={serifFont}>TOP</span>
                  <span className="text-[#333]">{perfume.mainScent.name}</span>
                  <span className="text-[#CCC]">|</span>
                  <span className="font-bold text-[#777]" style={serifFont}>MID</span>
                  <span className="text-[#333]">{perfume.subScent1.name}</span>
                  <span className="text-[#CCC]">|</span>
                  <span className="font-bold text-[#777]" style={serifFont}>BASE</span>
                  <span className="text-[#333]">{perfume.subScent2.name}</span>
                </div>

                {/* Tap for details hint */}
                <p className="text-[10px] text-center text-[#AAA] tracking-wider" style={serifFont}>
                  TAP FOR DETAILS
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sealed center content */}
        {!revealed && (
          <div className="flex flex-col items-center pb-3">
            <Lock size={20} className="text-[#CCC] mb-1" />
            <span className="text-[10px] tracking-wider text-[#AAA]" style={serifFont}>
              TAP TO REVEAL
            </span>
          </div>
        )}
      </motion.div>

      {/* Detail modal (portal) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDetail && (
            <>
              {/* Backdrop */}
              <motion.div
                key="eq-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseDetail}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: '#000000',
                  zIndex: 99990,
                }}
              />

              {/* Modal */}
              <motion.div
                key="eq-modal"
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-40px)] max-w-[338px] overflow-hidden"
                style={{
                  zIndex: 99991,
                  backgroundColor: '#FFFFFF',
                  maxHeight: 'calc(100dvh - 80px)',
                  border: '1px solid #E5E5E5',
                }}
              >
                {/* Red corner brackets */}
                <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#BB0000] z-10" />
                <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#BB0000] z-10" />
                <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#BB0000] z-10" />
                <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#BB0000] z-10" />

                {/* Close button */}
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 z-20 p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>

                {/* Scrollable content */}
                <div
                  className="overflow-y-auto px-6 py-8"
                  style={{ maxHeight: 'calc(100dvh - 80px)', scrollbarWidth: 'none' }}
                >
                  {/* Header: ID + Confidence */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs tracking-[0.2em] text-[#BB0000] font-semibold" style={serifFont}>
                      {perfume.id || `AC'SCENT ${displayNumber}`}
                    </span>
                    <span className="text-xs tracking-wider text-[#555]" style={serifFont}>
                      MATCH {matchConfidence}%
                    </span>
                  </div>

                  {/* Red divider */}
                  <div className="w-8 h-[2px] bg-[#BB0000] mb-4" />

                  {/* Perfume Name */}
                  <h2
                    className="text-2xl font-bold text-[#1A1A1A] mb-5"
                    style={{ ...serifFont, letterSpacing: '-0.02em' }}
                  >
                    {perfume.name}
                  </h2>

                  {/* Match Confidence Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] tracking-[0.15em] text-[#999] font-medium">CONFIDENCE</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{matchConfidence}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${matchConfidence}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-[#BB0000]"
                      />
                    </div>
                  </div>

                  {/* Scent Notes */}
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-3">NOTES</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-11 text-[10px] tracking-[0.1em] font-bold text-[#BB0000]">TOP</span>
                        <span className="flex-1 text-sm text-[#1A1A1A] font-medium">{perfume.mainScent.name}</span>
                      </div>
                      <div className="ml-14 h-[1px] bg-gray-100" />
                      <div className="flex items-center gap-3">
                        <span className="w-11 text-[10px] tracking-[0.1em] font-bold text-[#555]">MID</span>
                        <span className="flex-1 text-sm text-[#1A1A1A] font-medium">{perfume.subScent1.name}</span>
                      </div>
                      <div className="ml-14 h-[1px] bg-gray-100" />
                      <div className="flex items-center gap-3">
                        <span className="w-11 text-[10px] tracking-[0.1em] font-bold text-[#555]">BASE</span>
                        <span className="flex-1 text-sm text-[#1A1A1A] font-medium">{perfume.subScent2.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-2">MOOD</p>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.mood.split(',').map((m, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-medium text-[#1A1A1A] border border-gray-200"
                        >
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-6">
                    <p className="text-[10px] tracking-[0.15em] text-[#999] font-medium mb-2">WHY THIS PERFUME</p>
                    <div className="pl-3 border-l-2 border-[#BB0000]">
                      <p className="text-sm text-[#333] leading-relaxed">{reasoning}</p>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleCloseDetail}
                    className="w-full py-3 mt-2 border border-[#1A1A1A] text-[#1A1A1A] text-sm font-semibold tracking-wider active:bg-[#1A1A1A] active:text-white transition-colors duration-150"
                    style={serifFont}
                  >
                    CLOSE
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
