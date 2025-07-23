import React from 'react'

interface TankSymbolProps {
  width?: number
  height?: number
  selected?: boolean
  className?: string
  level?: number // Tank level as percentage (0-100)
}

export const TankSymbol: React.FC<TankSymbolProps> = ({ 
  width = 80, 
  height = 100, 
  selected = false,
  className = '',
  level = 75
}) => {
  const tankBodyHeight = 60
  const fluidHeight = (tankBodyHeight - 4) * (level / 100)
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 80 100"
      className={`equipment-symbol ${selected ? 'selected' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tank top ellipse */}
      <ellipse 
        cx="40" cy="20" rx="25" ry="6" 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Tank body */}
      <rect 
        x="15" y="20" width="50" height={tankBodyHeight} 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Tank bottom ellipse */}
      <ellipse 
        cx="40" cy="80" rx="25" ry="6" 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Water level indicator */}
      {level > 0 && (
        <>
          {/* Water body */}
          <rect 
            x="17" y={82 - fluidHeight} width="46" height={fluidHeight - 2} 
            fill="rgba(37, 99, 235, 0.3)" 
          />
          
          {/* Water surface ellipse */}
          <ellipse 
            cx="40" cy={82 - fluidHeight} rx="23" ry="5" 
            fill="rgba(37, 99, 235, 0.6)" 
          />
        </>
      )}
      
      {/* Level indicator line */}
      <line 
        x1="70" y1="25" 
        x2="70" y2="75" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1"
        opacity="0.7"
      />
      <line 
        x1="68" y1={82 - fluidHeight} 
        x2="72" y2={82 - fluidHeight} 
        stroke="var(--stream-product)" 
        strokeWidth="2"
      />
      
      {/* Inlet port (top) */}
      <circle 
        cx="40" cy="8" r="3" 
        fill="none" 
        stroke="var(--stream-feed)" 
        strokeWidth="2"
        data-port="inlet"
      />
      <text x="40" y="4" textAnchor="middle" className="text-xs text-text-secondary">
        IN
      </text>
      
      {/* Outlet port (bottom) */}
      <circle 
        cx="40" cy="92" r="3" 
        fill="none" 
        stroke="var(--stream-product)" 
        strokeWidth="2"
        data-port="outlet"
      />
      <text x="40" y="98" textAnchor="middle" className="text-xs text-text-secondary">
        OUT
      </text>
      
      {/* Equipment label */}
      <text 
        x="40" y="50" 
        textAnchor="middle" 
        className="equipment-label text-text-primary fill-current"
        fontSize="10"
        fontWeight="600"
      >
        TANK
      </text>
      
      {/* Level percentage */}
      <text 
        x="40" y="60" 
        textAnchor="middle" 
        className="technical-data text-text-secondary fill-current"
        fontSize="9"
      >
        {level}%
      </text>
    </svg>
  )
}