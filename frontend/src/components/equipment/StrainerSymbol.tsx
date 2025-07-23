import React from 'react'

interface StrainerSymbolProps {
  width?: number
  height?: number
  selected?: boolean
  className?: string
}

export const StrainerSymbol: React.FC<StrainerSymbolProps> = ({ 
  width = 100, 
  height = 60, 
  selected = false,
  className = '' 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 60"
      className={`equipment-symbol ${selected ? 'selected' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main strainer body */}
      <rect 
        x="15" y="20" width="70" height="20" rx="2"
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Strainer screen - diagonal mesh pattern */}
      <defs>
        <pattern id="mesh" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="4" stroke="var(--equipment-outline)" strokeWidth="0.5" opacity="0.6"/>
          <line x1="4" y1="0" x2="0" y2="4" stroke="var(--equipment-outline)" strokeWidth="0.5" opacity="0.6"/>
        </pattern>
      </defs>
      
      <rect 
        x="17" y="22" width="66" height="16"
        fill="url(#mesh)"
      />
      
      {/* Flow direction arrows */}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" 
                refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="var(--equipment-outline)" opacity="0.7"/>
        </marker>
      </defs>
      
      <line 
        x1="25" y1="30" x2="35" y2="30"
        stroke="var(--equipment-outline)" 
        strokeWidth="1"
        opacity="0.7"
        markerEnd="url(#arrowhead)"
      />
      
      <line 
        x1="65" y1="30" x2="75" y2="30"
        stroke="var(--equipment-outline)" 
        strokeWidth="1"
        opacity="0.7"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Debris collection area (bottom) */}
      <path 
        d="M 40 40 L 35 50 L 65 50 L 60 40 Z"
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Collected debris indication */}
      <circle cx="45" cy="46" r="1.5" fill="var(--stream-waste)" opacity="0.6"/>
      <circle cx="50" cy="47" r="1" fill="var(--stream-waste)" opacity="0.6"/>
      <circle cx="55" cy="46" r="1.5" fill="var(--stream-waste)" opacity="0.6"/>
      
      {/* Inlet port */}
      <circle 
        cx="5" cy="30" r="3" 
        fill="none" 
        stroke="var(--stream-feed)" 
        strokeWidth="2"
        data-port="inlet"
      />
      <text x="5" y="45" textAnchor="middle" className="text-xs text-text-secondary">
        IN
      </text>
      
      {/* Outlet port */}
      <circle 
        cx="95" cy="30" r="3" 
        fill="none" 
        stroke="var(--stream-product)" 
        strokeWidth="2"
        data-port="outlet"
      />
      <text x="95" y="45" textAnchor="middle" className="text-xs text-text-secondary">
        OUT
      </text>
      
      {/* Drain port */}
      <circle 
        cx="50" cy="55" r="2.5" 
        fill="none" 
        stroke="var(--stream-waste)" 
        strokeWidth="1.5"
        data-port="drain"
      />
      <text x="50" y="62" textAnchor="middle" className="text-xs text-text-secondary">
        DRAIN
      </text>
      
      {/* Equipment label */}
      <text 
        x="50" y="15" 
        textAnchor="middle" 
        className="equipment-label text-text-primary fill-current"
        fontSize="10"
        fontWeight="600"
      >
        STRAINER
      </text>
    </svg>
  )
}