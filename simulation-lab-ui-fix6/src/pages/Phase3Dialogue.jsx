import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

// 대화 시퀀스
const DIALOGUES_KO = [
  {
    speaker: 'director',
    name: '원장',
    color: '#ff0055',
    text: "내가 지금 똑똑히 본 기여? 손가락 몇 번 까딱거렸다고 그 무시무시한 불길이 잡히는 게... 저게 정녕 사람이 할 짓이여?"
  },
  {
    speaker: 'guard',
    name: '주민',
    color: '#ff9500',
    text: "네, 저도 봤습니다. 상식적으로 말이 안 돼요. 저 녀석... 눈앞에 이상한걸 띄워놓고 마법이라도 부리는 것 같았습니다."
  },
  {
    speaker: 'director',
    name: '원장',
    color: '#ff0055',
    text: "아녀, 아녀. 저 놈 가슴팍에서 나왔다 들어갔다 하던 그 머시깽이 못 봤어? 그게 일종의 리모컨 같은 거여. 저 쬐깐한 물건 하나로 세상을 지 맘대로 주무르는 거라니께!"
  },
  {
    speaker: 'guard',
    name: '주민',
    color: '#ff9500',
    text: "사람의 힘이 아닙니다. 저건 괴물이에요. 원장님, 저놈을 살려두면 우리가 위험합니다."
  },
  {
    speaker: 'director',
    name: '원장',
    color: '#ff0055',
    text: "괴물은 무슨 얼어 죽을 괴물이여! 저 리모컨만 있으면 이 지옥 같은 17구역도 다 내 손아귀에 들어오는 겨! 주민아, 저 놈 절대 놓치지 마라. 무슨 수를 써서라도 뺏어와야 쓰겄어. 정 안 되믄... 그냥 죽여서라도 가져와! 어차피 점마는 사람이 아녀, 짐승이라니께!"
  },
  {
    speaker: 'guard',
    name: '주민',
    color: '#ff9500',
    text: "들었지? 저 녀석은 살아있는 인간이 아니라 시스템 오류일 뿐이다. 겁먹지 마라. 죽여도 피 한 방울 안 날 거다. 당장 덮쳐!"
  },
  {
    speaker: 'minions',
    name: '주민 일행',
    color: '#ff6600',
    text: "꼬맹아, 편하게 죽고 싶으면 그 가슴에 든 거 내놓고 꺼져라!"
  }
]

const DIALOGUES_EN = [
  {
    speaker: 'director',
    name: 'Director',
    color: '#ff0055',
    text: "Did I just see that right? That terrifying inferno was put out with just a few finger movements... Is that even humanly possible?"
  },
  {
    speaker: 'guard',
    name: 'Resident',
    color: '#ff9500',
    text: "Yes, I saw it too. It makes no sense. That kid... he had some strange thing floating in front of him, like he was casting magic."
  },
  {
    speaker: 'director',
    name: 'Director',
    color: '#ff0055',
    text: "No, no. Didn't you see that thing going in and out of his chest? It's like some kind of remote control. That tiny thing lets him control the whole world as he pleases!"
  },
  {
    speaker: 'guard',
    name: 'Resident',
    color: '#ff9500',
    text: "That's not human power. That's a monster. Sir, if we let him live, we'll all be in danger."
  },
  {
    speaker: 'director',
    name: 'Director',
    color: '#ff0055',
    text: "Monster? What monster! With that remote, this hellhole Sector 17 would be completely under my control! Resident, don't let that thing escape. Get it by any means necessary. If you can't... just kill him and take it! He's not human anyway, just a beast!"
  },
  {
    speaker: 'guard',
    name: 'Resident',
    color: '#ff9500',
    text: "You heard him. That thing isn't a living human - it's just a system error. Don't be afraid. There won't be a single drop of blood. Attack now!"
  },
  {
    speaker: 'minions',
    name: 'Residents',
    color: '#ff6600',
    text: "Hey kid, if you want an easy death, hand over what's in your chest and disappear!"
  }
]

const Phase3Dialogue = ({ onComplete }) => {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [displayedText, setDisplayedText] = useState('')

  const dialogues = language === 'en' ? DIALOGUES_EN : DIALOGUES_KO
  const currentDialogue = dialogues[currentIndex]

  // 타이핑 효과
  useEffect(() => {
    if (!currentDialogue) return
    
    setIsTyping(true)
    setDisplayedText('')
    
    const text = currentDialogue.text
    let charIndex = 0
    
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 30) // 타이핑 속도

    return () => clearInterval(typeInterval)
  }, [currentIndex, currentDialogue])

  // 다음 대화로
  const handleNext = () => {
    if (isTyping) {
      // 타이핑 중이면 전체 텍스트 표시
      setDisplayedText(currentDialogue.text)
      setIsTyping(false)
    } else if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // 모든 대화 완료
      onComplete()
    }
  }

  // 클릭 또는 스페이스로 진행
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleNext()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, isTyping])

  return (
    <div 
      className="min-h-screen bg-void flex flex-col items-center justify-center cursor-pointer"
      onClick={handleNext}
    >
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Red Warning Vignette */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,64,0.3) 100%)'
        }}
      />

      {/* Character Portraits */}
      <div className="flex justify-center gap-12 mb-8">
        {/* 원장 */}
        <motion.div 
          className="text-center"
          animate={{ 
            scale: currentDialogue?.speaker === 'director' ? 1.1 : 0.9,
            opacity: currentDialogue?.speaker === 'director' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="w-24 h-24 rounded-full overflow-hidden border-4 mx-auto"
            style={{ 
              borderColor: currentDialogue?.speaker === 'director' ? '#ff0055' : '#333',
              boxShadow: currentDialogue?.speaker === 'director' ? '0 0 30px #ff0055' : 'none'
            }}
          >
            <img src="/portraits/director.png" alt="Director" className="w-full h-full object-cover" />
          </div>
          <p className="font-mono text-sm mt-2" style={{ color: '#ff0055' }}>
            {language === 'ko' ? '원장' : 'Director'}
          </p>
        </motion.div>

        {/* 주민 */}
        <motion.div 
          className="text-center"
          animate={{ 
            scale: (currentDialogue?.speaker === 'guard' || currentDialogue?.speaker === 'minions') ? 1.1 : 0.9,
            opacity: (currentDialogue?.speaker === 'guard' || currentDialogue?.speaker === 'minions') ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="w-24 h-24 rounded-full overflow-hidden border-4 mx-auto"
            style={{ 
              borderColor: (currentDialogue?.speaker === 'guard' || currentDialogue?.speaker === 'minions') ? '#ff9500' : '#333',
              boxShadow: (currentDialogue?.speaker === 'guard' || currentDialogue?.speaker === 'minions') ? '0 0 30px #ff9500' : 'none'
            }}
          >
            <img src="/portraits/guard.png" alt="Resident" className="w-full h-full object-cover" />
          </div>
          <p className="font-mono text-sm mt-2" style={{ color: '#ff9500' }}>
            {language === 'ko' ? '주민' : 'Resident'}
          </p>
        </motion.div>
      </div>

      {/* Dialogue Box */}
      <motion.div
        className="max-w-3xl w-full mx-4 p-6 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #1a0808, #0a0505)',
          border: `2px solid ${currentDialogue?.color}50`,
          boxShadow: `0 0 30px ${currentDialogue?.color}20`
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Speaker Name */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentDialogue?.color }}
          />
          <span 
            className="font-orbitron font-bold"
            style={{ color: currentDialogue?.color }}
          >
            {currentDialogue?.name}
          </span>
        </div>

        {/* Dialogue Text */}
        <p className="font-mono text-lg leading-relaxed text-terminal/90 min-h-[80px]">
          {displayedText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ color: currentDialogue?.color }}
            >
              ▌
            </motion.span>
          )}
        </p>

        {/* Progress */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-terminal/20">
          <span className="font-mono text-xs text-terminal/40">
            {currentIndex + 1} / {dialogues.length}
          </span>
          <motion.span 
            className="font-mono text-xs"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ color: currentDialogue?.color }}
          >
            {language === 'ko' ? '클릭 또는 SPACE로 계속' : 'Click or SPACE to continue'}
          </motion.span>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.p
          className="font-mono text-sm"
          style={{ color: '#ff004080' }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚠️ {language === 'ko' ? '위험 상황 감지' : 'THREAT DETECTED'} ⚠️
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Phase3Dialogue
