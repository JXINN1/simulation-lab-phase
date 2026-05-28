import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase3Intro = ({ onStart }) => {
  const { language } = useLanguage()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),   // Error text
      setTimeout(() => setStage(2), 2000),  // Instruction
      setTimeout(() => setStage(3), 3500),  // Button
    ]

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)'
      }} />

      {/* Red Pulsing Background */}
      <motion.div 
        className="fixed inset-0"
        animate={{ 
          background: [
            'radial-gradient(ellipse at center, #1a0000 0%, #000000 70%)',
            'radial-gradient(ellipse at center, #2a0505 0%, #000000 70%)',
            'radial-gradient(ellipse at center, #1a0000 0%, #000000 70%)'
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Glitch Lines */}
      <AnimatePresence>
        {stage >= 1 && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed left-0 right-0 pointer-events-none"
            style={{
              top: `${20 + i * 15}%`,
              height: '2px',
              background: '#ff0040',
              opacity: 0.5
            }}
            initial={{ scaleX: 0, x: '-100%' }}
            animate={{ 
              scaleX: [0, 1, 1, 0],
              x: ['-100%', '0%', '0%', '100%']
            }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 text-center max-w-4xl px-8">
        {/* Critical Error */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <motion.h1
                className="font-orbitron text-2xl md:text-4xl font-black mb-4"
                style={{ 
                  color: '#ff0040',
                  textShadow: '0 0 20px #ff0040, 0 0 40px #ff0040'
                }}
                animate={{ 
                  opacity: [1, 0.5, 1],
                  textShadow: [
                    '0 0 20px #ff0040, 0 0 40px #ff0040',
                    '0 0 40px #ff0040, 0 0 80px #ff0040',
                    '0 0 20px #ff0040, 0 0 40px #ff0040'
                  ]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                [CRITICAL ERROR]
              </motion.h1>
              
              <motion.p
                className="font-mono text-lg md:text-xl"
                style={{ color: '#ff6600' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {language === 'ko' 
                  ? 'UNAUTHORIZED DATA ACCESS ATTEMPT'
                  : 'UNAUTHORIZED DATA ACCESS ATTEMPT'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruction */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div 
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(255,0,64,0.1)',
                  border: '1px solid #ff004050'
                }}
              >
                <p className="font-mono text-sm mb-2" style={{ color: '#ff0040' }}>
                  {'>'} {language === 'ko' ? 'Admin 권한 탈취 시도 감지' : 'Admin privilege hijack attempt detected'}
                </p>
                <p className="font-mono text-lg" style={{ color: '#ff6600' }}>
                  {language === 'ko' 
                    ? '불안정 데이터(주민 일행)를 즉시 말소(Delete)하십시오.'
                    : 'Delete unstable data (Resident party) immediately.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.button
                onClick={onStart}
                className="px-12 py-5 font-orbitron font-bold text-xl rounded"
                style={{
                  background: 'linear-gradient(180deg, #330000, #1a0000)',
                  color: '#ff0040',
                  border: '2px solid #ff0040',
                  boxShadow: '0 0 30px rgba(255,0,64,0.5)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 50px rgba(255,0,64,0.8)'
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(255,0,64,0.5)',
                    '0 0 50px rgba(255,0,64,0.8)',
                    '0 0 30px rgba(255,0,64,0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚔️ {language === 'ko' ? 'SYSTEM CLEANUP 시작' : 'START SYSTEM CLEANUP'} ⚔️
              </motion.button>

              <motion.p
                className="font-mono text-xs mt-4"
                style={{ color: '#ff004060' }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {language === 'ko' ? '제한시간: 2분' : 'Time Limit: 2 minutes'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner Warnings */}
      <div className="fixed top-4 left-4 font-mono text-xs" style={{ color: '#ff004060' }}>
        ⚠ THREAT_LEVEL: MAXIMUM
      </div>
      <div className="fixed top-4 right-4 font-mono text-xs" style={{ color: '#ff004060' }}>
        PHASE 3: CLEANUP
      </div>
      <div className="fixed bottom-4 left-4 font-mono text-xs" style={{ color: '#ff004060' }}>
        TARGET: 5 HOSTILES
      </div>
      <motion.div 
        className="fixed bottom-4 right-4 font-mono text-xs"
        style={{ color: '#ff0040' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        ● COMBAT MODE
      </motion.div>
    </div>
  )
}

export default Phase3Intro
