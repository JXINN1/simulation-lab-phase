// Game Constants
export const TILE_SIZE = 36
export const MAP_WIDTH = 30
export const MAP_HEIGHT = 12  // 10 → 12로 세로만 증가

// Map Layout
// 0 = floor (passable)
// 1 = wall (impassable)
// 2 = purple zone
// 3 = blue zone  
// 4 = orange zone
export const HOSPITAL_MAP = [
  [1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 3, 3],
  [1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 3, 3],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4, 4, 4, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4, 4, 4, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
]

// Tile colors
export const TILE_COLORS = {
  0: '#0d1117',
  1: '#374151',
  2: '#7c3aed',
  3: '#2563eb',
  4: '#ea580c',
}

// Player (소년) starting position
export const PLAYER_START = { x: 14, y: 6 }

// NPC positions - 각 구역 안의 바닥 타일에서 시작
export const NPC_POSITIONS = {
  aran: { x: 1, y: 2 },      // 좌상단 울타리 안 (보라 옆)
  noah: { x: 4, y: 9 },      // 좌하단 구역
  haein: { x: 23, y: 2 },    // 우상단 울타리 안 (파랑 옆)
  director: { x: 14, y: 10 }, // 중앙 하단 구역
  guard: { x: 23, y: 10 },   // 우하단 주황 옆
}

// NPC 이동 가능 타일 설정
// 0 = 바닥만, 'all' = 바닥+색상 구역, 'exclude' = 특정 타일 제외
export const NPC_WALKABLE = {
  aran: [0],           // 바닥(0)만 이동 가능 - 보라(2), 벽(1) 불가
  noah: [0],           // 바닥(0)만 이동 가능
  haein: [0],          // 바닥(0)만 이동 가능 - 파랑(3), 벽(1) 불가
  director: [0],       // 바닥(0)만 이동 가능
  guard: [0],          // 바닥(0)만 이동 가능 - 주황(4), 벽(1) 불가
}

// NPC 구역 범위 (각 NPC가 이동할 수 있는 영역)
export const NPC_ZONES = {
  // 아란: 좌상단 울타리 안 + 출구 통해 (0,0)-(8,7)까지
  aran: { minX: 0, maxX: 8, minY: 0, maxY: 7 },
  // 노아: (0,8)-(8,12) 사각형
  noah: { minX: 0, maxX: 8, minY: 8, maxY: 12 },
  // 해인: 우상단 울타리 안 + 출구 통해 x=22까지
  haein: { minX: 22, maxX: 30, minY: 0, maxY: 7 },
  // 원장: (9,8)-(19,12) 넓은 중앙 하단
  director: { minX: 9, maxX: 19, minY: 8, maxY: 12 },
  // 주민: 우하단 주황 옆 (22,8)-(30,12)
  guard: { minX: 22, maxX: 30, minY: 8, maxY: 12 },
}

// NPC display info (다국어 지원)
export const NPC_INFO = {
  aran: { name: '아란', nameEn: 'Aran', color: '#00ff41', label: '아란', labelEn: 'Aran' },
  noah: { name: '노아', nameEn: 'Noah', color: '#00d4ff', label: '노아', labelEn: 'Noah' },
  haein: { name: '해인', nameEn: 'Haein', color: '#ff69b4', label: '해인', labelEn: 'Haein' },
  director: { name: '원장', nameEn: 'Director', color: '#ff0055', label: '원장', labelEn: 'Director' },
  guard: { name: '주민', nameEn: 'Resident', color: '#ff9500', label: '주민', labelEn: 'Resident' },
}

// Sprite config (2x2 grid, 128x128 per frame)
export const SPRITE_CONFIG = {
  frameWidth: 128,
  frameHeight: 128,
  standard: {
    down: [0, 0],
    up: [1, 0],
    left: [0, 1],
    right: [1, 1],
  },
  flipped: {
    down: [0, 0],
    up: [1, 0],
    left: [1, 1],
    right: [0, 1],
  },
}

// Characters needing flipped sprite mapping (left/right 스왑)
export const FLIPPED_SPRITES = ['director']
