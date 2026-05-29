// Simple spoiler guard for MVP

const SPOILER_KEYWORDS_KO = ['타임루프', '100번 죽', '소년의 능력', '루프', '되돌아', '반복하'];
const SPOILER_KEYWORDS_EN = ['time loop', '100 deaths', "boy's power", 'loop back', 'repeating'];

export const checkForSpoilers = (text, language = 'ko') => {
  const lower = text.toLowerCase();
  const keywords = language === 'ko' ? SPOILER_KEYWORDS_KO : SPOILER_KEYWORDS_EN;
  
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      return true;
    }
  }
  return false;
};

export const sanitizeResponse = (responseText, language = 'ko') => {
  // For MVP: just check and flag, don't modify
  if (checkForSpoilers(responseText, language)) {
    return {
      text: responseText,
      hasSpoiler: true,
      warning: language === 'ko' ? '스포일러 감지됨' : 'Spoiler detected'
    };
  }
  return { text: responseText, hasSpoiler: false, warning: null };
};
