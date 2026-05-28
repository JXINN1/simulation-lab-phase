import { useRef, useEffect, useCallback, useState } from 'react'
import {
  TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, HOSPITAL_MAP,
  TILE_COLORS, PLAYER_START, SPRITE_CONFIG, FLIPPED_SPRITES
} from '../data/gameData'
import { useLanguage } from '../i18n/LanguageContext'

const DEFAULT_SPRITE_SIZE = 66
// True aspect ratio from the map grid
const CANVAS_ASPECT = MAP_WIDTH / MAP_HEIGHT  // 30/12 = 2.5

const PixelGame = ({ onNpcCollision, highlightedCharacter, isChatOpen, ipId, characters = [] }) => {
  const { language } = useLanguage()
  const canvasRef = useRef(null)
  const spritesRef = useRef({})
  const spritesLoadedRef = useRef({})
  const portraitImagesRef = useRef({})

  const playerRef = useRef({
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    direction: 'down',
    isMoving: false
  })

  const npcsRef = useRef([])
  const prevCharsRef = useRef(null)

  const [dpadDir, setDpadDir] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dpadRef = useRef(null)

  const keysPressed = useRef({})
  const animationRef = useRef(null)
  const lastCollisionRef = useRef({ npcId: null, time: 0 })

  // Rebuild NPCs when characters change
  useEffect(() => {
    const charIds = characters.map(c => c.id).sort().join(',')
    if (charIds === prevCharsRef.current) return
    prevCharsRef.current = charIds

    npcsRef.current = characters
      .filter(c => c.canChat !== false && c.id !== 'boy')
      .map((c, i) => {
        const pos = c.world?.position || { x: 3 + i * 5, y: 5 }
        return {
          id: c.id, x: pos.x, y: pos.y, startX: pos.x, startY: pos.y,
          direction: 'down', moveTimer: Math.random() * 3,
          label: c.name || c.id, labelEn: c.nameEn || c.name || c.id,
          color: c.color || '#00ff41', spriteUrl: c.spriteUrl, portraitUrl: c.portraitUrl,
          zone: c.world?.zone || { minX: 0, maxX: MAP_WIDTH - 1, minY: 0, maxY: MAP_HEIGHT - 1 },
          walkableTiles: c.world?.walkableTiles || [0],
          spriteSize: c.world?.spriteSize || DEFAULT_SPRITE_SIZE,
        }
      })
  }, [characters])

  // Load sprites
  useEffect(() => {
    if (!spritesLoadedRef.current['boy']) {
      const boyImg = new Image()
      boyImg.onload = () => { spritesRef.current['boy'] = boyImg; spritesLoadedRef.current['boy'] = true }
      boyImg.src = '/characters/boy.png'
    }
    characters.forEach(c => {
      if (c.id === 'boy') return
      if (c.spriteUrl && !spritesLoadedRef.current[c.id]) {
        const img = new Image()
        img.onload = () => { spritesRef.current[c.id] = img; spritesLoadedRef.current[c.id] = true }
        img.onerror = () => { spritesLoadedRef.current[c.id] = false }
        img.src = c.spriteUrl
      }
      if (c.portraitUrl && !portraitImagesRef.current[c.id]) {
        const pImg = new Image()
        pImg.onload = () => { portraitImagesRef.current[c.id] = pImg }
        pImg.src = c.portraitUrl
      }
    })
  }, [characters])

  // Lock body scroll in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isFullscreen])

  const canMove = useCallback((x, y) => {
    if (x < 0.3 || x > MAP_WIDTH - 0.3 || y < 0.3 || y > MAP_HEIGHT - 0.3) return false
    const tileX = Math.floor(x); const tileY = Math.floor(y)
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return false
    return HOSPITAL_MAP[tileY]?.[tileX] === 0
  }, [])

  const checkNpcCollision = useCallback((player) => {
    const npcs = npcsRef.current; const now = Date.now()
    for (const npc of npcs) {
      const dx = npc.x - player.x; const dy = npc.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 0.9) {
        let isFacing = false
        if (player.direction === 'up' && dy < -0.2) isFacing = true
        if (player.direction === 'down' && dy > 0.2) isFacing = true
        if (player.direction === 'left' && dx < -0.2) isFacing = true
        if (player.direction === 'right' && dx > 0.2) isFacing = true
        const timeSince = now - lastCollisionRef.current.time
        const isSame = lastCollisionRef.current.npcId === npc.id
        if (isFacing && (!isSame || timeSince > 2000)) return npc
      }
    }
    return null
  }, [])

  const handleNpcCollision = useCallback((npc) => {
    lastCollisionRef.current = { npcId: npc.id, time: Date.now() }
    onNpcCollision(npc.id)
  }, [onNpcCollision])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isChatOpen) return
      const key = e.key.toLowerCase()
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) {
        e.preventDefault(); keysPressed.current[key] = true
      }
      if (key === 'escape' && isFullscreen) setIsFullscreen(false)
    }
    const handleKeyUp = (e) => { keysPressed.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [isChatOpen, isFullscreen])

  useEffect(() => { dpadRef.current = dpadDir }, [dpadDir])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); let lastTime = 0

    const gameLoop = (timestamp) => {
      const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1); lastTime = timestamp
      const player = playerRef.current; const speed = 4 * deltaTime
      let isMoving = false; const dp = dpadRef.current

      if (keysPressed.current['w'] || keysPressed.current['arrowup'] || dp === 'up') {
        player.direction = 'up'; if (canMove(player.x, player.y - speed)) player.y -= speed; isMoving = true
      } else if (keysPressed.current['s'] || keysPressed.current['arrowdown'] || dp === 'down') {
        player.direction = 'down'; if (canMove(player.x, player.y + speed)) player.y += speed; isMoving = true
      } else if (keysPressed.current['a'] || keysPressed.current['arrowleft'] || dp === 'left') {
        player.direction = 'left'; if (canMove(player.x - speed, player.y)) player.x -= speed; isMoving = true
      } else if (keysPressed.current['d'] || keysPressed.current['arrowright'] || dp === 'right') {
        player.direction = 'right'; if (canMove(player.x + speed, player.y)) player.x += speed; isMoving = true
      }
      player.isMoving = isMoving
      if (isMoving) { const c = checkNpcCollision(player); if (c) handleNpcCollision(c) }

      // Update NPCs
      npcsRef.current.forEach(npc => {
        npc.moveTimer += deltaTime
        if (npc.moveTimer > 2 + Math.random() * 3) {
          npc.moveTimer = 0
          const dirs = ['up','down','left','right','idle','idle','idle']
          npc.direction = dirs[Math.floor(Math.random() * dirs.length)]
        }
        if (npc.direction !== 'idle') {
          const ns = 0.5 * deltaTime; let nx = npc.x, ny = npc.y
          if (npc.direction === 'up') ny -= ns; if (npc.direction === 'down') ny += ns
          if (npc.direction === 'left') nx -= ns; if (npc.direction === 'right') nx += ns
          const z = npc.zone
          if (z) { nx = Math.max(z.minX+0.5, Math.min(z.maxX-0.5, nx)); ny = Math.max(z.minY+0.5, Math.min(z.maxY-0.5, ny)) }
          const tx = Math.floor(nx), ty = Math.floor(ny), tile = HOSPITAL_MAP[ty]?.[tx]
          const walkable = npc.walkableTiles || [0]
          if (tile !== undefined && walkable.includes(tile) && nx >= 0.5 && nx <= MAP_WIDTH-0.5 && ny >= 0.5 && ny <= MAP_HEIGHT-0.5) {
            npc.x = nx; npc.y = ny
          } else { npc.direction = ({up:'down',down:'up',left:'right',right:'left'})[npc.direction]||'idle'; npc.moveTimer = 0 }
        }
      })

      render(ctx, player, npcsRef.current)
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    const render = (ctx, player, npcs) => {
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          ctx.fillStyle = TILE_COLORS[HOSPITAL_MAP[y][x]] || '#0d1117'
          ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
          ctx.strokeStyle = '#ffffff08'; ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
        }
      }
      npcs.forEach(npc => {
        const dl = language === 'en' ? (npc.labelEn || npc.label) : npc.label
        drawCharacter(ctx, npc.id, npc.x, npc.y, npc.direction, dl, npc.color, false, highlightedCharacter===npc.id, npc.spriteSize)
      })
      drawCharacter(ctx, 'boy', player.x, player.y, player.direction, '?', '#9d00ff', true, false, DEFAULT_SPRITE_SIZE)
    }

    const drawCharacter = (ctx, spriteId, x, y, direction, label, color, isPlayer, isHL, spriteSize) => {
      const sprite = spritesRef.current[spriteId]
      const cx = x*TILE_SIZE+TILE_SIZE/2, cy = y*TILE_SIZE+TILE_SIZE/2
      const rs = spriteSize || DEFAULT_SPRITE_SIZE, dx = cx-rs/2, dy = cy-rs/2-12
      if (isHL) { ctx.shadowColor = color; ctx.shadowBlur = 20 }
      if (sprite && spritesLoadedRef.current[spriteId]) {
        const useFlipped = FLIPPED_SPRITES.includes(spriteId)
        const fm = useFlipped ? SPRITE_CONFIG.flipped : SPRITE_CONFIG.standard
        const fp = fm[direction] || [0,0]
        ctx.drawImage(sprite, fp[0]*SPRITE_CONFIG.frameWidth, fp[1]*SPRITE_CONFIG.frameHeight, SPRITE_CONFIG.frameWidth, SPRITE_CONFIG.frameHeight, dx, dy, rs, rs)
      } else {
        const portrait = portraitImagesRef.current[spriteId]
        if (portrait) {
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy-6, 18, 0, Math.PI*2); ctx.clip()
          ctx.drawImage(portrait, cx-18, cy-24, 36, 36); ctx.restore()
          ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy-6, 18, 0, Math.PI*2); ctx.stroke()
        } else {
          ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, cy-6, 20, 0, Math.PI*2); ctx.fill()
        }
      }
      ctx.shadowBlur = 0
      if (!isPlayer) { ctx.fillStyle = color; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText(label, cx, dy-4) }
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [canMove, checkNpcCollision, handleNpcCollision, highlightedCharacter, language])

  const handleCanvasClick = useCallback(() => { canvasRef.current?.focus() }, [])
  const handleDpadDown = useCallback((dir) => { setDpadDir(dir) }, [])
  const handleDpadUp = useCallback(() => { setDpadDir(null) }, [])

  // Shared D-pad
  const dpad = (
    <div className="flex items-center justify-center select-none">
      <div className="relative" style={{ width: 120, height: 120 }}>
        {[['up','▲','left-1/2 top-0 -translate-x-1/2'],['down','▼','left-1/2 bottom-0 -translate-x-1/2'],['left','◀','top-1/2 left-0 -translate-y-1/2'],['right','▶','top-1/2 right-0 -translate-y-1/2']].map(([dir,sym,pos])=>(
          <button key={dir} className={`absolute ${pos} w-10 h-10 flex items-center justify-center rounded bg-terminal/20 border border-terminal/40 text-terminal text-lg active:bg-terminal/40`}
            onTouchStart={e=>{e.preventDefault();handleDpadDown(dir)}} onTouchEnd={handleDpadUp}
            onMouseDown={()=>handleDpadDown(dir)} onMouseUp={handleDpadUp} onMouseLeave={handleDpadUp}>{sym}</button>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-terminal/10 border border-terminal/20"/>
      </div>
    </div>
  )

  // Canvas element (reused in both modes — only one renders at a time)
  const canvasEl = (
    <canvas
      ref={canvasRef}
      width={MAP_WIDTH * TILE_SIZE}
      height={MAP_HEIGHT * TILE_SIZE}
      onClick={handleCanvasClick}
      tabIndex={0}
      className="rounded cursor-pointer outline-none block"
      style={{
        imageRendering: 'pixelated',
        width: '100%',
        height: 'auto',
        aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
      }}
    />
  )

  // ── Fullscreen landscape mode ──
  if (isFullscreen) {
    return (
      <div className="game-fullscreen-overlay">
        {/* Exit button */}
        <button onClick={() => setIsFullscreen(false)}
          className="absolute top-2 right-2 z-10 px-3 py-1.5 text-[10px] font-mono rounded bg-void/80 border border-terminal/40 text-terminal active:bg-terminal/20">
          ✕ EXIT
        </button>

        {/* Layout: canvas centered, D-pad on right side for landscape */}
        <div className="game-fs-layout">
          <div className="game-fs-canvas-area">
            {canvasEl}
          </div>
          <div className="game-fs-controls">
            {dpad}
          </div>
        </div>
      </div>
    )
  }

  // ── Normal inline mode ──
  return (
    <div className="relative">
      {/* Canvas at original ratio, width=100% of container, height auto from aspect */}
      <div style={{ border: '1px solid #00ff4130', borderRadius: 4, overflow: 'hidden' }}>
        {canvasEl}
      </div>

      {/* Fullscreen button — mobile only */}
      <button onClick={() => setIsFullscreen(true)}
        className="sm:hidden absolute bottom-2 right-2 px-2.5 py-1.5 text-[10px] font-mono rounded bg-void/80 border border-terminal/40 text-terminal active:bg-terminal/20"
        style={{ zIndex: 5 }}>
        ⛶ FULL
      </button>

      {/* D-pad below canvas — mobile only */}
      <div className="sm:hidden mt-3">
        {dpad}
      </div>
    </div>
  )
}

export default PixelGame
