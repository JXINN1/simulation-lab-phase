// Prototype lore chunks for keyword-based RAG
export const prototypeLore = [
  {
    id: 'sector17_overview', ipId: 'prototype', title: '제17구역', category: 'location',
    keywords: ['17구역', '구역', '전초기지', 'sector', 'outpost', '여기', '어디', 'where', 'place'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '제17구역은 황폐한 행성의 외곽에 위치한 의료 전초기지다. 모래폭풍이 잦고, 자원이 부족하며, 주민 수도 적다.', en: 'Sector 17 is a medical outpost on the outskirts of a desolate planet. Sandstorms are frequent, resources scarce, and residents few.' }
  },
  {
    id: 'sector17_danger', ipId: 'prototype', title: '구역 위험도', category: 'location',
    keywords: ['위험', '안전', 'danger', 'safe', 'dangerous', '밤', 'night'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '제17구역은 밤이 되면 특히 위험하다. 알 수 없는 소음과 이상 현상이 보고되어 있다.', en: 'Sector 17 is especially dangerous at night. Strange noises and unexplained phenomena have been reported.' }
  },
  {
    id: 'medical_outpost', ipId: 'prototype', title: '의료 시설', category: 'location',
    keywords: ['의료', '병원', 'medical', 'hospital', '환자', 'patient', 'clinic'],
    characterScope: ['aran', 'noah', 'haein'],
    spoilerLevel: 0,
    content: { ko: '전초기지의 의료 시설은 열악하다. 기본 수술 장비와 약품만 갖추고 있으며, 중증 환자는 본부로 이송해야 한다.', en: 'The outpost medical facility is basic. Only fundamental surgical equipment and medications are available; critical patients must be transferred to HQ.' }
  },
  {
    id: 'hq_overview', ipId: 'prototype', title: '본부', category: 'organization',
    keywords: ['본부', 'headquarters', 'HQ', '중앙', 'central'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '본부는 행성 중심부에 위치한 최고 기관이다. 모든 구역을 관할하며, 의료진과 보안 인력을 배치한다.', en: 'HQ is the supreme authority located at the planet center. It oversees all sectors and dispatches medical and security personnel.' }
  },
  {
    id: 'aran_background', ipId: 'prototype', title: '아란의 배경', category: 'character',
    keywords: ['아란', 'aran', '메딕', 'medic', '의사', 'doctor'],
    characterScope: ['aran'],
    spoilerLevel: 0,
    content: { ko: '아란은 본부 의료원 수석 졸업 후 자원하여 17구역에 왔다. 뛰어난 실력을 가졌지만, 과거의 트라우마에 시달린다.', en: 'Aran graduated top of HQ Medical Academy and volunteered for Sector 17. Highly skilled but haunted by past trauma.' }
  },
  {
    id: 'noah_background', ipId: 'prototype', title: '노아의 배경', category: 'character',
    keywords: ['노아', 'noah', '보조', 'assistant'],
    characterScope: ['noah'],
    spoilerLevel: 0,
    content: { ko: '노아는 전투 유닛 출신이지만 겁이 많아 의료 보조로 재배치되었다. 아란을 깊이 존경한다.', en: 'Noah was originally a combat unit but was reassigned to medical support due to his timid nature. He deeply respects Aran.' }
  },
  {
    id: 'haein_background', ipId: 'prototype', title: '해인의 배경', category: 'character',
    keywords: ['해인', 'haein', '팀장', 'leader', '선배', 'senior', '임신', 'pregnant'],
    characterScope: ['haein'],
    spoilerLevel: 0,
    content: { ko: '해인은 최연소 팀장 출신으로, 아란을 보호하기 위해 17구역에 자원했다. 현재 임신 중이다.', en: 'Haein was the youngest team leader at HQ. She volunteered for Sector 17 to protect Aran. She is currently pregnant.' }
  },
  {
    id: 'director_background', ipId: 'prototype', title: '원장의 배경', category: 'character',
    keywords: ['원장', 'director', '책임자', 'admin', 'boss', '나쁜'],
    characterScope: ['director'],
    spoilerLevel: 0,
    content: { ko: '원장은 15년간 제17구역을 관리해온 책임자다. 본부의 신뢰를 받고 있지만, 실제로는 사리사욕에 가득 차 있다.', en: 'The Director has managed Sector 17 for 15 years. Trusted by HQ, but in reality driven by greed.' }
  },
  {
    id: 'guard_background', ipId: 'prototype', title: '경사의 배경', category: 'character',
    keywords: ['경사', 'guard', 'resident', '보안', 'security', '무서운', 'scary'],
    characterScope: ['guard'],
    spoilerLevel: 0,
    content: { ko: '경사는 본부 특수부대 출신으로 좌천되어 17구역에 왔다. 원장의 충실한 하수인이다.', en: 'The Guard was a special forces operative demoted to Sector 17. He is the Director\'s loyal enforcer.' }
  },
  {
    id: 'boy_mystery', ipId: 'prototype', title: '소년의 정체', category: 'character',
    keywords: ['소년', 'boy', '아이', 'kid', '나', 'me', 'who am i', '누구'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 1,
    content: { ko: '소년의 정체는 아무도 모른다. 출입 기록이 없고, 마치 처음부터 거기 있었던 것처럼 나타났다.', en: "Nobody knows the boy's identity. There is no entry record, as if he appeared out of nowhere." }
  },
  {
    id: 'planet_surface', ipId: 'prototype', title: '행성 표면', category: 'location',
    keywords: ['행성', 'planet', '사막', 'desert', '환경', 'environment', '밖', 'outside'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '이 행성의 표면은 대부분 황무지와 사막이다. 낮에는 뜨겁고 밤에는 극도로 추워진다.', en: 'Most of the planet surface is wasteland and desert. Scorching hot during the day and extremely cold at night.' }
  },
  {
    id: 'church_building', ipId: 'prototype', title: '교회', category: 'location',
    keywords: ['교회', 'church', '건물', 'building'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '17구역 외곽에 오래된 교회 건물이 있다. 누가 지었는지 모르며, 주민들은 가까이 가지 않는다.', en: 'There is an old church building on the outskirts of Sector 17. Nobody knows who built it, and residents avoid going near it.' }
  },
  {
    id: 'timeloop_spoiler', ipId: 'prototype', title: '타임루프', category: 'event',
    keywords: ['타임루프', 'time loop', '반복', 'repeat', 'loop', '죽음', 'death', '100번'],
    characterScope: [],
    spoilerLevel: 2,
    content: { ko: '[스포일러 차단됨]', en: '[SPOILER BLOCKED]' }
  },
  {
    id: 'boy_power', ipId: 'prototype', title: '소년의 능력', category: 'event',
    keywords: ['능력', 'power', 'ability', '힘', '특별'],
    characterScope: [],
    spoilerLevel: 2,
    content: { ko: '[스포일러 차단됨]', en: '[SPOILER BLOCKED]' }
  },
  {
    id: 'daily_life', ipId: 'prototype', title: '일상 생활', category: 'world',
    keywords: ['일상', 'daily', '생활', 'life', '음식', 'food', '먹다', 'eat'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '17구역 주민들은 배급으로 살아간다. 합성 식량이 대부분이고, 가끔 본부에서 신선한 식재료가 도착한다.', en: 'Sector 17 residents live on rations. Most food is synthetic, with occasional fresh supplies from HQ.' }
  },
  {
    id: 'sandstorm', ipId: 'prototype', title: '모래폭풍', category: 'event',
    keywords: ['모래', 'sand', '폭풍', 'storm', '날씨', 'weather'],
    characterScope: ['aran', 'noah', 'haein', 'director', 'guard'],
    spoilerLevel: 0,
    content: { ko: '모래폭풍은 예고 없이 발생한다. 폭풍이 오면 모든 외부 활동이 중단되고, 주민들은 대피소에 모인다.', en: 'Sandstorms strike without warning. When they hit, all outside activity stops and residents gather in shelters.' }
  },
  {
    id: 'missing_doctors', ipId: 'prototype', title: '실종된 의사들', category: 'event',
    keywords: ['실종', 'missing', '의사', 'doctor', '사라', 'disappear'],
    characterScope: ['director', 'guard'],
    spoilerLevel: 1,
    content: { ko: '17구역에서 3명의 의사가 실종되었다. 공식 기록은 "자발적 이직"이지만, 진실은 다를 수 있다.', en: 'Three doctors have gone missing in Sector 17. Official records say "voluntary transfer," but the truth may differ.' }
  },
  {
    id: 'night_sounds', ipId: 'prototype', title: '밤의 소리', category: 'event',
    keywords: ['소리', 'sound', 'noise', '밤', 'night', '이상', 'strange'],
    characterScope: ['aran', 'noah', 'haein'],
    spoilerLevel: 0,
    content: { ko: '밤마다 구역 어딘가에서 알 수 없는 소리가 들린다. 기계음 같기도, 사람 소리 같기도 한 정체불명의 소음이다.', en: 'Every night, unknown sounds come from somewhere in the sector. Part mechanical, part human - an unidentifiable noise.' }
  },
  {
    id: 'aran_patient', ipId: 'prototype', title: '아란의 잃은 환자', category: 'character',
    keywords: ['환자', 'patient', '잃', 'lost', '죽', 'died', '소녀', 'girl', '트라우마', 'trauma'],
    characterScope: ['aran'],
    spoilerLevel: 0,
    content: { ko: '아란이 잃은 환자는 어린 소녀였다. 아란은 자신의 실수로 그 아이를 살리지 못했다고 생각하며, 깊은 죄책감을 품고 있다.', en: 'The patient Aran lost was a young girl. Aran believes she failed to save the child due to her own mistake and carries deep guilt.' }
  },
  {
    id: 'security_system', ipId: 'prototype', title: '보안 시스템', category: 'world',
    keywords: ['보안', 'security', '카메라', 'camera', 'CCTV', '감시', 'surveillance', 'watch'],
    characterScope: ['guard', 'director'],
    spoilerLevel: 0,
    content: { ko: '17구역의 보안 시스템은 경사가 직접 관리한다. CCTV, 출입 기록, 통신 감청 등 모든 감시를 총괄한다.', en: 'The Guard manages Sector 17\'s security system directly, overseeing CCTV, access logs, and communications monitoring.' }
  },
];
