// Keyword-based lore retrieval (MVP — no vector DB)
import { prototypeLore } from '../data/prototype/prototype.lore';

export const retrieveRelevantLore = ({ ipId, characterId, query, language = 'ko', mode = 'canon', loreSource = null, limit = 4 }) => {
  const lore = loreSource || (ipId === 'prototype' ? prototypeLore : []);
  if (!lore.length) return [];

  const q = (query || '').toLowerCase();
  const tokens = q.split(/\s+/).filter(t => t.length > 1);

  const scored = lore.map(chunk => {
    // Block high-spoiler content
    if (chunk.spoilerLevel >= 2) return { chunk, score: -1 };
    
    // Check character scope
    const inScope = !chunk.characterScope?.length || chunk.characterScope.includes(characterId);
    if (!inScope && mode === 'canon') return { chunk, score: -1 };

    let score = 0;
    const keywords = chunk.keywords || [];
    
    for (const token of tokens) {
      for (const kw of keywords) {
        if (kw.toLowerCase().includes(token) || token.includes(kw.toLowerCase())) {
          score += 2;
        }
      }
    }

    // Boost chunks matching character scope
    if (chunk.characterScope?.includes(characterId)) score += 1;
    
    // Slight boost for lower spoiler levels
    if (chunk.spoilerLevel === 0) score += 0.5;

    return { chunk, score };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score);

  // If no matches, return general world lore
  if (!scored.length) {
    return lore
      .filter(c => c.spoilerLevel === 0 && c.category === 'location')
      .slice(0, 2);
  }

  return scored.slice(0, limit).map(s => s.chunk);
};
