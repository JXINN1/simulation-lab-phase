// 다국어 지원 (한국어 / English)

export const translations = {
  ko: {
    // Landing Page
    landing: {
      title: 'PROTOTYPE',
      securityProtocol: 'SECURITY PROTOCOL ACTIVE',
      holdInstruction: '인터페이스를 홀드하여 침입 시퀀스를 시작하십시오.',
      holdButton: '[HOLD TO BREACH]',
      accessGranted: 'ACCESS GRANTED',
      selectLanguage: '언어 선택',
    },

    // Mission Briefing
    mission: {
      title: '임무 브리핑',
      subtitle: 'MISSION BRIEFING',
      objective: '목표',
      objectiveText: '현재 구역의 객체들과 동기화하여 데이터를 복구하십시오.',
      instructions: '지시사항',
      instructionText: '각 캐릭터와 대화하여 개별 동기화를 완료할 것.',
      syncRequired: '동기화 필요: 캐릭터당 3회 대화',
      warning: '경고: 동기화 실패 시 데이터 손실 발생',
      accept: '임무 수락',
    },

    // Dashboard
    dashboard: {
      systemSync: 'SYSTEM SYNC',
      phase1: 'PHASE 1',
      syncComplete: 'SYNC COMPLETE',
      simulationInterface: 'SIMULATION_INTERFACE',
      characterDatabase: 'CHARACTER_DATABASE',
      playAsPlayer: '소년으로 플레이 // NPC와 충돌하면 채팅 시작',
      connected: 'CONNECTED',
      clickToChat: '클릭하여 대화 시작',
      poweredBy: 'Powered by Gemini AI • 3턴 대화로 동기화 완료',
      syncRequired: '⚠ SYNC REQUIRED',
      systemReady: '⚠ SYSTEM READY',
      synced: 'SYNCED ✓',
      syncWaiting: 'SYNC 대기',
    },

    // Chat Modal
    chat: {
      syncInstruction: '캐릭터와 데이터 동기화를 완료하십시오',
      turnProgress: '턴',
      syncReady: '동기화 준비 완료 - 창을 닫으면 SYNC +20%',
      syncDone: '동기화 완료됨',
      sendMessage: '에게 메시지 보내기...',
      send: '전송',
      enterToSend: 'Enter로 전송 • Shift+Enter로 줄바꿈',
      // API key UI removed — server-side only
      save: '저장',
    },

    // Phase 1 Complete
    phase1Complete: {
      systemSync: 'SYSTEM SYNC',
      percent: '100%',
      criticalError: '[CRITICAL ERROR]',
      anomaly: 'UNIDENTIFIED ANOMALY IN CHURCH',
      newMission: '새로운 지령',
      goToChurch: '교회로 이동하여 시스템을 제어하십시오.',
      phase2: 'PHASE 2: 화재 진압',
      startPhase2: '🔥 PHASE 2 시작',
    },

    // Phase 2
    phase2: {
      intro: {
        detecting: '⚠️ 시스템 이상 감지...',
        fireAlert: '🔥 교회 구역에서 화재 발생',
        urgent: '긴급: 제한 시간 내에 화재를 진압하십시오',
        activate: '인터페이스를 활성화하여 불을 끄십시오',
        start: '🔥 화재 진압 시작',
      },
      game: {
        emergency: '🔥 EMERGENCY PROTOCOL 🔥',
        contained: '진압',
        clickToActivate: '불타는 구역을 클릭하여 인터페이스를 활성화하십시오',
        extinguished: '✓ 진압 완료',
        houseName: ['입구', '창고', '상점', '덩굴집', '대저택'],
      },
      gauge: {
        extinguish: '진압',
        targetHint: '타겟 존에 맞춰 클릭하세요!',
        difficulty: '난이도',
        clickOrSpace: '🔥 클릭 또는 SPACE',
        success: '진압 성공!',
        fail: '실패!',
        penalty: '-5초',
        escToCancel: 'ESC로 취소',
      },
      complete: {
        fireOut: '🔥 화재 진압 완료',
        watching: '누군가 지켜보고 있었다',
        witnessed: '원장과 경사가 이 장면을 목격했다...',
        stateChanged: '⚠️ 캐릭터 상태가 변경되었습니다 ⚠️',
        continue: '계속하기...',
      },
    },

    // Characters
    characters: {
      boy: { name: '소년', role: '미스터리한 존재' },
      aran: { name: '아란', role: '메딕 / 주인공' },
      noah: { name: '노아', role: '의료 보조 유닛' },
      haein: { name: '해인', role: '선배 의사 / 팀장' },
      director: { name: '원장', role: '제17구역 책임자' },
      guard: { name: '경사', role: '보안 책임자' },
    },

    // Player Card
    playerCard: {
      codename: 'VARIABLE-X',
      heartRate: 'HEART RATE',
      neuralSync: 'NEURAL SYNC',
      network: 'NETWORK',
      dataStream: 'DATA STREAM',
      analyzing: '분석 중...',
      stable: '안정',
      connected: '연결됨',
    },
  },

  en: {
    // Landing Page
    landing: {
      title: 'PROTOTYPE',
      securityProtocol: 'SECURITY PROTOCOL ACTIVE',
      holdInstruction: 'HOLD THE INTERFACE TO INITIATE BREACH SEQUENCE.',
      holdButton: '[HOLD TO BREACH]',
      accessGranted: 'ACCESS GRANTED',
      selectLanguage: 'Select Language',
    },

    // Mission Briefing
    mission: {
      title: 'MISSION BRIEFING',
      subtitle: 'CLASSIFIED OPERATION',
      objective: 'OBJECTIVE',
      objectiveText: 'Synchronize with entities in the current sector to recover data.',
      instructions: 'INSTRUCTIONS',
      instructionText: 'Complete individual sync by conversing with each character.',
      syncRequired: 'Sync Required: 3 conversations per character',
      warning: 'WARNING: Data loss will occur if sync fails',
      accept: 'ACCEPT MISSION',
    },

    // Dashboard
    dashboard: {
      systemSync: 'SYSTEM SYNC',
      phase1: 'PHASE 1',
      syncComplete: 'SYNC COMPLETE',
      simulationInterface: 'SIMULATION_INTERFACE',
      characterDatabase: 'CHARACTER_DATABASE',
      playAsPlayer: 'Play as Boy // Collide with NPC to start chat',
      connected: 'CONNECTED',
      clickToChat: 'Click to start conversation',
      poweredBy: 'Powered by Gemini AI • Complete sync with 3 turns',
      syncRequired: '⚠ SYNC REQUIRED',
      systemReady: '⚠ SYSTEM READY',
      synced: 'SYNCED ✓',
      syncWaiting: 'SYNC PENDING',
    },

    // Chat Modal
    chat: {
      syncInstruction: 'Complete data synchronization with character',
      turnProgress: 'turns',
      syncReady: 'Sync ready - Close window for SYNC +20%',
      syncDone: 'Synchronization complete',
      sendMessage: 'Send message to ',
      send: 'Send',
      enterToSend: 'Enter to send • Shift+Enter for new line',
      // API key UI removed — server-side only
      save: 'Save',
    },

    // Phase 1 Complete
    phase1Complete: {
      systemSync: 'SYSTEM SYNC',
      percent: '100%',
      criticalError: '[CRITICAL ERROR]',
      anomaly: 'UNIDENTIFIED ANOMALY IN CHURCH',
      newMission: 'NEW DIRECTIVE',
      goToChurch: 'Proceed to church and take control of the system.',
      phase2: 'PHASE 2: FIRE SUPPRESSION',
      startPhase2: '🔥 START PHASE 2',
    },

    // Phase 2
    phase2: {
      intro: {
        detecting: '⚠️ System anomaly detected...',
        fireAlert: '🔥 Fire outbreak in church sector',
        urgent: 'URGENT: Suppress fire within time limit',
        activate: 'Activate interface to extinguish flames',
        start: '🔥 START FIRE SUPPRESSION',
      },
      game: {
        emergency: '🔥 EMERGENCY PROTOCOL 🔥',
        contained: 'CONTAINED',
        clickToActivate: 'Click burning zones to activate interface',
        extinguished: '✓ Extinguished',
        houseName: ['Entrance', 'Storage', 'Shop', 'Vine House', 'Manor'],
      },
      gauge: {
        extinguish: 'Extinguish',
        targetHint: 'Click when bar reaches target zone!',
        difficulty: 'Difficulty',
        clickOrSpace: '🔥 CLICK or SPACE',
        success: 'Extinguished!',
        fail: 'Failed!',
        penalty: '-5 sec',
        escToCancel: 'ESC to cancel',
      },
      complete: {
        fireOut: '🔥 Fire suppression complete',
        watching: 'Someone was watching',
        witnessed: 'The Director and Resident witnessed this...',
        stateChanged: '⚠️ Character states have changed ⚠️',
        continue: 'Continue...',
      },
    },

    // Characters
    characters: {
      boy: { name: 'Boy', role: 'Mysterious Entity' },
      aran: { name: 'Aran', role: 'Medic / Protagonist' },
      noah: { name: 'Noah', role: 'Medical Assistant' },
      haein: { name: 'Haein', role: 'Senior Doctor / Team Lead' },
      director: { name: 'Director', role: 'Sector 17 Administrator' },
      guard: { name: 'Resident', role: 'Security Chief' },
    },

    // Player Card
    playerCard: {
      codename: 'VARIABLE-X',
      heartRate: 'HEART RATE',
      neuralSync: 'NEURAL SYNC',
      network: 'NETWORK',
      dataStream: 'DATA STREAM',
      analyzing: 'Analyzing...',
      stable: 'Stable',
      connected: 'Connected',
    },
  },
};

// 언어 컨텍스트 헬퍼
export const getCharacterName = (lang, characterId) => {
  return translations[lang]?.characters?.[characterId]?.name || characterId;
};

export const getCharacterRole = (lang, characterId) => {
  return translations[lang]?.characters?.[characterId]?.role || '';
};
