import React from 'react'

interface FeedTankSymbolProps {
  width?: number
  height?: number
  selected?: boolean
  className?: string
  level?: number // Tank level as percentage (0-100)
  sourceType?: string // Type of water source
}

export const FeedTankSymbol: React.FC<FeedTankSymbolProps> = ({ 
  width = 100, 
  height = 120, 
  selected = false,
  className = '',
  level = 75,
  sourceType = 'surface_water'
}) => {
  const tankBodyHeight = 70
  const fluidHeight = (tankBodyHeight - 4) * (level / 100)
  
  // Get source type color and icon
  const getSourceConfig = (type: string) => {
    switch (type) {
      case 'surface_water':
        return { color: '#3b82f6', icon: '🏞️', label: 'Surface' }
      case 'groundwater':
        return { color: '#059669', icon: '💧', label: 'Ground' }
      case 'municipal':
        return { color: '#6366f1', icon: '🏢', label: 'Municipal' }
      case 'industrial':
        return { color: '#dc2626', icon: '🏭', label: 'Industrial' }
      default:
        return { color: '#6b7280', icon: '💧', label: 'Unknown' }
    }
  }
  
  const sourceConfig = getSourceConfig(sourceType)
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 120"
      className={`equipment-symbol ${selected ? 'selected' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tank top ellipse */}
      <ellipse 
        cx="50" cy="25" rx="30" ry="8" 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Tank body */}
      <rect 
        x="20" y="25" width="60" height={tankBodyHeight} 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Tank bottom ellipse */}
      <ellipse 
        cx="50" cy="95" rx="30" ry="8" 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Water level indicator */}
      {level > 0 && (
        <>
          {/* Water body */}
          <rect 
            x="22" y={97 - fluidHeight} width="56" height={fluidHeight - 2} 
            fill={`${sourceConfig.color}30`}
          />
          
          {/* Water surface ellipse */}
          <ellipse 
            cx="50" cy={97 - fluidHeight} rx="28" ry="6" 
            fill={`${sourceConfig.color}80`}
          />
        </>
      )}
      
      {/* Source type indicator (top) - clean colored bar */}
      <rect 
        x="35" y="8" width="30" height="4" rx="2"
        fill={sourceConfig.color}
        opacity="0.8"
      />
      
      {/* Water quality indicator - simple colored dot */}
      <circle 
        cx="75" cy="40" r="4" 
        fill={sourceConfig.color}
        opacity="0.8"
      />
      
      {/* Level gauge */}
      <line 
        x1="85" y1="30" 
        x2="85" y2="90" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1"
        opacity="0.7"
      />
      
      {/* Level indicator marks - clean lines only */}
      {[25, 50, 75, 100].map(percent => {
        const y = 90 - (percent / 100) * 60
        return (
          <line 
            key={percent}
            x1="83" y1={y} 
            x2="87" y2={y} 
            stroke="var(--equipment-outline)" 
            strokeWidth="1"
            opacity="0.5"
          />
        )
      })}
      
      {/* Current level indicator */}
      <line 
        x1="82" y1={97 - fluidHeight} 
        x2="88" y2={97 - fluidHeight} 
        stroke={sourceConfig.color} 
        strokeWidth="2"
      />
      
      {/* Inlet port (top) */}
      <circle 
        cx="50" cy="12" r="3" 
        fill="none" 
        stroke="var(--stream-feed)" 
        strokeWidth="2"
        data-port="inlet"
      />
      
      {/* Outlet port (bottom) */}
      <circle 
        cx="50" cy="108" r="3" 
        fill="none" 
        stroke="var(--stream-feed)" 
        strokeWidth="2"
        data-port="outlet"
      />
      
      {/* Overflow port (side) */}
      <circle 
        cx="15" cy="35" r="2.5" 
        fill="none" 
        stroke="var(--stream-waste)" 
        strokeWidth="1.5"
        data-port="overflow"
      />
      
      {/* Drain port (bottom) */}
      <circle 
        cx="30" cy="103" r="2.5" 
        fill="none" 
        stroke="var(--stream-waste)" 
        strokeWidth="1.5"
        data-port="drain"
      />
      
    </svg>
  )
}