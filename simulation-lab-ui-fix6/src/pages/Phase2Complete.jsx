import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase2Complete = ({ onContinue }) => {
  const { language } = useLanguage()
  const [stage, setStage] = useState(0)

  const messagesKo = [
    { text: "🔥 화재 진압 완료", color: '#00ff41', delay: 0 },
    { text: "...", color: '#666', delay: 1500 },
    { text: "누군가 지켜보고 있었다", color: '#ff0040', delay: 3000 },
    { text: "원장과 주민이 이 장면을 목격했다...", color: '#ff0040', delay: 5000 },
  ]

  const messagesEn = [
    { text: "🔥 Fire suppression complete", color: '#00ff41', delay: 0 },
    { text: "...", color: '#666', delay: 1500 },
    { text: "Someone was watching", color: '#ff0040', delay: 3000 },
    { text: "The Director and Resident witnessed this...", color: '#ff0040', delay: 5000 },
  ]

  const messages = language === 'en' ? messagesEn : messagesKo

  useEffect(() => {
    const timers = messages.map((_, index) => {
      return setTimeout(() => {
        setStage(index + 1)
      }, messages[index].delay)
    })

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Red Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,0,64,0.2) 100%)'
      }} />

      <div className="text-center max-w-2xl px-8">
        {/* Messages */}
        <div className="space-y-6 mb-12 min-h-[200px]">
          {messages.slice(0, stage).map((msg, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-mono text-xl"
              style={{ 
                color: msg.color,
                textShadow: msg.color === '#ff0040' ? '0 0 20px #ff0040' : 'none'
              }}
            >
              {msg.text}
            </motion.p>
          ))}
        </div>

        {/* Witnesses */}
        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-8 mb-12"
          >
            {/* 원장 */}
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden border-2 mb-2 mx-auto"
                style={{ borderColor: '#ff0055' }}
              >
                <img 
                  src="/portraits/director.png" 
                  alt="Director"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-mono text-sm" style={{ color: '#ff0055' }}>
                {language === 'ko' ? '원장' : 'Director'}
              </p>
              <p className="font-mono text-xs text-terminal/50 mt-1">
                {language === 'ko' ? '"...점마가..."' : '"...that thing..."'}
              </p>
            </div>

            {/* 주민 */}
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden border-2 mb-2 mx-auto"
                style={{ borderColor: '#ff9500' }}
              >
                <img 
                  src="/portraits/guard.png" 
                  alt="Resident"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-mono text-sm" style={{ color: '#ff9500' }}>
                {language === 'ko' ? '주민' : 'Resident'}
              </p>
              <p className="font-mono text-xs text-terminal/50 mt-1">
                {language === 'ko' ? '"...봤어."' : '"...I saw it."'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Warning */}
        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.p
              className="font-mono text-sm mb-8"
              style={{ color: '#ff004080' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️ {language === 'ko' ? '캐릭터 상태가 변경되었습니다' : 'Character status has changed'} ⚠️
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="px-8 py-4 font-orbitron font-bold rounded"
              style={{
                background: 'linear-gradient(180deg, #1a0a0a, #0a0505)',
                color: '#ff0040',
                border: '2px solid #ff0040',
                boxShadow: '0 0 30px rgba(255,0,64,0.3)'
              }}
            >
              {language === 'ko' ? '계속하기...' : 'Continue...'}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Glitch Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{
          opacity: [0, 0.1, 0, 0.15, 0],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ 
          background: 'linear-gradient(90deg, transparent, #ff0040, transparent)',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  )
}

export default Phase2Complete
