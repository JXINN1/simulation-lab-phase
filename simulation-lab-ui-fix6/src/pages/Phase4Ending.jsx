import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase4Ending = ({ onRestart }) => {
  const { language } = useLanguage()
  const [stage, setStage] = useState(0)
  const [showButton, setShowButton] = useState(false)

  // Film link - PROTOTYPE YouTube video
  const FILM_URL = 'https://www.youtube.com/watch?v=iOg9nU_pXhs'

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3500),
      setTimeout(() => setShowButton(true), 5000),
    ]

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  const handleWatchFilm = () => {
    window.open(FILM_URL, '_blank')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Subtle ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,255,65,0.05) 0%, transparent 60%)'
        }}
      />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Main Content */}
      <div className="text-center max-w-2xl px-6 z-10">
        
        {/* Protocol Message */}
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <motion.p
              className="font-mono text-sm md:text-base mb-2"
              style={{ color: '#00ff4180' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {'>'} EMERGENCY_PROTOCOL :: ACTIVATED
            </motion.p>
            <motion.p
              className="font-mono text-sm md:text-base"
              style={{ color: '#00ff4180' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              {'>'} SYSTEM_RELOAD :: REQUIRED
            </motion.p>
          </motion.div>
        )}

        {/* PROTOTYPE Title */}
        {stage >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h1
              className="font-orbitron text-4xl md:text-6xl font-black tracking-wider"
              style={{ 
                color: '#00ff41',
                textShadow: '0 0 30px #00ff41, 0 0 60px #00ff41'
              }}
              animate={{
                textShadow: [
                  '0 0 30px #00ff41, 0 0 60px #00ff41',
                  '0 0 50px #00ff41, 0 0 100px #00ff41',
                  '0 0 30px #00ff41, 0 0 60px #00ff41',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              PROTOTYPE
            </motion.h1>
          </motion.div>
        )}

        {/* Story continues message */}
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="mb-12"
          >
            <p 
              className="font-mono text-lg md:text-xl italic"
              style={{ color: '#ffffff80' }}
            >
              {language === 'ko' 
                ? '"이야기는 계속됩니다..."'
                : '"The story continues..."'}
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Watch Film Button */}
            <motion.button
              onClick={handleWatchFilm}
              className="w-full max-w-sm mx-auto px-8 py-5 font-orbitron font-bold text-lg rounded block"
              style={{
                background: 'linear-gradient(180deg, #0a1a0a, #051005)',
                color: '#00ff41',
                border: '2px solid #00ff41',
                boxShadow: '0 0 30px rgba(0,255,65,0.3)'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 50px rgba(0,255,65,0.5)'
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 0 30px rgba(0,255,65,0.3)',
                  '0 0 50px rgba(0,255,65,0.5)',
                  '0 0 30px rgba(0,255,65,0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="flex items-center justify-center gap-3">
                <span>▶</span>
                <span>{language === 'ko' ? '영화 보기' : 'WATCH THE FILM'}</span>
              </span>
            </motion.button>

            {/* Restart Button */}
            <motion.button
              onClick={onRestart}
              className="w-full max-w-sm mx-auto px-6 py-3 font-mono text-sm rounded block"
              style={{
                background: 'transparent',
                color: '#ffffff40',
                border: '1px solid #ffffff20',
              }}
              whileHover={{ 
                color: '#ffffff80',
                borderColor: '#ffffff40',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {language === 'ko' ? '처음부터 다시 시작' : 'Restart from beginning'}
            </motion.button>
          </motion.div>
        )}

        {/* Loading indicator before buttons */}
        {stage >= 3 && !showButton && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" style={{ animationDelay: '0.4s' }} />
          </motion.div>
        )}
      </div>

      {/* Corner decorations */}
      <motion.div 
        className="fixed top-4 left-4 font-mono text-xs"
        style={{ color: '#00ff4130' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        PHASE 4: COMPLETE
      </motion.div>
      <motion.div 
        className="fixed top-4 right-4 font-mono text-xs"
        style={{ color: '#00ff4130' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        PROTOCOL: RELOAD
      </motion.div>
      <motion.div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-xs"
        style={{ color: '#00ff4130' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        SYS.PROTO.v2.0.47 // END_SEQUENCE
      </motion.div>

      {/* Film strip decoration */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent, #00ff41, transparent)'
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 4, duration: 1 }}
      />
    </div>
  )
}

export default Phase4Ending
