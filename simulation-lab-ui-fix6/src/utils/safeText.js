// src/utils/safeText.js
// Ensures React never receives an object as a text child.

export function toDisplayText(value, language = 'ko', fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(v => toDisplayText(v, language, '')).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    // {ko, en} pattern
    if (value.ko || value.en) return (language === 'en' ? (value.en || value.ko) : (value.ko || value.en)) || fallback;
    // {text} or {content} pattern
    if (value.text) return toDisplayText(value.text, language, fallback);
    if (value.content) return toDisplayText(value.content, language, fallback);
    try { return JSON.stringify(value); } catch { return fallback; }
  }
  return fallback;
}

export function safeArray(value) {
  if (Array.isArray(value)) return value;
  return [];
}

export function safeObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  return {};
}

export function normalizeUnlock(unlock) {
  if (!unlock || typeof unlock !== 'object') return null;
  return {
    ...unlock,
    id: unlock.id || `unlock_${Date.now()}`,
    type: unlock.type || 'memory',
    title: toDisplayText(unlock.title, 'ko', ''),
    titleEn: toDisplayText(unlock.titleEn || unlock.title, 'en', ''),
    content: toDisplayText(unlock.content, 'ko', ''),
    contentEn: toDisplayText(unlock.contentEn || unlock.content, 'en', ''),
  };
}
