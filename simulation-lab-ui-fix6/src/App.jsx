import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import IPLabLanding from './pages/IPLabLanding'
import LandingPage from './pages/LandingPage'
import ArchiveWorld from './pages/ArchiveWorld'
import AdminLitePage from './pages/AdminLitePage'
import Phase1Complete from './pages/Phase1Complete'
import Phase2Intro from './pages/Phase2Intro'
import Phase2Game from './pages/Phase2Game'
import Phase2Complete from './pages/Phase2Complete'
import Phase3Dialogue from './pages/Phase3Dialogue'
import Phase3Intro from './pages/Phase3Intro'
import Phase3Game from './pages/Phase3Game'
import Phase3Complete from './pages/Phase3Complete'
import Phase4Confrontation from './pages/Phase4Confrontation'
import Phase4Gunshot from './pages/Phase4Gunshot'
import Phase4Ending from './pages/Phase4Ending'
import useArchiveStore from './store/useArchiveStore'

function App() {
  const [currentPage, setCurrentPage] = useState('ipLabLanding')
  const selectIp = useArchiveStore(s => s.selectIp)
  const completeStoryEvent = useArchiveStore(s => s.completeStoryEvent)

  const handleSelectIp = useCallback((ipId) => {
    selectIp(ipId)
    if (ipId === 'prototype') {
      setCurrentPage('prototypeGateway')
    } else {
      setCurrentPage('archiveWorld')
    }
  }, [selectIp])

  const handleOpenAdmin = useCallback(() => {
    setCurrentPage('adminLite')
  }, [])

  const handleGatewayComplete = useCallback(() => {
    setCurrentPage('archiveWorld')
  }, [])

  const handleBackToLab = useCallback(() => {
    setCurrentPage('ipLabLanding')
  }, [])

  const handleStoryEvent = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  // Phase 2
  const handlePhase1Complete = () => {
    completeStoryEvent('church_fire')
    setCurrentPage('phase2intro')
  }
  const handlePhase2Start = () => setCurrentPage('phase2game')
  const handlePhase2Complete = () => setCurrentPage('phase2complete')
  const handlePhase2Fail = () => setCurrentPage('phase2intro')
  const handlePhase2Continue = () => setCurrentPage('phase3dialogue')

  // Phase 3
  const handlePhase3DialogueComplete = () => setCurrentPage('phase3intro')
  const handlePhase3Start = () => setCurrentPage('phase3game')
  const handlePhase3Complete = () => {
    completeStoryEvent('boss_map')
    setCurrentPage('phase3complete')
  }
  const handlePhase3Fail = () => setCurrentPage('phase3intro')
  const handlePhase3Continue = () => setCurrentPage('phase4confrontation')

  // Phase 4
  const handlePhase4ConfrontationComplete = () => setCurrentPage('phase4gunshot')
  const handlePhase4GunshotComplete = () => setCurrentPage('phase4ending')
  const handleRestart = () => {
    completeStoryEvent('prequel_outro')
    setCurrentPage('archiveWorld')
  }

  return (
    <AnimatePresence mode="wait">
      {currentPage === 'ipLabLanding' && (
        <IPLabLanding key="ipLabLanding" onSelectIp={handleSelectIp} onOpenAdmin={handleOpenAdmin} />
      )}

      {currentPage === 'prototypeGateway' && (
        <LandingPage key="prototypeGateway" onUnlock={handleGatewayComplete} />
      )}

      {currentPage === 'archiveWorld' && (
        <ArchiveWorld key="archiveWorld" onBack={handleBackToLab} onStoryEvent={handleStoryEvent} />
      )}

      {currentPage === 'adminLite' && (
        <AdminLitePage key="adminLite" onBack={handleBackToLab} />
      )}

      {currentPage === 'phase1complete' && (
        <Phase1Complete key="phase1complete" onContinue={handlePhase1Complete} />
      )}
      {currentPage === 'phase2intro' && (
        <Phase2Intro key="phase2intro" onStart={handlePhase2Start} />
      )}
      {currentPage === 'phase2game' && (
        <Phase2Game key="phase2game" onComplete={handlePhase2Complete} onFail={handlePhase2Fail} />
      )}
      {currentPage === 'phase2complete' && (
        <Phase2Complete key="phase2complete" onContinue={handlePhase2Continue} />
      )}
      {currentPage === 'phase3dialogue' && (
        <Phase3Dialogue key="phase3dialogue" onComplete={handlePhase3DialogueComplete} />
      )}
      {currentPage === 'phase3intro' && (
        <Phase3Intro key="phase3intro" onStart={handlePhase3Start} />
      )}
      {currentPage === 'phase3game' && (
        <Phase3Game key="phase3game" onComplete={handlePhase3Complete} onFail={handlePhase3Fail} />
      )}
      {currentPage === 'phase3complete' && (
        <Phase3Complete key="phase3complete" onContinue={handlePhase3Continue} />
      )}
      {currentPage === 'phase4confrontation' && (
        <Phase4Confrontation key="phase4confrontation" onComplete={handlePhase4ConfrontationComplete} />
      )}
      {currentPage === 'phase4gunshot' && (
        <Phase4Gunshot key="phase4gunshot" onComplete={handlePhase4GunshotComplete} />
      )}
      {currentPage === 'phase4ending' && (
        <Phase4Ending key="phase4ending" onRestart={handleRestart} />
      )}
    </AnimatePresence>
  )
}

export default App
