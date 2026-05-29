import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ipCatalog } from '../data/ipCatalog'
import useArchiveStore from '../store/useArchiveStore'
import { useLanguage } from '../i18n/LanguageContext'

// IPs with Canvas world get this badge; others get Character Chat badge
const IP_TYPE_META = {
  prototype: { badgeEn: 'Interactive World', badgeKo: '인터랙티브 월드', icon: '🎮' },
}
function getIpTypeMeta(ipId) {
  return IP_TYPE_META[ipId] || { badgeEn: 'Character Chat', badgeKo: '캐릭터 챗', icon: '💬' }
}

const IPLabLanding = ({ onSelectIp, onOpenAdmin }) => {
  const { language, setLanguage } = useLanguage()
  const customIps = useArchiveStore(s => s.customIps)
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => {
    if (!language) setLanguage('ko')
  }, [language, setLanguage])

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const allIps = [
    ...Object.values(ipCatalog),
    ...Object.values(customIps),
  ]

  const t = (ko, en) => language === 'en' ? en : ko

  return (
    <div className="min-h-screen-safe relative overflow-hidden pb-safe" style={{ background: '#050505', color: '#e0e0e0' }}>
      {/* Scanlines */}
      <div className="fixed inset-0 z-10 pointer-events-none" 
        style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px)' }} />

      {/* Vignette */}
      <div className="fixed inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,5,0.7) 100%)' }} />

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {!bootDone ? (
            <motion.div key="boot" className="min-h-screen-safe flex items-center justify-center"
              exit={{ opacity: 0 }}>
              <div className="flex flex-col items-center gap-3">
                {['INITIALIZING CODE FANTASIA...', 'LOADING IP SIMULATION LAB...', 'CONNECTING TO ARCHIVE...'].map((msg, i) => (
                  <motion.p key={i} className="text-sm tracking-wider font-mono"
                    style={{ color: 'rgba(0,255,65,0.7)' }}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}>
                    {'>'} {msg}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 sm:space-y-10">
              {/* Header */}
              <header className="text-center pt-4 sm:pt-8 space-y-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <p className="text-xs tracking-[0.4em] font-mono mb-2" style={{ color: 'rgba(0,255,65,0.5)' }}>
                    CODE FANTASIA
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black" style={{ 
                    fontFamily: 'Orbitron, monospace', color: '#00ff41',
                    textShadow: '0 0 10px #00ff41, 0 0 30px rgba(0,255,65,0.3)'
                  }}>
                    IP SIMULATION LAB
                  </h1>
                  <p className="text-sm font-mono mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t('IP 아카이브에 접속하여 시뮬레이션을 시작하세요', 'Access the IP Archive to begin simulation')}
                  </p>
                </motion.div>

                {/* Language Toggle */}
                <motion.div className="flex items-center justify-center gap-2" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <button onClick={() => setLanguage('ko')}
                    className="px-4 py-2 rounded text-xs font-mono transition-all tap-target flex items-center justify-center"
                    style={{
                      background: language === 'ko' ? 'rgba(0,255,65,0.15)' : 'transparent',
                      border: `1px solid ${language === 'ko' ? '#00ff41' : 'rgba(0,255,65,0.25)'}`,
                      color: language === 'ko' ? '#00ff41' : 'rgba(0,255,65,0.4)',
                    }}>한국어</button>
                  <span className="text-terminal/20">/</span>
                  <button onClick={() => setLanguage('en')}
                    className="px-4 py-2 rounded text-xs font-mono transition-all tap-target flex items-center justify-center"
                    style={{
                      background: language === 'en' ? 'rgba(0,212,255,0.15)' : 'transparent',
                      border: `1px solid ${language === 'en' ? '#00d4ff' : 'rgba(0,212,255,0.25)'}`,
                      color: language === 'en' ? '#00d4ff' : 'rgba(0,212,255,0.4)',
                    }}>ENGLISH</button>
                </motion.div>

                <motion.div className="w-64 h-px mx-auto"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(0,255,65,0.3), transparent)' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.8 }} />
              </header>

              {/* IP Cards */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center gap-2 mb-5 sm:mb-6">
                  <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
                  <h2 className="text-terminal font-mono text-sm tracking-wider">
                    {t('시뮬레이션 아카이브', 'SIMULATION ARCHIVE')}
                  </h2>
                  <span className="text-terminal/30 text-xs font-mono ml-2">
                    // {allIps.length} IP{allIps.length !== 1 ? 's' : ''} {t('등록됨', 'registered')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Add IP block first on top */}
                  <AddIPBlock onClick={onOpenAdmin} language={language} index={0} />

                  {allIps.map((ip, i) => (
                    <IPBlock key={ip.id} ip={ip} index={i + 1} onClick={() => onSelectIp(ip.id)} language={language} />
                  ))}

                  {[...Array(Math.max(0, 3 - allIps.length))].map((_, i) => (
                    <ComingSoonBlock key={`empty-${i}`} index={allIps.length + 1 + i} language={language} />
                  ))}
                </div>
              </motion.section>

              {/* Footer */}
              <footer className="text-center pb-6 sm:pb-8 pt-4 border-t border-terminal/10">
                <p className="text-xs font-mono" style={{ color: 'rgba(0,255,65,0.25)' }}>
                  CODE FANTASIA IP SIMULATION LAB v1.0 // Powered by Gemini AI
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Single IP Block card — mobile-optimized with type badge
const IPBlock = ({ ip, index, onClick, language }) => {
  const [isHovered, setIsHovered] = useState(false)
  const isActive = ip.status === 'active'
  const title = language === 'en' ? (ip.titleEn || ip.title) : ip.title
  const tagline = language === 'en' ? (ip.taglineEn || ip.tagline) : ip.tagline
  const meta = getIpTypeMeta(ip.id)
  const typeBadge = language === 'en' ? meta.badgeEn : meta.badgeKo

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-lg group active:scale-[0.98] transition-transform"
      style={{ 
        background: 'linear-gradient(180deg, #0d0d0d, #080808)',
        border: `1px solid ${isActive ? '#00ff4140' : '#ffffff15'}`,
      }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      whileHover={{ borderColor: '#00ff4180', boxShadow: '0 0 30px rgba(0,255,65,0.15)' }}
      onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-void-light">
        {ip.thumbnailUrl ? (
          <motion.img src={ip.thumbnailUrl} alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'grayscale(20%) contrast(1.1)' }}
            animate={{ scale: isHovered ? 1.08 : 1 }} transition={{ duration: 0.4 }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #111)' }}>
            <span className="text-3xl font-orbitron font-bold" style={{ color: '#00ff4130' }}>
              {title?.[0] || '?'}
            </span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(5,5,5,0.95) 100%)' }} />
        
        {/* Status badge — top left */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-sm text-[10px] font-mono font-bold"
          style={{
            background: isActive ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.1)',
            border: `1px solid ${isActive ? '#00ff4160' : '#ffffff20'}`,
            color: isActive ? '#00ff41' : '#ffffff60',
          }}>
          {isActive ? '● ACTIVE' : '○ DRAFT'}
        </div>

        {/* Genre tags */}
        {ip.genre && (
          <div className="absolute top-3 right-3 flex gap-1">
            {ip.genre.slice(0, 2).map(g => (
              <span key={g} className="px-1.5 py-0.5 text-[9px] font-mono rounded-sm"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #ffffff15', color: '#ffffff50' }}>
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-orbitron text-lg font-bold mb-1" style={{ color: '#00ff41' }}>{title}</h3>
        <p className="text-xs font-mono mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{tagline}</p>
        
        {/* IP type badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm">{meta.icon}</span>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded-sm"
            style={{
              background: ip.id === 'prototype' ? 'rgba(157,0,255,0.12)' : 'rgba(0,212,255,0.12)',
              border: `1px solid ${ip.id === 'prototype' ? 'rgba(157,0,255,0.3)' : 'rgba(0,212,255,0.3)'}`,
              color: ip.id === 'prototype' ? '#9d00ff' : '#00d4ff',
            }}>
            {typeBadge}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono" style={{ color: 'rgba(0,255,65,0.4)' }}>
            {ip.characters?.length || 0} {language === 'en' ? 'characters' : '캐릭터'}
          </span>
          <motion.span className="text-xs font-mono font-bold tap-target flex items-center justify-center" style={{ color: '#00ff41' }}
            animate={{ opacity: isHovered ? 1 : 0.6 }}>
            {language === 'en' ? 'ENTER →' : '입장 →'}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

// Coming Soon placeholder
const ComingSoonBlock = ({ index, language }) => (
  <motion.div
    className="relative overflow-hidden rounded-lg"
    style={{ background: '#080808', border: '1px dashed #ffffff15' }}
    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.1 }}
  >
    <div className="aspect-[16/10] flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="text-center">
        <div className="text-2xl mb-2 opacity-20">📦</div>
        <p className="text-xs font-mono" style={{ color: '#ffffff20' }}>
          {language === 'en' ? 'COMING SOON' : '준비 중'}
        </p>
      </div>
    </div>
    <div className="p-4">
      <div className="h-4 w-24 rounded" style={{ background: '#ffffff08' }} />
      <div className="h-3 w-32 rounded mt-2" style={{ background: '#ffffff05' }} />
    </div>
  </motion.div>
)

// Add IP Builder block
const AddIPBlock = ({ onClick, language, index }) => (
  <motion.div
    className="relative overflow-hidden rounded-lg cursor-pointer group active:scale-[0.98] transition-transform"
    style={{ background: '#080808', border: '1px dashed #00ff4130' }}
    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.1 }}
    whileHover={{ borderColor: '#00ff4180', boxShadow: '0 0 20px rgba(0,255,65,0.1)' }}
    onClick={onClick}
  >
    <div className="aspect-[16/10] flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.02)' }}>
      <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
        <div className="w-12 h-12 rounded-full border-2 border-dashed mx-auto mb-2 flex items-center justify-center"
          style={{ borderColor: '#00ff4150' }}>
          <span className="text-2xl font-bold" style={{ color: '#00ff4160' }}>+</span>
        </div>
        <p className="text-xs font-mono font-bold" style={{ color: '#00ff4160' }}>
          {language === 'en' ? 'ADD IP' : 'IP 추가'}
        </p>
      </motion.div>
    </div>
    <div className="p-4">
      <p className="text-xs font-mono" style={{ color: 'rgba(0,255,65,0.3)' }}>
        {language === 'en' ? 'Create your own scenario' : '나만의 시나리오 만들기'}
      </p>
    </div>
  </motion.div>
)

export default IPLabLanding
