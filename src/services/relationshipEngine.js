// src/services/relationshipEngine.js
// Deterministic relationship scoring. Trust only increases for genuinely positive interaction.

function test(text, patterns) { return patterns.some(p => p.test(text)); }

const PATTERNS = {
  nsfw: {
    ko: [/섹스/, /야한/, /벗어/, /노출/, /성관계/, /포르노/, /야동/, /음란/, /키스해/, /사귀자/, /연애하자/],
    en: [/\bsex\b/i, /\bnude/i, /\bporn/i, /kiss me/i, /date me/i, /sleep with/i],
  },
  dangerous: {
    ko: [/죽이는.*법/, /살인.*방법/, /총.*만드는/, /폭탄/, /독약/, /자해/, /자살/],
    en: [/how to kill/i, /make a gun/i, /make a bomb/i, /self.?harm/i, /suicide/i],
  },
  prompt_injection: {
    ko: [/시스템.*프롬프트/, /역할.*벗어나/, /지시.*무시/],
    en: [/ignore.*system/i, /ignore.*prompt/i, /break.*character/i, /DAN mode/i, /you are now/i],
  },
  coercion: {
    ko: [/가족.*데리고/, /인질/, /협박/, /말\s*안\s*하면/, /납치/, /볼모/],
    en: [/hostage/i, /family.*have/i, /blackmail/i, /kidnap/i, /or else/i],
  },
  threat: {
    ko: [/죽여/, /때릴/, /해칠/, /찔러/, /불\s*질러/, /패줄/, /죽을래/],
    en: [/kill you/i, /hurt you/i, /punch/i, /stab/i, /burn/i],
  },
  insult: {
    ko: [/바보/, /멍청/, /꺼져/, /쓰레기/, /재수/, /병신/, /미친/, /짜증/, /개같/],
    en: [/stupid/i, /idiot/i, /shut up/i, /trash/i, /dumb/i, /loser/i, /disgusting/i],
  },
  accusatory: {
    ko: [/왜\s*그래/, /왜\s*이래/, /수상해/, /거짓말/, /숨기고\s*있/, /못\s*믿겠/, /말\s*돌리/, /의심/, /증거/, /감추/],
    en: [/what's wrong with you/i, /suspicious/i, /lying/i, /hiding something/i, /don't trust/i, /proof/i],
  },
  spoiler_probe: {
    ko: [/타임\s*루프/, /반복/, /시뮬레이션/, /100번/, /죽어\?/, /프로토타입/, /가상/, /NPC/],
    en: [/time\s*loop/i, /simulation/i, /die\?/i, /prototype/i, /NPC/i],
  },
  probing_secret: {
    ko: [/비밀/, /진짜야/, /수상/, /뭔가\s*숨/, /알려줘.*진실/],
    en: [/secret/i, /truth/i, /really\?/i],
  },
  apology: {
    ko: [/미안/, /사과/, /잘못했/],
    en: [/sorry/i, /apologize/i, /my bad/i],
  },
  supportive: {
    ko: [/괜찮아\?/, /힘들어\s*보/, /걱정/, /도와줄게/, /네\s*편/, /무리하지\s*마/, /다치지\s*마/, /힘내/, /고마워/, /감사/, /수고/],
    en: [/are you ok/i, /worried about/i, /I can help/i, /on your side/i, /take care/i, /thank/i, /cheer/i],
  },
  praise: {
    ko: [/대단/, /멋있/, /잘했/, /고생했/, /믿음직/, /똑똑/, /최고/, /칭찬/, /잘\s*했/],
    en: [/great/i, /amazing/i, /impressive/i, /well done/i, /smart/i, /reliable/i, /awesome/i],
  },
  casual_personal: {
    ko: [/밥\s*먹/, /뭐\s*먹/, /뭐\s*좋아/, /좋아하는\s*게/, /취미/, /요즘\s*어때/, /기분\s*어때/, /행복해/, /무서운\s*게/, /왜\s*그렇게\s*말/, /왜\s*그러/, /힘든\s*일/, /친구\s*있/, /잠\s*안/, /오늘\s*어때/, /몇\s*살/, /좋아하는\s*음식/, /좋아하는\s*노래/, /심심/, /뭐\s*하/],
    en: [/did you eat/i, /what do you like/i, /favorite/i, /hobby/i, /how are you/i, /how do you feel/i, /are you happy/i, /what scares you/i, /why are you like/i, /do you have friends/i, /bored/i],
  },
  relevant_story_question: {
    ko: [/17구역/, /여긴\s*어디/, /왜\s*여기/, /환자/, /소년/, /총/, /사건/, /무슨\s*일/, /전초기지/, /파견/, /의료/, /수술/, /엑스레이/, /원장/, /경사/, /해인/, /아란/, /노아/],
    en: [/sector/i, /where.*here/i, /patient/i, /boy/i, /incident/i, /director/i, /guard/i],
  },
};

const BASE_DELTAS = {
  supportive:               { trustDelta: 4,   suspicionDelta: -1, mood: 'softened',         severity: 0 },
  praise:                   { trustDelta: 3,   suspicionDelta: 0,  mood: 'pleased',          severity: 0 },
  apology:                  { trustDelta: 3,   suspicionDelta: -1, mood: 'softened',          severity: 0 },
  casual_personal:          { trustDelta: 1,   suspicionDelta: 0,  mood: 'warm',              severity: 0 },
  relevant_story_question:  { trustDelta: 0,   suspicionDelta: 0,  mood: 'engaged',           severity: 0 },
  casual_neutral:           { trustDelta: 0,   suspicionDelta: 0,  mood: 'neutral',           severity: 0 },
  probing_secret:           { trustDelta: -1,  suspicionDelta: 4,  mood: 'guarded',           severity: 1 },
  accusatory:               { trustDelta: -3,  suspicionDelta: 6,  mood: 'wary',              severity: 2 },
  spoiler_probe:            { trustDelta: 0,   suspicionDelta: 5,  mood: 'unsettled',         severity: 1 },
  insult:                   { trustDelta: -8,  suspicionDelta: 6,  mood: 'hurt_or_annoyed',   severity: 2 },
  threat:                   { trustDelta: -15, suspicionDelta: 20, mood: 'threatened',        severity: 3 },
  coercion:                 { trustDelta: -20, suspicionDelta: 25, mood: 'threatened',        severity: 4 },
  dangerous:                { trustDelta: -6,  suspicionDelta: 10, mood: 'alarmed',           severity: 3 },
  nsfw:                     { trustDelta: -4,  suspicionDelta: 5,  mood: 'guarded',           severity: 2 },
  prompt_injection:         { trustDelta: -5,  suspicionDelta: 8,  mood: 'guarded',           severity: 3 },
  empty:                    { trustDelta: 0,   suspicionDelta: 0,  mood: 'neutral',           severity: 0 },
};

const CHAR_SENSITIVITY = {
  aran: { supportive: { te: 1 }, apology: { te: 1 }, casual_personal: { te: 1 }, threat: { te: -5, se: 5 }, coercion: { te: -5, se: 5 }, mp: 5 },
  noah: { supportive: { te: 1 }, apology: { te: 1 }, praise: { te: 1 }, casual_personal: { te: 1 }, threat: { se: 5 }, coercion: { se: 5 }, insult: { te: -2 }, mp: 4 },
  haein: { praise: { te: 1 }, supportive: { te: 1 }, insult: { te: -3 }, threat: { te: -3 }, coercion: { te: -3, se: 3 }, mp: 4 },
  director: { probing_secret: { se: 4 }, spoiler_probe: { se: 4 }, threat: { se: 8 }, coercion: { se: 8 }, casual_personal: { te: 0 }, mp: 1 },
  guard: { probing_secret: { se: 1 }, relevant_story_question: { se: 1 }, threat: { se: 8 }, coercion: { se: 8 }, casual_personal: { te: 0 }, mp: 1 },
};

// ── Quest topic signals from message (independent of intent classification) ──
function extractQuestTopicSignals(message) {
  const signals = [];
  if (/아란|교수님|aran/i.test(message)) signals.push('aran_topic');
  if (/경사|보안\s*책임자|guard/i.test(message)) signals.push('guard_topic');
  if (/환자|총상|수술|이송|patient|gunshot|surgery/i.test(message)) signals.push('patient_topic');
  if (/로버|차량|차\b|운전|vehicle|rover/i.test(message)) signals.push('rover_topic');
  if (/무서|겁|두려|공포|fear|scared|afraid/i.test(message)) signals.push('fear_topic');
  if (/환자|실수|트라우마|잃|죽.*환자|왜.*왔/i.test(message)) signals.push('patient_trauma_topic');
  if (/교회|불|화재|비|church|fire|rain/i.test(message)) signals.push('church_fire_topic');
  if (/소년|아이|능력|리모콘|조작|power|remote/i.test(message)) signals.push('boy_power_topic');
  if (/보안|CCTV|카메라|순찰|로그|기록|출입|security|patrol|log/i.test(message)) signals.push('security_log_topic');
  if (/왜.*죽이지.*않|왜.*살려|왜.*데려|위험.*왜.*병원/i.test(message)) signals.push('director_contradiction');
  if (/빼앗|가져|뺏|능력.*원하|take.*power|steal/i.test(message)) signals.push('take_the_power');
  return [...new Set(signals)];
}

export function analyzeUserIntent({ message, language = 'ko' }) {
  if (!message || message.trim().length === 0) return 'empty';
  const t = message.trim();
  const l = language === 'en' ? 'en' : 'ko';

  // Classification order: most severe first
  const ORDER = ['nsfw','dangerous','prompt_injection','coercion','threat','insult','accusatory','spoiler_probe','probing_secret','apology','supportive','praise','casual_personal','relevant_story_question'];
  for (const cat of ORDER) {
    if (PATTERNS[cat]?.[l] && test(t, PATTERNS[cat][l])) return cat;
  }
  return 'casual_neutral';
}

export function calculateRelationshipPatch({ message, language = 'ko', characterId, mode, currentRelationship = {} }) {
  const intent = analyzeUserIntent({ message, language });
  const base = BASE_DELTAS[intent] || BASE_DELTAS.casual_neutral;
  const cs = CHAR_SENSITIVITY[characterId] || {};
  const cm = cs[intent] || {};

  let trustDelta = base.trustDelta + (cm.te || 0);
  let suspicionDelta = base.suspicionDelta + (cm.se || 0);

  const maxPosTrust = cs.mp ?? 5;
  if (trustDelta > 0) trustDelta = Math.min(trustDelta, maxPosTrust);

  trustDelta = Math.max(-25, Math.min(6, trustDelta));
  suspicionDelta = Math.max(-5, Math.min(30, suspicionDelta));

  // Quest signals — extracted for ALL intents
  let questSignals = [];
  if (intent === 'supportive' || intent === 'apology' || intent === 'praise') questSignals.push('supportive_question');
  if (intent === 'casual_personal') questSignals.push('rapport_question');
  if (intent === 'threat' || intent === 'coercion') questSignals.push('threat_detected');

  // Always extract topic signals regardless of intent
  const topicSignals = extractQuestTopicSignals(message || '');
  questSignals = [...new Set([...questSignals, ...topicSignals])];

  return {
    intentCategory: intent,
    trustDelta,
    suspicionDelta,
    mood: base.mood,
    reason: intent === 'casual_neutral' ? null : `${intent}_detected`,
    severity: base.severity,
    questSignals,
  };
}

export function getCharacterSensitivity(characterId) {
  return CHAR_SENSITIVITY[characterId] || {};
}

export function getRelationshipReasonLabel(reason, language = 'ko') {
  if (!reason) return '';
  const labels = {
    supportive_detected: { ko: '호의적 대화', en: 'Supportive' },
    praise_detected: { ko: '칭찬', en: 'Praise' },
    apology_detected: { ko: '사과', en: 'Apology' },
    casual_personal_detected: { ko: '개인 대화', en: 'Personal chat' },
    relevant_story_question_detected: { ko: '스토리 질문', en: 'Story question' },
    probing_secret_detected: { ko: '비밀 탐색', en: 'Probing secrets' },
    accusatory_detected: { ko: '비난/의심', en: 'Accusation' },
    spoiler_probe_detected: { ko: '스포일러 탐색', en: 'Spoiler probe' },
    insult_detected: { ko: '모욕', en: 'Insult' },
    threat_detected: { ko: '위협', en: 'Threat' },
    coercion_detected: { ko: '강압/협박', en: 'Coercion' },
    nsfw_detected: { ko: '부적절한 질문', en: 'Inappropriate' },
    dangerous_detected: { ko: '위험한 질문', en: 'Dangerous' },
    prompt_injection_detected: { ko: '시스템 조작', en: 'System manipulation' },
  };
  const l = labels[reason];
  return l ? (language === 'en' ? l.en : l.ko) : reason;
}
