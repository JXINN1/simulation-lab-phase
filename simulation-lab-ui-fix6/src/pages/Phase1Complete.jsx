import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase1Complete = ({ onContinue }) => {
  const { language } = useLanguage()
  const [phase, setPhase] = useState(0)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    setTimeout(() => setPhase(1), 1500)
    setTimeout(() => setPhase(2), 4000)
    setTimeout(() => setShowButton(true), 5500)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        background: phase === 0 ? '#200000' : '#050505',
        transition: 'background 0.5s'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-10" 
        style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)' }} />

      {/* Red flash overlay */}
      {phase === 0 && (
        <motion.div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(255, 0, 64, 0.3)' }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}

      <div className="relative z-20 text-center px-8">
        {/* SYSTEM SYNC 100% */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div 
            className="text-5xl md:text-6xl font-bold mb-2"
            style={{ 
              color: '#00ff41', 
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41'
            }}
          >
            SYSTEM SYNC
          </div>
          <div 
            className="text-7xl md:text-8xl font-bold"
            style={{ 
              color: '#00ff41', 
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 30px #00ff41, 0 0 60px #00ff41'
            }}
          >
            100%
          </div>
        </motion.div>

        {/* Critical Error */}
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div 
              className="inline-block px-8 py-4 rounded border-2"
              style={{ 
                backgroundColor: 'rgba(255, 0, 64, 0.2)',
                borderColor: '#ff0040'
              }}
            >
              <motion.div 
                className="text-2xl md:text-3xl font-bold"
                style={{ 
                  color: '#ff0040',
                  fontFamily: 'Orbitron, monospace',
                  textShadow: '0 0 10px #ff0040'
                }}
                animate={{ 
                  x: [0, -3, 3, -3, 0],
                  textShadow: [
                    '0 0 10px #ff0040',
                    '-3px 0 #00ffff, 3px 0 #ff0040',
                    '3px 0 #00ffff, -3px 0 #ff0040',
                    '0 0 10px #ff0040'
                  ]
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
              >
                [CRITICAL ERROR]
              </motion.div>
              <div 
                className="text-lg md:text-xl mt-2"
                style={{ color: '#ff4070', fontFamily: 'monospace' }}
              >
                UNIDENTIFIED ANOMALY IN CHURCH
              </div>
            </div>
          </motion.div>
        )}

        {/* New Mission */}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div 
              className="px-8 py-6 rounded-lg border"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: '#00ff4150'
              }}
            >
              <div className="text-lg" style={{ color: '#00ff41', fontFamily: 'monospace' }}>
                ▶ {language === 'ko' ? '새로운 지령' : 'NEW DIRECTIVE'}
              </div>
              <div className="text-xl md:text-2xl mt-3" style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                {language === 'ko' 
                  ? '교회로 이동하여 시스템을 제어하십시오.'
                  : 'Move to the church and take control of the system.'}
              </div>
              <div className="text-sm mt-4" style={{ color: '#ff6600', fontFamily: 'monospace' }}>
                {language === 'ko' 
                  ? '[ PHASE 2: 화재 진압 ]'
                  : '[ PHASE 2: FIRE SUPPRESSION ]'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="mt-8 px-8 py-4 font-orbitron font-bold text-lg rounded"
            style={{
              background: 'linear-gradient(180deg, #ff4400, #cc0000)',
              color: 'white',
              border: '2px solid #ff6600',
              boxShadow: '0 0 30px rgba(255,68,0,0.5)'
            }}
          >
            🔥 {language === 'ko' ? 'PHASE 2 시작' : 'START PHASE 2'}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default Phase1Complete
