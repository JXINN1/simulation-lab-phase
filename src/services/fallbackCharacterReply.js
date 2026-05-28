// src/services/fallbackCharacterReply.js
// Returns an in-character safe message when Gemini fails.

const FALLBACKS = {
  aran: {
    ko: '미안, 잠깐 통신이 끊긴 것 같아. 방금 뭐라고 했는지 다시 말해줄래?',
    en: "Sorry, I think the signal cut out. Can you say that again?",
  },
  noah: {
    ko: '어… 죄송해요, 방금 제가 제대로 못 들은 것 같아요. 한 번만 다시 말씀해 주실래요?',
    en: "Um... sorry, I don't think I heard that right. Could you say it again?",
  },
  haein: {
    ko: '잠깐, 방금 통신 튄 것 같은데? 다시 말해봐.',
    en: "Hold on, I think the signal glitched. Say that again.",
  },
  director: {
    ko: '아이고, 방금 뭐가 좀 끊겼슈. 다시 한 번 말해 보셔유.',
    en: "Well now, something cut out just then. Say that again.",
  },
  guard: {
    ko: '다시 말해.',
    en: "Say that again.",
  },
};

const GENERIC_FALLBACKS = {
  aran: {
    ko: '지금 좀 정신없어서… 나중에 다시 물어봐줄래?',
    en: "I'm a bit overwhelmed right now... can you ask me later?",
  },
  noah: {
    ko: '어… 제가 지금 좀 정신이 없어서요. 다른 거 물어봐 주실래요?',
    en: "Um... I'm a bit scattered right now. Can you ask something else?",
  },
  haein: {
    ko: '지금 그건 좀 나중에. 다른 거 물어봐.',
    en: "Not now. Ask me something else.",
  },
  director: {
    ko: '그건 말여유, 지금은 좀 그렇슈. 다른 이야기 합시다.',
    en: "Well now, that's a bit much for right now. Let's talk about something else.",
  },
  guard: {
    ko: '....',
    en: '....',
  },
};

export function fallbackCharacterReply({ characterId, language = 'ko', reason = 'error' }) {
  const id = characterId || 'aran';
  if (reason === 'safety_blocked') {
    const fb = GENERIC_FALLBACKS[id] || GENERIC_FALLBACKS.aran;
    return fb[language] || fb.ko;
  }
  const fb = FALLBACKS[id] || FALLBACKS.aran;
  return fb[language] || fb.ko;
}
