import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const CharacterCard = ({ character, onClick, index }) => {
  const { language, t } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const intervalRef = useRef(null)
  const glitchChars = '!@#$%█▓▒░'

  // 캐릭터 이름/역할 가져오기
  const charName = t(`characters.${character.id}.name`) || character.name
  const charRole = t(`characters.${character.id}.role`) || character.role

  useEffect(() => {
    setDisplayName(charName)
  }, [charName])

  useEffect(() => {
    if (isHovered) {
      let iter = 0
      intervalRef.current = setInterval(() => {
        setDisplayName(charName.split('').map((c, i) => 
          i < iter ? charName[i] : c === ' ' ? ' ' : glitchChars[Math.floor(Math.random() * glitchChars.length)]
        ).join(''))
        iter += 0.5
        if (iter >= charName.length) { clearInterval(intervalRef.current); setDisplayName(charName) }
      }, 40)
    } else { clearInterval(intervalRef.current); setDisplayName(charName) }
    return () => clearInterval(intervalRef.current)
  }, [isHovered, charName])

  const threatColor = () => {
    const l = character.stats?.threatLevel
    if (l === 'MAXIMUM' || l === '관찰 대상') return '#ff0055'
    if (l === 'HIGH') return '#ff9500'
    if (l === 'UNDEFINED' || l === '???') return '#9d00ff'
    return '#00ff41'
  }

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-sm"
      style={{ background: 'linear-gradient(180deg, #0a0a0a, #050505)', border: `1px solid ${character.color}30` }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      whileHover={{ borderColor: `${character.color}80`, boxShadow: `0 0 25px ${character.color}25` }}
      onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(character)}>
      
      <div className="relative aspect-[3/4] overflow-hidden bg-void-light">
        <motion.img src={character.imageUrl} alt={charName}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.1)' }}
          animate={{ scale: isHovered ? 1.1 : 1 }} transition={{ duration: 0.4 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.95) 100%)' }} />
        
        <div className="absolute top-2 right-2">
          <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: threatColor() }}
            animate={isHovered ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
        </div>
        
        {isHovered && (
          <motion.div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-void/95 border rounded-sm"
            style={{ borderColor: character.color }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-mono" style={{ color: character.color }}>
              {language === 'ko' ? '💬 대화하기' : '💬 Chat'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Codename badge — below portrait, above name */}
      {character.codename && (
        <div className="px-1.5 mx-2 mt-1 mb-0">
          <span className="font-mono text-[7px] tracking-wider" style={{ color: `${character.color}70` }}>{character.codename}</span>
        </div>
      )}

      <div className="px-2 pb-2 pt-0.5">
        <h3 className="font-orbitron font-bold text-sm mb-1 truncate" style={{ color: character.color }}>{displayName}</h3>
        <p className="font-mono text-[10px] text-terminal/50 truncate">{charRole}</p>
      </div>
      
      <motion.div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: character.color }}
        initial={{ scaleX: 0 }} animate={{ scaleX: isHovered ? 1 : 0 }} transition={{ duration: 0.3 }} />
    </motion.div>
  )
}

export default CharacterCard
