import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useArchiveStore from '../store/useArchiveStore';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_CHAR = {
  name: '',
  nameEn: '',
  codename: '',
  role: '',
  roleEn: '',
  shortDescription: '',
  color: '#00ff88',
  canChat: true,
  portraitUrl: '',
  spriteUrl: '',
  promptKo: '',
  promptEn: '',
  canonRulesKo: '',
  canonRulesEn: '',
  openerKo: '',
  openerEn: '',
  personality: '',
  speechStyleKo: '',
  speechStyleEn: '',
};

function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20) || `char_${Date.now()}`;
}

export default function AdminLitePage({ onBack }) {
  const { language } = useLanguage() || { language: 'ko' };
  const t = language === 'ko';

  const { customIps, addCustomIp, removeCustomIp, resetCustomIps } = useArchiveStore();

  // Form state
  const [step, setStep] = useState(0); // 0=scenario, 1=characters, 2=review
  const [scenario, setScenario] = useState({
    title: '',
    titleEn: '',
    genre: '',
    tagline: '',
    taglineEn: '',
    thumbnailUrl: '',
  });
  const [chars, setChars] = useState([{ ...DEFAULT_CHAR }]);
  const [editingCharIdx, setEditingCharIdx] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [editingIpId, setEditingIpId] = useState(null);

  // Build IP object for save / export
  const buildIpObject = useCallback(() => {
    const ipId = editingIpId || `custom_${Date.now()}`;
    const builtChars = chars.map((c, i) => {
      const cid = generateId(c.name || c.nameEn) || `char_${i}`;
      return {
        id: cid,
        ipId,
        name: c.name || c.nameEn,
        nameEn: c.nameEn || c.name,
        codename: c.codename || cid.toUpperCase(),
        role: c.role,
        roleEn: c.roleEn || c.role,
        shortDescription: c.shortDescription,
        portraitUrl: c.portraitUrl || '/portraits/aran.png',
        spriteUrl: c.spriteUrl || '',
        color: c.color,
        canChat: c.canChat,
        stats: {},
        world: { mapId: ipId, position: { x: 3 + i * 4, y: 5 }, zone: { minX: 0, maxX: 29, minY: 0, maxY: 11 }, walkableTiles: [0], spriteSize: 66 },
        persona: {
          personality: c.personality ? c.personality.split(',').map(s => s.trim()) : [],
          speechStyle: {
            ko: { register: '반말', tone: c.speechStyleKo || '기본', examples: [] },
            en: { register: 'casual', tone: c.speechStyleEn || 'default', examples: [] },
          },
          values: [],
          secrets: [],
        },
        canonRules: {
          ko: c.canonRulesKo || '',
          en: c.canonRulesEn || '',
        },
        openers: {
          ko: c.openerKo ? [c.openerKo] : ['안녕.'],
          en: c.openerEn ? [c.openerEn] : ['Hey.'],
        },
        systemPrompt: {
          ko: c.promptKo || `너는 ${c.name || c.nameEn}이다. 짧고 간결하게 반말로 대답해.`,
          en: c.promptEn || `You are ${c.nameEn || c.name}. Respond briefly and casually.`,
        },
        unlocks: { memory: [], lore: [], log: [] },
      };
    });

    return {
      id: ipId,
      title: scenario.title || scenario.titleEn || 'Untitled IP',
      titleEn: scenario.titleEn || scenario.title || 'Untitled IP',
      genre: scenario.genre ? scenario.genre.split(',').map(s => s.trim()) : ['Custom'],
      tagline: scenario.tagline,
      taglineEn: scenario.taglineEn || scenario.tagline,
      thumbnailUrl: scenario.thumbnailUrl || '/portraits/aran.png',
      worldMapId: ipId,
      status: 'active',
      characters: builtChars.map(c => c.id),
      _characters: builtChars,
      _lore: [],
    };
  }, [scenario, chars, editingIpId]);

  const jsonPreview = useMemo(() => {
    try { return JSON.stringify(buildIpObject(), null, 2); }
    catch { return '{}'; }
  }, [buildIpObject]);

  const handleSave = useCallback(() => {
    const ip = buildIpObject();
    addCustomIp(ip);
    setSavedMsg(t ? '✅ 저장 완료! 랜딩 페이지에서 확인하세요.' : '✅ Saved! Check the landing page.');
    setTimeout(() => setSavedMsg(''), 3000);
  }, [buildIpObject, addCustomIp, t]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([jsonPreview], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.title || 'custom-ip'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonPreview, scenario.title]);

  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(jsonPreview).then(() => {
      setSavedMsg(t ? '📋 클립보드에 복사됨' : '📋 Copied to clipboard');
      setTimeout(() => setSavedMsg(''), 2000);
    });
  }, [jsonPreview, t]);

  const handleLoadExisting = useCallback((ipId) => {
    const ip = customIps[ipId];
    if (!ip) return;
    setEditingIpId(ipId);
    setScenario({
      title: ip.title || '',
      titleEn: ip.titleEn || '',
      genre: (ip.genre || []).join(', '),
      tagline: ip.tagline || '',
      taglineEn: ip.taglineEn || '',
      thumbnailUrl: ip.thumbnailUrl || '',
    });
    const loadedChars = (ip._characters || []).map(c => ({
      name: c.name || '',
      nameEn: c.nameEn || '',
      codename: c.codename || '',
      role: c.role || '',
      roleEn: c.roleEn || '',
      shortDescription: c.shortDescription || '',
      color: c.color || '#00ff88',
      canChat: c.canChat !== false,
      portraitUrl: c.portraitUrl || '',
      spriteUrl: c.spriteUrl || '',
      promptKo: c.systemPrompt?.ko || '',
      promptEn: c.systemPrompt?.en || '',
      canonRulesKo: c.canonRules?.ko || '',
      canonRulesEn: c.canonRules?.en || '',
      openerKo: (c.openers?.ko || [])[0] || '',
      openerEn: (c.openers?.en || [])[0] || '',
      personality: (c.persona?.personality || []).join(', '),
      speechStyleKo: c.persona?.speechStyle?.ko?.tone || '',
      speechStyleEn: c.persona?.speechStyle?.en?.tone || '',
    }));
    setChars(loadedChars.length > 0 ? loadedChars : [{ ...DEFAULT_CHAR }]);
    setEditingCharIdx(0);
    setStep(0);
  }, [customIps]);

  const updateChar = (field, value) => {
    setChars(prev => {
      const n = [...prev];
      n[editingCharIdx] = { ...n[editingCharIdx], [field]: value };
      return n;
    });
  };

  const addChar = () => {
    setChars(prev => [...prev, { ...DEFAULT_CHAR }]);
    setEditingCharIdx(chars.length);
  };

  const removeChar = (idx) => {
    if (chars.length <= 1) return;
    setChars(prev => prev.filter((_, i) => i !== idx));
    setEditingCharIdx(Math.max(0, editingCharIdx - 1));
  };

  const existingIpIds = Object.keys(customIps);
  const char = chars[editingCharIdx] || DEFAULT_CHAR;

  // Styles
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'rgba(0,255,65,0.05)',
    border: '1px solid rgba(0,255,65,0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    color: '#00ff41',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };

  const btnStyle = (color = '#00ff41') => ({
    padding: '10px 20px',
    background: `${color}15`,
    border: `1px solid ${color}40`,
    borderRadius: '8px',
    color: color,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 50%, #0a0a0a 100%)',
        color: '#e0e0e0',
        fontFamily: "'Noto Sans KR', 'Courier New', monospace",
        padding: '20px',
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={onBack} style={{ ...btnStyle('#888'), padding: '8px 16px', fontSize: '13px' }}>
            ← {t ? '랜딩으로' : 'Back'}
          </button>
          <h1 style={{ color: '#00ff41', fontSize: '20px', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
            {t ? '🛠 IP 빌더 (Admin Lite)' : '🛠 IP Builder (Admin Lite)'}
          </h1>
          <div style={{ width: '100px' }} />
        </div>

        {/* Existing IPs */}
        {existingIpIds.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#00ff41', marginBottom: '8px', textTransform: 'uppercase' }}>
              {t ? '저장된 커스텀 IP' : 'Saved Custom IPs'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {existingIpIds.map(ipId => (
                <div key={ipId} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLoadExisting(ipId)}
                    style={{ ...btnStyle('#60a5fa'), padding: '6px 12px', fontSize: '12px' }}
                  >
                    📝 {customIps[ipId].title}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t ? '삭제하시겠습니까?' : 'Delete this IP?')) {
                        removeCustomIp(ipId);
                      }
                    }}
                    style={{ ...btnStyle('#ff4444'), padding: '6px 8px', fontSize: '11px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[
            t ? '① 시나리오' : '① Scenario',
            t ? '② 캐릭터' : '② Characters',
            t ? '③ 미리보기' : '③ Preview',
          ].map((label, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                flex: 1,
                padding: '10px',
                background: step === i ? 'rgba(0,255,65,0.12)' : 'rgba(255,255,255,0.03)',
                border: step === i ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                color: step === i ? '#00ff41' : '#888',
                fontSize: '13px',
                fontWeight: step === i ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Scenario */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '제목 (한국어)' : 'Title (KO)'}</label>
                    <input style={inputStyle} value={scenario.title} onChange={e => setScenario(p => ({ ...p, title: e.target.value }))} placeholder={t ? '예: 달빛 연구소' : 'e.g. Moonlight Lab'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '제목 (영어)' : 'Title (EN)'}</label>
                    <input style={inputStyle} value={scenario.titleEn} onChange={e => setScenario(p => ({ ...p, titleEn: e.target.value }))} placeholder="e.g. Moonlight Lab" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t ? '장르 (쉼표 구분)' : 'Genre (comma-separated)'}</label>
                  <input style={inputStyle} value={scenario.genre} onChange={e => setScenario(p => ({ ...p, genre: e.target.value }))} placeholder="Sci-Fi, Romance, Mystery" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '태그라인 (한국어)' : 'Tagline (KO)'}</label>
                    <input style={inputStyle} value={scenario.tagline} onChange={e => setScenario(p => ({ ...p, tagline: e.target.value }))} placeholder={t ? '한줄 소개' : 'One-line pitch'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '태그라인 (영어)' : 'Tagline (EN)'}</label>
                    <input style={inputStyle} value={scenario.taglineEn} onChange={e => setScenario(p => ({ ...p, taglineEn: e.target.value }))} placeholder="One-line pitch" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t ? '썸네일 URL (선택)' : 'Thumbnail URL (optional)'}</label>
                  <input style={inputStyle} value={scenario.thumbnailUrl} onChange={e => setScenario(p => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="/portraits/aran.png or https://..." />
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setStep(1)} style={btnStyle()}>
                  {t ? '다음: 캐릭터 →' : 'Next: Characters →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Characters */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Character tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {chars.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setEditingCharIdx(i)}
                    style={{
                      padding: '6px 14px',
                      background: editingCharIdx === i ? 'rgba(0,255,65,0.12)' : 'rgba(255,255,255,0.03)',
                      border: editingCharIdx === i ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '20px',
                      color: editingCharIdx === i ? (c.color || '#00ff41') : '#888',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {c.name || c.nameEn || `Character ${i + 1}`}
                  </button>
                ))}
                <button onClick={addChar} style={{ ...btnStyle('#60a5fa'), padding: '6px 14px', fontSize: '13px', borderRadius: '20px' }}>
                  + {t ? '추가' : 'Add'}
                </button>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {/* Row 1: Names */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '이름 (한국어)' : 'Name (KO)'}</label>
                    <input style={inputStyle} value={char.name} onChange={e => updateChar('name', e.target.value)} placeholder={t ? '예: 루나' : 'e.g. Luna'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '이름 (영어)' : 'Name (EN)'}</label>
                    <input style={inputStyle} value={char.nameEn} onChange={e => updateChar('nameEn', e.target.value)} placeholder="e.g. Luna" />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '코드명' : 'Codename'}</label>
                    <input style={inputStyle} value={char.codename} onChange={e => updateChar('codename', e.target.value)} placeholder="SUBJECT-X" />
                  </div>
                </div>

                {/* Row 2: Role */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '역할 (한국어)' : 'Role (KO)'}</label>
                    <input style={inputStyle} value={char.role} onChange={e => updateChar('role', e.target.value)} placeholder={t ? '예: 연구원' : 'e.g. Researcher'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '역할 (영어)' : 'Role (EN)'}</label>
                    <input style={inputStyle} value={char.roleEn} onChange={e => updateChar('roleEn', e.target.value)} placeholder="e.g. Researcher" />
                  </div>
                </div>

                {/* Short desc */}
                <div>
                  <label style={labelStyle}>{t ? '짧은 설명' : 'Short Description'}</label>
                  <input style={inputStyle} value={char.shortDescription} onChange={e => updateChar('shortDescription', e.target.value)} placeholder={t ? '한줄로 캐릭터를 설명해주세요' : 'Describe the character in one line'} />
                </div>

                {/* Color + portraits */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '색상' : 'Color'}</label>
                    <input type="color" value={char.color} onChange={e => updateChar('color', e.target.value)} style={{ width: '100%', height: '38px', background: 'transparent', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '6px', cursor: 'pointer' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '초상화 URL' : 'Portrait URL'}</label>
                    <input style={inputStyle} value={char.portraitUrl} onChange={e => updateChar('portraitUrl', e.target.value)} placeholder="/portraits/aran.png" />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '스프라이트 URL' : 'Sprite URL'}</label>
                    <input style={inputStyle} value={char.spriteUrl} onChange={e => updateChar('spriteUrl', e.target.value)} placeholder="/characters/aran.png" />
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <label style={labelStyle}>{t ? '성격 (쉼표 구분)' : 'Personality Traits (comma-separated)'}</label>
                  <input style={inputStyle} value={char.personality} onChange={e => updateChar('personality', e.target.value)} placeholder={t ? '예: 차가움, 비밀이 많음, 관찰력이 좋음' : 'e.g. Cold, Mysterious, Observant'} />
                </div>

                {/* Speech Style */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '말투 스타일 (한국어)' : 'Speech Style (KO)'}</label>
                    <input style={inputStyle} value={char.speechStyleKo} onChange={e => updateChar('speechStyleKo', e.target.value)} placeholder={t ? '예: 차갑고 단호한' : 'e.g. cold and decisive'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '말투 스타일 (영어)' : 'Speech Style (EN)'}</label>
                    <input style={inputStyle} value={char.speechStyleEn} onChange={e => updateChar('speechStyleEn', e.target.value)} placeholder="e.g. cold and decisive" />
                  </div>
                </div>

                {/* Opener */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>{t ? '첫 인사 (한국어)' : 'Opening Line (KO)'}</label>
                    <input style={inputStyle} value={char.openerKo} onChange={e => updateChar('openerKo', e.target.value)} placeholder={t ? '예: ...누구야?' : 'e.g. ...who are you?'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t ? '첫 인사 (영어)' : 'Opening Line (EN)'}</label>
                    <input style={inputStyle} value={char.openerEn} onChange={e => updateChar('openerEn', e.target.value)} placeholder="e.g. ...who are you?" />
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label style={labelStyle}>{t ? '시스템 프롬프트 (한국어)' : 'System Prompt (KO)'}</label>
                  <textarea style={textareaStyle} value={char.promptKo} onChange={e => updateChar('promptKo', e.target.value)} placeholder={t ? '이 캐릭터가 어떻게 행동해야 하는지 설명해주세요...' : 'Describe how this character should behave...'} />
                </div>
                <div>
                  <label style={labelStyle}>{t ? '시스템 프롬프트 (영어)' : 'System Prompt (EN)'}</label>
                  <textarea style={textareaStyle} value={char.promptEn} onChange={e => updateChar('promptEn', e.target.value)} placeholder="Describe how this character should behave..." />
                </div>

                {/* Canon Rules */}
                <div>
                  <label style={labelStyle}>{t ? '캐논 규칙 (한국어) — 선택' : 'Canon Rules (KO) — optional'}</label>
                  <textarea style={{ ...textareaStyle, minHeight: '60px' }} value={char.canonRulesKo} onChange={e => updateChar('canonRulesKo', e.target.value)} placeholder={t ? '절대 말하면 안 되는 것, 시점 제한 등...' : 'Things this character must never say, timeline restrictions...'} />
                </div>
                <div>
                  <label style={labelStyle}>{t ? '캐논 규칙 (영어) — 선택' : 'Canon Rules (EN) — optional'}</label>
                  <textarea style={{ ...textareaStyle, minHeight: '60px' }} value={char.canonRulesEn} onChange={e => updateChar('canonRulesEn', e.target.value)} placeholder="Things this character must never say, timeline restrictions..." />
                </div>

                {/* Remove button */}
                {chars.length > 1 && (
                  <button
                    onClick={() => removeChar(editingCharIdx)}
                    style={{ ...btnStyle('#ff4444'), alignSelf: 'flex-start', fontSize: '12px', padding: '6px 14px' }}
                  >
                    🗑 {t ? '이 캐릭터 삭제' : 'Remove this character'}
                  </button>
                )}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(0)} style={btnStyle('#888')}>
                  ← {t ? '시나리오' : 'Scenario'}
                </button>
                <button onClick={() => setStep(2)} style={btnStyle()}>
                  {t ? '미리보기 →' : 'Preview →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review & Export */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Summary Card */}
              <div style={{ padding: '16px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#00ff41', marginBottom: '6px' }}>
                  {scenario.title || scenario.titleEn || 'Untitled'}
                </div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                  {scenario.genre || 'Custom'} — {scenario.tagline || scenario.taglineEn || '...'}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t ? `캐릭터 ${chars.length}명` : `${chars.length} Character(s)`}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {chars.map((c, i) => (
                    <div key={i} style={{
                      padding: '8px 14px',
                      background: `${c.color}10`,
                      border: `1px solid ${c.color}40`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: c.color,
                    }}>
                      <span style={{ fontWeight: 700 }}>{c.name || c.nameEn || `Char ${i + 1}`}</span>
                      {c.role && <span style={{ opacity: 0.7, marginLeft: '6px' }}>— {c.role}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button onClick={handleSave} style={btnStyle('#00ff41')}>
                  💾 {t ? '저장 (localStorage)' : 'Save (localStorage)'}
                </button>
                <button onClick={handleDownloadJson} style={btnStyle('#60a5fa')}>
                  📥 {t ? 'JSON 다운로드' : 'Download JSON'}
                </button>
                <button onClick={handleCopyJson} style={btnStyle('#a78bfa')}>
                  📋 {t ? 'JSON 복사' : 'Copy JSON'}
                </button>
                <button onClick={() => setShowJson(p => !p)} style={btnStyle('#888')}>
                  {showJson ? '▲' : '▼'} {t ? 'JSON 보기' : 'View JSON'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(t ? '모든 커스텀 IP를 삭제하시겠습니까?' : 'Reset all custom IPs?')) {
                      resetCustomIps();
                      setScenario({ title: '', titleEn: '', genre: '', tagline: '', taglineEn: '', thumbnailUrl: '' });
                      setChars([{ ...DEFAULT_CHAR }]);
                      setEditingIpId(null);
                      setStep(0);
                    }
                  }}
                  style={btnStyle('#ff4444')}
                >
                  🔄 {t ? '전체 초기화' : 'Reset All'}
                </button>
              </div>

              {/* Saved message */}
              {savedMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '10px', background: 'rgba(0,255,65,0.08)', borderRadius: '6px', color: '#00ff41', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}
                >
                  {savedMsg}
                </motion.div>
              )}

              {/* JSON Preview */}
              {showJson && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(0,255,65,0.15)',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '11px',
                    color: '#00ff41',
                    overflow: 'auto',
                    maxHeight: '400px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {jsonPreview}
                </motion.pre>
              )}

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                <button onClick={() => setStep(1)} style={btnStyle('#888')}>
                  ← {t ? '캐릭터 수정' : 'Edit Characters'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
