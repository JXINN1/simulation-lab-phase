import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const LandingPage = ({ onUnlock }) => {
  const { language, setLanguage } = useLanguage()
  const [showTransition, setShowTransition] = useState(false)
  const [bootSequence, setBootSequence] = useState(true)

  // 기본 언어 설정 (선택 안 했으면 ko)
  useEffect(() => {
    if (!language) {
      setLanguage('ko')
    }
  }, [language, setLanguage])

  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleAccessComplete = () => {
    setShowTransition(true)
  }

  const handleTransitionComplete = () => {
    onUnlock()
  }

  const bootMessages = [
    { text: 'INITIALIZING PROTOTYPE SYSTEM...', delay: 0 },
    { text: 'LOADING NEURAL INTERFACE...', delay: 400 },
    { text: 'WARNING: UNAUTHORIZED ACCESS', delay: 800, isWarning: true },
    { text: 'SYSTEM LOCKED', delay: 1400, isAlert: true },
  ]

  // 언어별 텍스트
  const getText = (key) => {
    const texts = {
      ko: {
        subtitle: 'PROTOTYPE — 첫 번째 장면 이전의 프리퀄 시뮬레이션',
        instruction: '보안 프로토콜 활성화. 인터페이스 수치가 100%에 도달할 때까지 유지하면 아카이브에 접속합니다.',
      },
      en: {
        subtitle: 'PROTOTYPE — A Prequel Simulation Before the First Scene',
        instruction: 'SECURITY PROTOCOL ACTIVE. HOLD THE INTERFACE UNTIL 100% TO ACCESS THE ARCHIVE.',
      }
    }
    return texts[language || 'ko'][key]
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#050505', color: '#00ff41' }}>
      {/* Matrix Rain */}
      <MatrixRain />
      
      {/* Vignette */}
      <div className="fixed inset-0 z-10 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse at center, transparent, rgba(5,5,5,0.8))' }} />
      
      {/* Scanlines */}
      <div className="fixed inset-0 z-20 pointer-events-none" 
        style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)' }} />
      
      {/* Glitch Transition */}
      <GlitchTransition isActive={showTransition} onComplete={handleTransitionComplete} />
      
      {/* Main Content */}
      <div className="relative z-30">
        <AnimatePresence mode="wait">
          <motion.div key="landing" className="min-h-screen flex flex-col items-center justify-center p-4" exit={{ opacity: 0 }}>
            <AnimatePresence mode="wait">
              {bootSequence ? (
                <motion.div key="boot" className="flex flex-col items-center gap-2" exit={{ opacity: 0, y: -20 }}>
                  {bootMessages.map((msg, i) => (
                    <motion.p key={i} className="text-sm tracking-wider"
                      style={{ 
                        color: msg.isAlert ? '#ff0055' : msg.isWarning ? 'rgba(255,0,85,0.7)' : 'rgba(0,255,65,0.7)', 
                        fontFamily: 'monospace',
                        textShadow: msg.isAlert ? '0 0 10px #ff0055' : 'none' 
                      }}
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: msg.delay / 1000 }}>
                      {'>'} {msg.text}
                    </motion.p>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="main" className="flex flex-col items-center gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Header */}
                  <motion.div className="text-center" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <motion.div className="flex items-center justify-center gap-2 mb-4" 
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs tracking-widest" style={{ color: '#ff0055', fontFamily: 'monospace' }}>SYSTEM LOCKED</span>
                    </motion.div>
                    
                    {/* Title - PROTOTYPE */}
                    <h1 className="text-5xl md:text-7xl font-black mb-2" 
                      style={{ 
                        color: '#00ff41', 
                        fontFamily: 'Orbitron, monospace', 
                        textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff41' 
                      }}>
                      PROTOTYPE
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-sm tracking-[0.3em] mt-4" style={{ color: 'rgba(0,255,65,0.6)', fontFamily: 'monospace' }}>
                      {getText('subtitle')}
                    </p>
                    
                    {/* Divider */}
                    <motion.div className="w-64 h-px mx-auto mt-6" 
                      style={{ background: 'linear-gradient(to right, transparent, rgba(0,255,65,0.5), transparent)' }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.8 }} />
                  </motion.div>

                  {/* Language Toggle */}
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={() => setLanguage('ko')}
                      className="px-4 py-2 rounded text-sm font-mono transition-all"
                      style={{
                        background: language === 'ko' ? 'rgba(0,255,65,0.2)' : 'transparent',
                        border: language === 'ko' ? '1px solid #00ff41' : '1px solid rgba(0,255,65,0.3)',
                        color: language === 'ko' ? '#00ff41' : 'rgba(0,255,65,0.5)',
                        boxShadow: language === 'ko' ? '0 0 15px rgba(0,255,65,0.3)' : 'none'
                      }}
                    >
                      한국어
                    </button>
                    <span className="text-terminal/30">/</span>
                    <button
                      onClick={() => setLanguage('en')}
                      className="px-4 py-2 rounded text-sm font-mono transition-all"
                      style={{
                        background: language === 'en' ? 'rgba(0,212,255,0.2)' : 'transparent',
                        border: language === 'en' ? '1px solid #00d4ff' : '1px solid rgba(0,212,255,0.3)',
                        color: language === 'en' ? '#00d4ff' : 'rgba(0,212,255,0.5)',
                        boxShadow: language === 'en' ? '0 0 15px rgba(0,212,255,0.3)' : 'none'
                      }}
                    >
                      ENGLISH
                    </button>
                  </motion.div>
                  
                  {/* Hold Button */}
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                    <HoldToAccessButton onComplete={handleAccessComplete} />
                  </motion.div>
                  
                  {/* Instructions - 언어별 변경 */}
                  <motion.p 
                    key={language}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center max-w-md" 
                    style={{ color: 'rgba(0,255,65,0.4)', fontFamily: 'monospace' }}
                  >
                    {getText('instruction')}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <p className="text-xs tracking-widest" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'monospace' }}>
          SYS.PROTO.v2.0.47 // SIMULATION_INTERFACE
        </p>
      </div>
    </div>
  )
}

// Matrix Rain Background
const MatrixRain = () => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const chars = 'アイウエオ0123456789ABCDEF@#$%'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops = Array(columns).fill(1)
    
    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#00ff41'
      ctx.font = `${fontSize}px monospace`
      ctx.shadowBlur = 5
      ctx.shadowColor = '#00ff41'
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5 + Math.random() * 0.5
      }
    }
    
    const interval = setInterval(draw, 50)
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', handleResize)
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize) }
  }, [])
  
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-30" />
}

// Hold to Access Button
const HoldToAccessButton = ({ onComplete }) => {
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const containerControls = useAnimation()

  const handleStart = useCallback((e) => {
    e.preventDefault()
    if (isComplete) return
    setIsHolding(true)
    startTimeRef.current = Date.now() - (progress * 3000)
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min(elapsed / 3000, 1)
      setProgress(newProgress)
      
      if (newProgress > 0.7) {
        const intensity = (newProgress - 0.7) / 0.3 * 5
        containerControls.start({
          x: [0, -intensity, intensity, -intensity, intensity, 0],
          transition: { duration: 0.1, repeat: Infinity }
        })
      }
      
      if (newProgress >= 1) {
        clearInterval(intervalRef.current)
        setIsComplete(true)
        setIsHolding(false)
        containerControls.stop()
        containerControls.set({ x: 0 })
        setTimeout(() => onComplete?.(), 500)
      }
    }, 16)
  }, [progress, isComplete, containerControls, onComplete])

  const handleEnd = useCallback(() => {
    if (isComplete) return
    setIsHolding(false)
    clearInterval(intervalRef.current)
    containerControls.stop()
    containerControls.set({ x: 0 })
    const depleteInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) { clearInterval(depleteInterval); return 0 }
        return prev - 0.06
      })
    }, 16)
  }, [isComplete, containerControls])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress * circumference)
  const getColor = () => progress < 0.5 ? '#00ff41' : progress < 0.8 ? '#00d4ff' : '#ff0055'

  return (
    <motion.div animate={containerControls} className="relative flex flex-col items-center gap-8">
      {/* Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ 
          width: 220, height: 220, left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          boxShadow: isHolding ? `0 0 ${30 + progress * 50}px ${getColor()}40` : '0 0 20px rgba(0,255,65,0.1)' 
        }}
        animate={{ scale: isHolding ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.5, repeat: isHolding ? Infinity : 0 }}
      />
      
      {/* Button */}
      <motion.button
        className="relative w-[200px] h-[200px] rounded-full cursor-pointer select-none"
        style={{ 
          background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #050505 100%)', 
          border: '2px solid rgba(0,255,65,0.3)', 
          touchAction: 'none' 
        }}
        onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
        onTouchStart={handleStart} onTouchEnd={handleEnd} disabled={isComplete}
      >
        {/* SVG Ring */}
        <svg className="absolute inset-0 -rotate-90" width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(0,255,65,0.1)" strokeWidth="4" />
          <circle cx="100" cy="100" r={radius} fill="none" stroke={getColor()} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 10px ${getColor()})` }} />
          {[...Array(24)].map((_, i) => (
            <line key={i} x1="100" y1="30" x2="100" y2="35"
              stroke={(i / 24) <= progress ? getColor() : 'rgba(0,255,65,0.2)'}
              strokeWidth="2" transform={`rotate(${(i / 24) * 360} 100 100)`} />
          ))}
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-bold text-center whitespace-pre-line" 
              style={{ color: '#00ff41', textShadow: '0 0 20px #00ff41', fontFamily: 'Orbitron, monospace' }}>
              ACCESS{'\n'}GRANTED
            </motion.span>
          ) : (
            <>
              <motion.div className="text-4xl font-bold" 
                style={{ 
                  color: getColor(), 
                  fontFamily: 'Orbitron, monospace',
                  textShadow: isHolding ? `0 0 20px ${getColor()}` : '0 0 10px rgba(0,255,65,0.5)' 
                }}>
                {Math.round(progress * 100)}%
              </motion.div>
              <motion.div className="mt-2 text-xs tracking-wider" 
                style={{ color: 'rgba(0,255,65,0.6)', fontFamily: 'monospace' }}
                animate={{ opacity: isHolding ? [0.6, 1, 0.6] : 0.6 }}
                transition={{ duration: 0.5, repeat: isHolding ? Infinity : 0 }}>
                {isHolding ? 'BREACHING...' : 'HOLD TO ACCESS'}
              </motion.div>
            </>
          )}
        </div>
      </motion.button>
      
      {/* Status Text */}
      <motion.p className="text-xs tracking-widest" style={{ color: 'rgba(0,255,65,0.5)', fontFamily: 'monospace' }}
        animate={{ opacity: isHolding ? [0.5, 0.8, 0.5] : 0.5 }} transition={{ duration: 1, repeat: Infinity }}>
        {isComplete ? 'INITIALIZING SYSTEM...' : isHolding ? `SECURITY BYPASS: ${Math.round(progress * 100)}%` : 'AUTHENTICATION REQUIRED'}
      </motion.p>
      
      {/* Warning */}
      {progress > 0.7 && !isComplete && (
        <motion.p className="absolute -bottom-16 text-xs tracking-wider" style={{ color: '#ff0055', fontFamily: 'monospace' }}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
          transition={{ opacity: { duration: 0.3, repeat: Infinity } }}>
          ⚠ WARNING: SECURITY BREACH IMMINENT
        </motion.p>
      )}
    </motion.div>
  )
}

// Glitch Transition
const GlitchTransition = ({ isActive, onComplete }) => {
  const [phase, setPhase] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 500)
    const t3 = setTimeout(() => setPhase(3), 1200)
    const t4 = setTimeout(() => { setPhase(4); onComplete?.() }, 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [isActive, onComplete])

  if (!isActive) return null
  
  return (
    <motion.div className="fixed inset-0 z-50 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {phase >= 1 && [...Array(10)].map((_, i) => (
        <motion.div key={i} className="absolute left-0 right-0" 
          style={{ background: 'rgba(0,255,65,0.2)', height: `${Math.random()*5+1}%`, top: `${i*10}%` }}
          animate={{ x: [0, 50, -50, 50, 0], opacity: [0, 1, 0.5, 1, 0] }} 
          transition={{ duration: 0.2, repeat: phase < 3 ? Infinity : 0 }} />
      ))}
      {phase >= 2 && (
        <>
          <motion.div className="absolute inset-0" style={{ background: 'rgba(255,0,0,0.1)', mixBlendMode: 'screen' }}
            animate={{ x: [-10, 10, -5, 15, -10] }} transition={{ duration: 0.1, repeat: phase < 3 ? Infinity : 0 }} />
          <motion.div className="absolute inset-0" style={{ background: 'rgba(0,0,255,0.1)', mixBlendMode: 'screen' }}
            animate={{ x: [10, -10, 5, -15, 10] }} transition={{ duration: 0.1, repeat: phase < 3 ? Infinity : 0 }} />
        </>
      )}
      {phase >= 3 && <motion.div className="absolute inset-0" style={{ background: '#00ff41' }}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.8, 1, 0] }} transition={{ duration: 0.5 }} />}
      {phase >= 2 && phase < 4 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div className="text-6xl md:text-8xl font-black" 
            style={{ color: '#00ff41', fontFamily: 'Orbitron, monospace',
              textShadow: '-2px 0 #ff0055, 2px 0 #00d4ff, 0 0 40px #00ff41' }}
            animate={{ x: [0, -20, 20, -10, 10, 0], opacity: [1, 0.5, 1, 0.3, 1, 1] }} 
            transition={{ duration: 0.15, repeat: Infinity }}>
            BREACH
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default LandingPage
