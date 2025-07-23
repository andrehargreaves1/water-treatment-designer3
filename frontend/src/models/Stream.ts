// Stream data models

export interface Stream {
  id: string
  sourceEquipmentId: string
  sourcePort: string
  targetEquipmentId: string
  targetPort: string
  properties: StreamProperties
  style?: StreamStyle
}

export interface StreamProperties {
  flowRate: number // m³/h
  pressure: number // bar
  temperature: number // °C
  concentration: number // g/L
  composition?: Record<string, number> // Component concentrations
  waterQuality?: WaterQuality // Water quality parameters
}

export interface WaterQuality {
  turbidity: number // NTU
  tss: number // mg/L Total Suspended Solids
  tds: number // mg/L Total Dissolved Solids
  fog: number // mg/L Fats, Oils and Grease
  bod: number // mg/L Biochemical Oxygen Demand
  cod: number // mg/L Chemical Oxygen Demand
  ph: number // pH units
  alkalinity: number // mg/L as CaCO3
  hardness: number // mg/L as CaCO3
  chloride: number // mg/L
  sulfate: number // mg/L
  nitrate: number // mg/L
  phosphate: number // mg/L
  iron: number // mg/L
  manganese: number // mg/L
}

export interface StreamStyle {
  color: string
  strokeWidth: number
  animated: boolean
  label?: string
}

export interface Connection {
  id: string
  source: string // equipment-port format: "UF-001-permeate_outlet"
  target: string // equipment-port format: "TANK-001-inlet"
  animated: boolean
  style: {
    stroke: string
    strokeWidth: number
  }
}

// Stream type definitions for color coding
export const STREAM_TYPES = {
  feed: {
    color: '#ea580c', // Orange
    label: 'Feed Water',
    description: 'Raw or pretreated feed water'
  },
  product: {
    color: '#2563eb', // Blue  
    label: 'Product Water',
    description: 'Clean treated water'
  },
  permeate: {
    color: '#2563eb', // Blue
    label: 'Permeate',
    description: 'Filtered water from membrane'
  },
  concentrate: {
    color: '#6b7280', // Gray
    label: 'Concentrate',
    description: 'Concentrated waste stream'
  },
  waste: {
    color: '#6b7280', // Gray
    label: 'Waste Water',
    description: 'Waste or reject stream'
  },
  backwash: {
    color: '#d97706', // Amber
    label: 'Backwash',
    description: 'Cleaning water for backwash'
  },
  chemical: {
    color: '#d97706', // Amber
    label: 'Chemicals',
    description: 'Cleaning chemicals or coagulants'
  },
  air: {
    color: '#059669', // Green
    label: 'Air/Gas',
    description: 'Air or other gas streams'
  }
} as const

export type StreamType = keyof typeof STREAM_TYPES

// Stream compatibility matrix
export const STREAM_COMPATIBILITY: Record<StreamType, StreamType[]> = {
  feed: ['feed', 'product'],
  product: ['product', 'feed', 'backwash'],
  permeate: ['permeate', 'product', 'feed'],
  concentrate: ['concentrate', 'waste'],
  waste: ['waste', 'concentrate'],
  backwash: ['backwash', 'product', 'feed'],
  chemical: ['chemical'],
  air: ['air']
}

export function getStreamType(streamId: string): StreamType {
  const lower = streamId.toLowerCase()
  
  if (lower.includes('feed')) return 'feed'
  if (lower.includes('permeate')) return 'permeate'
  if (lower.includes('concentrate') || lower.includes('reject')) return 'concentrate'
  if (lower.includes('waste')) return 'waste'
  if (lower.includes('backwash')) return 'backwash'
  if (lower.includes('chemical') || lower.includes('cip')) return 'chemical'
  if (lower.includes('air') || lower.includes('gas')) return 'air'
  if (lower.includes('product') || lower.includes('clean')) return 'product'
  
  return 'feed' // Default
}

export function areStreamsCompatible(sourceType: StreamType, targetType: StreamType): boolean {
  return STREAM_COMPATIBILITY[sourceType]?.includes(targetType) || false
}