import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHARACTER_UNLOCK_THRESHOLD, checkStoryEventUnlock, STORY_EVENTS } from '../data/unlockRules';
import { normalizeUnlock } from '../utils/safeText';

const useArchiveStore = create(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'ipLabLanding',
      selectedIpId: null,
      selectedCharacterId: null,
      selectedPersonaId: 'boy',
      activeArchiveTab: 'characters',

      // Relationships keyed by `${ipId}:${characterId}`
      relationships: {},

      // Unlocked content array
      unlockedContent: [],

      // Story events
      completedStoryEvents: [],
      storyEventsUnlocked: [],

      // Custom IPs from Add IP Builder
      customIps: {},
      customCharacters: {},
      customLore: {},

      // Conversation history keyed by `${ipId}:${characterId}`
      conversationHistory: {},

      // Quest system
      questProgress: {},
      completedQuests: [],
      activeQuestByCharacter: {},
      archiveFragments: [],
      caseFiles: {},

      // Actions
      setPage: (page) => set({ currentPage: page }),
      
      selectIp: (ipId) => set({ selectedIpId: ipId }),
      
      selectCharacter: (characterId) => set({ selectedCharacterId: characterId }),
      
      setArchiveTab: (tab) => set({ activeArchiveTab: tab }),

      addCustomIp: (ip) => set(state => {
        const newCustomIps = { ...state.customIps, [ip.id]: ip };
        const newCustomChars = { ...state.customCharacters };
        const newCustomLore = { ...state.customLore };
        
        if (ip._characters) {
          ip._characters.forEach(c => { newCustomChars[c.id] = c; });
        }
        if (ip._lore) {
          newCustomLore[ip.id] = ip._lore;
        }
        
        return { customIps: newCustomIps, customCharacters: newCustomChars, customLore: newCustomLore };
      }),

      removeCustomIp: (ipId) => set(state => {
        const newCustomIps = { ...state.customIps };
        const newCustomChars = { ...state.customCharacters };
        const newCustomLore = { ...state.customLore };
        
        const ip = newCustomIps[ipId];
        if (ip && ip.characters) {
          ip.characters.forEach(cid => { delete newCustomChars[cid]; });
        }
        delete newCustomIps[ipId];
        delete newCustomLore[ipId];
        
        return { customIps: newCustomIps, customCharacters: newCustomChars, customLore: newCustomLore };
      }),

      updateRelationship: (ipId, characterId, delta) => set(state => {
        const key = `${ipId}:${characterId}`;
        const prev = state.relationships[key] || { trust: 0, suspicion: 0, totalTurns: 0, mood: 'neutral', memoryTags: [], lastEmotion: 'neutral', relationshipEvents: [] };
        const events = Array.isArray(prev.relationshipEvents) ? prev.relationshipEvents : [];
        const newEvent = delta.reason ? {
          id: `re_${Date.now()}`,
          timestamp: Date.now(),
          intentCategory: delta.intentCategory || delta.emotion || 'unknown',
          reason: delta.reason,
          trustDelta: delta.trustDelta || 0,
          suspicionDelta: delta.suspicionDelta || 0,
          mood: delta.emotion || delta.mood || 'neutral',
        } : null;
        return {
          relationships: {
            ...state.relationships,
            [key]: {
              ...prev,
              trust: Math.max(0, Math.min(100, prev.trust + (delta.trustDelta || 0))),
              suspicion: Math.max(0, Math.min(100, prev.suspicion + (delta.suspicionDelta || 0))),
              mood: delta.emotion || delta.mood || prev.mood,
              lastEmotion: delta.emotion || delta.mood || prev.lastEmotion,
              memoryTags: [...new Set([...prev.memoryTags, ...(delta.memoryTags || [])])],
              relationshipEvents: newEvent ? [...events.slice(-19), newEvent] : events,
            }
          }
        };
      }),

      incrementTurn: (ipId, characterId) => set(state => {
        const key = `${ipId}:${characterId}`;
        const prev = state.relationships[key] || { trust: 0, suspicion: 0, totalTurns: 0, mood: 'neutral', memoryTags: [], lastEmotion: 'neutral' };
        return {
          relationships: {
            ...state.relationships,
            [key]: { ...prev, totalTurns: prev.totalTurns + 1 }
          }
        };
      }),

      addUnlock: (unlock) => set(state => {
        const arr = Array.isArray(state.unlockedContent) ? state.unlockedContent : [];
        const normalized = normalizeUnlock(unlock);
        if (!normalized) return state;
        if (arr.find(u => u.id === normalized.id)) return state;
        return { unlockedContent: [...arr, normalized] };
      }),

      completeStoryEvent: (eventId) => set(state => {
        if (state.completedStoryEvents.includes(eventId)) return state;
        return { completedStoryEvents: [...state.completedStoryEvents, eventId] };
      }),

      unlockStoryEvent: (eventId) => set(state => {
        if (state.storyEventsUnlocked.includes(eventId)) return state;
        return { storyEventsUnlocked: [...state.storyEventsUnlocked, eventId] };
      }),

      checkStoryUnlocks: (ipId) => {
        const state = get();
        Object.keys(STORY_EVENTS).forEach(eventId => {
          const event = STORY_EVENTS[eventId];
          if (event.ipId !== ipId) return;
          if (state.storyEventsUnlocked.includes(eventId)) return;
          if (checkStoryEventUnlock(eventId, state.relationships, state.completedStoryEvents)) {
            set(s => ({ storyEventsUnlocked: [...s.storyEventsUnlocked, eventId] }));
          }
        });
      },

      addConversationMessage: (ipId, characterId, message) => set(state => {
        const key = `${ipId}:${characterId}`;
        const prev = state.conversationHistory[key] || [];
        const updated = [...prev, message].slice(-20); // keep last 20
        return { conversationHistory: { ...state.conversationHistory, [key]: updated } };
      }),

      getRelationship: (ipId, characterId) => {
        const key = `${ipId}:${characterId}`;
        return get().relationships[key] || { trust: 0, suspicion: 0, totalTurns: 0, mood: 'neutral', memoryTags: [], lastEmotion: 'neutral' };
      },

      resetArchiveProgress: () => set({
        relationships: {},
        unlockedContent: [],
        completedStoryEvents: [],
        storyEventsUnlocked: [],
        conversationHistory: {},
      }),

      resetCustomIps: () => set({
        customIps: {},
        customCharacters: {},
        customLore: {},
      }),

      // Quest actions
      setActiveQuest: (ipId, characterId, questId) => set(state => ({
        activeQuestByCharacter: { ...state.activeQuestByCharacter, [`${ipId}:${characterId}`]: questId }
      })),

      updateQuestProgress: (ipId, characterId, questId, progressData) => set(state => {
        const key = `${ipId}:${characterId}:${questId}`;
        return { questProgress: { ...state.questProgress, [key]: progressData } };
      }),

      completeQuest: (questId) => set(state => {
        if ((state.completedQuests || []).includes(questId)) return state;
        return { completedQuests: [...(state.completedQuests || []), questId] };
      }),

      addArchiveFragment: (fragment) => set(state => {
        const arr = Array.isArray(state.archiveFragments) ? state.archiveFragments : [];
        if (!fragment?.id || arr.find(f => f.id === fragment.id)) return state;
        return { archiveFragments: [...arr, fragment] };
      }),

      applyQuestEvaluation: (evaluation) => set(state => {
        let newState = { ...state };
        // Apply progress patches
        if (evaluation.progressPatches) {
          const qp = { ...(state.questProgress || {}) };
          evaluation.progressPatches.forEach(p => { qp[p.key] = p.progress; });
          newState.questProgress = qp;
        }
        // Complete quests
        if (evaluation.completedQuestIds?.length > 0) {
          const cq = [...(state.completedQuests || [])];
          evaluation.completedQuestIds.forEach(id => { if (!cq.includes(id)) cq.push(id); });
          newState.completedQuests = cq;
        }
        // Add rewards as archive fragments and unlocked content
        if (evaluation.rewards?.length > 0) {
          const af = [...(state.archiveFragments || [])];
          const uc = [...(state.unlockedContent || [])];
          evaluation.rewards.forEach(r => {
            if (r?.id && !af.find(f => f.id === r.id)) af.push(r);
            if (r?.id && !uc.find(u => u.id === r.id)) uc.push(r);
          });
          newState.archiveFragments = af;
          newState.unlockedContent = uc;
        }
        return newState;
      }),
    }),
    {
      name: 'code-fantasia-ip-sim-lab',
      version: 8,
      migrate: (persisted, version) => {
        // Sanitize all persisted state
        const safe = {
          selectedIpId: persisted?.selectedIpId || null,
          relationships: (persisted?.relationships && typeof persisted.relationships === 'object' && !Array.isArray(persisted.relationships)) ? persisted.relationships : {},
          unlockedContent: Array.isArray(persisted?.unlockedContent) ? persisted.unlockedContent.map(u => normalizeUnlock(u)).filter(Boolean) : [],
          completedStoryEvents: Array.isArray(persisted?.completedStoryEvents) ? persisted.completedStoryEvents : [],
          storyEventsUnlocked: Array.isArray(persisted?.storyEventsUnlocked) ? persisted.storyEventsUnlocked : [],
          customIps: (persisted?.customIps && typeof persisted.customIps === 'object') ? persisted.customIps : {},
          customCharacters: (persisted?.customCharacters && typeof persisted.customCharacters === 'object') ? persisted.customCharacters : {},
          customLore: (persisted?.customLore && typeof persisted.customLore === 'object') ? persisted.customLore : {},
        };
        if (version < 8) safe.unlockedContent = []; // Clear old corrupted unlocks
        return safe;
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...((persistedState && typeof persistedState === 'object') ? persistedState : {}),
        unlockedContent: Array.isArray(persistedState?.unlockedContent) ? persistedState.unlockedContent : [],
        relationships: (persistedState?.relationships && typeof persistedState.relationships === 'object') ? persistedState.relationships : {},
      }),
      partialize: (state) => ({
        selectedIpId: state.selectedIpId,
        relationships: state.relationships,
        unlockedContent: state.unlockedContent,
        completedStoryEvents: state.completedStoryEvents,
        storyEventsUnlocked: state.storyEventsUnlocked,
        customIps: state.customIps,
        customCharacters: state.customCharacters,
        customLore: state.customLore,
        questProgress: state.questProgress,
        completedQuests: state.completedQuests,
        activeQuestByCharacter: state.activeQuestByCharacter,
        archiveFragments: state.archiveFragments,
        caseFiles: state.caseFiles,
      })
    }
  )
);

export default useArchiveStore;
