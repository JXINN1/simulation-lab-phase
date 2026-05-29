import { motion } from 'framer-motion'
import useArchiveStore from '../store/useArchiveStore'
import { useLanguage } from '../i18n/LanguageContext'
import { toDisplayText, safeArray } from '../utils/safeText'
import { getVisibleQuests } from '../services/questEngine'

const SideInfoPanel = ({ character, ipId }) => {
  const { language } = useLanguage()
  const rel = useArchiveStore(s => {
    try { return s.getRelationship(ipId, character?.id) } catch { return null }
  })
  const unlockedContent = safeArray(useArchiveStore(s => s.unlockedContent))

  if (!character) return null

  const name = toDisplayText(character.name, language, character.id)
  const role = toDisplayText(character.role, language, '')
  const trust = rel?.trust || 0
  const suspicion = rel?.suspicion || 0
  const totalTurns = rel?.totalTurns || 0
  const mood = rel?.mood || 'neutral'
  const memoryTags = safeArray(rel?.memoryTags)
  const c = character.color || '#00ff41'

  const charUnlocks = unlockedContent.filter(u => u && u.characterId === character.id && u.ipId === ipId)
  const memories = charUnlocks.filter(u => u.type === 'memory')
  const lore = charUnlocks.filter(u => u.type === 'lore')
  const logs = charUnlocks.filter(u => u.type === 'log')

  const t = (ko, en) => language === 'en' ? en : ko

  const starters = character.suggestedStarters
    ? safeArray(language === 'en' ? character.suggestedStarters.en : character.suggestedStarters.ko)
    : []

  const imgSrc = character.imageUrl || character.portraitUrl || ''

  return (
    <div className="space-y-4 text-xs font-mono">
      <Section title={t('프로필', 'Profile')} color={c}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: c }}>
            {imgSrc && <img src={imgSrc} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />}
          </div>
          <div>
            <h4 className="font-bold" style={{ color: c }}>{name}</h4>
            <p className="text-terminal/50">{role}</p>
            {character.codename && <p className="text-terminal/30 text-[9px]">{toDisplayText(character.codename, language)}</p>}
          </div>
        </div>
        {character.persona && (
          <div className="space-y-1 text-terminal/50">
            {character.persona.age && <p>{t('나이', 'Age')}: {character.persona.age}</p>}
            {character.persona.personality && (
              <p>{t('성격', 'Personality')}: {toDisplayText(character.persona.personality, language)}</p>
            )}
          </div>
        )}
      </Section>

      <Section title={t('관계', 'Relationship')} color="#00d4ff">
        <div className="space-y-2">
          <StatRow label={t('신뢰도', 'Trust')} value={trust} max={100} color="#00ff41" />
          <StatRow label={t('의심도', 'Suspicion')} value={suspicion} max={100} color="#ff0055" />
          <div className="flex justify-between mt-2">
            <span className="text-terminal/40">{t('대화 횟수', 'Conversations')}</span>
            <span className="text-terminal/70">{totalTurns}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal/40">{t('현재 기분', 'Mood')}</span>
            <span style={{ color: c }}>{toDisplayText(mood, language, 'neutral')}</span>
          </div>
          {memoryTags.length > 0 && (
            <div className="mt-2">
              <span className="text-terminal/40">{t('기억 태그', 'Memory Tags')}:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {memoryTags.map((tag, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px]"
                    style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41' }}>
                    {toDisplayText(tag, language)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {memories.length > 0 && (
        <Section title={t('🧠 기억', '🧠 Memory')} color="#9d00ff">
          {memories.map(m => (
            <div key={m.id} className="p-2 rounded mb-1" style={{ background: 'rgba(157,0,255,0.08)', border: '1px solid rgba(157,0,255,0.2)' }}>
              <p className="text-[11px]" style={{ color: '#9d00ff' }}>{toDisplayText(language === 'en' ? (m.titleEn || m.title) : m.title, language)}</p>
              <p className="text-terminal/50 text-[11px] mt-0.5">
                {toDisplayText(language === 'en' ? (m.contentEn || m.content) : (m.content || m.contentEn), language)}
              </p>
            </div>
          ))}
        </Section>
      )}

      {lore.length > 0 && (
        <Section title={t('📜 로어', '📜 Lore')} color="#00d4ff">
          {lore.map(l => (
            <div key={l.id} className="p-2 rounded mb-1" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <p className="text-[11px]" style={{ color: '#00d4ff' }}>{toDisplayText(language === 'en' ? (l.titleEn || l.title) : l.title, language)}</p>
              <p className="text-terminal/50 text-[11px] mt-0.5">
                {toDisplayText(language === 'en' ? (l.contentEn || l.content) : (l.content || l.contentEn), language)}
              </p>
            </div>
          ))}
        </Section>
      )}

      {logs.length > 0 && (
        <Section title={t('📋 기록', '📋 Log')} color="#ff9500">
          {logs.map(l => (
            <div key={l.id} className="p-2 rounded mb-1" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
              <p className="text-[11px]" style={{ color: '#ff9500' }}>{toDisplayText(language === 'en' ? (l.titleEn || l.title) : l.title, language)}</p>
              <p className="text-terminal/50 text-[11px] mt-0.5">
                {toDisplayText(language === 'en' ? (l.contentEn || l.content) : (l.content || l.contentEn), language)}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Active Quest */}
      <QuestSection character={character} ipId={ipId} language={language} t={t} />

      {starters.length > 0 && (
        <Section title={t('💡 추천 질문', '💡 Suggested')} color="#00ff41">
          <div className="space-y-1">
            {starters.map((q, i) => (
              <p key={i} className="text-terminal/50 text-[10px] cursor-pointer hover:text-terminal transition-colors"
                onClick={() => window.dispatchEvent(new CustomEvent('suggested-starter', { detail: toDisplayText(q, language) }))}>
                → {toDisplayText(q, language)}
              </p>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

const Section = ({ title, color, children }) => (
  <div className="border rounded p-3" style={{ borderColor: `${color}20`, background: 'rgba(0,0,0,0.3)' }}>
    <h3 className="text-[10px] font-bold tracking-wider mb-2" style={{ color }}>{title}</h3>
    {children}
  </div>
)

const QuestSection = ({ character, ipId, language, t }) => {
  const completedQuests = safeArray(useArchiveStore(s => s.completedQuests))
  const questProgress = useArchiveStore(s => s.questProgress) || {}
  const activeQuestByChar = useArchiveStore(s => s.activeQuestByCharacter) || {}
  const setActiveQuest = useArchiveStore(s => s.setActiveQuest)

  let quests = []
  try { quests = getVisibleQuests({ ipId, characterId: character.id, completedQuests, questProgress }) } catch {}
  if (quests.length === 0) return null

  const activeId = activeQuestByChar[`${ipId}:${character.id}`]
  const activeQuest = quests.find(q => q.id === activeId) || quests.find(q => !completedQuests.includes(q.id))

  if (!activeQuest) return null
  const isCompleted = completedQuests.includes(activeQuest.id)
  const pk = `${ipId}:${character.id}:${activeQuest.id}`
  const progress = questProgress[pk] || {}

  return (
    <Section title={t('조사 과제', 'QUESTS')} color="#9d00ff">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono" style={{ color: isCompleted ? '#00ff41' : '#9d00ff' }}>
            {isCompleted ? '[COMPLETED]' : '[ACTIVE CASE]'}
          </span>
        </div>
        <p className="text-[11px] text-terminal/80">{toDisplayText(language === 'en' ? activeQuest.titleEn : activeQuest.title, language)}</p>
        <p className="text-[11px] text-terminal/40">{toDisplayText(language === 'en' ? activeQuest.shortDescriptionEn : activeQuest.shortDescription, language)}</p>

        {/* Objectives */}
        {!isCompleted && activeQuest.objectives && (
          <div className="space-y-1 mt-1">
            {activeQuest.objectives.map(obj => {
              const os = progress.objectiveStatus?.[obj.progressKey] || { current: 0, target: obj.target || 1, done: false }
              return (
                <div key={obj.id} className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span style={{ color: os.done ? '#00ff41' : '#ffffff30' }}>{os.done ? '✓' : '○'}</span>
                  <span className={os.done ? 'text-terminal/60 line-through' : 'text-terminal/50'}>
                    {toDisplayText(language === 'en' ? obj.labelEn : obj.label, language)}
                  </span>
                  {!os.done && os.target > 1 && <span className="text-terminal/30">{os.current}/{os.target}</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* Reward preview */}
        <div className="text-[10px] font-mono mt-1" style={{ color: isCompleted ? '#9d00ff' : '#ffffff20' }}>
          {isCompleted ? `[REWARD] ${toDisplayText(language === 'en' ? activeQuest.successReward?.titleEn : activeQuest.successReward?.title, language)}` : '[REWARD: REDACTED]'}
        </div>

        {/* Set active button */}
        {!isCompleted && activeId !== activeQuest.id && (
          <button onClick={() => setActiveQuest(ipId, character.id, activeQuest.id)}
            className="text-[10px] font-mono px-2 py-1 rounded border mt-1"
            style={{ borderColor: '#9d00ff40', color: '#9d00ff', background: '#9d00ff08' }}>
            {t('활성화', 'Set Active')}
          </button>
        )}
      </div>
    </Section>
  )
}

const StatRow = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between mb-0.5">
      <span className="text-terminal/40">{label}</span>
      <span style={{ color }}>{value}/{max}</span>
    </div>
    <div className="h-1.5 bg-void rounded overflow-hidden">
      <motion.div className="h-full rounded" style={{ backgroundColor: color }}
        animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.5 }} />
    </div>
  </div>
)

export default SideInfoPanel
