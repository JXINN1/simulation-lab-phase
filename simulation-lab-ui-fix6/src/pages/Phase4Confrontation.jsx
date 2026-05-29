import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const Phase4Confrontation = ({ onComplete }) => {
  const { language } = useLanguage()
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [showText, setShowText] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  const dialogues = language === 'ko' ? [
    { speaker: 'director', text: '역시... 괴물이었어.' },
    { speaker: 'director', text: '저 녀석이 뒤돌아 있어. 못 보고 있는 지금이 기회야.' },
    { speaker: 'director', text: '저 녀석 얼른 없애버려.' },
    { speaker: 'guard', text: '어떻게요?' },
    { speaker: 'director', text: '얼른 총으로 쏴.' },
    { speaker: 'guard', text: '...' },
  ] : [
    { speaker: 'director', text: 'Just as I thought... a monster.' },
    { speaker: 'director', text: "He's turned away. Now's our chance while he can't see us." },
    { speaker: 'director', text: 'Get rid of him. Now.' },
    { speaker: 'guard', text: 'How?' },
    { speaker: 'director', text: 'Shoot him.' },
    { speaker: 'guard', text: '...' },
  ]

  const speakerNames = {
    director: language === 'ko' ? '원장' : 'Director',
    guard: language === 'ko' ? '주민' : 'Resident'
  }

  const speakerColors = {
    director: '#ff0055',
    guard: '#ff9500'
  }

  // Start showing portraits after initial delay
  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Typing effect
  useEffect(() => {
    if (!showText || dialogueIndex >= dialogues.length) return

    const currentDialogue = dialogues[dialogueIndex]
    setIsTyping(true)
    setDisplayedText('')

    let charIndex = 0
    const typingInterval = setInterval(() => {
      if (charIndex < currentDialogue.text.length) {
        setDisplayedText(currentDialogue.text.slice(0, charIndex + 1))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 40)

    return () => clearInterval(typingInterval)
  }, [dialogueIndex, showText])

  const handleClick = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(dialogues[dialogueIndex].text)
      setIsTyping(false)
    } else if (dialogueIndex < dialogues.length - 1) {
      // Next dialogue
      setDialogueIndex(prev => prev + 1)
    } else {
      // Dialogue complete, trigger gunshot
      onComplete()
    }
  }

  const currentSpeaker = dialogues[dialogueIndex]?.speaker

  return (
    <motion.div
      className="min-h-screen bg-black flex flex-col items-center justify-center cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dark red ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(255,0,64,0.1) 0%, transparent 70%)'
      }} />

      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Portraits Container */}
      <div className="flex items-center justify-center gap-16 md:gap-32 mb-12">
        {/* Director Portrait */}
        <motion.div
          className="relative"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div 
            className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden"
            style={{ 
              border: `3px solid ${currentSpeaker === 'director' ? '#ff0055' : '#333'}`,
              boxShadow: currentSpeaker === 'director' ? '0 0 30px rgba(255,0,85,0.5)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <img 
              src="/portraits/director.png" 
              alt="Director"
              className="w-full h-full object-cover"
              style={{ filter: currentSpeaker === 'director' ? 'none' : 'brightness(0.5)' }}
            />
          </div>
          <p 
            className="text-center mt-2 font-mono text-sm"
            style={{ color: '#ff0055' }}
          >
            {speakerNames.director}
          </p>
        </motion.div>

        {/* VS or Confrontation Symbol */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ delay: 0.8 }}
          className="text-4xl"
          style={{ color: '#ff0040' }}
        >
          ⚔
        </motion.div>

        {/* Guard Portrait */}
        <motion.div
          className="relative"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div 
            className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden"
            style={{ 
              border: `3px solid ${currentSpeaker === 'guard' ? '#ff9500' : '#333'}`,
              boxShadow: currentSpeaker === 'guard' ? '0 0 30px rgba(255,149,0,0.5)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <img 
              src="/portraits/guard.png" 
              alt="Guard"
              className="w-full h-full object-cover"
              style={{ filter: currentSpeaker === 'guard' ? 'none' : 'brightness(0.5)' }}
            />
          </div>
          <p 
            className="text-center mt-2 font-mono text-sm"
            style={{ color: '#ff9500' }}
          >
            {speakerNames.guard}
          </p>
        </motion.div>
      </div>

      {/* Dialogue Box */}
      <AnimatePresence mode="wait">
        {showText && dialogueIndex < dialogues.length && (
          <motion.div
            key={dialogueIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl px-6"
          >
            <div 
              className="p-6 rounded-lg"
              style={{
                background: 'linear-gradient(180deg, rgba(20,0,0,0.9), rgba(10,0,0,0.95))',
                border: `1px solid ${speakerColors[currentSpeaker]}40`,
                boxShadow: `0 0 30px ${speakerColors[currentSpeaker]}20`
              }}
            >
              {/* Speaker Name */}
              <p 
                className="font-orbitron font-bold mb-3 text-sm"
                style={{ color: speakerColors[currentSpeaker] }}
              >
                {speakerNames[currentSpeaker]}
              </p>

              {/* Dialogue Text */}
              <p 
                className="font-mono text-lg md:text-xl leading-relaxed"
                style={{ color: '#ffffff' }}
              >
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ color: speakerColors[currentSpeaker] }}
                  >
                    _
                  </motion.span>
                )}
              </p>
            </div>

            {/* Click to continue hint */}
            {!isTyping && (
              <motion.p
                className="text-center mt-4 font-mono text-xs"
                style={{ color: '#ffffff40' }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {language === 'ko' ? '클릭하여 계속...' : 'Click to continue...'}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner Labels */}
      <div className="fixed top-4 left-4 font-mono text-xs" style={{ color: '#ff004040' }}>
        PHASE 4: CONFRONTATION
      </div>
      <div className="fixed top-4 right-4 font-mono text-xs" style={{ color: '#ff004040' }}>
        PROTOCOL: JUDGEMENT
      </div>
    </motion.div>
  )
}

export default Phase4Confrontation
