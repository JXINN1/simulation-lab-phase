import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

// 난이도별 설정
const DIFFICULTY_SETTINGS = {
  1: { speed: 2.5, targetSize: 22 },    // 쉬움
  2: { speed: 3, targetSize: 18 },
  3: { speed: 3.5, targetSize: 15 },
  4: { speed: 4, targetSize: 12 },
  5: { speed: 5, targetSize: 10 },      // 어려움
}

const GaugeMiniGame = ({ difficulty, houseName, onResult, onClose }) => {
  const { language } = useLanguage()
  const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS[1]
  
  const [barPosition, setBarPosition] = useState(0) // 0-100
  const [direction, setDirection] = useState(1)     // 1 or -1
  const [isStopped, setIsStopped] = useState(false)
  const [result, setResult] = useState(null)        // 'success' | 'fail' | null

  // 타겟 존 (중앙)
  const targetStart = 50 - settings.targetSize / 2
  const targetEnd = 50 + settings.targetSize / 2

  // 바 애니메이션
  useEffect(() => {
    if (isStopped) return

    const interval = setInterval(() => {
      setBarPosition(prev => {
        let next = prev + (direction * settings.speed)
        
        if (next >= 100) {
          setDirection(-1)
          return 100
        }
        if (next <= 0) {
          setDirection(1)
          return 0
        }
        
        return next
      })
    }, 16) // 60fps

    return () => clearInterval(interval)
  }, [direction, settings.speed, isStopped])

  // 클릭/스페이스 핸들러
  const handleStop = useCallback(() => {
    if (isStopped) return
    
    setIsStopped(true)
    
    const isSuccess = barPosition >= targetStart && barPosition <= targetEnd
    setResult(isSuccess ? 'success' : 'fail')
    
    // 1.5초 후 결과 전달
    setTimeout(() => {
      onResult(isSuccess)
    }, 1500)
  }, [barPosition, targetStart, targetEnd, isStopped, onResult])

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleStop()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleStop, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 p-6 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #1a0a0a, #0a0505)',
          border: '2px solid #ff660050',
          boxShadow: '0 0 50px rgba(255,100,0,0.3)',
          width: '400px'
        }}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-orbitron text-xl font-bold mb-2" style={{ color: '#ff6600' }}>
            🔥 {houseName} {language === 'ko' ? '진압' : 'Extinguish'}
          </h2>
          <p className="font-mono text-sm text-terminal/70">
            {language === 'ko' ? '타겟 존에 맞춰 클릭하세요!' : 'Click when bar reaches target zone!'}
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: '#ff4400' }}>
            {language === 'ko' ? '난이도' : 'Difficulty'}: {'★'.repeat(difficulty)}{'☆'.repeat(5 - difficulty)}
          </p>
        </div>

        {/* Gauge Bar */}
        <div className="relative h-16 mb-6 rounded overflow-hidden"
          style={{ 
            background: '#0a0a0a',
            border: '2px solid #333'
          }}
        >
          {/* Target Zone */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${targetStart}%`,
              width: `${settings.targetSize}%`,
              background: result === 'success' 
                ? 'rgba(0,255,65,0.4)' 
                : result === 'fail'
                  ? 'rgba(255,0,64,0.4)'
                  : 'rgba(0,255,65,0.2)',
              borderLeft: '2px solid #00ff41',
              borderRight: '2px solid #00ff41'
            }}
          />

          {/* Center Line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5"
            style={{ 
              left: '50%',
              background: '#00ff41',
              boxShadow: '0 0 10px #00ff41'
            }}
          />

          {/* Moving Bar */}
          <motion.div
            className="absolute top-1 bottom-1 w-3 rounded"
            style={{
              left: `calc(${barPosition}% - 6px)`,
              background: result === 'success' 
                ? '#00ff41' 
                : result === 'fail'
                  ? '#ff0040'
                  : 'linear-gradient(180deg, #ff6600, #ff4400)',
              boxShadow: result 
                ? `0 0 20px ${result === 'success' ? '#00ff41' : '#ff0040'}`
                : '0 0 15px #ff6600'
            }}
          />

          {/* Labels */}
          <div className="absolute bottom-1 left-2 text-xs font-mono text-terminal/30">0</div>
          <div className="absolute bottom-1 right-2 text-xs font-mono text-terminal/30">100</div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-4"
          >
            {result === 'success' ? (
              <div>
                <span className="text-4xl">✅</span>
                <p className="font-orbitron font-bold mt-2" style={{ color: '#00ff41' }}>
                  {language === 'ko' ? '진압 성공!' : 'Extinguished!'}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-4xl">❌</span>
                <p className="font-orbitron font-bold mt-2" style={{ color: '#ff0040' }}>
                  {language === 'ko' ? '실패! -5초' : 'Failed! -5 sec'}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Button */}
        {!isStopped && (
          <motion.button
            className="w-full py-4 font-orbitron font-bold text-lg rounded"
            style={{
              background: 'linear-gradient(180deg, #ff6600, #cc4400)',
              color: 'white',
              border: '2px solid #ff8800',
              boxShadow: '0 0 20px rgba(255,100,0,0.5)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStop}
          >
            {language === 'ko' ? '🔥 클릭 또는 SPACE' : '🔥 CLICK or SPACE'}
          </motion.button>
        )}

        {/* Instructions */}
        <p className="text-center font-mono text-xs text-terminal/40 mt-4">
          {language === 'ko' ? 'ESC로 취소' : 'ESC to cancel'}
        </p>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: '#ff6600' }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: '#ff6600' }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: '#ff6600' }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: '#ff6600' }} />
      </motion.div>
    </motion.div>
  )
}

export default GaugeMiniGame
