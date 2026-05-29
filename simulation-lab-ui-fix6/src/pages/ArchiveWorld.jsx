import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toDisplayText, safeArray } from '../utils/safeText'
import { PROTOTYPE_QUESTS, CASE_FILES } from '../data/prototype/quests'
import { getCaseFileProgress } from '../services/questEngine'
import PixelGame from '../components/PixelGame'
import PlayerInfoCard from '../components/PlayerInfoCard'
import CharacterCard from '../components/CharacterCard'
import CharacterChatModal from '../components/CharacterChatModal'
import { ipCatalog, characters as builtInCharacters, getCharactersForIp } from '../data/ipCatalog'
import { STORY_EVENTS } from '../data/unlockRules'
import useArchiveStore from '../store/useArchiveStore'
import { useLanguage } from '../i18n/LanguageContext'

// Whether this IP has a Canvas world (Prototype does; custom/future IPs don't)
const hasCanvasWorld = (ipId) => ipId === 'prototype'

// Tab definitions — the "explore" tab only shows for IPs with canvas
const ALL_TABS = [
  { id: 'characters', labelKo: '캐릭터', labelEn: 'Characters', icon: '👤', alwaysShow: true },
  { id: 'explore', labelKo: '탐험', labelEn: 'Explore', icon: '🎮', requiresCanvas: true },
  { id: 'quests', labelKo: '조사 과제', labelEn: 'Quests', icon: '📋', alwaysShow: true },
  { id: 'caseFiles', labelKo: '사건 파일', labelEn: 'Case Files', icon: '📁', alwaysShow: true },
  { id: 'unlocked', labelKo: '해금', labelEn: 'Unlocked', icon: '🔓', alwaysShow: true },
]

const ArchiveWorld = ({ onBack, onStoryEvent }) => {
  const { language, t } = useLanguage()
  const selectedIpId = useArchiveStore(s => s.selectedIpId) || 'prototype'
  const activeTab = useArchiveStore(s => s.activeArchiveTab)
  const setTab = useArchiveStore(s => s.setArchiveTab)
  const relationships = useArchiveStore(s => s.relationships)
  const unlockedContent = useArchiveStore(s => s.unlockedContent)
  const storyEventsUnlocked = useArchiveStore(s => s.storyEventsUnlocked)
  const completedStoryEvents = useArchiveStore(s => s.completedStoryEvents)
  const customIps = useArchiveStore(s => s.customIps)
  const customCharacters = useArchiveStore(s => s.customCharacters)

  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [highlightedCharacter, setHighlightedCharacter] = useState(null)

  const showCanvas = hasCanvasWorld(selectedIpId)

  // Build visible tabs for this IP
  const visibleTabs = ALL_TABS.filter(tab => {
    if (tab.alwaysShow) return true
    if (tab.requiresCanvas && showCanvas) return true
    return false
  })

  // Default to 'characters' on first load, migrate old 'world' tab
  useEffect(() => {
    if (activeTab === 'world') {
      setTab(showCanvas ? 'explore' : 'characters')
    } else if (!visibleTabs.find(t => t.id === activeTab)) {
      setTab('characters')
    }
  }, [activeTab, showCanvas, visibleTabs, setTab])

  const safeActiveTab = visibleTabs.find(t => t.id === activeTab) ? activeTab : 'characters'

  // Resolve IP and characters
  const ip = ipCatalog[selectedIpId] || customIps[selectedIpId]
  const ipTitle = ip ? (language === 'en' ? (ip.titleEn || ip.title) : ip.title) : selectedIpId

  const ipCharacters = (() => {
    if (ipCatalog[selectedIpId]) return getCharactersForIp(selectedIpId)
    const customIp = customIps[selectedIpId]
    if (customIp && customIp.characters) {
      return customIp.characters.map(cid => customCharacters[cid]).filter(Boolean)
    }
    return []
  })()

  const npcCharacters = ipCharacters.filter(c => c.canChat !== false)

  // Archive progress
  const totalChars = npcCharacters.length
  const charsWithTurns = npcCharacters.filter(c => {
    const rel = relationships[`${selectedIpId}:${c.id}`]
    return rel && rel.totalTurns >= 3
  }).length
  const progressPercent = totalChars > 0 ? Math.round((charsWithTurns / totalChars) * 100) : 0

  // NPC collision → open chat
  const handleNpcCollision = useCallback((characterId) => {
    const char = ipCharacters.find(c => c.id === characterId)
    if (char && char.canChat !== false) {
      setSelectedCharacter(mapToLegacyFormat(char, language))
    }
  }, [ipCharacters, language])

  const handleCharacterSelect = useCallback((character) => {
    if (character.canChat !== false) {
      setSelectedCharacter(character)
    }
  }, [])

  const handleCloseChat = useCallback(() => {
    setSelectedCharacter(null)
  }, [])

  return (
    <div className="min-h-screen-safe bg-void">
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      {/* Header — compact on mobile */}
      <header className="border-b border-terminal/30 bg-void-light/50 sticky top-0 z-40 pt-safe">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <motion.button onClick={onBack} className="text-terminal/50 hover:text-terminal text-xs font-mono tap-target flex items-center justify-center flex-shrink-0"
              whileHover={{ x: -2 }}>
              ← {language === 'en' ? 'LAB' : '랩'}
            </motion.button>
            <h1 className="font-orbitron text-terminal text-base sm:text-xl font-bold truncate" style={{
              textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41'
            }}>
              {ipTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-terminal text-xs sm:text-sm font-mono hidden sm:inline">
              {language === 'en' ? 'ARCHIVE' : '아카이브'}:
            </span>
            <motion.span 
              className="text-lg sm:text-xl font-bold font-orbitron"
              style={{ color: progressPercent >= 100 ? '#ff0040' : '#00ff41' }}
              key={progressPercent}
              initial={{ scale: 1.3 }} animate={{ scale: 1 }}
            >
              {progressPercent}%
            </motion.span>
            <div className="w-16 sm:w-24 h-2 bg-void rounded overflow-hidden border border-terminal/30">
              <motion.div className="h-full"
                style={{ backgroundColor: progressPercent >= 100 ? '#ff0040' : '#00ff41' }}
                animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Desktop top tab bar — hidden on mobile (bottom tabs used instead) */}
        <div className="hidden sm:flex max-w-6xl mx-auto px-4 gap-1 pb-1">
          {visibleTabs.map(tab => (
            <button key={tab.id} onClick={() => setTab(tab.id)}
              className="px-4 py-2 text-xs font-mono rounded-t transition-all"
              style={{
                background: safeActiveTab === tab.id ? 'rgba(0,255,65,0.1)' : 'transparent',
                borderBottom: safeActiveTab === tab.id ? '2px solid #00ff41' : '2px solid transparent',
                color: safeActiveTab === tab.id ? '#00ff41' : 'rgba(0,255,65,0.4)',
              }}>
              {language === 'en' ? tab.labelEn : tab.labelKo}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content — extra bottom padding on mobile for bottom tabs */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 has-bottom-tabs sm:pb-6">
        <AnimatePresence mode="wait">
          {safeActiveTab === 'explore' && showCanvas && (
            <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WorldTab
                selectedIpId={selectedIpId}
                ipCharacters={ipCharacters}
                npcCharacters={npcCharacters}
                relationships={relationships}
                highlightedCharacter={highlightedCharacter}
                selectedCharacter={selectedCharacter}
                progressPercent={progressPercent}
                onNpcCollision={handleNpcCollision}
                onCharacterSelect={handleCharacterSelect}
                language={language}
                t={t}
              />
            </motion.div>
          )}

          {safeActiveTab === 'characters' && (
            <motion.div key="characters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CharactersTab
                npcCharacters={npcCharacters}
                selectedIpId={selectedIpId}
                relationships={relationships}
                onCharacterSelect={handleCharacterSelect}
                language={language}
              />
            </motion.div>
          )}

          {safeActiveTab === 'quests' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <QuestsTab ipId={selectedIpId} language={language} t={t} onCharacterSelect={handleCharacterSelect} ipCharacters={ipCharacters} />
            </motion.div>
          )}

          {safeActiveTab === 'caseFiles' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <CaseFilesTab ipId={selectedIpId} language={language} t={t}
                storyEventsUnlocked={storyEventsUnlocked} completedStoryEvents={completedStoryEvents} onStoryEvent={onStoryEvent} />
            </motion.div>
          )}

          {safeActiveTab === 'unlocked' && (
            <motion.div key="unlocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UnlockedTab
                unlockedContent={unlockedContent}
                selectedIpId={selectedIpId}
                language={language}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer — hidden on mobile since we have bottom tabs */}
      <footer className="hidden sm:block border-t border-terminal/20 mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="text-terminal/30 text-xs font-mono">
            IP SIMULATION LAB v1.0 // CODE FANTASIA
          </span>
          <span className="text-terminal/30 text-xs font-mono">
            © 2024 CODE FANTASIA
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden bottom-tab-bar">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={safeActiveTab === tab.id ? 'active' : ''}
            onClick={() => setTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{language === 'en' ? tab.labelEn : tab.labelKo}</span>
          </button>
        ))}
      </div>

      {/* Character Chat Modal */}
      <CharacterChatModal
        character={selectedCharacter}
        isOpen={!!selectedCharacter}
        onClose={handleCloseChat}
        ipId={selectedIpId}
      />
    </div>
  )
}

// ── World/Explore Tab ──
const WorldTab = ({ selectedIpId, ipCharacters, npcCharacters, relationships, highlightedCharacter, selectedCharacter, progressPercent, onNpcCollision, onCharacterSelect, language, t }) => (
  <>
    {/* Game Section */}
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
        <h2 className="text-terminal font-mono text-sm tracking-wider">
          SIMULATION_INTERFACE
        </h2>
      </div>
      <div className="bg-void-light border border-terminal/30 rounded-lg p-3 sm:p-4"
        style={{ boxShadow: '0 0 30px rgba(0,255,65,0.1)' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="hidden sm:block">
            <PlayerInfoCard totalSyncPercent={progressPercent} />
          </div>
          <div className="relative flex-1">
            <div className="absolute -inset-1 bg-gradient-to-b from-terminal/10 to-transparent rounded pointer-events-none" />
            <PixelGame 
              onNpcCollision={onNpcCollision}
              highlightedCharacter={highlightedCharacter}
              isChatOpen={!!selectedCharacter}
              ipId={selectedIpId}
              characters={ipCharacters}
            />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-terminal/20 flex items-center justify-between text-xs font-mono">
          <span className="text-terminal/50">
            {language === 'ko' ? '소년으로 플레이 // NPC와 충돌하면 채팅 시작' : 'Play as Boy // Collide with NPC to start chat'}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal" />
            <span className="text-terminal/70">CONNECTED</span>
          </div>
        </div>
      </div>
    </motion.section>

    {/* Character portraits below canvas */}
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-4 sm:mt-6">
        <div className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
        <h2 className="text-cyber font-mono text-sm tracking-wider">CHARACTER_DATABASE</h2>
        <span className="text-terminal/30 text-xs font-mono ml-2 hidden sm:inline">
          // {language === 'ko' ? '클릭하여 대화 시작' : 'Click to start conversation'}
        </span>
      </div>

      {/* Desktop: original grid */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {npcCharacters.map((char, index) => {
          const rel = relationships[`${selectedIpId}:${char.id}`]
          const totalTurns = rel?.totalTurns || 0
          const isSynced = totalTurns >= 3
          const legacyChar = mapToLegacyFormat(char, language)
          return (
            <motion.div key={char.id} className="relative">
              <div className="absolute -top-2 left-0 right-0 z-10 flex justify-center">
                <div className="px-2 py-0.5 rounded text-xs font-bold font-mono"
                  style={{ backgroundColor: isSynced ? 'rgba(0,255,65,0.2)' : '#0a0a0a', border: `1px solid ${isSynced ? '#00ff41' : char.color}50`, color: isSynced ? '#00ff41' : char.color }}>
                  {isSynced ? 'SYNCED ✓' : `${totalTurns}/3`}
                </div>
              </div>
              <div style={{ filter: isSynced ? 'none' : 'grayscale(60%)', transition: 'filter 0.3s' }}>
                <CharacterCard character={legacyChar} index={index} onClick={() => onCharacterSelect(legacyChar)} isSynced={isSynced} />
              </div>
              <div className="mt-2 h-1.5 bg-void rounded overflow-hidden">
                <motion.div className="h-full rounded" style={{ backgroundColor: isSynced ? '#00ff41' : char.color }}
                  initial={{ width: 0 }} animate={{ width: isSynced ? '100%' : `${(totalTurns / 3) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Mobile: staggered layout — Row 1: 3 cards, Row 2: 2 cards offset between row 1 */}
      <div className="sm:hidden">
        <div className="grid grid-cols-6 gap-x-1.5 gap-y-3">
          {/* Row 1: Aran (col 1-2), Noah (col 3-4), Haein (col 5-6) */}
          {npcCharacters.slice(0, 3).map((char, index) => {
            const rel = relationships[`${selectedIpId}:${char.id}`]
            const totalTurns = rel?.totalTurns || 0
            const isSynced = totalTurns >= 3
            const legacyChar = mapToLegacyFormat(char, language)
            const colStart = index * 2 + 1
            return (
              <motion.div key={char.id} className="relative pt-2" style={{ gridColumn: `${colStart} / span 2` }}>
                <div className="absolute top-0 left-0 right-0 z-10 flex justify-center">
                  <div className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono"
                    style={{ backgroundColor: isSynced ? 'rgba(0,255,65,0.2)' : '#0a0a0a', border: `1px solid ${isSynced ? '#00ff41' : char.color}50`, color: isSynced ? '#00ff41' : char.color }}>
                    {isSynced ? 'SYNCED ✓' : `${totalTurns}/3`}
                  </div>
                </div>
                <div style={{ filter: isSynced ? 'none' : 'grayscale(60%)', transition: 'filter 0.3s' }}>
                  <CharacterCard character={legacyChar} index={index} onClick={() => onCharacterSelect(legacyChar)} isSynced={isSynced} />
                </div>
                <div className="mt-1 h-1 bg-void rounded overflow-hidden">
                  <motion.div className="h-full rounded" style={{ backgroundColor: isSynced ? '#00ff41' : char.color }}
                    initial={{ width: 0 }} animate={{ width: isSynced ? '100%' : `${(totalTurns / 3) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </motion.div>
            )
          })}
          {/* Row 2: Director (col 2-3, between Aran & Noah), Guard (col 4-5, between Noah & Haein) */}
          {npcCharacters.slice(3, 5).map((char, index) => {
            const rel = relationships[`${selectedIpId}:${char.id}`]
            const totalTurns = rel?.totalTurns || 0
            const isSynced = totalTurns >= 3
            const legacyChar = mapToLegacyFormat(char, language)
            const colStart = index * 2 + 2
            return (
              <motion.div key={char.id} className="relative pt-2" style={{ gridColumn: `${colStart} / span 2` }}>
                <div className="absolute top-0 left-0 right-0 z-10 flex justify-center">
                  <div className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono"
                    style={{ backgroundColor: isSynced ? 'rgba(0,255,65,0.2)' : '#0a0a0a', border: `1px solid ${isSynced ? '#00ff41' : char.color}50`, color: isSynced ? '#00ff41' : char.color }}>
                    {isSynced ? 'SYNCED ✓' : `${totalTurns}/3`}
                  </div>
                </div>
                <div style={{ filter: isSynced ? 'none' : 'grayscale(60%)', transition: 'filter 0.3s' }}>
                  <CharacterCard character={legacyChar} index={index + 3} onClick={() => onCharacterSelect(legacyChar)} isSynced={isSynced} />
                </div>
                <div className="mt-1 h-1 bg-void rounded overflow-hidden">
                  <motion.div className="h-full rounded" style={{ backgroundColor: isSynced ? '#00ff41' : char.color }}
                    initial={{ width: 0 }} animate={{ width: isSynced ? '100%' : `${(totalTurns / 3) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  </>
)

// ── Characters Tab — mobile-first card layout with larger tap targets ──
const CharactersTab = ({ npcCharacters, selectedIpId, relationships, onCharacterSelect, language }) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="flex items-center gap-2 mb-2 sm:mb-4">
      <div className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
      <h2 className="text-cyber font-mono text-sm tracking-wider">
        {language === 'en' ? 'CHARACTER HUB' : '캐릭터 허브'}
      </h2>
      <span className="text-terminal/30 text-xs font-mono ml-2 hidden sm:inline">
        // {language === 'en' ? 'Tap to chat' : '탭하여 대화 시작'}
      </span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {npcCharacters.map(char => {
        const rel = relationships[`${selectedIpId}:${char.id}`]
        const totalTurns = rel?.totalTurns || 0
        const trust = rel?.trust || 0
        const suspicion = rel?.suspicion || 0
        const name = language === 'en' ? (char.nameEn || char.name) : char.name
        const role = language === 'en' ? (char.roleEn || char.role) : char.role

        return (
          <motion.div key={char.id}
            className="bg-void-light border rounded-lg p-3 sm:p-4 cursor-pointer active:scale-[0.98] transition-transform"
            style={{ borderColor: `${char.color}30` }}
            whileHover={{ borderColor: `${char.color}80`, boxShadow: `0 0 20px ${char.color}15` }}
            onClick={() => onCharacterSelect(mapToLegacyFormat(char, language))}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: char.color }}>
                <img src={char.portraitUrl} alt={name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron font-bold text-sm sm:text-base truncate" style={{ color: char.color }}>{name}</h3>
                  <span className="text-lg flex-shrink-0">💬</span>
                </div>
                <p className="text-terminal/50 text-xs font-mono truncate">{role}</p>
                <div className="flex gap-3 sm:gap-4 mt-2">
                  <StatBar label="Trust" value={trust} max={100} color="#00ff41" />
                  <StatBar label="Suspicion" value={suspicion} max={100} color="#ff0055" />
                </div>
                <p className="text-terminal/30 text-[10px] font-mono mt-1">
                  {language === 'en' ? `${totalTurns} conversations` : `${totalTurns}회 대화`}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  </div>
)

// ── Story Logs Tab ──
const StoryLogsTab = ({ selectedIpId, storyEventsUnlocked, completedStoryEvents, onStoryEvent, language }) => {
  const events = Object.entries(STORY_EVENTS).filter(([_, e]) => e.ipId === selectedIpId)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-alert animate-pulse" />
        <h2 className="text-alert font-mono text-sm tracking-wider">
          {language === 'en' ? 'STORY EVENTS' : '스토리 이벤트'}
        </h2>
      </div>
      {events.length === 0 ? (
        <p className="text-terminal/30 text-sm font-mono text-center py-12">
          {language === 'en' ? 'No story events for this IP yet.' : '이 IP에는 아직 스토리 이벤트가 없습니다.'}
        </p>
      ) : (
        <div className="space-y-3">
          {events.map(([eventId, event]) => {
            const isUnlocked = safeArray(storyEventsUnlocked).includes(eventId)
            const isCompleted = safeArray(completedStoryEvents).includes(eventId)
            const pageMap = { church_fire: 'phase1complete', boss_map: 'phase3intro', prequel_outro: 'phase4confrontation' }

            return (
              <motion.div key={eventId}
                className="bg-void-light border rounded-lg p-4"
                style={{ 
                  borderColor: isCompleted ? '#00ff4140' : isUnlocked ? '#ff004040' : '#ffffff10',
                  opacity: isUnlocked ? 1 : 0.5,
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-orbitron text-sm font-bold" style={{ 
                      color: isCompleted ? '#00ff41' : isUnlocked ? '#ff0040' : '#ffffff30' 
                    }}>
                      {isUnlocked ? (language === 'en' ? (event.titleEn || event.title) : event.title) : '???'}
                    </h3>
                    <p className="text-xs font-mono mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {isCompleted 
                        ? (language === 'en' ? '✓ Completed' : '✓ 완료됨')
                        : isUnlocked 
                          ? (language === 'en' ? '● Available' : '● 진행 가능')
                          : (language === 'en' ? '🔒 Locked' : '🔒 잠김')
                      }
                    </p>
                  </div>
                  {isUnlocked && !isCompleted && (
                    <motion.button
                      className="px-4 py-2 text-xs font-mono font-bold border rounded tap-target flex items-center justify-center"
                      style={{ borderColor: '#ff004080', color: '#ff0040' }}
                      whileHover={{ backgroundColor: 'rgba(255,0,64,0.1)' }}
                      onClick={() => onStoryEvent(pageMap[eventId] || 'phase1complete')}
                    >
                      {language === 'en' ? 'ENTER' : '진입'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Unlocked Tab ──
const UnlockedTab = ({ unlockedContent, selectedIpId, language }) => {
  const filtered = unlockedContent.filter(u => u.ipId === selectedIpId)
  const memories = filtered.filter(u => u.type === 'memory')
  const lore = filtered.filter(u => u.type === 'lore')
  const logs = filtered.filter(u => u.type === 'log')

  const renderSection = (title, items) => (
    <div>
      <h3 className="text-sm font-mono font-bold mb-3" style={{ color: '#00d4ff' }}>{title}</h3>
      {items.length === 0 ? (
        <p className="text-terminal/30 text-xs font-mono">
          {language === 'en' ? 'None unlocked yet.' : '아직 해금된 것이 없습니다.'}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-void-light border border-terminal/20 rounded p-3">
              <h4 className="text-xs font-mono font-bold text-terminal">{toDisplayText(item.title, language)}</h4>
              <p className="text-[11px] font-mono text-terminal/60 mt-1">
                {toDisplayText(language === 'en' ? (item.contentEn || item.content) : (item.content || item.contentEn), language)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <h2 className="font-mono text-sm tracking-wider" style={{ color: '#9d00ff' }}>
          {language === 'en' ? 'UNLOCKED CONTENT' : '해금 콘텐츠'}
        </h2>
      </div>
      {renderSection(language === 'en' ? '🧠 Memories' : '🧠 기억', memories)}
      {renderSection(language === 'en' ? '📜 Lore' : '📜 로어', lore)}
      {renderSection(language === 'en' ? '📋 Logs' : '📋 기록', logs)}
    </div>
  )
}

// ── Helpers ──
const StatBar = ({ label, value, max, color }) => (
  <div className="flex-1">
    <div className="flex justify-between text-[9px] font-mono mb-0.5">
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
    <div className="h-1 bg-void rounded overflow-hidden">
      <div className="h-full" style={{ backgroundColor: color, width: `${(value / max) * 100}%` }} />
    </div>
  </div>
)

// Map new ipCatalog character to legacy format used by CharacterCard/ChatModal
function mapToLegacyFormat(char, language) {
  return {
    id: char.id,
    ipId: char.ipId,
    name: language === 'en' ? (char.nameEn || char.name) : char.name,
    nameEn: char.nameEn || char.name,
    codename: char.codename,
    role: language === 'en' ? (char.roleEn || char.role) : char.role,
    roleEn: char.roleEn || char.role,
    imageUrl: char.portraitUrl,
    portraitUrl: char.portraitUrl,
    spriteUrl: char.spriteUrl,
    color: char.color,
    canChat: char.canChat !== false,
    stats: char.stats,
    systemPromptKo: char.systemPromptKo,
    systemPromptEn: char.systemPromptEn,
    openers: char.openers,
    suggestedStarters: char.suggestedStarters,
    persona: char.persona,
    canonRules: char.canonRules,
    unlocks: char.unlocks,
    world: char.world,
  }
}

// ── Quests Tab ──
const QuestsTab = ({ ipId, language, t, onCharacterSelect, ipCharacters }) => {
  const completedQuests = safeArray(useArchiveStore(s => s.completedQuests))
  const questProgress = useArchiveStore(s => s.questProgress) || {}
  const activeQuestByChar = useArchiveStore(s => s.activeQuestByCharacter) || {}
  const setActiveQuest = useArchiveStore(s => s.setActiveQuest)

  const quests = PROTOTYPE_QUESTS.filter(q => q.ipId === ipId && q.characterId !== null)
  const charGroups = {}
  quests.forEach(q => {
    const cid = q.characterId
    if (!charGroups[cid]) charGroups[cid] = []
    charGroups[cid].push(q)
  })

  return (
    <div className="space-y-4">
      <h2 className="text-terminal font-orbitron text-sm tracking-wider">{t('조사 과제', 'INVESTIGATION QUESTS')}</h2>
      {Object.entries(charGroups).map(([cid, cQuests]) => {
        const char = ipCharacters.find(c => c.id === cid)
        const charName = char ? toDisplayText(language === 'en' ? char.nameEn : char.name, language, cid) : cid
        return (
          <div key={cid} className="border border-terminal/15 rounded p-3 bg-void-light">
            <h3 className="text-xs font-mono font-bold mb-2" style={{ color: char?.color || '#00ff41' }}>{charName}</h3>
            <div className="space-y-2">
              {cQuests.map(q => {
                const isCompleted = completedQuests.includes(q.id)
                const isPrereqMet = !q.prerequisiteQuestIds?.length || q.prerequisiteQuestIds.every(pid => completedQuests.includes(pid))
                const pk = `${ipId}:${cid}:${q.id}`
                const prog = questProgress[pk]
                const isActive = activeQuestByChar[`${ipId}:${cid}`] === q.id

                return (
                  <div key={q.id} className="border rounded p-2" style={{ borderColor: isCompleted ? '#00ff4130' : isActive ? '#9d00ff40' : '#ffffff10', background: isActive ? '#9d00ff08' : 'transparent' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-terminal/70">{toDisplayText(language === 'en' ? q.titleEn : q.title, language)}</span>
                      <span className="text-[8px] font-mono" style={{ color: isCompleted ? '#00ff41' : !isPrereqMet ? '#ffffff20' : isActive ? '#9d00ff' : '#ffffff40' }}>
                        {isCompleted ? '✓ COMPLETED' : !isPrereqMet ? 'LOCKED' : isActive ? 'ACTIVE' : 'AVAILABLE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-terminal/40 mt-1">{toDisplayText(language === 'en' ? q.shortDescriptionEn : q.shortDescription, language)}</p>
                    {!isCompleted && isPrereqMet && !isActive && (
                      <button onClick={() => setActiveQuest(ipId, cid, q.id)}
                        className="text-[10px] font-mono px-3 py-1 rounded border mt-1 tap-target flex items-center justify-center"
                        style={{ borderColor: '#9d00ff30', color: '#9d00ff', background: '#9d00ff08' }}>
                        {t('활성화', 'Set Active')}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Case Files Tab ──
const CaseFilesTab = ({ ipId, language, t, storyEventsUnlocked, completedStoryEvents, onStoryEvent }) => {
  const archiveFragments = safeArray(useArchiveStore(s => s.archiveFragments))
  const completedQuests = safeArray(useArchiveStore(s => s.completedQuests))

  const caseFileIds = Object.keys(CASE_FILES)

  return (
    <div className="space-y-4">
      <h2 className="text-terminal font-orbitron text-sm tracking-wider">{t('사건 파일', 'CASE FILES')}</h2>
      {caseFileIds.map(cfId => {
        const cf = CASE_FILES[cfId]
        const progress = getCaseFileProgress(cfId, archiveFragments)
        const evidence = progress?.evidence || []
        const collected = progress?.collected || 0
        const required = cf.requiredEvidence || 3
        const isComplete = collected >= required

        return (
          <div key={cfId} className="border rounded p-3" style={{ borderColor: isComplete ? '#00ff4130' : '#ffffff15', background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold text-terminal">{toDisplayText(language === 'en' ? cf.titleEn : cf.title, language)}</h3>
              <span className="text-[8px] font-mono" style={{ color: isComplete ? '#00ff41' : '#ff9500' }}>
                {t('증거', 'EVIDENCE')}: {collected}/{required}
              </span>
            </div>
            <p className="text-[11px] text-terminal/40 mb-2">{toDisplayText(language === 'en' ? cf.descriptionEn : cf.description, language)}</p>

            {evidence.length > 0 && (
              <div className="space-y-1">
                {evidence.map(e => (
                  <div key={e.id} className="text-[10px] font-mono text-terminal/60 pl-2 border-l" style={{ borderColor: '#00d4ff30' }}>
                    {toDisplayText(language === 'en' ? e.titleEn : e.title, language)}
                  </div>
                ))}
              </div>
            )}

            {!isComplete && (
              <p className="text-[10px] font-mono text-terminal/20 mt-2">[{t('추가 증거가 필요합니다', 'Additional evidence required')}]</p>
            )}
          </div>
        )
      })}

      {/* Story Events section */}
      <h3 className="text-terminal/60 font-mono text-xs mt-6 mb-2">{t('스토리 이벤트', 'Story Events')}</h3>
      {Object.entries(STORY_EVENTS || {}).map(([eventId, event]) => {
        if (!event) return null
        const isUnlocked = safeArray(storyEventsUnlocked).includes(eventId)
        const isCompleted = safeArray(completedStoryEvents).includes(eventId)
        const pageMap = { church_fire: 'phase1complete', boss_map: 'phase3intro', prequel_outro: 'phase4confrontation' }
        return (
          <div key={eventId} className="border rounded p-2" style={{ borderColor: isCompleted ? '#00ff4120' : isUnlocked ? '#9d00ff30' : '#ffffff08' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono" style={{ color: isCompleted ? '#00ff41' : isUnlocked ? '#9d00ff' : '#ffffff20' }}>
                {isUnlocked ? toDisplayText(language === 'en' ? (event.titleEn || event.title) : event.title, language) : '???'}
              </span>
              {isUnlocked && !isCompleted && (
                <button className="text-[10px] font-mono px-3 py-1 rounded border tap-target flex items-center justify-center"
                  style={{ borderColor: '#9d00ff30', color: '#9d00ff' }}
                  onClick={() => onStoryEvent(pageMap[eventId] || 'phase1complete')}>
                  {t('시작', 'Start')}
                </button>
              )}
              {isCompleted && <span className="text-[8px] font-mono text-terminal/30">✓</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ArchiveWorld
