// Client-side chat service — calls /api/chat only.
// NEVER returns message: null. All paths return a displayable message.

const CHAT_TIMEOUT_MS = 60_000;

const NETWORK_FALLBACK = {
  ko: '⚠️ 통신이 불안정해. 잠시 후 다시 시도해줘.',
  en: '⚠️ Connection unstable. Please try again.',
};

const FALLBACK_SUGGESTIONS = {
  ko: ['다시 말해볼게', '다른 질문을 할게', '여기 대해 알려줘'],
  en: ['Let me try again', 'Ask something else', 'Tell me about this place'],
};

export const chatService = {
  async sendCharacterMessage({
    ipId, characterId, userMessage, language = 'ko', mode = 'canon',
    conversationHistory = [], relationshipState = {}, personaId = 'boy',
    ipSnapshot = null, characterSnapshot = null, loreSnapshot = null,
    systemPrompt = null,
  }) {
    // Empty input — return gentle prompt, don't send to server
    if (!userMessage?.trim()) {
      return {
        success: true, message: language === 'ko' ? '무슨 말을 하려던 거야?' : 'What were you trying to say?',
        emotion: 'neutral', trustDelta: 0, suspicionDelta: 0,
        memoryTags: [], unlockEvent: null, suggestedReplies: FALLBACK_SUGGESTIONS[language] || FALLBACK_SUGGESTIONS.ko,
        responseType: 'empty_input', blocked: false, warningType: null,
      };
    }

    const body = {
      ipId, characterId, userMessage: userMessage.trim(), language, mode,
      conversationHistory: conversationHistory.slice(-10),
      relationshipState, personaId, systemPrompt,
    };
    if (ipSnapshot) body.ipSnapshot = ipSnapshot;
    if (characterSnapshot) body.characterSnapshot = characterSnapshot;
    if (loreSnapshot) body.loreSnapshot = loreSnapshot;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data;
      try { data = await response.json(); } catch {
        return {
          success: true, message: NETWORK_FALLBACK[language] || NETWORK_FALLBACK.ko,
          emotion: 'guarded', trustDelta: 0, suspicionDelta: 0,
          memoryTags: [], unlockEvent: null, suggestedReplies: FALLBACK_SUGGESTIONS[language] || FALLBACK_SUGGESTIONS.ko,
          responseType: 'network_error', blocked: false, warningType: null,
        };
      }

      // Normalize — ensure message is NEVER null/undefined
      return {
        success: data.success !== false,
        message: data.message || NETWORK_FALLBACK[language] || NETWORK_FALLBACK.ko,
        emotion: data.emotion || 'neutral',
        trustDelta: data.trustDelta ?? 0,
        suspicionDelta: data.suspicionDelta ?? 0,
        memoryTags: Array.isArray(data.memoryTags) ? data.memoryTags : [],
        unlockEvent: data.unlockEvent || null,
        suggestedReplies: Array.isArray(data.suggestedReplies) ? data.suggestedReplies : [],
        responseType: data.responseType || 'normal',
        blocked: data.blocked || false,
        warningType: data.warningType || null,
        userTone: data.userTone || null,
        relationshipPatch: data.relationshipPatch || null,
        questSignals: Array.isArray(data.relationshipPatch?.questSignals)
          ? data.relationshipPatch.questSignals
          : Array.isArray(data.questSignals) ? data.questSignals : [],
      };

    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      return {
        success: true,
        message: isTimeout
          ? (language === 'ko' ? '⚠️ 응답 시간이 초과됐어. 다시 시도해줘.' : '⚠️ Response timed out. Try again.')
          : (NETWORK_FALLBACK[language] || NETWORK_FALLBACK.ko),
        emotion: 'guarded', trustDelta: 0, suspicionDelta: 0,
        memoryTags: [], unlockEvent: null,
        suggestedReplies: FALLBACK_SUGGESTIONS[language] || FALLBACK_SUGGESTIONS.ko,
        responseType: 'network_error', blocked: false, warningType: null,
      };
    }
  },
};
