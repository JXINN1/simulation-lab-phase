import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase2Intro = ({ onStart }) => {
  const { language } = useLanguage()
  const [textIndex, setTextIndex] = useState(0)
  const [showButton, setShowButton] = useState(false)

  const messagesKo = [
    "⚠️ 시스템 이상 감지...",
    "🔥 교회 구역에서 화재 발생",
    "긴급: 제한 시간 내에 화재를 진압하십시오",
    "인터페이스를 활성화하여 불을 끄십시오"
  ]

  const messagesEn = [
    "⚠️ System anomaly detected...",
    "🔥 Fire outbreak in the church sector",
    "URGENT: Suppress the fire within the time limit",
    "Activate the interface to extinguish the flames"
  ]

  const messages = language === 'en' ? messagesEn : messagesKo

  useEffect(() => {
    if (textIndex < messages.length) {
      const timer = setTimeout(() => {
        setTextIndex(prev => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setTimeout(() => setShowButton(true), 500)
    }
  }, [textIndex, messages.length])

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      <div className="text-center max-w-2xl px-8">
        {/* Warning Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl mb-8"
        >
          🔥
        </motion.div>

        {/* Messages */}
        <div className="space-y-4 mb-12">
          {messages.slice(0, textIndex).map((msg, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-lg"
              style={{ 
                color: i === 0 ? '#ff0040' : i === 1 ? '#ff6600' : '#00ff41',
                textShadow: i < 2 ? '0 0 10px currentColor' : 'none'
              }}
            >
              {msg}
            </motion.p>
          ))}
        </div>

        {/* Start Button */}
        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-8 py-4 font-orbitron font-bold text-lg rounded"
            style={{
              background: 'linear-gradient(180deg, #ff4400, #cc0000)',
              color: 'white',
              border: '2px solid #ff6600',
              boxShadow: '0 0 30px rgba(255,68,0,0.5)'
            }}
          >
            🔥 {language === 'ko' ? '화재 진압 시작' : 'START FIRE SUPPRESSION'}
          </motion.button>
        )}

        {/* Glitch Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0, 0.1, 0, 0.05, 0],
            x: [0, -2, 2, -1, 0]
          }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          style={{ background: 'linear-gradient(90deg, transparent, #ff0040, transparent)' }}
        />
      </div>
    </div>
  )
}

export default Phase2Intro
