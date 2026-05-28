// Unlock rules for character unlocks and story events

export const CHARACTER_UNLOCK_THRESHOLD = 3; // messages needed to unlock

export const STORY_EVENTS = {
  church_fire: {
    id: 'church_fire',
    ipId: 'prototype',
    title: '교회 화재',
    titleEn: 'Church Fire',
    phase: 'phase2intro',
    description: '교회에서 발생한 의문의 화재를 진압하라.',
    descriptionEn: 'Extinguish the mysterious fire at the church.',
    unlockCondition: 'all_characters_3_turns',
    prerequisite: null,
  },
  boss_map: {
    id: 'boss_map',
    ipId: 'prototype',
    title: '보스 전투',
    titleEn: 'Boss Map',
    phase: 'phase3dialogue',
    description: '원장과의 대결이 시작된다.',
    descriptionEn: 'The confrontation with the Director begins.',
    unlockCondition: 'story_event_complete',
    prerequisite: 'church_fire',
  },
  prequel_outro: {
    id: 'prequel_outro',
    ipId: 'prototype',
    title: '프리퀄 엔딩',
    titleEn: 'Prequel Outro',
    phase: 'phase4confrontation',
    description: '모든 것의 시작, 그 진실.',
    descriptionEn: 'The beginning of everything, and the truth.',
    unlockCondition: 'story_event_complete',
    prerequisite: 'boss_map',
  }
};

// Check if character unlock should trigger
export const shouldUnlockCharacter = (totalTurns) => {
  return totalTurns >= CHARACTER_UNLOCK_THRESHOLD;
};

// Check if story event should unlock
export const checkStoryEventUnlock = (eventId, relationships, completedEvents) => {
  const event = STORY_EVENTS[eventId];
  if (!event) return false;

  // Check prerequisite
  if (event.prerequisite && !completedEvents.includes(event.prerequisite)) {
    return false;
  }

  if (event.unlockCondition === 'all_characters_3_turns') {
    const prototypeChars = ['aran', 'noah', 'haein', 'director', 'guard'];
    return prototypeChars.every(charId => {
      const rel = relationships[`prototype:${charId}`];
      return rel && rel.totalTurns >= CHARACTER_UNLOCK_THRESHOLD;
    });
  }

  if (event.unlockCondition === 'story_event_complete') {
    return event.prerequisite && completedEvents.includes(event.prerequisite);
  }

  return false;
};
