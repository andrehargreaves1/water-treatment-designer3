import React from 'react'

interface PumpSymbolProps {
  width?: number
  height?: number
  selected?: boolean
  className?: string
  running?: boolean
}

export const PumpSymbol: React.FC<PumpSymbolProps> = ({ 
  width = 80, 
  height = 60, 
  selected = false,
  className = '',
  running = false
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 80 60"
      className={`equipment-symbol ${selected ? 'selected' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pump volute (main body) */}
      <circle 
        cx="40" cy="30" r="20" 
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Pump volute cutwater */}
      <path 
        d="M 40 10 A 20 20 0 0 1 60 30 L 55 30 A 15 15 0 0 0 40 15 Z"
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Impeller - rotating element */}
      <g className={running ? 'animate-spin' : ''} style={{ transformOrigin: '40px 30px' }}>
        {/* Impeller blades */}
        {Array.from({length: 6}, (_, i) => {
          const angle = (i * 60) * Math.PI / 180
          const x1 = 40 + 8 * Math.cos(angle)
          const y1 = 30 + 8 * Math.sin(angle)
          const x2 = 40 + 15 * Math.cos(angle)
          const y2 = 30 + 15 * Math.sin(angle)
          
          return (
            <line 
              key={i}
              x1={x1} y1={y1} 
              x2={x2} y2={y2}
              stroke="var(--equipment-outline)" 
              strokeWidth="1.5"
            />
          )
        })}
        
        {/* Impeller hub */}
        <circle 
          cx="40" cy="30" r="5" 
          fill="var(--equipment-fill)" 
          stroke="var(--equipment-outline)" 
          strokeWidth="1.5"
        />
      </g>
      
      {/* Suction port */}
      <circle 
        cx="5" cy="30" r="3" 
        fill="none" 
        stroke="var(--stream-feed)" 
        strokeWidth="2"
        data-port="suction"
      />
      <text x="5" y="45" textAnchor="middle" className="text-xs text-text-secondary">
        SUC
      </text>
      
      {/* Discharge port */}
      <circle 
        cx="75" cy="30" r="3" 
        fill="none" 
        stroke="var(--stream-product)" 
        strokeWidth="2"
        data-port="discharge"
      />
      <text x="75" y="45" textAnchor="middle" className="text-xs text-text-secondary">
        DIS
      </text>
      
      {/* Motor connection (simplified) */}
      <rect 
        x="35" y="5" width="10" height="8" rx="1"
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1"
      />
      
      {/* Running indicator */}
      {running && (
        <circle 
          cx="70" cy="15" r="3" 
          fill="#10b981"
          className="animate-pulse"
        />
      )}
      
      {/* Equipment label */}
      <text 
        x="40" y="55" 
        textAnchor="middle" 
        className="equipment-label text-text-primary fill-current"
        fontSize="10"
        fontWeight="600"
      >
        PUMP
      </text>
    </svg>
  )
}