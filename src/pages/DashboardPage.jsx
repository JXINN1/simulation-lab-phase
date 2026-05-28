import { useState } from 'react'
import { motion } from 'framer-motion'
import PixelGame from '../components/PixelGame'
import PlayerInfoCard from '../components/PlayerInfoCard'
import CharacterCard from '../components/CharacterCard'
import CharacterChatModal from '../components/CharacterChatModal'
import { characterData } from '../data/characterData'
import { useLanguage } from '../i18n/LanguageContext'

const DashboardPage = ({ 
  syncComplete, 
  openerIndex, 
  totalSyncPercent, 
  onSyncComplete,
  onAdvanceOpener 
}) => {
  const { language, t } = useLanguage()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [highlightedCharacter, setHighlightedCharacter] = useState(null)

  // NPC와 충돌 시 채팅창 자동 열기
  const handleNpcCollision = (characterId) => {
    const character = characterData.find(c => c.id === characterId)
    if (character && character.canChat) {
      setSelectedCharacter(character)
    }
  }

  // 카드 클릭으로 채팅창 열기
  const handleCharacterSelect = (character) => {
    if (character.canChat) {
      setSelectedCharacter(character)
    }
  }

  // 채팅창 닫기
  const handleCloseChat = (completedSync = false) => {
    if (selectedCharacter) {
      onAdvanceOpener(selectedCharacter.id)
      if (completedSync) {
        onSyncComplete(selectedCharacter.id)
      }
    }
    setSelectedCharacter(null)
  }

  const npcCharacters = characterData.filter(c => c.id !== 'boy')

  // 캐릭터 이름 가져오기
  const getCharName = (charId) => {
    return t(`characters.${charId}.name`) || charId
  }

  return (
    <div className="min-h-screen bg-void">
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Header */}
      <header className="border-b border-terminal/30 bg-void-light/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-orbitron text-terminal text-xl font-bold" style={{
              textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41'
            }}>
              PROTOTYPE
            </h1>
            <span className="text-terminal/50 text-xs font-mono hidden sm:block">
              {language === 'ko' ? '시뮬레이션 v2.0' : 'Simulation v2.0'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-terminal text-sm font-mono">
              {t('dashboard.systemSync')}:
            </span>
            <motion.span 
              className="text-xl font-bold font-orbitron"
              style={{ color: totalSyncPercent >= 100 ? '#ff0040' : '#00ff41' }}
              key={totalSyncPercent}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {totalSyncPercent}%
            </motion.span>
            <div className="w-24 h-2 bg-void rounded overflow-hidden border border-terminal/30">
              <motion.div
                className="h-full"
                style={{ backgroundColor: totalSyncPercent >= 100 ? '#ff0040' : '#00ff41' }}
                animate={{ width: `${totalSyncPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {totalSyncPercent >= 100 ? (
              <motion.span 
                className="text-xs font-mono font-bold"
                style={{ color: '#ff0040' }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {t('dashboard.syncComplete')}
              </motion.span>
            ) : (
              <motion.span 
                className="text-alert text-xs font-mono"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ● {t('dashboard.phase1')}
              </motion.span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Game Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
            <h2 className="text-terminal font-mono text-sm tracking-wider">
              {t('dashboard.simulationInterface')}
            </h2>
          </div>
          
          <div 
            className="bg-void-light border border-terminal/30 rounded-lg p-4"
            style={{ boxShadow: '0 0 30px rgba(0,255,65,0.1)' }}
          >
            <div className="flex gap-4">
              <PlayerInfoCard totalSyncPercent={totalSyncPercent} />
              
              <div className="relative flex-1">
                <div className="absolute -inset-1 bg-gradient-to-b from-terminal/10 to-transparent rounded pointer-events-none" />
                <PixelGame 
                  onNpcCollision={handleNpcCollision}
                  highlightedCharacter={highlightedCharacter}
                  isChatOpen={!!selectedCharacter}
                />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-terminal/20 flex items-center justify-between text-xs font-mono">
              <span className="text-terminal/50">
                {t('dashboard.playAsPlayer')}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-terminal" />
                <span className="text-terminal/70">{t('dashboard.connected')}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Character Grid Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
            <h2 className="text-cyber font-mono text-sm tracking-wider">
              {t('dashboard.characterDatabase')}
            </h2>
            <span className="text-terminal/30 text-xs font-mono ml-2">
              // {t('dashboard.clickToChat')}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {npcCharacters.map((character, index) => {
              const isSynced = syncComplete[character.id]
              const isHighlighted = highlightedCharacter === character.id
              
              return (
                <motion.div
                  key={character.id}
                  className={`relative ${isHighlighted ? 'z-10' : ''}`}
                  animate={isHighlighted ? { 
                    scale: [1, 1.05, 1],
                    boxShadow: ['0 0 0px transparent', `0 0 20px ${character.color}`, '0 0 0px transparent']
                  } : {}}
                  transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
                >
                  {/* Sync Status Badge */}
                  <div className="absolute -top-2 left-0 right-0 z-10 flex justify-center">
                    <div 
                      className="px-2 py-0.5 rounded text-xs font-bold font-mono"
                      style={{ 
                        backgroundColor: isSynced ? 'rgba(0,255,65,0.2)' : '#0a0a0a',
                        border: `1px solid ${isSynced ? '#00ff41' : character.color}50`,
                        color: isSynced ? '#00ff41' : character.color
                      }}
                    >
                      {isSynced ? t('dashboard.synced') : t('dashboard.syncWaiting')}
                    </div>
                  </div>
                  
                  <div style={{ 
                    filter: isSynced ? 'none' : 'grayscale(60%)',
                    transition: 'filter 0.3s'
                  }}>
                    <CharacterCard 
                      character={character} 
                      index={index}
                      onClick={handleCharacterSelect}
                      isSynced={isSynced}
                    />
                  </div>
                  
                  {/* Sync Progress Bar */}
                  <div className="mt-2 h-1.5 bg-void rounded overflow-hidden">
                    <motion.div
                      className="h-full rounded"
                      style={{ backgroundColor: isSynced ? '#00ff41' : character.color }}
                      initial={{ width: 0 }}
                      animate={{ width: isSynced ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-terminal/10 flex justify-between">
            <p className="font-mono text-xs text-terminal/30">
              {t('dashboard.poweredBy')}
            </p>
            <motion.p 
              className="font-mono text-xs"
              style={{ color: totalSyncPercent >= 100 ? '#ff0040' : '#ff005550' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {totalSyncPercent >= 100 ? t('dashboard.systemReady') : t('dashboard.syncRequired')}
            </motion.p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-terminal/20 mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="text-terminal/30 text-xs font-mono">
            SYS.PROTO.v2.0.47 // ANTHROPIC_TERMINAL
          </span>
          <span className="text-terminal/30 text-xs font-mono">
            © 2024 PROTOTYPE PROJECT
          </span>
        </div>
      </footer>

      {/* Character Chat Modal */}
      <CharacterChatModal
        character={selectedCharacter}
        isOpen={!!selectedCharacter}
        onClose={handleCloseChat}
        openerIndex={openerIndex[selectedCharacter?.id] || 0}
        isSynced={syncComplete[selectedCharacter?.id] || false}
      />
    </div>
  )
}

export default DashboardPage
