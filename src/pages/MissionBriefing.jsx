import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const MissionBriefing = ({ onAccept }) => {
  const { language, t } = useLanguage()
  const [displayedText, setDisplayedText] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)

  const missionTextKo = [
    '> SYSTEM STATUS: CORRUPTED',
    '> INITIATING RECOVERY PROTOCOL...',
    '',
    '▶ 현재 구역의 객체들과 동기화하여',
    '  데이터를 복구하십시오.',
    '',
    '▶ 목표: 각 캐릭터와 대화하여',
    '  개별 동기화를 완료할 것.',
    '',
    '> AWAITING OPERATOR CONFIRMATION...',
  ]

  const missionTextEn = [
    '> SYSTEM STATUS: CORRUPTED',
    '> INITIATING RECOVERY PROTOCOL...',
    '',
    '▶ Synchronize with entities in the',
    '  current sector to recover data.',
    '',
    '▶ Objective: Complete individual sync',
    '  by conversing with each character.',
    '',
    '> AWAITING OPERATOR CONFIRMATION...',
  ]

  const missionText = language === 'ko' ? missionTextKo : missionTextEn

  useEffect(() => {
    setDisplayedText([])
    missionText.forEach((line, index) => {
      setTimeout(() => {
        setDisplayedText(prev => [...prev, line])
        
        if (index === missionText.length - 1) {
          setTimeout(() => setShowConfirm(true), 800)
        }
      }, 300 + index * 350)
    })
  }, [language])

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none" 
        style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)' }} />

      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(#00ff41 1px, transparent 1px),
            linear-gradient(90deg, #00ff41 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Mission Briefing Box */}
      <motion.div
        className="relative z-10 max-w-2xl w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="bg-black/90 border-2 rounded-lg overflow-hidden" style={{ borderColor: '#00ff41' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b" style={{ borderColor: '#00ff4150', background: 'rgba(0,255,65,0.1)' }}>
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#00ff41' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <h2 className="font-bold text-xl tracking-wider" style={{ color: '#00ff41', fontFamily: 'Orbitron, monospace' }}>
                MISSION BRIEFING
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-2 min-h-[280px]" style={{ fontFamily: 'monospace' }}>
              {displayedText.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg"
                  style={{ 
                    color: line.startsWith('>') ? '#00ff41' : 
                           line.startsWith('▶') ? '#ffffff' : 
                           '#00ff4190'
                  }}
                >
                  {line || '\u00A0'}
                </motion.div>
              ))}
              
              {displayedText.length > 0 && displayedText.length < missionText.length && (
                <span style={{ color: '#00ff41' }} className="animate-pulse">▌</span>
              )}
            </div>

            {/* Confirm Button */}
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <motion.button
                  onClick={onAccept}
                  className="group relative px-12 py-4 border-2 text-lg tracking-wider"
                  style={{ 
                    borderColor: '#00ff41', 
                    color: '#00ff41',
                    fontFamily: 'Orbitron, monospace',
                    background: 'transparent'
                  }}
                  whileHover={{ 
                    backgroundColor: '#00ff41',
                    color: '#000000',
                    boxShadow: '0 0 30px #00ff4150'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  [ ENTER ]
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-2 border-t" style={{ borderColor: '#00ff4130', background: 'rgba(0,255,65,0.05)' }}>
            <div className="flex justify-between text-sm" style={{ color: '#00ff4150', fontFamily: 'monospace' }}>
              <span>PHASE 1: SYNCHRONIZATION</span>
              <span>STATUS: PENDING</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MissionBriefing
