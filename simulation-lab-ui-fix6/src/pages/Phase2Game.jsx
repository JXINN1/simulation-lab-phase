import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GaugeMiniGame from '../components/GaugeMiniGame'
import { useLanguage } from '../i18n/LanguageContext'

// 집 배치 좌표 (1080x432 캔버스 기준)
const HOUSE_POSITIONS = [
  { id: 1, nameKo: '입구', nameEn: 'Entrance', x: 30, y: 50, width: 180, height: 160, difficulty: 1 },
  { id: 2, nameKo: '상점', nameEn: 'Shop', x: 450, y: 30, width: 180, height: 170, difficulty: 2 },
  { id: 3, nameKo: '창고', nameEn: 'Storage', x: 870, y: 50, width: 180, height: 160, difficulty: 3 },
  { id: 4, nameKo: '덩굴집', nameEn: 'Vine House', x: 200, y: 250, width: 200, height: 160, difficulty: 4 },
  { id: 5, nameKo: '대저택', nameEn: 'Manor', x: 700, y: 230, width: 220, height: 180, difficulty: 5 },
]

// 난이도별 설정
const DIFFICULTY_SETTINGS = {
  1: { speed: 2, targetSize: 20 },
  2: { speed: 2.5, targetSize: 18 },
  3: { speed: 3, targetSize: 15 },
  4: { speed: 3.5, targetSize: 12 },
  5: { speed: 4, targetSize: 10 },
}

const Phase2Game = ({ onComplete, onFail }) => {
  const { language, t } = useLanguage()
  const [timeRemaining, setTimeRemaining] = useState(90)
  const [extinguished, setExtinguished] = useState({})
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [showGauge, setShowGauge] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)

  const getHouseName = (house) => {
    return language === 'en' ? house.nameEn : house.nameKo
  }

  useEffect(() => {
    if (timeRemaining <= 0) {
      onFail()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, onFail])

  useEffect(() => {
    if (completedCount >= 5) {
      setTimeout(() => onComplete(), 1000)
    }
  }, [completedCount, onComplete])

  const handleHouseClick = (house) => {
    if (extinguished[house.id]) return
    setSelectedHouse(house)
    setShowGauge(true)
  }

  const handleGaugeResult = useCallback((success) => {
    if (success && selectedHouse) {
      setExtinguished(prev => ({ ...prev, [selectedHouse.id]: true }))
      setCompletedCount(prev => prev + 1)
    } else {
      setTimeRemaining(prev => Math.max(0, prev - 5))
    }
    setShowGauge(false)
    setSelectedHouse(null)
  }, [selectedHouse])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      <div className="w-full max-w-4xl mb-4">
        <div className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{ 
            background: 'linear-gradient(180deg, #1a0a0a, #0a0505)',
            border: '1px solid #ff440050'
          }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <motion.span 
              className="font-orbitron text-2xl font-bold"
              style={{ color: timeRemaining <= 30 ? '#ff0040' : '#ff6600' }}
              animate={timeRemaining <= 30 ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {formatTime(timeRemaining)}
            </motion.span>
          </div>

          <h1 className="font-orbitron text-lg font-bold" style={{ color: '#ff4400' }}>
            {language === 'ko' ? '🔥 화재 진압 🔥' : '🔥 EMERGENCY PROTOCOL 🔥'}
          </h1>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm" style={{ color: '#00ff41' }}>
              {language === 'ko' ? '진압' : 'CONTAINED'}: {completedCount}/5
            </span>
            <div className="w-24 h-3 bg-void rounded overflow-hidden border border-terminal/30">
              <motion.div
                className="h-full bg-green-500"
                animate={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div 
        className="relative rounded-lg overflow-hidden"
        style={{ 
          width: '1080px', 
          height: '432px',
          background: '#0a0505',
          border: '2px solid #ff440030',
          boxShadow: '0 0 50px rgba(255,68,0,0.2)'
        }}
      >
        <img 
          src="/5houses.png" 
          alt="마을" 
          className="absolute inset-0 w-full h-full object-contain"
          style={{ opacity: 0.9 }}
        />

        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)'
        }} />

        {HOUSE_POSITIONS.map((house) => (
          <motion.div
            key={house.id}
            className="absolute cursor-pointer rounded-lg"
            style={{
              left: house.x,
              top: house.y,
              width: house.width,
              height: house.height,
              border: extinguished[house.id] 
                ? '3px solid #00ff41' 
                : '3px solid transparent',
              background: extinguished[house.id]
                ? 'rgba(0,255,65,0.1)'
                : 'transparent'
            }}
            whileHover={!extinguished[house.id] ? { 
              boxShadow: '0 0 30px rgba(255,100,0,0.8)',
              border: '3px solid #ff6600'
            } : {}}
            onClick={() => handleHouseClick(house)}
          >
            {!extinguished[house.id] && (
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                animate={{ 
                  y: [0, -5, 0, -3, 0],
                  scale: [1, 1.1, 1, 1.05, 1],
                  rotate: [0, 2, -2, 1, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <img 
                  src="/firepixel.png" 
                  alt="불" 
                  className="w-16 h-16 object-contain"
                  style={{ filter: 'brightness(1.2)' }}
                />
              </motion.div>
            )}

            <div 
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-mono whitespace-nowrap"
              style={{
                background: extinguished[house.id] ? '#00ff4120' : '#ff440020',
                color: extinguished[house.id] ? '#00ff41' : '#ff6600',
                border: `1px solid ${extinguished[house.id] ? '#00ff41' : '#ff6600'}50`
              }}
            >
              {extinguished[house.id] 
                ? (language === 'ko' ? '✓ 진압 완료' : '✓ Extinguished')
                : `🔥 ${getHouseName(house)}`}
            </div>

            {extinguished[house.id] && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center text-6xl"
              >
                ✅
              </motion.div>
            )}
          </motion.div>
        ))}

        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="font-mono text-sm" style={{ color: '#ff660080' }}>
            {language === 'ko' 
              ? '불타는 구역을 클릭하여 인터페이스를 활성화하십시오'
              : 'Click burning zones to activate interface'}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showGauge && selectedHouse && (
          <GaugeMiniGame
            difficulty={selectedHouse.difficulty}
            houseName={getHouseName(selectedHouse)}
            onResult={handleGaugeResult}
            onClose={() => {
              setShowGauge(false)
              setSelectedHouse(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Phase2Game
