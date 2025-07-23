import React from 'react'

interface UFSymbolProps {
  width?: number
  height?: number
  selected?: boolean
  className?: string
}

export const UFSymbol: React.FC<UFSymbolProps> = ({ 
  width = 120, 
  height = 60, 
  selected = false,
  className = '' 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 60"
      className={`equipment-symbol ${selected ? 'selected' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Housing - main membrane vessel */}
      <rect 
        x="10" y="15" width="100" height="30" rx="3"
        fill="var(--equipment-fill)" 
        stroke="var(--equipment-outline)" 
        strokeWidth="1.5"
      />
      
      {/* Membrane elements - vertical lines representing membrane sheets */}
      {Array.from({length: 6}, (_, i) => (
        <line 
          key={i}
          x1={20 + i * 15} y1="18" 
          x2={20 + i * 15} y2="42"
          stroke="var(--equipment-outline)" 
          strokeWidth="1"
          opacity="0.7"
        />
      ))}
      
      {/* Feed inlet port */}
      <circle 
        cx="5" cy="30" r="3" 
        fill="none" 
        stroke="var(--stream-feed)" 
        strokeWidth="2"
        data-port="feed_inlet"
      />
      <text x="5" y="52" textAnchor="middle" className="text-xs text-text-secondary">
        FEED
      </text>
      
      {/* Permeate outlet port */}
      <circle 
        cx="115" cy="20" r="3" 
        fill="none" 
        stroke="var(--stream-product)" 
        strokeWidth="2"
        data-port="permeate_outlet"
      />
      <text x="115" y="12" textAnchor="middle" className="text-xs text-text-secondary">
        PERM
      </text>
      
      {/* Concentrate outlet port */}
      <circle 
        cx="115" cy="40" r="3" 
        fill="none" 
        stroke="var(--stream-waste)" 
        strokeWidth="2"
        data-port="concentrate_outlet"
      />
      <text x="115" y="54" textAnchor="middle" className="text-xs text-text-secondary">
        CONC
      </text>
      
      {/* Backwash inlet port (bottom) */}
      <circle 
        cx="35" cy="50" r="2.5" 
        fill="none" 
        stroke="var(--stream-chemical)" 
        strokeWidth="1.5"
        data-port="backwash_inlet"
      />
      
      {/* CIP inlet port (bottom) */}
      <circle 
        cx="85" cy="50" r="2.5" 
        fill="none" 
        stroke="var(--stream-chemical)" 
        strokeWidth="1.5"
        data-port="cip_inlet"
      />
      
      {/* Equipment label */}
      <text 
        x="60" y="35" 
        textAnchor="middle" 
        className="equipment-label text-text-primary fill-current"
        fontSize="12"
        fontWeight="600"
      >
        UF
      </text>
    </svg>
  )
}