'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface PerfumeBottleProps {
  perfumeName: string
  index: number
  onOpen: () => void
}

export function PerfumeBottle({ perfumeName, index, onOpen }: PerfumeBottleProps) {
  const [isOpened, setIsOpened] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const handleClick = () => {
    if (isOpening) return

    // Already opened → just reopen the popup
    if (isOpened) {
      onOpen()
      return
    }

    // First time opening → play animation then open popup
    setIsOpening(true)
    setTimeout(() => {
      setIsOpened(true)
      setIsOpening(false)
      onOpen()
    }, 600)
  }

  const displayNumber = String(index + 1).padStart(2, '0')

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.96 }}
      className="relative flex-1 max-w-[100px] aspect-[3/4] cursor-pointer"
    >
      {/* Main Box */}
      <motion.div
        className="absolute inset-0 border-2 flex flex-col items-center justify-center"
        style={{
          borderColor: isOpened ? '#BB0000' : '#1A1A1A',
          backgroundColor: isOpened ? '#FAFAFA' : '#FFFFFF',
        }}
        animate={isOpening ? {
          scale: [1, 1.05, 0.97, 1.02, 1],
          borderColor: ['#1A1A1A', '#BB0000', '#BB0000'],
        } : {}}
        transition={isOpening ? { duration: 0.6, ease: 'easeInOut' } : {}}
      >
        {/* Red corner brackets (viewfinder motif) */}
        <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#BB0000]" />
        <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#BB0000]" />
        <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#BB0000]" />
        <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#BB0000]" />

        {/* Content by state */}
        {isOpened ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#BB0000]"
                  style={{ fontFamily: 'Times New Roman, serif' }}>{displayNumber}</span>
            <span className="text-[9px] text-[#BB0000] tracking-wider font-semibold">TAP TO VIEW</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#1A1A1A]"
                  style={{ fontFamily: 'Times New Roman, serif' }}>{displayNumber}</span>
            <span className="text-[9px] text-gray-500 tracking-wider">TAP TO OPEN</span>
          </div>
        )}

        {/* Seal line (unopened only) */}
        {!isOpened && (
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-[#1A1A1A]"
            style={{ top: '25%' }}
            animate={isOpening ? { scaleX: [1, 0], opacity: [1, 0] } : {}}
            transition={{ duration: 0.4, ease: 'easeIn' }}
          />
        )}
      </motion.div>

      {/* Subtle shine sweep (unopened only) */}
      {!isOpened && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(187,0,0,0.06) 50%, transparent 60%)',
          }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Opening particle effect (subtle red lines) */}
      <AnimatePresence>
        {isOpening && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-[1px] h-3 bg-[#BB0000]"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'center',
                  rotate: `${i * 90}deg`,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0], y: [0, -20] }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
