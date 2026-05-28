import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { 
  TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, HOSPITAL_MAP, TILE_COLORS,
  SPRITE_CONFIG
} from '../data/gameData'

// 일반 적 4명 (HP 5, 동일)
const MINIONS = [
  { id: 'group1', sprite: 'group1', name: '부하1', nameEn: 'Minion 1', color: '#ff6600', hp: 5, speed: 2.0 },
  { id: 'group2', sprite: 'group2', name: '부하2', nameEn: 'Minion 2', color: '#ff6600', hp: 5, speed: 2.2 },
  { id: 'group3', sprite: 'group3', name: '부하3', nameEn: 'Minion 3', color: '#ff6600', hp: 5, speed: 1.8 },
  { id: 'group4', sprite: 'group4', name: '부하4', nameEn: 'Minion 4', color: '#ff6600', hp: 5, speed: 2.1 },
]

// 보스 (HP 10, 속도 소년보다 살짝 느림 = 3.8, 데미지 2)
const BOSS = {
  id: 'groupboss', sprite: 'groupboss', name: '주민 대장', nameEn: 'Resident Boss', 
  color: '#ff0040', hp: 10, speed: 3.8, damage: 2  // 소년 속도 4.0보다 살짝 느림
}

// 적 시작 위치 - 모두 바닥(0) 타일이면서 통로로 나올 수 있는 위치
const MINION_START_POSITIONS = [
  { x: 1, y: 5 },   // 좌측 중앙 통로
  { x: 7, y: 5 },   // 중앙 좌측
  { x: 1, y: 9 },   // 좌하단
  { x: 7, y: 9 },   // 중앙 하단
]

// 보스 시작 위치 - 우측 상단과 하단 박스 사이 통로 (22, 5)
const BOSS_START_POSITION = { x: 22, y: 5 }

// 플레이어 시작 위치
const PLAYER_START = { x: 14, y: 6 }

// 캐릭터 크기
const CHARACTER_SIZE = 66

// 충돌 회피 거리
const SEPARATION_DISTANCE = 1.2

const Phase3Game = ({ onComplete, onFail }) => {
  const { language } = useLanguage()
  const canvasRef = useRef(null)
  
  // Game state
  const [playerHP, setPlayerHP] = useState(5)
  const [timeRemaining, setTimeRemaining] = useState(120)
  const [eliminatedCount, setEliminatedCount] = useState(0)
  const [isAttacking, setIsAttacking] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [victory, setVictory] = useState(false)
  const [bossPhase, setBossPhase] = useState(false)
  const [bossAppeared, setBossAppeared] = useState(false)

  // Refs for game loop
  const playerRef = useRef({ 
    x: PLAYER_START.x, 
    y: PLAYER_START.y, 
    direction: 'down',
    isAttacking: false,
    attackCooldown: 0,
    invincible: 0
  })
  
  // 일반 적 4명
  const minionsRef = useRef(
    MINIONS.map((enemy, index) => ({
      ...enemy,
      x: MINION_START_POSITIONS[index].x,
      y: MINION_START_POSITIONS[index].y,
      currentHP: enemy.hp,
      direction: 'down',
      isAlive: true,
      stunTime: 0
    }))
  )

  // 보스
  const bossRef = useRef({
    ...BOSS,
    x: BOSS_START_POSITION.x,
    y: BOSS_START_POSITION.y,
    currentHP: BOSS.hp,
    direction: 'down',
    isAlive: true,
    isActive: false,
    stunTime: 0
  })
  
  const keysPressed = useRef({})
  const animationRef = useRef(null)

  // Sprites
  const spritesRef = useRef({})
  const spritesLoadedRef = useRef({})

  // Load sprites
  useEffect(() => {
    const boyImg = new Image()
    boyImg.onload = () => {
      spritesRef.current['boy'] = boyImg
      spritesLoadedRef.current['boy'] = true
    }
    boyImg.src = '/characters/boy.png'

    const spriteNames = ['group1', 'group2', 'group3', 'group4', 'groupboss']
    spriteNames.forEach(name => {
      const img = new Image()
      img.onload = () => {
        spritesRef.current[name] = img
        spritesLoadedRef.current[name] = true
      }
      img.src = `/characters/${name}.png`
    })
  }, [])

  // 일반 적 4명 모두 처치 시 보스 페이즈
  useEffect(() => {
    if (eliminatedCount >= 4 && !bossPhase) {
      setBossPhase(true)
      setBossAppeared(true)
      setTimeout(() => {
        bossRef.current.isActive = true
        setBossAppeared(false)
      }, 2000)
    }
  }, [eliminatedCount, bossPhase])

  // Timer
  useEffect(() => {
    if (gameOver || victory) return
    
    if (timeRemaining <= 0) {
      setGameOver(true)
      setTimeout(() => onFail(), 2000)
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, gameOver, victory, onFail])

  // Check victory
  useEffect(() => {
    if (eliminatedCount >= 5 && !victory) {
      setVictory(true)
      setTimeout(() => onComplete(), 2000)
    }
  }, [eliminatedCount, victory, onComplete])

  // Check game over
  useEffect(() => {
    if (playerHP <= 0 && !gameOver) {
      setGameOver(true)
      setTimeout(() => onFail(), 2000)
    }
  }, [playerHP, gameOver, onFail])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'j'].includes(key)) {
        e.preventDefault()
        keysPressed.current[key] = true
      }
    }
    
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Tile collision check
  const canMove = useCallback((x, y) => {
    if (x < 0.3 || x > MAP_WIDTH - 0.3 || y < 0.3 || y > MAP_HEIGHT - 0.3) return false
    const tileX = Math.floor(x)
    const tileY = Math.floor(y)
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return false
    return HOSPITAL_MAP[tileY]?.[tileX] === 0
  }, [])

  // Attack logic
  const performAttack = useCallback(() => {
    const player = playerRef.current
    if (player.attackCooldown > 0) return

    player.isAttacking = true
    player.attackCooldown = 0.4
    setIsAttacking(true)
    setTimeout(() => setIsAttacking(false), 150)

    const attackRange = 1.5

    // 일반 적 공격
    minionsRef.current.forEach(enemy => {
      if (!enemy.isAlive) return

      const dx = enemy.x - player.x
      const dy = enemy.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > attackRange) return

      let inRange = false
      if (player.direction === 'up' && dy < 0 && Math.abs(dx) < 1) inRange = true
      if (player.direction === 'down' && dy > 0 && Math.abs(dx) < 1) inRange = true
      if (player.direction === 'left' && dx < 0 && Math.abs(dy) < 1) inRange = true
      if (player.direction === 'right' && dx > 0 && Math.abs(dy) < 1) inRange = true

      if (inRange) {
        enemy.currentHP -= 1
        enemy.stunTime = 0.3

        if (enemy.currentHP <= 0) {
          enemy.isAlive = false
          setEliminatedCount(prev => prev + 1)
        }
      }
    })

    // 보스 공격
    const boss = bossRef.current
    if (boss.isAlive && boss.isActive) {
      const dx = boss.x - player.x
      const dy = boss.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= attackRange) {
        let inRange = false
        if (player.direction === 'up' && dy < 0 && Math.abs(dx) < 1) inRange = true
        if (player.direction === 'down' && dy > 0 && Math.abs(dx) < 1) inRange = true
        if (player.direction === 'left' && dx < 0 && Math.abs(dy) < 1) inRange = true
        if (player.direction === 'right' && dx > 0 && Math.abs(dy) < 1) inRange = true

        if (inRange) {
          boss.currentHP -= 1
          boss.stunTime = 0.2

          if (boss.currentHP <= 0) {
            boss.isAlive = false
            setEliminatedCount(prev => prev + 1)
          }
        }
      }
    }
  }, [])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let lastTime = 0

    const gameLoop = (timestamp) => {
      if (gameOver || victory) {
        animationRef.current = requestAnimationFrame(gameLoop)
        render(ctx)
        return
      }

      const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1)
      lastTime = timestamp

      const player = playerRef.current
      const playerSpeed = 4 * deltaTime

      if (player.attackCooldown > 0) player.attackCooldown -= deltaTime
      if (player.invincible > 0) player.invincible -= deltaTime

      // 플레이어 이동
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
        player.direction = 'up'
        if (canMove(player.x, player.y - playerSpeed)) player.y -= playerSpeed
      }
      else if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
        player.direction = 'down'
        if (canMove(player.x, player.y + playerSpeed)) player.y += playerSpeed
      }
      else if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
        player.direction = 'left'
        if (canMove(player.x - playerSpeed, player.y)) player.x -= playerSpeed
      }
      else if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
        player.direction = 'right'
        if (canMove(player.x + playerSpeed, player.y)) player.x += playerSpeed
      }

      if (keysPressed.current['j']) {
        performAttack()
        keysPressed.current['j'] = false
      }

      // 일반 적 AI
      const minions = minionsRef.current
      const aliveMinions = minions.filter(e => e.isAlive)
      
      minions.forEach(enemy => {
        if (!enemy.isAlive) return
        if (enemy.stunTime > 0) {
          enemy.stunTime -= deltaTime
          return
        }

        let dx = player.x - enemy.x
        let dy = player.y - enemy.y
        const distToPlayer = Math.sqrt(dx * dx + dy * dy)

        // 다른 적들과 충돌 회피
        aliveMinions.forEach(other => {
          if (other.id === enemy.id) return
          const odx = enemy.x - other.x
          const ody = enemy.y - other.y
          const odist = Math.sqrt(odx * odx + ody * ody)
          
          if (odist < SEPARATION_DISTANCE && odist > 0) {
            const pushStrength = (SEPARATION_DISTANCE - odist) * 2
            dx += (odx / odist) * pushStrength
            dy += (ody / odist) * pushStrength
          }
        })

        const totalDist = Math.sqrt(dx * dx + dy * dy)
        if (totalDist > 0.8 && distToPlayer > 0.8) {
          const speed = enemy.speed * deltaTime
          const moveX = (dx / totalDist) * speed
          const moveY = (dy / totalDist) * speed

          if (Math.abs(dx) > Math.abs(dy)) {
            enemy.direction = dx > 0 ? 'right' : 'left'
          } else {
            enemy.direction = dy > 0 ? 'down' : 'up'
          }

          if (canMove(enemy.x + moveX, enemy.y + moveY)) {
            enemy.x += moveX
            enemy.y += moveY
          } else if (canMove(enemy.x + moveX, enemy.y)) {
            enemy.x += moveX
          } else if (canMove(enemy.x, enemy.y + moveY)) {
            enemy.y += moveY
          }
        }

        // 충돌 데미지
        if (distToPlayer < 0.7 && player.invincible <= 0) {
          setPlayerHP(prev => Math.max(0, prev - 1))
          player.invincible = 1.5
        }
      })

      // 보스 AI
      const boss = bossRef.current
      if (boss.isAlive && boss.isActive) {
        if (boss.stunTime > 0) {
          boss.stunTime -= deltaTime
        } else {
          const bdx = player.x - boss.x
          const bdy = player.y - boss.y
          const bdist = Math.sqrt(bdx * bdx + bdy * bdy)

          if (bdist > 0.8) {
            const speed = boss.speed * deltaTime
            const moveX = (bdx / bdist) * speed
            const moveY = (bdy / bdist) * speed

            if (Math.abs(bdx) > Math.abs(bdy)) {
              boss.direction = bdx > 0 ? 'right' : 'left'
            } else {
              boss.direction = bdy > 0 ? 'down' : 'up'
            }

            if (canMove(boss.x + moveX, boss.y + moveY)) {
              boss.x += moveX
              boss.y += moveY
            } else if (canMove(boss.x + moveX, boss.y)) {
              boss.x += moveX
            } else if (canMove(boss.x, boss.y + moveY)) {
              boss.y += moveY
            }
          }

          // 보스 충돌 데미지 (2)
          if (bdist < 0.7 && player.invincible <= 0) {
            setPlayerHP(prev => Math.max(0, prev - BOSS.damage))
            player.invincible = 1.5
          }
        }
      }

      render(ctx)
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    const render = (ctx) => {
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = HOSPITAL_MAP[y][x]
          let color = TILE_COLORS[tile] || '#0d1117'
          if (tile === 0) color = '#0a0808'
          ctx.fillStyle = color
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          ctx.strokeStyle = '#ff000010'
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        }
      }

      // 일반 적
      minionsRef.current.forEach(enemy => {
        if (!enemy.isAlive) return
        drawCharacter(ctx, enemy.sprite, enemy.x, enemy.y, enemy.direction, enemy.color, enemy.stunTime > 0)
        drawHPBar(ctx, enemy.x, enemy.y, enemy.currentHP, enemy.hp, '#ff6600', false)
      })

      // 보스
      const boss = bossRef.current
      if (bossPhase && boss.isAlive) {
        const bossFlash = !boss.isActive && Math.floor(Date.now() / 200) % 2 === 0
        if (!bossFlash) {
          drawCharacter(ctx, boss.sprite, boss.x, boss.y, boss.direction, boss.color, boss.stunTime > 0)
          drawHPBar(ctx, boss.x, boss.y, boss.currentHP, boss.hp, '#ff0040', true)
        }
      }

      // 플레이어
      const player = playerRef.current
      const isFlashing = player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0
      if (!isFlashing) {
        drawCharacter(ctx, 'boy', player.x, player.y, player.direction, '#9d00ff', false)
      }

      // 공격 이펙트
      if (player.isAttacking) {
        const attackX = player.x * TILE_SIZE + TILE_SIZE / 2
        const attackY = player.y * TILE_SIZE + TILE_SIZE / 2
        let offsetX = 0, offsetY = 0
        if (player.direction === 'up') offsetY = -40
        if (player.direction === 'down') offsetY = 40
        if (player.direction === 'left') offsetX = -40
        if (player.direction === 'right') offsetX = 40

        ctx.fillStyle = '#ff00ff80'
        ctx.beginPath()
        ctx.arc(attackX + offsetX, attackY + offsetY, 25, 0, Math.PI * 2)
        ctx.fill()
        
        player.isAttacking = false
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#ff0040'
        ctx.font = 'bold 48px Orbitron, monospace'
        ctx.textAlign = 'center'
        ctx.fillText('SYSTEM FAILURE', canvas.width / 2, canvas.height / 2)
      }

      if (victory) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#00ff41'
        ctx.font = 'bold 36px Orbitron, monospace'
        ctx.textAlign = 'center'
        ctx.fillText('SYSTEM ERROR RECOVERY', canvas.width / 2, canvas.height / 2 - 20)
        ctx.fillText('COMPLETE', canvas.width / 2, canvas.height / 2 + 30)
      }
    }

    const drawCharacter = (ctx, spriteId, x, y, direction, color, isStunned) => {
      const sprite = spritesRef.current[spriteId]
      const centerX = x * TILE_SIZE + TILE_SIZE / 2
      const centerY = y * TILE_SIZE + TILE_SIZE / 2
      const renderSize = CHARACTER_SIZE
      const drawX = centerX - renderSize / 2
      const drawY = centerY - renderSize / 2 - 12

      if (isStunned) ctx.globalAlpha = 0.5

      if (sprite && spritesLoadedRef.current[spriteId]) {
        const frameMapping = SPRITE_CONFIG.standard
        const framePos = frameMapping[direction] || [0, 0]
        const sx = framePos[0] * SPRITE_CONFIG.frameWidth
        const sy = framePos[1] * SPRITE_CONFIG.frameHeight

        ctx.drawImage(
          sprite,
          sx, sy, SPRITE_CONFIG.frameWidth, SPRITE_CONFIG.frameHeight,
          drawX, drawY, renderSize, renderSize
        )
      } else {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(centerX, centerY - 6, 20, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    const drawHPBar = (ctx, x, y, currentHP, maxHP, color, isBoss) => {
      const barWidth = isBoss ? 60 : 40
      const barHeight = isBoss ? 8 : 6
      const hpPercent = currentHP / maxHP
      const barX = x * TILE_SIZE + TILE_SIZE / 2 - barWidth / 2
      const barY = y * TILE_SIZE - (isBoss ? 15 : 10)
      
      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barWidth, barHeight)
      ctx.fillStyle = color
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight)
      ctx.strokeStyle = color
      ctx.lineWidth = isBoss ? 2 : 1
      ctx.strokeRect(barX, barY, barWidth, barHeight)
      ctx.lineWidth = 1
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [canMove, performAttack, gameOver, victory, bossPhase])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = eliminatedCount * 20

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)'
      }} />

      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,0,64,0.2) 100%)'
      }} />

      <div className="w-full max-w-4xl mb-4">
        <div className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{ 
            background: 'linear-gradient(180deg, #1a0505, #0a0000)',
            border: '1px solid #ff004050'
          }}>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono" style={{ color: '#ff0040' }}>HP:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-6 h-6 rounded"
                  style={{ 
                    background: i < playerHP ? '#ff0040' : '#330000',
                    border: '1px solid #ff0040',
                    boxShadow: i < playerHP ? '0 0 10px #ff0040' : 'none'
                  }}
                  animate={i < playerHP ? { opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="flex items-center gap-2"
            animate={timeRemaining <= 30 ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-xl">⏱️</span>
            <span 
              className="font-orbitron text-2xl font-bold"
              style={{ color: timeRemaining <= 30 ? '#ff0040' : '#ff6600' }}
            >
              {formatTime(timeRemaining)}
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm" style={{ color: bossPhase ? '#ff0040' : '#00ff41' }}>
              {bossPhase ? '⚠️ BOSS' : (language === 'ko' ? '복구' : 'Recovery')}: {progressPercent}%
            </span>
            <div className="w-24 h-3 bg-void rounded overflow-hidden border border-terminal/30">
              <motion.div
                className="h-full"
                style={{ background: bossPhase ? '#ff0040' : '#00ff41' }}
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div 
        className="relative rounded-lg overflow-hidden"
        style={{ 
          border: '2px solid #ff004030',
          boxShadow: '0 0 50px rgba(255,0,64,0.2)'
        }}
      >
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH * TILE_SIZE}
          height={MAP_HEIGHT * TILE_SIZE}
          className="rounded"
          style={{ imageRendering: 'pixelated' }}
        />

        <AnimatePresence>
          {bossAppeared && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-orbitron text-3xl font-bold mb-2" style={{ color: '#ff0040' }}>
                  ⚠️ {language === 'ko' ? '보스 등장!' : 'BOSS APPEARED!'} ⚠️
                </p>
                <p className="font-mono text-lg" style={{ color: '#ff6600' }}>
                  {language === 'ko' ? '주민 대장이 나타났다!' : 'The Resident Boss has arrived!'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-center">
        <p className="font-mono text-sm" style={{ color: '#ff006680' }}>
          {language === 'ko' ? 'WASD: 이동 | J: 공격' : 'WASD: Move | J: Attack'}
        </p>
      </div>

      <AnimatePresence>
        {isAttacking && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-6xl">⚔️</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Phase3Game
