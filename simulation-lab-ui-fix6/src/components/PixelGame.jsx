import { useRef, useEffect, useCallback, useState } from 'react'
import {
  TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, HOSPITAL_MAP,
  TILE_COLORS, PLAYER_START, SPRITE_CONFIG, FLIPPED_SPRITES
} from '../data/gameData'
import { useLanguage } from '../i18n/LanguageContext'

const DEFAULT_SPRITE_SIZE = 66
const CANVAS_W = MAP_WIDTH * TILE_SIZE
const CANVAS_H = MAP_HEIGHT * TILE_SIZE

const PixelGame = ({ onNpcCollision, highlightedCharacter, isChatOpen, ipId, characters = [] }) => {
  const { language } = useLanguage()
  const canvasRef = useRef(null)
  const spritesRef = useRef({})
  const spritesLoadedRef = useRef({})
  const portraitImagesRef = useRef({})
  const playerRef = useRef({ x: PLAYER_START.x, y: PLAYER_START.y, direction: 'down', isMoving: false })
  const npcsRef = useRef([])
  const prevCharsRef = useRef(null)
  const [dpadDir, setDpadDir] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dpadRef = useRef(null)
  const keysPressed = useRef({})
  const animationRef = useRef(null)
  const lastCollisionRef = useRef({ npcId: null, time: 0 })

  useEffect(() => {
    const charIds = characters.map(c => c.id).sort().join(',')
    if (charIds === prevCharsRef.current) return
    prevCharsRef.current = charIds
    npcsRef.current = characters.filter(c => c.canChat !== false && c.id !== 'boy').map((c, i) => {
      const pos = c.world?.position || { x: 3 + i * 5, y: 5 }
      return { id:c.id, x:pos.x, y:pos.y, startX:pos.x, startY:pos.y, direction:'down', moveTimer:Math.random()*3,
        label:c.name||c.id, labelEn:c.nameEn||c.name||c.id, color:c.color||'#00ff41', spriteUrl:c.spriteUrl, portraitUrl:c.portraitUrl,
        zone:c.world?.zone||{minX:0,maxX:MAP_WIDTH-1,minY:0,maxY:MAP_HEIGHT-1}, walkableTiles:c.world?.walkableTiles||[0], spriteSize:c.world?.spriteSize||DEFAULT_SPRITE_SIZE }
    })
  }, [characters])

  useEffect(() => {
    if (!spritesLoadedRef.current['boy']) { const img=new Image(); img.onload=()=>{spritesRef.current['boy']=img;spritesLoadedRef.current['boy']=true}; img.src='/characters/boy.png' }
    characters.forEach(c => {
      if (c.id==='boy') return
      if (c.spriteUrl&&!spritesLoadedRef.current[c.id]) { const img=new Image(); img.onload=()=>{spritesRef.current[c.id]=img;spritesLoadedRef.current[c.id]=true}; img.onerror=()=>{spritesLoadedRef.current[c.id]=false}; img.src=c.spriteUrl }
      if (c.portraitUrl&&!portraitImagesRef.current[c.id]) { const p=new Image(); p.onload=()=>{portraitImagesRef.current[c.id]=p}; p.src=c.portraitUrl }
    })
  }, [characters])

  useEffect(() => {
    if (!isFullscreen) return
    document.body.style.overflow = 'hidden'
    try { screen.orientation?.lock?.('landscape').catch(()=>{}) } catch {}
    return () => { document.body.style.overflow = ''; try { screen.orientation?.unlock?.() } catch {} }
  }, [isFullscreen])

  const canMove = useCallback((x,y) => {
    if(x<0.3||x>MAP_WIDTH-0.3||y<0.3||y>MAP_HEIGHT-0.3)return false
    const tx=Math.floor(x),ty=Math.floor(y); if(tx<0||tx>=MAP_WIDTH||ty<0||ty>=MAP_HEIGHT)return false; return HOSPITAL_MAP[ty]?.[tx]===0
  }, [])
  const checkNpcCollision = useCallback((player) => {
    const now=Date.now(); for(const npc of npcsRef.current){const dx=npc.x-player.x,dy=npc.y-player.y
      if(Math.sqrt(dx*dx+dy*dy)<0.9){let f=false;if(player.direction==='up'&&dy<-0.2)f=true;if(player.direction==='down'&&dy>0.2)f=true;if(player.direction==='left'&&dx<-0.2)f=true;if(player.direction==='right'&&dx>0.2)f=true
        if(f&&(lastCollisionRef.current.npcId!==npc.id||now-lastCollisionRef.current.time>2000))return npc}} return null
  }, [])
  const handleNpcCollision = useCallback((npc) => { lastCollisionRef.current={npcId:npc.id,time:Date.now()}; onNpcCollision(npc.id) }, [onNpcCollision])

  useEffect(() => {
    const down=(e)=>{if(isChatOpen)return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keysPressed.current[k]=true};if(k==='escape'&&isFullscreen)setIsFullscreen(false)}
    const up=(e)=>{keysPressed.current[e.key.toLowerCase()]=false}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  }, [isChatOpen, isFullscreen])
  useEffect(() => { dpadRef.current = dpadDir }, [dpadDir])

  // ── Game loop ──
  useEffect(() => {
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); let lastTime=0
    const gameLoop=(ts)=>{
      const dt=Math.min((ts-lastTime)/1000,0.1);lastTime=ts;const p=playerRef.current;const spd=4*dt;let moving=false;const dp=dpadRef.current
      if(keysPressed.current['w']||keysPressed.current['arrowup']||dp==='up'){p.direction='up';if(canMove(p.x,p.y-spd))p.y-=spd;moving=true}
      else if(keysPressed.current['s']||keysPressed.current['arrowdown']||dp==='down'){p.direction='down';if(canMove(p.x,p.y+spd))p.y+=spd;moving=true}
      else if(keysPressed.current['a']||keysPressed.current['arrowleft']||dp==='left'){p.direction='left';if(canMove(p.x-spd,p.y))p.x-=spd;moving=true}
      else if(keysPressed.current['d']||keysPressed.current['arrowright']||dp==='right'){p.direction='right';if(canMove(p.x+spd,p.y))p.x+=spd;moving=true}
      p.isMoving=moving;if(moving){const c=checkNpcCollision(p);if(c)handleNpcCollision(c)}
      npcsRef.current.forEach(npc=>{npc.moveTimer+=dt;if(npc.moveTimer>2+Math.random()*3){npc.moveTimer=0;npc.direction=['up','down','left','right','idle','idle','idle'][Math.floor(Math.random()*7)]}
        if(npc.direction!=='idle'){const ns=0.5*dt;let nx=npc.x,ny=npc.y;if(npc.direction==='up')ny-=ns;if(npc.direction==='down')ny+=ns;if(npc.direction==='left')nx-=ns;if(npc.direction==='right')nx+=ns
          const z=npc.zone;if(z){nx=Math.max(z.minX+.5,Math.min(z.maxX-.5,nx));ny=Math.max(z.minY+.5,Math.min(z.maxY-.5,ny))}
          const tx=Math.floor(nx),ty=Math.floor(ny),tile=HOSPITAL_MAP[ty]?.[tx];if(tile!==undefined&&(npc.walkableTiles||[0]).includes(tile)&&nx>=.5&&nx<=MAP_WIDTH-.5&&ny>=.5&&ny<=MAP_HEIGHT-.5){npc.x=nx;npc.y=ny}else{npc.direction=({up:'down',down:'up',left:'right',right:'left'})[npc.direction]||'idle';npc.moveTimer=0}}})
      ctx.fillStyle='#050505';ctx.fillRect(0,0,canvas.width,canvas.height)
      for(let y=0;y<MAP_HEIGHT;y++)for(let x=0;x<MAP_WIDTH;x++){ctx.fillStyle=TILE_COLORS[HOSPITAL_MAP[y][x]]||'#0d1117';ctx.fillRect(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE);ctx.strokeStyle='#ffffff08';ctx.strokeRect(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE)}
      npcsRef.current.forEach(n=>{const dl=language==='en'?(n.labelEn||n.label):n.label;drawChar(ctx,n.id,n.x,n.y,n.direction,dl,n.color,false,highlightedCharacter===n.id,n.spriteSize)})
      drawChar(ctx,'boy',p.x,p.y,p.direction,'?','#9d00ff',true,false,DEFAULT_SPRITE_SIZE);animationRef.current=requestAnimationFrame(gameLoop)}
    const drawChar=(ctx,sid,x,y,dir,label,color,isP,isHL,ss)=>{const spr=spritesRef.current[sid];const cx=x*TILE_SIZE+TILE_SIZE/2,cy=y*TILE_SIZE+TILE_SIZE/2;const rs=ss||DEFAULT_SPRITE_SIZE,dx=cx-rs/2,dy=cy-rs/2-12
      if(isHL){ctx.shadowColor=color;ctx.shadowBlur=20};if(spr&&spritesLoadedRef.current[sid]){const fm=(FLIPPED_SPRITES.includes(sid)?SPRITE_CONFIG.flipped:SPRITE_CONFIG.standard);const fp=fm[dir]||[0,0];ctx.drawImage(spr,fp[0]*SPRITE_CONFIG.frameWidth,fp[1]*SPRITE_CONFIG.frameHeight,SPRITE_CONFIG.frameWidth,SPRITE_CONFIG.frameHeight,dx,dy,rs,rs)}
      else{const pt=portraitImagesRef.current[sid];if(pt){ctx.save();ctx.beginPath();ctx.arc(cx,cy-6,18,0,Math.PI*2);ctx.clip();ctx.drawImage(pt,cx-18,cy-24,36,36);ctx.restore();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy-6,18,0,Math.PI*2);ctx.stroke()}else{ctx.fillStyle=color;ctx.beginPath();ctx.arc(cx,cy-6,20,0,Math.PI*2);ctx.fill()}}
      ctx.shadowBlur=0;if(!isP){ctx.fillStyle=color;ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(label,cx,dy-4)}}
    animationRef.current=requestAnimationFrame(gameLoop);return()=>{if(animationRef.current)cancelAnimationFrame(animationRef.current)}
  }, [canMove, checkNpcCollision, handleNpcCollision, highlightedCharacter, language])

  const handleDpadDown = useCallback((dir) => setDpadDir(dir), [])
  const handleDpadUp = useCallback(() => setDpadDir(null), [])
  const Dpad = () => (
    <div className="select-none">
      <div className="relative" style={{ width: 100, height: 100 }}>
        {[['up','▲','left-1/2 top-0 -translate-x-1/2'],['down','▼','left-1/2 bottom-0 -translate-x-1/2'],['left','◀','top-1/2 left-0 -translate-y-1/2'],['right','▶','top-1/2 right-0 -translate-y-1/2']].map(([d,s,p])=>(
          <button key={d} className={`absolute ${p} w-8 h-8 flex items-center justify-center rounded bg-black/50 border border-terminal/50 text-terminal text-sm active:bg-terminal/30`}
            onTouchStart={e=>{e.preventDefault();handleDpadDown(d)}} onTouchEnd={handleDpadUp}
            onMouseDown={()=>handleDpadDown(d)} onMouseUp={handleDpadUp} onMouseLeave={handleDpadUp}>{s}</button>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-terminal/10 border border-terminal/20"/>
      </div>
    </div>
  )

  /*
   * ARCHITECTURE: The <canvas> is always in the SAME position in the React tree.
   * The wrapper div toggles between 'game-inline-wrap' (normal) and 'game-fs-wrap' (fullscreen).
   * In fullscreen, the wrapper becomes position:fixed and CSS rotates it 90deg when portrait.
   * D-pad and exit button are CHILDREN of the wrapper so they rotate with it.
   * The canvas DOM node is NEVER unmounted — game loop keeps running.
   */
  return (
    <div className="relative">
      {/* Black fullscreen background — separate from the rotated content */}
      {isFullscreen && <div className="game-fs-bg" />}

      {/* Canvas wrapper: always rendered, CSS toggles between inline and fullscreen */}
      <div className={isFullscreen ? 'game-fs-wrap' : 'game-inline-wrap'}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={() => canvasRef.current?.focus()}
          tabIndex={0}
          className="block outline-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Fullscreen overlay controls — inside the rotated wrapper so they rotate too */}
        {isFullscreen && (
          <>
            <div className="game-fs-dpad"><Dpad /></div>
            <button onClick={() => setIsFullscreen(false)} className="game-fs-exit">✕ EXIT</button>
          </>
        )}
      </div>

      {/* Normal mode controls */}
      {!isFullscreen && (
        <>
          <button onClick={() => setIsFullscreen(true)}
            className="sm:hidden absolute bottom-2 right-2 px-2.5 py-1.5 text-[10px] font-mono rounded bg-void/80 border border-terminal/40 text-terminal active:bg-terminal/20"
            style={{ zIndex: 5 }}>
            ⛶ FULL
          </button>
          <div className="sm:hidden mt-3 flex justify-center"><Dpad /></div>
        </>
      )}
    </div>
  )
}

export default PixelGame
