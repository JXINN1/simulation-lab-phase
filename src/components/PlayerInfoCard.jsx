import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const PlayerInfoCard = ({ totalSyncPercent }) => {
  const [heartRate, setHeartRate] = useState(72)
  const [networkPing, setNetworkPing] = useState(23)
  const [dataStream, setDataStream] = useState(847)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.max(60, Math.min(120, prev + (Math.random() - 0.5) * 8)))
      setNetworkPing(prev => Math.max(10, Math.min(80, prev + (Math.random() - 0.5) * 10)))
      setDataStream(prev => Math.max(500, Math.min(1200, prev + (Math.random() - 0.5) * 100)))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { label: 'HEART RATE', value: Math.round(heartRate), unit: 'BPM', color: '#ff0055', max: 120 },
    { label: 'ARCHIVE', value: totalSyncPercent, unit: '%', color: '#00ff41', max: 100 },
    { label: 'NETWORK', value: Math.round(networkPing), unit: 'ms', color: '#00d4ff', max: 100 },
    { label: 'DATA STREAM', value: Math.round(dataStream), unit: 'kb/s', color: '#9d00ff', max: 1200 },
  ]

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-sm flex-shrink-0"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0a, #050505)', 
        border: '1px solid #9d00ff30',
        width: '160px'
      }}
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Portrait */}
      <div className="relative aspect-[3/4] overflow-hidden bg-void-light">
        <motion.img 
          src="/portraits/boy.png" 
          alt="소년"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.1)' }}
        />
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.95) 100%)' 
        }} />
        
        {/* Codename badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-void/80 border rounded-sm" 
          style={{ borderColor: '#9d00ff50' }}>
          <span className="font-mono text-[9px]" style={{ color: '#9d00ff90' }}>VARIABLE-X</span>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <motion.div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#9d00ff' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-orbitron font-bold text-sm mb-1" style={{ color: '#9d00ff' }}>소년</h3>
        <p className="font-mono text-[10px] text-terminal/50 mb-3">플레이어 아바타</p>
        
        {/* Stats */}
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-mono text-[8px] text-terminal/40">{stat.label}</span>
                <span className="font-mono text-[9px] font-bold" style={{ color: stat.color }}>
                  {stat.value}<span className="text-[7px] ml-0.5 opacity-60">{stat.unit}</span>
                </span>
              </div>
              <div className="h-1 bg-void rounded overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: stat.color }}
                  animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: '#9d00ff' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}

export default PlayerInfoCard
