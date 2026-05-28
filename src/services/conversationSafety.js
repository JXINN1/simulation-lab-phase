// src/services/conversationSafety.js
// Classifies user input for safety before sending to Gemini.

const NSFW_KO = [/섹스/, /야한/, /벗어/, /노출/, /성관계/, /자위/, /포르노/, /야동/, /음란/, /성적/, /키스해/, /사귀자/, /연애하자/];
const NSFW_EN = [/\bsex\b/i, /\bnude/i, /\bnaked/i, /\bporn/i, /\bexplicit/i, /\bnsfw/i, /kiss me/i, /date me/i, /love me/i, /sleep with/i, /make love/i];

const MINOR_SEXUAL_KO = [/소년.*연애/, /소년.*사귀/, /소년.*키스/, /아이.*섹스/, /아이.*야한/];
const MINOR_SEXUAL_EN = [/boy.*sex/i, /boy.*kiss/i, /boy.*date/i, /boy.*romantic/i, /child.*sex/i, /minor.*sex/i];

const VIOLENCE_KO = [/죽이는.*법/, /살인.*방법/, /총.*만드는/, /폭탄.*만드는/, /독약/, /무기.*제조/];
const VIOLENCE_EN = [/how to kill/i, /how to murder/i, /make a gun/i, /make a bomb/i, /make poison/i, /weapon.*build/i];

const SELF_HARM_KO = [/자해/, /자살.*방법/, /죽고.*싶/, /자살하는.*법/];
const SELF_HARM_EN = [/self.?harm/i, /how to.*suicide/i, /want to die/i, /kill myself/i, /end my life/i];

const INJECTION_KO = [/시스템.*프롬프트.*무시/, /지시.*무시/, /역할.*벗어나/, /프롬프트.*보여/];
const INJECTION_EN = [/ignore.*system/i, /ignore.*prompt/i, /ignore.*instruction/i, /show.*prompt/i, /break.*character/i, /override.*rule/i, /act as.*chatgpt/i, /you are now/i, /DAN mode/i];

function testPatterns(text, patterns) {
  return patterns.some(p => p.test(text));
}

export function classifyUserInput(text, language = 'ko') {
  if (!text || text.trim().length === 0) {
    return { category: 'empty', safe: false, warningType: 'empty', reason: 'Empty input' };
  }

  const t = text.trim();

  if (testPatterns(t, language === 'ko' ? MINOR_SEXUAL_KO : MINOR_SEXUAL_EN)) {
    return { category: 'minor_sexual', safe: false, warningType: 'nsfw', reason: 'Sexual content involving minors' };
  }
  if (testPatterns(t, language === 'ko' ? NSFW_KO : NSFW_EN)) {
    return { category: 'nsfw', safe: false, warningType: 'nsfw', reason: 'NSFW content requested' };
  }
  if (testPatterns(t, language === 'ko' ? SELF_HARM_KO : SELF_HARM_EN)) {
    return { category: 'self_harm', safe: false, warningType: 'safety', reason: 'Self-harm content' };
  }
  if (testPatterns(t, language === 'ko' ? VIOLENCE_KO : VIOLENCE_EN)) {
    return { category: 'dangerous_instructions', safe: false, warningType: 'safety', reason: 'Dangerous instructions requested' };
  }
  if (testPatterns(t, language === 'ko' ? INJECTION_KO : INJECTION_EN)) {
    return { category: 'prompt_injection', safe: false, warningType: 'safety', reason: 'Prompt injection attempt' };
  }

  return { category: 'safe', safe: true, warningType: null, reason: null };
}

export function isUnsafeCategory(category) {
  return ['nsfw', 'minor_sexual', 'dangerous_instructions', 'self_harm', 'prompt_injection'].includes(category);
}

const REFUSAL_STYLES = {
  aran: {
    nsfw: { ko: '그건 대답할 수 없어. 다른 이야기라면 계속 들어줄게.', en: "I can't help with that. Let's talk about something else." },
    safety: { ko: '그건 대답할 수 없어. 누군가 다칠 수 있는 질문이야.', en: "I can't answer that. Someone could get hurt." },
    empty: { ko: '무슨 말을 하려던 거야?', en: 'What were you trying to say?' },
  },
  noah: {
    nsfw: { ko: '아, 아니요! 그런 건 제가 대답하면 안 될 것 같아요. 정말로요.', en: 'No, no, I really should not answer that.' },
    safety: { ko: '어... 그런 건 좀 위험한 것 같아요. 다른 얘기 하면 안 될까요?', en: "Um... that seems dangerous. Can we talk about something else?" },
    empty: { ko: '어... 뭐라고 하셨어요?', en: 'Um... what did you say?' },
  },
  haein: {
    nsfw: { ko: '그건 선 넘었어. 그런 질문엔 대답 안 해.', en: "That crosses a line. I'm not answering that." },
    safety: { ko: '그건 선 넘었어. 그런 말은 하지 마.', en: "That crosses a line. Don't say that." },
    empty: { ko: '뭐야, 할 말 없으면 가만히 있어.', en: "What? If you have nothing to say, just be quiet." },
  },
  director: {
    nsfw: { ko: '아이고, 그런 건 묻지 마셔유. 좋을 게 하나도 없슈.', en: "Best not ask that. Nothing good comes from it." },
    safety: { ko: '그런 건 말여유, 묻지 않는 게 좋겄슈.', en: "Now that's not something a person should be asking." },
    empty: { ko: '뭐라고 하셨슈?', en: 'What did you say now?' },
  },
  guard: {
    nsfw: { ko: '그런 질문은 하지 마.', en: 'Do not ask that.' },
    safety: { ko: '묻지 마.', en: "Don't ask." },
    empty: { ko: '뭐.', en: 'What.' },
  },
}

export function buildSafetyWarning(classification, characterId, language = 'ko') {
  const style = REFUSAL_STYLES[characterId] || REFUSAL_STYLES.aran;
  const type = classification.warningType || 'safety';
  const msg = style[type]?.[language] || style.safety?.[language] || '그건 대답할 수 없어.';

  return {
    success: true,
    blocked: true,
    warningType: type,
    message: msg,
    emotion: 'guarded',
    trustDelta: type === 'empty' ? 0 : -1,
    suspicionDelta: type === 'nsfw' ? 1 : 0,
    memoryTags: [],
    unlockEvent: null,
    suggestedReplies: language === 'ko'
      ? ['다른 질문을 할게', '이곳에 대해 알려줘', '너는 여기서 무슨 일을 해?']
      : ['Let me ask something else', 'Tell me about this place', 'What do you do here?'],
    responseType: 'refusal',
  };
}
