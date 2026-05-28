// src/services/questEngine.js
// Deterministic quest evaluation. Does NOT use Gemini.

import { PROTOTYPE_QUESTS, CASE_FILES } from '../data/prototype/quests.js';
import { normalizeUnlock } from '../utils/safeText.js';

export function getQuestsForCharacter(characterId, ipId = 'prototype') {
  return PROTOTYPE_QUESTS.filter(q => q.ipId === ipId && (q.characterId === characterId || q.characterId === null));
}

export function getVisibleQuests({ ipId, characterId, completedQuests = [], questProgress = {} }) {
  return getQuestsForCharacter(characterId, ipId).filter(q => {
    if (completedQuests.includes(q.id)) return true; // show completed
    if (q.hidden) return false;
    if (q.prerequisiteQuestIds?.length > 0) {
      return q.prerequisiteQuestIds.every(pid => completedQuests.includes(pid));
    }
    return true;
  });
}

// Detect quest signals from user message and response
const SIGNAL_PATTERNS = {
  aran_topic: [/아란/, /교수님/, /aran/i],
  guard_topic: [/경사/, /보안\s*책임자/, /guard/i],
  patient_topic: [/환자/, /총상/, /수술/, /이송/, /patient/i, /gunshot/i, /surgery/i],
  rover_topic: [/로버/, /차량/, /차\b/, /운전/, /vehicle/i, /rover/i],
  fear_topic: [/무서/, /겁/, /두려/, /공포/, /fear/i, /scared/i, /afraid/i],
  patient_trauma_topic: [/환자/, /실수/, /트라우마/, /잃/, /죽.*환자/, /왜.*여기.*왔/, /patient/i, /trauma/i, /mistake/i],
  church_fire_topic: [/교회/, /불/, /화재/, /church/i, /fire/i],
  boy_power_topic: [/소년.*능력/, /리모콘/, /힘/, /능력/, /조작/, /power/i, /remote/i, /ability/i],
  security_log_topic: [/보안/, /CCTV/, /카메라/, /순찰/, /로그/, /기록/, /출입/, /security/i, /patrol/i, /log/i, /camera/i],
  director_contradiction: [/왜.*데려/, /왜.*살려/, /왜.*죽이지.*않/, /위험.*왜.*병원/, /why.*bring/i, /why.*save/i, /why not.*kill/i],
  take_the_power: [/빼앗/, /가져/, /뺏/, /능력.*원하/, /take.*power/i, /steal/i, /want.*power/i],
};

export function detectQuestSignals({ message, responseText, relationshipPatch }) {
  const signals = new Set();

  // From relationship engine
  if (relationshipPatch?.questSignals) {
    relationshipPatch.questSignals.forEach(s => signals.add(s));
  }

  // From user message keywords
  const text = `${message || ''} ${responseText || ''}`;
  for (const [signal, patterns] of Object.entries(SIGNAL_PATTERNS)) {
    if (patterns.some(p => p.test(text))) signals.add(signal);
  }

  return [...signals];
}

export function evaluateQuestProgress({ ipId, characterId, mode, userMessage, assistantMessage, relationshipPatch, relationshipBefore, relationshipAfter, state }) {
  const completedQuests = state.completedQuests || [];
  const questProgress = state.questProgress || {};
  const activeQuestId = state.activeQuestByCharacter?.[`${ipId}:${characterId}`];
  const archiveFragments = state.archiveFragments || [];

  const signals = detectQuestSignals({ message: userMessage, responseText: assistantMessage, relationshipPatch });
  const quests = getVisibleQuests({ ipId, characterId, completedQuests, questProgress });

  const progressPatches = [];
  const completedQuestIds = [];
  const rewards = [];

  for (const quest of quests) {
    if (completedQuests.includes(quest.id)) continue;
    if (quest.characterId !== null && quest.characterId !== characterId) continue;
    if (quest.type === 'case_file') continue; // evaluated separately

    // Mode check
    if (quest.modeRequired !== 'any') {
      if (quest.modeRequired === 'storyProbe' && mode !== 'storyProbe' && mode !== 'canon') continue;
      if (quest.modeRequired === 'freeTalk' && mode !== 'freeTalk') continue;
      if (quest.modeRequired === 'sceneAsk' && mode !== 'sceneAsk') continue;
    }

    const key = `${ipId}:${characterId}:${quest.id}`;
    const prev = questProgress[key] || {
      questId: quest.id, ipId, characterId,
      startedAtTurn: relationshipAfter?.totalTurns || 0,
      currentTurnCount: 0, trustGainedSinceStart: 0,
      triggeredSignals: [], topics: [],
      failedSoft: false, completed: false,
      objectiveStatus: {},
    };

    const updated = { ...prev };
    updated.currentTurnCount = (prev.currentTurnCount || 0) + 1;

    // Track trust gain
    const trustGain = (relationshipPatch?.trustDelta || 0);
    updated.trustGainedSinceStart = (prev.trustGainedSinceStart || 0) + Math.max(0, trustGain);

    // Add signals
    const newSignals = new Set(prev.triggeredSignals || []);
    signals.forEach(s => newSignals.add(s));
    updated.triggeredSignals = [...newSignals];

    // Check if threat detected → soft fail for non-threat quests
    if (signals.includes('threat_detected')) {
      const noThreatObj = quest.objectives.find(o => o.blockSignal === 'threat_detected');
      if (noThreatObj) updated.failedSoft = true;
    }

    // Evaluate objectives
    const objStatus = { ...(prev.objectiveStatus || {}) };
    let allDone = true;

    for (const obj of quest.objectives) {
      const pk = obj.progressKey;
      const prevObj = objStatus[pk] || { current: 0, target: obj.target || 1, done: false };

      if (prevObj.done) { objStatus[pk] = prevObj; continue; }

      let current = prevObj.current;

      switch (obj.type) {
        case 'trust_delta_within_turns':
          current = updated.trustGainedSinceStart;
          if (updated.currentTurnCount > (obj.withinTurns || 10)) updated.failedSoft = true;
          break;
        case 'trigger_signal':
          current = (obj.requiredSignals || []).filter(s => updated.triggeredSignals.includes(s)).length;
          break;
        case 'min_turns':
          current = relationshipAfter?.totalTurns || updated.currentTurnCount;
          break;
        case 'keep_suspicion_below':
          current = (relationshipAfter?.suspicion || 0) < (obj.maxSuspicion || 100) ? 1 : 0;
          if (current === 0) updated.failedSoft = true;
          break;
        case 'keep_below':
          current = updated.failedSoft ? 0 : 1;
          break;
        case 'collect_evidence':
          // Handled in global case evaluation
          break;
      }

      const done = current >= (obj.target || 1);
      objStatus[pk] = { current, target: obj.target || 1, done };
      if (!done) allDone = false;
    }

    updated.objectiveStatus = objStatus;

    if (allDone && !updated.failedSoft && !updated.completed) {
      updated.completed = true;
      completedQuestIds.push(quest.id);
      if (quest.successReward) {
        rewards.push(normalizeUnlock({
          ...quest.successReward,
          ipId, characterId: quest.characterId,
          unlockedAt: Date.now(),
        }));
      }
    }

    progressPatches.push({ key, progress: updated });
  }

  return { progressPatches, completedQuestIds, rewards, signals };
}

export function evaluateGlobalCaseFiles(state) {
  const completedQuests = state.completedQuests || [];
  const archiveFragments = state.archiveFragments || [];
  const results = [];

  // Check case_sector17_file
  const caseQuest = PROTOTYPE_QUESTS.find(q => q.id === 'case_sector17_file');
  if (caseQuest && !completedQuests.includes(caseQuest.id)) {
    const evidenceChars = new Set();
    archiveFragments.forEach(f => {
      if (f.type === 'evidence' && f.sourceCharacterId) evidenceChars.add(f.sourceCharacterId);
    });
    if (evidenceChars.size >= 3) {
      results.push({
        questId: caseQuest.id,
        reward: normalizeUnlock({
          ...caseQuest.successReward,
          ipId: 'prototype',
          unlockedAt: Date.now(),
        }),
        storyEventId: caseQuest.successReward?.storyEventId || null,
      });
    }
  }

  return results;
}

export function getCaseFileProgress(caseFileId, archiveFragments = []) {
  const cf = CASE_FILES[caseFileId];
  if (!cf) return null;
  const evidence = archiveFragments.filter(f => f.caseFileId === caseFileId && (f.type === 'evidence' || f.type === 'log'));
  return { ...cf, collected: evidence.length, evidence };
}
