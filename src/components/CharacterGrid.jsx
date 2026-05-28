import { useState } from 'react'
import { motion } from 'framer-motion'
import CharacterCard from './CharacterCard'
import CharacterChatModal from './CharacterChatModal'
import { characterData } from '../data/characterData'

const CharacterGrid = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {characterData.map((character, index) => (
          <CharacterCard key={character.id} character={character} index={index}
            onClick={(c) => { setSelectedCharacter(c); setIsChatOpen(true); }} />
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-terminal/10 flex justify-between">
        <p className="font-mono text-xs text-terminal/30">Powered by Gemini AI • 캐릭터를 클릭하여 대화</p>
        <motion.p className="font-mono text-xs text-alert/50"
          animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>⚠ CLASSIFIED</motion.p>
      </div>
      <CharacterChatModal character={selectedCharacter} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

export default CharacterGrid
