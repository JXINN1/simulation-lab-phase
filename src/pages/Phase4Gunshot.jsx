import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase4Gunshot = ({ onComplete }) => {
  const { language } = useLanguage()
  const [stage, setStage] = useState(0)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const containerRef = useRef(null)
  
  // Stages:
  // 0: White flash
  // 1: Red flash + shake starts
  // 2: Intense glitch + error
  // 3: Maximum chaos
  // 4: Fade to black

  useEffect(() => {
    const timers = [
      setTimeout(() => { setStage(1); setShakeIntensity(10); }, 100),
      setTimeout(() => { setStage(2); setShakeIntensity(20); }, 400),
      setTimeout(() => { setStage(3); setShakeIntensity(30); }, 1500),
      setTimeout(() => { setShakeIntensity(15); }, 3000),
      setTimeout(() => { setStage(4); setShakeIntensity(5); }, 4500),
      setTimeout(() => onComplete(), 6000),
    ]

    return () => timers.forEach(t => clearTimeout(t))
  }, [onComplete])

  // Screen shake effect
  useEffect(() => {
    if (shakeIntensity === 0) return
    
    const shakeInterval = setInterval(() => {
      if (containerRef.current) {
        const x = (Math.random() - 0.5) * shakeIntensity
        const y = (Math.random() - 0.5) * shakeIntensity
        containerRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
    }, 30)

    return () => {
      clearInterval(shakeInterval)
      if (containerRef.current) {
        containerRef.current.style.transform = 'translate(0, 0)'
      }
    }
  }, [shakeIntensity])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" ref={containerRef}>
      
      {/* Stage 0: Initial White Flash */}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: '#ffffff' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* Stage 1+: Red Flash & Pulse */}
      {stage >= 1 && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.8, 0.3, 0.6, 0.2, 0.5],
            background: [
              'rgba(255,0,0,0.9)',
              'rgba(255,0,64,0.5)',
              'rgba(255,0,0,0.7)',
              'rgba(200,0,0,0.4)',
              'rgba(255,0,64,0.6)',
            ]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}

      {/* Horizontal Glitch Lines */}
      {stage >= 2 && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full"
              style={{
                height: `${Math.random() * 8 + 2}px`,
                top: `${Math.random() * 100}%`,
                background: Math.random() > 0.5 
                  ? `rgba(255,0,${Math.floor(Math.random() * 100)},${Math.random() * 0.8 + 0.2})`
                  : `rgba(0,${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 100)},${Math.random() * 0.5})`,
                mixBlendMode: 'screen',
              }}
              animate={{
                x: [0, Math.random() * 200 - 100, Math.random() * -150, 0],
                scaleX: [1, Math.random() * 2 + 0.5, 1],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: Math.random() * 0.2 + 0.05,
                repeat: Infinity,
                repeatDelay: Math.random() * 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* RGB Split / Chromatic Aberration Effect */}
      {stage >= 2 && (
        <>
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            style={{ 
              background: 'rgba(255,0,0,0.1)',
              mixBlendMode: 'screen',
            }}
            animate={{ x: [-5, 5, -3, 4, 0] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            style={{ 
              background: 'rgba(0,0,255,0.1)',
              mixBlendMode: 'screen',
            }}
            animate={{ x: [5, -5, 3, -4, 0] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </>
      )}

      {/* Noise Overlay */}
      {stage >= 1 && (
        <motion.div
          className="fixed inset-0 z-60 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.15,
            mixBlendMode: 'overlay',
          }}
          animate={{ opacity: [0.1, 0.3, 0.1, 0.25, 0.15] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      )}

      {/* Scanlines - More Intense */}
      <div className="fixed inset-0 pointer-events-none z-70" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 2px)',
        animation: stage >= 2 ? 'scanlineMove 0.1s linear infinite' : 'none',
      }} />

      {/* Main Error Content */}
      <div className="min-h-screen flex items-center justify-center relative z-40">
        {stage >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.02, 0.98, 1.01, 1],
              rotate: [0, -0.5, 0.5, -0.3, 0],
            }}
            transition={{ 
              opacity: { duration: 0.3 },
              scale: { duration: 0.3, repeat: Infinity },
              rotate: { duration: 0.2, repeat: Infinity },
            }}
            className="text-center max-w-3xl px-6"
          >
            {/* Error Box */}
            <motion.div
              className="p-8 rounded-lg relative overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: '4px solid #ff0040',
                boxShadow: '0 0 100px rgba(255,0,64,0.8), inset 0 0 100px rgba(255,0,64,0.3)',
              }}
              animate={{
                borderColor: ['#ff0040', '#ff0000', '#ff0040', '#cc0030', '#ff0040'],
                boxShadow: [
                  '0 0 100px rgba(255,0,64,0.8), inset 0 0 100px rgba(255,0,64,0.3)',
                  '0 0 150px rgba(255,0,0,1), inset 0 0 150px rgba(255,0,0,0.5)',
                  '0 0 100px rgba(255,0,64,0.8), inset 0 0 100px rgba(255,0,64,0.3)',
                ],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {/* Glitch overlay inside box */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={`inner-${i}`}
                    className="absolute w-full bg-red-500"
                    style={{
                      height: '2px',
                      top: `${i * 10 + Math.random() * 10}%`,
                      opacity: 0.5,
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 0.2,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>

              {/* Warning Icon */}
              <motion.div
                className="text-6xl mb-6"
                animate={{ 
                  scale: [1, 1.3, 1, 1.2, 1],
                  rotate: [0, -10, 10, -5, 0],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                ⚠️
              </motion.div>

              {/* CRITICAL ERROR */}
              <motion.h1
                className="font-orbitron text-3xl md:text-5xl font-black mb-8 relative"
                style={{ color: '#ff0040' }}
                animate={{
                  textShadow: [
                    '0 0 20px #ff0040, 0 0 40px #ff0040, 0 0 80px #ff0040',
                    '5px 0 0 #00ffff, -5px 0 0 #ff00ff, 0 0 40px #ff0040',
                    '0 0 20px #ff0040, 0 0 40px #ff0040, 0 0 80px #ff0040',
                    '-3px 0 0 #00ffff, 3px 0 0 #ff00ff, 0 0 60px #ff0040',
                    '0 0 20px #ff0040, 0 0 40px #ff0040, 0 0 80px #ff0040',
                  ],
                  x: [0, -3, 5, -2, 3, 0],
                }}
                transition={{ duration: 0.15, repeat: Infinity }}
              >
                CRITICAL ERROR
              </motion.h1>

              {/* Error Messages */}
              <div className="space-y-3 font-mono text-base md:text-lg text-left relative z-10">
                <GlitchErrorLine delay={0}>
                  {'>'} SUBJECT_07 :: TERMINATED
                </GlitchErrorLine>
                <GlitchErrorLine delay={0.1}>
                  {'>'} NEURAL_LINK :: SEVERED
                </GlitchErrorLine>
                <GlitchErrorLine delay={0.2}>
                  {'>'} SIMULATION :: CORRUPTED
                </GlitchErrorLine>
                <GlitchErrorLine delay={0.3}>
                  {'>'} SYSTEM_INTEGRITY :: 0%
                </GlitchErrorLine>
              </div>

              {/* Fatal Message */}
              {stage >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 pt-6 border-t border-red-500/50"
                >
                  <motion.p
                    className="font-orbitron text-xl md:text-2xl font-bold"
                    style={{ color: '#ff0040' }}
                    animate={{
                      opacity: [1, 0.3, 1, 0.5, 1],
                      scale: [1, 1.05, 1, 1.03, 1],
                    }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  >
                    FATAL EXCEPTION
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Pre-error: Just flash */}
        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-8xl"
          >
            💥
          </motion.div>
        )}
      </div>

      {/* Stage 4: Fade to black */}
      {stage >= 4 && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      )}

      {/* CSS for scanline animation */}
      <style>{`
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(2px); }
        }
      `}</style>
    </div>
  )
}

// Glitch Error Line Component
const GlitchErrorLine = ({ children, delay = 0 }) => {
  return (
    <motion.p
      initial={{ opacity: 0, x: -50 }}
      animate={{ 
        opacity: 1, 
        x: [0, -5, 8, -3, 5, 0],
      }}
      transition={{ 
        opacity: { delay, duration: 0.2 },
        x: { delay: delay + 0.2, duration: 0.15, repeat: Infinity },
      }}
      style={{ color: '#ff0040' }}
      className="relative"
    >
      <motion.span
        animate={{
          textShadow: [
            '0 0 0 transparent',
            '3px 0 0 #00ffff, -3px 0 0 #ff00ff',
            '0 0 0 transparent',
            '-2px 0 0 #00ffff, 2px 0 0 #ff00ff',
            '0 0 0 transparent',
          ],
        }}
        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 }}
      >
        {children}
      </motion.span>
    </motion.p>
  )
}

export default Phase4Gunshot
