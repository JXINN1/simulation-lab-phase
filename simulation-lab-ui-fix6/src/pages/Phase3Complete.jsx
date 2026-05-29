import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase3Complete = ({ onContinue }) => {
  const { language } = useLanguage()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => setStage(4), 6000),
    ]

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Green success glow */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,255,65,0.1) 0%, transparent 70%)'
        }}
      />

      <div className="text-center max-w-2xl px-8">
        {/* Recovery Complete */}
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <motion.h1
              className="font-orbitron text-3xl md:text-5xl font-black mb-4"
              style={{ 
                color: '#00ff41',
                textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41'
              }}
              animate={{ 
                textShadow: [
                  '0 0 20px #00ff41, 0 0 40px #00ff41',
                  '0 0 40px #00ff41, 0 0 80px #00ff41',
                  '0 0 20px #00ff41, 0 0 40px #00ff41'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              SYSTEM ERROR RECOVERY
            </motion.h1>
            <motion.p
              className="font-orbitron text-2xl md:text-3xl font-bold"
              style={{ color: '#00ff41' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              COMPLETE
            </motion.p>
          </motion.div>
        )}

        {/* Progress Bar Complete */}
        {stage >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="w-64 h-4 mx-auto bg-void rounded overflow-hidden border border-terminal/30">
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #00ff41, #00d4ff)' }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <p className="font-mono text-sm mt-2" style={{ color: '#00ff41' }}>
              100% {language === 'ko' ? '완료' : 'COMPLETE'}
            </p>
          </motion.div>
        )}

        {/* Status Messages */}
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 mb-8"
          >
            <p className="font-mono text-sm" style={{ color: '#00ff4180' }}>
              {'>'} {language === 'ko' ? '불안정 데이터 삭제 완료' : 'Unstable data deleted'}
            </p>
            <p className="font-mono text-sm" style={{ color: '#00ff4180' }}>
              {'>'} {language === 'ko' ? '시스템 안정화 완료' : 'System stabilized'}
            </p>
            <p className="font-mono text-sm" style={{ color: '#00ff4180' }}>
              {'>'} {language === 'ko' ? 'Admin 권한 복구 완료' : 'Admin privileges restored'}
            </p>
          </motion.div>
        )}

        {/* Eliminated Count */}
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-4 mb-12"
          >
            {[1, 2, 3, 4, 5].map((_, i) => (
              <motion.div
                key={i}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,0,64,0.2)',
                  border: '2px solid #ff0040'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-xl">❌</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Continue Button */}
        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.p
              className="font-mono text-sm mb-6"
              style={{ color: '#00d4ff80' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {language === 'ko' 
                ? '⚠️ 새로운 데이터 흐름 감지...'
                : '⚠️ New data flow detected...'}
            </motion.p>

            <motion.button
              onClick={onContinue}
              className="px-10 py-5 font-orbitron font-bold text-lg rounded"
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
            >
              {language === 'ko' ? '다음 단계로...' : 'Continue to next phase...'}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Corner decorations */}
      <div className="fixed top-4 left-4 font-mono text-xs" style={{ color: '#00ff4140' }}>
        PHASE 3: COMPLETE
      </div>
      <div className="fixed top-4 right-4 font-mono text-xs" style={{ color: '#00ff4140' }}>
        THREATS: ELIMINATED
      </div>
      <motion.div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-xs"
        style={{ color: '#00ff4160' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        SYS.PROTO.v2.0.47 // CLEANUP_PROTOCOL
      </motion.div>
    </div>
  )
}

export default Phase3Complete
