import { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatService } from '../services/chatService'
import { retrieveRelevantLore } from '../services/loreRetrieval'
import { buildCharacterPrompt } from '../services/promptBuilder'
import { toDisplayText } from '../utils/safeText'
import { evaluateQuestProgress, evaluateGlobalCaseFiles } from '../services/questEngine'
import { calculateRelationshipPatch } from '../services/relationshipEngine'
import { shouldUnlockCharacter, CHARACTER_UNLOCK_THRESHOLD } from '../data/unlockRules'
import SideInfoPanel from './SideInfoPanel'
import useArchiveStore from '../store/useArchiveStore'
import { useLanguage } from '../i18n/LanguageContext'

// ── Error Boundary — catches ANY render crash ────────────────────────────────
class ChatErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.error('ChatModal crash caught:', err) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center">
          <div className="bg-void-light border border-alert/30 p-6 rounded max-w-md text-center">
            <p className="text-alert font-mono text-sm mb-3">⚠️ 채팅 오류가 발생했습니다</p>
            <button onClick={() => { this.setState({ hasError: false }); this.props.onClose?.() }}
              className="px-4 py-2 bg-terminal/20 border border-terminal/50 text-terminal font-mono text-sm rounded tap-target">
              닫기
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = {
  aran: {
    storyProbe: { ko: ['제17구역은 어떤 곳이야?', '왜 이 위험한 곳에 왔어?', '여기서 무슨 일이 벌어지고 있어?'], en: ['What is Sector 17?', 'Why did you come here?', 'What is going on?'] },
    freeTalk: { ko: ['좋아하는 음식 뭐야?', '쉬는 날엔 뭐 해?', '제일 행복했던 순간은?'], en: ['Favorite food?', 'Days off?', 'Happiest moment?'] },
    sceneAsk: { ko: ['의무실은 어떻게 생겼어?', '환자들은 어떤 사람들?', '밤에 여기 어때?'], en: ['What does the infirmary look like?', 'What kind of patients?', 'Night time here?'] },
  },
  noah: {
    storyProbe: { ko: ['교수님은 누구야?', '의료 보조는 어떤 일?', '무서운 일 본 적 있어?'], en: ['Who is the Professor?', 'What do you do?', 'Seen anything scary?'] },
    freeTalk: { ko: ['좋아하는 간식 뭐야?', '겁 안 나는 게 있어?', '친구 많아?'], en: ['Favorite snack?', 'Not scared of anything?', 'Many friends?'] },
    sceneAsk: { ko: ['의료 창고에 뭐가 있어?', '야간 순찰은 어때?', '전기는 어디서 나와?'], en: ['In the storage?', 'Night patrols?', 'Power source?'] },
  },
  haein: {
    storyProbe: { ko: ['팀장 된 지 얼마나 됐어?', '아란이랑 무슨 사이야?', '여기 오기 전 어디 있었어?'], en: ['How long as leader?', 'Aran relationship?', 'Before here?'] },
    freeTalk: { ko: ['스트레스 어떻게 풀어?', '좋아하는 노래 있어?', '아이 이름 정했어?'], en: ['De-stress?', 'Favorite song?', 'Baby name?'] },
    sceneAsk: { ko: ['팀장 사무실 어때?', '사람들 분위기는?', '이상한 소리 들은 적 있어?'], en: ['Your office?', 'Mood here?', 'Strange noises?'] },
  },
  director: {
    storyProbe: { ko: ['이 구역은 뭐 하는 곳이에요?', '책임자 된 지 얼마나 됐어요?', '실종 소문 들었어요.'], en: ['What is this for?', 'How long in charge?', 'Missing people?'] },
    freeTalk: { ko: ['취미가 뭐예요?', '무서운 게 뭐예요?', '밥은 뭐 좋아해요?'], en: ['Hobbies?', 'Biggest fear?', 'Favorite food?'] },
    sceneAsk: { ko: ['원장실에 뭐가 있어요?', '금지 구역은 어디예요?', '보안은 누가 해요?'], en: ['In your office?', 'Restricted areas?', 'Security?'] },
  },
  guard: {
    storyProbe: { ko: ['여기서 뭐 하는 거야?', '원장이랑 무슨 사이야?', '이상한 거 본 적 있어?'], en: ['What do you do?', 'Director relation?', 'Seen anything?'] },
    freeTalk: { ko: ['말이 왜 적어?', '무서운 거 없어?', '재미있는 거 없어?'], en: ['Why so quiet?', 'Afraid?', 'Nothing fun?'] },
    sceneAsk: { ko: ['보안실 어때?', '카메라 몇 개야?', '순찰 때 뭐 보여?'], en: ['Security room?', 'Cameras?', 'On patrol?'] },
  },
}
const DEFAULT_S = {
  storyProbe: { ko: ['네 이야기 들려줘.', '여긴 어떤 곳이야?', '무슨 일이야?'], en: ['Tell me about yourself.', 'What is this place?', 'What happened?'] },
  freeTalk: { ko: ['좋아하는 것은?', '요즘 어때?', '뭐가 중요해?'], en: ['What do you like?', 'How are you?', 'What matters?'] },
  sceneAsk: { ko: ['주변을 설명해줘.', '분위기가 어때?', '특별한 곳 있어?'], en: ['Describe area.', 'Vibe here?', 'Special places?'] },
}
const MODES = [
  { id: 'storyProbe', ko: '스토리 탐문', en: 'Story Probe' },
  { id: 'freeTalk', ko: '자유 대화', en: 'Free Talk' },
  { id: 'sceneAsk', ko: '장면 질문', en: 'Scene Ask' },
]

const sessionChats = {}

function ChatModalInner({ character, isOpen, onClose, ipId }) {
  const { language } = useLanguage()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState('storyProbe')
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [unlockToast, setUnlockToast] = useState(null)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Refs for mutable state — avoids re-render cascade in useCallback
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const relationships = useArchiveStore(s => s.relationships)
  const incrementTurn = useArchiveStore(s => s.incrementTurn)
  const updateRelationship = useArchiveStore(s => s.updateRelationship)
  const addUnlock = useArchiveStore(s => s.addUnlock)
  const checkStoryUnlocks = useArchiveStore(s => s.checkStoryUnlocks)

  const resolvedIpId = ipId || character?.ipId || 'prototype'
  const relKey = character ? `${resolvedIpId}:${character.id}` : ''
  const rel = relationships[relKey] || { trust: 0, suspicion: 0, totalTurns: 0 }

  const charName = character ? (language === 'en' ? (character.nameEn || character.name) : character.name) : ''
  const charRole = character ? (language === 'en' ? (character.roleEn || character.role) : character.role) : ''
  const c = character?.color || '#00ff41'

  const currentSuggestions = useMemo(() => {
    if (!character) return []
    const q = SUGGESTIONS[character.id] || DEFAULT_S
    const m = q[mode] || DEFAULT_S[mode]
    return m ? (language === 'en' ? m.en : m.ko) : []
  }, [character, mode, language])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!isOpen || !character) return
    const saved = sessionChats[character.id]
    if (saved && saved.length > 0) {
      setMessages(saved)
    } else {
      try {
        const openers = character.openers ? (language === 'en' ? (character.openers.en || []) : (character.openers.ko || [])) : []
        setMessages(openers.length > 0 ? [{ role: 'assistant', content: openers[Math.floor(Math.random() * openers.length)] }] : [])
      } catch { setMessages([]) }
    }
    setMode('storyProbe')
    setShowBottomSheet(false)
    setTimeout(() => { try { inputRef.current?.focus() } catch {} }, 300)
  }, [isOpen, character, language])

  useEffect(() => {
    if (character && messages.length > 0) sessionChats[character.id] = messages
  }, [messages, character])

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  // ── Send — PRESERVED EXACTLY from original ──
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading || !character) return
    const userMsg = inputText.trim()
    setInputText('')

    const previousMessages = messagesRef.current || []
    const current = [...previousMessages, { role: 'user', content: userMsg }]
    setMessages(current)
    setIsLoading(true)

    try { incrementTurn(resolvedIpId, character.id) } catch {}

    const historyForApi = previousMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map(m => ({ role: m.role, content: toDisplayText(m.content, language, '') }))

    let relevantLore = []
    try { relevantLore = retrieveRelevantLore({ ipId: resolvedIpId, characterId: character.id, query: userMsg, language, mode }) } catch {}

    let systemPrompt = ''
    try {
      systemPrompt = buildCharacterPrompt({
        ip: { id: resolvedIpId }, character, userMessage: userMsg,
        language, mode, relationshipState: rel, persona: 'boy',
        relevantLore, conversationHistory: historyForApi,
      })
    } catch {}

    try {
      const result = await chatService.sendCharacterMessage({
        ipId: resolvedIpId, characterId: character.id,
        userMessage: userMsg, language, mode,
        conversationHistory: historyForApi,
        relationshipState: rel, personaId: 'boy', systemPrompt,
      })

      const displayMsg = toDisplayText(result?.message, language, '......')
      const isWarning = !!(result && (result.blocked || result.warningType))

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isWarning ? `⚠️ ${displayMsg}` : displayMsg,
        isWarning,
      }])

      const relBefore = { ...(useArchiveStore.getState().relationships[relKey] || { trust: 0, suspicion: 0, totalTurns: 0 }) }

      const patch = result?.relationshipPatch || calculateRelationshipPatch({
        message: userMsg, language, characterId: character.id, mode,
        currentRelationship: relBefore,
      })

      if (import.meta.env.DEV) console.debug('[REL PATCH]', patch)

      try {
        updateRelationship(resolvedIpId, character.id, {
          trustDelta: Number.isFinite(patch.trustDelta) ? patch.trustDelta : 0,
          suspicionDelta: Number.isFinite(patch.suspicionDelta) ? patch.suspicionDelta : 0,
          mood: patch.mood || result?.emotion || 'neutral',
          emotion: patch.mood || result?.emotion || 'neutral',
          reason: patch.reason || patch.intentCategory || null,
          intentCategory: patch.intentCategory || 'unknown',
          severity: patch.severity || 0,
          questSignals: Array.isArray(patch.questSignals) ? patch.questSignals : [],
          memoryTags: Array.isArray(result?.memoryTags) ? result.memoryTags : [],
        })
      } catch {}

      if (import.meta.env.DEV) console.debug('[REL AFTER]', useArchiveStore.getState().relationships[relKey])

      if ((patch.trustDelta !== 0 || patch.suspicionDelta !== 0) && patch.reason) {
        const shiftText = `trust ${patch.trustDelta >= 0 ? '+' : ''}${patch.trustDelta} / suspicion ${patch.suspicionDelta >= 0 ? '+' : ''}${patch.suspicionDelta}`
        setMessages(prev => [...prev, { role: 'system', content: `RELATIONSHIP: ${shiftText} · ${patch.reason}`, isSystem: true }])
      }

      try {
        const BASIC_LORE = {
          aran: '아란은 제17구역에 새로 파견된 메딕이며, 과거 환자를 잃은 죄책감을 숨기고 있다.',
          noah: '노아는 소심하지만 선한 의료 보조원이며, 아란을 깊이 신뢰한다.',
          haein: '해인은 아란의 선배 의사이자 팀장으로, 위기 상황에서 빠르게 모순을 짚어낸다.',
          director: '원장은 제17구역의 최고 책임자이며, 친근한 말투 뒤에 무언가를 숨기고 있다.',
          guard: '경사는 제17구역의 보안 책임자로, 말수는 적지만 원장의 명령 체계 안에서 움직인다.',
        }
        const BASIC_LORE_EN = {
          aran: 'Aran is a newly assigned medic to Sector 17, hiding guilt over a patient she lost.',
          noah: 'Noah is a timid but kind medical assistant who deeply trusts Aran.',
          haein: 'Haein is Aran\'s senior doctor and team leader, quick to spot contradictions in crisis.',
          director: 'The Director is the chief of Sector 17, hiding something behind his folksy manner.',
          guard: 'The Guard is Sector 17\'s security chief, quiet but operating within the Director\'s chain of command.',
        }
        const relAfterUpdate = useArchiveStore.getState().relationships[relKey] || {}
        const turns = relAfterUpdate.totalTurns || 0
        if (turns === 3 && BASIC_LORE[character.id]) {
          addUnlock({
            id: `${character.id}_basic_lore`,
            ipId: resolvedIpId,
            characterId: character.id,
            type: 'lore',
            title: '기본 로어 복원',
            titleEn: 'Basic Lore Restored',
            content: BASIC_LORE[character.id],
            contentEn: BASIC_LORE_EN[character.id] || BASIC_LORE[character.id],
            unlockedAt: Date.now(),
          })
          setMessages(prev => [...prev, { role: 'system', content: `LORE RESTORED: ${language === 'en' ? 'Basic Lore Restored' : '기본 로어 복원'}`, isSystem: true }])
        }
      } catch {}

      try {
        const store = useArchiveStore.getState()
        const relAfter = store.relationships[relKey] || relBefore
        const evaluation = evaluateQuestProgress({
          ipId: resolvedIpId, characterId: character.id, mode,
          userMessage: userMsg, assistantMessage: displayMsg,
          relationshipPatch: patch, relationshipBefore: relBefore, relationshipAfter: relAfter,
          state: store,
        })
        if (evaluation.progressPatches.length > 0 || evaluation.completedQuestIds.length > 0) {
          store.applyQuestEvaluation(evaluation)
        }
        for (const reward of (evaluation.rewards || [])) {
          setMessages(prev => [...prev, { role: 'system', isSystem: true, content: `ARCHIVE FRAGMENT RESTORED: ${toDisplayText(reward.title || reward.titleEn, language)}` }])
        }
        const globalResults = evaluateGlobalCaseFiles(useArchiveStore.getState())
        for (const gr of globalResults) {
          store.completeQuest(gr.questId)
          if (gr.reward) store.addArchiveFragment(gr.reward)
        }
      } catch {}
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'ko' ? '⚠️ 통신이 불안정해. 다시 시도해줘.' : '⚠️ Connection unstable. Try again.',
        isWarning: true,
      }])
    }

    setIsLoading(false)
  }, [inputText, isLoading, character, resolvedIpId, language, mode, rel, incrementTurn, updateRelationship, addUnlock, checkStoryUnlocks])

  if (!character) return null

  const trustPct = Math.max(0, Math.min(100, rel.trust || 0))
  const suspPct = Math.max(0, Math.min(100, rel.suspicion || 0))

  // Shared sub-components used by both mobile and desktop layouts
  const headerContent = (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b flex-shrink-0" style={{ borderColor: `${c}20` }}>
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button onClick={onClose}
          className="sm:hidden w-9 h-9 flex items-center justify-center text-terminal/60 active:text-terminal flex-shrink-0 -ml-1"
          aria-label="Back">
          <span className="text-lg">←</span>
        </button>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: c }}>
          {(character.imageUrl || character.portraitUrl) && <img src={character.imageUrl || character.portraitUrl} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />}
        </div>
        <div className="min-w-0">
          <h3 className="font-orbitron text-sm font-bold truncate" style={{ color: c }}>{charName}</h3>
          <div className="flex items-center gap-2">
            <p className="text-terminal/50 text-[10px] sm:text-xs font-mono truncate">{charRole}</p>
            {/* Compact inline trust/suspicion on mobile */}
            <span className="sm:hidden text-[9px] font-mono" style={{ color: '#00ff41' }}>T:{trustPct}</span>
            <span className="sm:hidden text-[9px] font-mono" style={{ color: '#ff0055' }}>S:{suspPct}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Desktop trust/suspicion bars */}
        <div className="hidden sm:flex flex-col gap-1 mr-2">
          <div className="flex items-center gap-1"><span className="text-[8px] font-mono text-terminal/40 w-7">Trust</span><div className="w-14 h-1.5 bg-void rounded overflow-hidden"><div className="h-full rounded" style={{ backgroundColor:'#00ff41', width:`${trustPct}%` }}/></div><span className="text-[8px] font-mono text-terminal/30 w-5 text-right">{trustPct}</span></div>
          <div className="flex items-center gap-1"><span className="text-[8px] font-mono text-alert/40 w-7">Susp.</span><div className="w-14 h-1.5 bg-void rounded overflow-hidden"><div className="h-full rounded" style={{ backgroundColor:'#ff0055', width:`${suspPct}%` }}/></div><span className="text-[8px] font-mono text-alert/30 w-5 text-right">{suspPct}</span></div>
        </div>
        {/* Mobile: info sheet toggle */}
        <button className="sm:hidden w-9 h-9 flex items-center justify-center text-terminal/50 active:text-terminal rounded"
          onClick={() => setShowBottomSheet(!showBottomSheet)}
          aria-label="Character info">
          <span className="text-base">📋</span>
        </button>
        {/* Desktop close */}
        <button className="hidden sm:flex w-8 h-8 items-center justify-center text-terminal/50 hover:text-alert rounded" onClick={onClose}>✕</button>
      </div>
    </div>
  )

  const modeBar = (
    <div className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 border-b flex-shrink-0" style={{ borderColor: `${c}10` }}>
      {MODES.map(m => (
        <button key={m.id} onClick={() => setMode(m.id)}
          className="px-3 py-1.5 text-[10px] sm:text-[11px] font-mono rounded tap-target flex items-center justify-center"
          style={{ background: mode===m.id?`${c}20`:'transparent', border:`1px solid ${mode===m.id?`${c}50`:'transparent'}`, color: mode===m.id?c:'rgba(0,255,65,0.3)' }}>
          {language==='en'?m.en:m.ko}
        </button>
      ))}
    </div>
  )

  const toastBanner = unlockToast ? (
    <div className="mx-3 sm:mx-4 mt-2 p-2 rounded text-xs font-mono text-center flex-shrink-0" style={{ background:'rgba(157,0,255,0.15)', border:'1px solid rgba(157,0,255,0.3)', color:'#9d00ff' }}>{unlockToast}</div>
  ) : null

  const messageList = (
    <div ref={messagesContainerRef} className="chat-messages-scroll px-3 sm:px-4 py-3 space-y-3">
      {messages.map((msg, i) => {
        if (msg.isSystem) {
          return (
            <div key={i} className="flex justify-center">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ color: '#00ff4150', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.08)' }}>
                {toDisplayText(msg.content, language)}
              </span>
            </div>
          )
        }
        return (
          <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded ${msg.role==='user'?'bg-terminal/15 border border-terminal/20 rounded-br-none':msg.isWarning?'bg-alert/10 border border-alert/30 rounded-bl-none':'bg-void-light border rounded-bl-none'}`}
              style={{ borderColor: msg.role==='user'?undefined:msg.isWarning?undefined:`${c}20` }}>
              {msg.role==='assistant' && <p className="text-xs font-mono font-bold mb-1" style={{ color: msg.isWarning?'#ff0055':c }}>{charName}</p>}
              <p className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role==='user'?'text-terminal':'text-terminal/85'}`}>{toDisplayText(msg.content, language, '......')}</p>
            </div>
          </div>
        )
      })}
      {isLoading && (
        <div className="flex justify-start">
          <div className="px-4 py-3 bg-void-light border rounded rounded-bl-none" style={{ borderColor:`${c}20` }}>
            <div className="flex items-center gap-1.5">
              {[0,1,2].map(i=><motion.div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor:c }} animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1,repeat:Infinity,delay:i*0.2 }}/>)}
            </div>
          </div>
        </div>
      )}
      <div ref={endRef}/>
    </div>
  )

  const suggestionsBar = currentSuggestions.length > 0 && !isLoading ? (
    <div className="px-3 sm:px-4 py-2 border-t flex-shrink-0" style={{ borderColor:`${c}08` }}>
      <div className="suggestion-chips">
        <span className="suggestion-chip flex-shrink-0 text-[9px] font-mono self-center border-none px-1" style={{ color: 'rgba(0,255,65,0.2)' }}>
          💬
        </span>
        {currentSuggestions.map((q,i)=>(
          <button key={`${mode}-${i}`} onClick={()=>setInputText(q)}
            className="suggestion-chip"
            style={{ borderColor:`${c}25`, color:`${c}cc`, background:`${c}06` }}>
            {q}
          </button>
        ))}
      </div>
    </div>
  ) : null

  const inputBar = (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t flex-shrink-0 pb-safe" style={{ borderColor:`${c}20` }}>
      <div className="flex gap-2 items-end">
        <textarea ref={inputRef} value={inputText} onChange={e=>setInputText(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()}}}
          placeholder={language==='ko'?`${charName}에게 메시지...`:`Message ${charName}...`}
          className="flex-1 px-3 py-2.5 bg-void border border-terminal/20 text-terminal font-mono text-base resize-none rounded focus:outline-none focus:border-terminal/50"
          rows={1}
          style={{ minHeight: 44, maxHeight: 80 }} disabled={isLoading}/>
        <button onClick={handleSend} disabled={isLoading||!inputText.trim()}
          className={`px-4 sm:px-5 py-2.5 font-mono text-sm rounded border flex-shrink-0 tap-target flex items-center justify-center ${isLoading||!inputText.trim()?'bg-terminal/5 border-terminal/10 text-terminal/20 cursor-not-allowed':'bg-terminal/20 border-terminal/50 text-terminal active:bg-terminal/30'}`}>
          {isLoading?'...':language==='ko'?'전송':'Send'}
        </button>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Mobile: fullscreen chat ── */}
          <motion.div className="sm:hidden chat-fullscreen-mobile"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2 }}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            {headerContent}
            {modeBar}
            {toastBanner}
            {messageList}
            {suggestionsBar}
            {inputBar}
          </motion.div>

          {/* ── Mobile bottom sheet for SideInfoPanel ── */}
          <AnimatePresence>
            {showBottomSheet && (
              <>
                <motion.div className="sm:hidden bottom-sheet-backdrop"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowBottomSheet(false)} />
                <motion.div className="sm:hidden bottom-sheet"
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                  <div className="bottom-sheet-handle" />
                  <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
                    <h3 className="text-xs font-mono font-bold" style={{ color: c }}>
                      {language === 'en' ? 'CHARACTER INFO' : '캐릭터 정보'}
                    </h3>
                    <button onClick={() => setShowBottomSheet(false)}
                      className="w-8 h-8 flex items-center justify-center text-terminal/50 active:text-terminal">
                      ✕
                    </button>
                  </div>
                  <div className="bottom-sheet-content">
                    <SideInfoPanel character={character} ipId={resolvedIpId}/>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Desktop: modal overlay + side panel (preserved from original) ── */}
          <motion.div className="hidden sm:block fixed inset-0 z-[200] bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          <div className="hidden sm:flex fixed inset-0 z-[201] items-center justify-center p-4 pointer-events-none">
            <motion.div className="relative flex w-full pointer-events-auto overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #0a0a0a, #050505)', border: `1px solid ${c}40`, boxShadow: `0 0 60px ${c}10`, maxWidth: 900, height: 'min(92vh, 720px)', borderRadius: 6 }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>

              <div className="flex flex-col flex-1 min-w-0">
                {headerContent}
                {modeBar}
                {toastBanner}
                {messageList}
                {suggestionsBar}
                {inputBar}
              </div>

              {/* Side panel desktop */}
              <div className="w-56 flex-col border-l overflow-y-auto p-3 flex" style={{ borderColor:`${c}12`, background:'rgba(0,0,0,0.35)' }}>
                <SideInfoPanel character={character} ipId={resolvedIpId}/>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Export with ErrorBoundary wrapper ─────────────────────────────────────────
export default function CharacterChatModal(props) {
  return (
    <ChatErrorBoundary onClose={props.onClose}>
      <ChatModalInner {...props} />
    </ChatErrorBoundary>
  )
}
