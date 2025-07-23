// Equipment data models for TypeScript type safety

export interface BaseEquipment {
  id: string
  type: string
  position: { x: number; y: number }
  config: Record<string, any>
  label?: string
}

export interface UFEquipment extends BaseEquipment {
  type: 'ultrafiltration'
  config: {
    membrane_area: number // m²
    transmembrane_pressure: number // bar
    temperature: number // °C
    feed_concentration: number // g/L
    crossflow_velocity: number // m/s
    membrane_type: 'PVDF' | 'PTFE'
    operating_hours: number // h
  }
}

export interface TankEquipment extends BaseEquipment {
  type: 'tank'
  config: {
    volume: number // m³
    height: number // m
    level: number // % (0-100)
  }
}

export interface PumpEquipment extends BaseEquipment {
  type: 'pump'
  config: {
    discharge_pressure: number // bar
    efficiency: number // 0-1
    running: boolean
  }
}

export interface StrainerEquipment extends BaseEquipment {
  type: 'strainer'
  config: {
    mesh_size: number // mm
    pressure_drop: number // bar
  }
}

export type Equipment = UFEquipment | TankEquipment | PumpEquipment | StrainerEquipment

export interface EquipmentResults {
  [equipmentId: string]: {
    [key: string]: number | string | boolean
  }
}

// Port configuration for different equipment types
export interface PortConfig {
  id: string
  position: { x: number; y: number } // Relative position (0-1)
  type: 'inlet' | 'outlet'
  streamTypes: string[]
  diameter?: string
  maxPressure?: number
}

export const EQUIPMENT_PORTS: Record<string, Record<string, PortConfig>> = {
  ultrafiltration: {
    feed_inlet: {
      id: 'feed_inlet',
      position: { x: 0, y: 0.5 },
      type: 'inlet',
      streamTypes: ['feed', 'pretreated_water'],
      diameter: 'DN100',
      maxPressure: 6.0
    },
    permeate_outlet: {
      id: 'permeate_outlet',
      position: { x: 1, y: 0.33 },
      type: 'outlet',
      streamTypes: ['permeate', 'product_water'],
      diameter: 'DN80',
      maxPressure: 2.0
    },
    concentrate_outlet: {
      id: 'concentrate_outlet',
      position: { x: 1, y: 0.67 },
      type: 'outlet',
      streamTypes: ['concentrate', 'waste_water'],
      diameter: 'DN50',
      maxPressure: 6.0
    },
    backwash_inlet: {
      id: 'backwash_inlet',
      position: { x: 0.3, y: 1 },
      type: 'inlet',
      streamTypes: ['backwash_water'],
      diameter: 'DN50',
      maxPressure: 4.0
    },
    cip_inlet: {
      id: 'cip_inlet',
      position: { x: 0.7, y: 1 },
      type: 'inlet',
      streamTypes: ['cleaning_chemicals'],
      diameter: 'DN25',
      maxPressure: 10.0
    }
  },
  tank: {
    inlet: {
      id: 'inlet',
      position: { x: 0.5, y: 0 },
      type: 'inlet',
      streamTypes: ['feed', 'product_water', 'waste_water'],
      diameter: 'DN100',
      maxPressure: 3.0
    },
    outlet: {
      id: 'outlet',
      position: { x: 0.5, y: 1 },
      type: 'outlet',
      streamTypes: ['feed', 'product_water', 'waste_water'],
      diameter: 'DN100',
      maxPressure: 3.0
    }
  },
  pump: {
    suction: {
      id: 'suction',
      position: { x: 0, y: 0.5 },
      type: 'inlet',
      streamTypes: ['feed', 'product_water', 'waste_water'],
      diameter: 'DN100',
      maxPressure: 2.0
    },
    discharge: {
      id: 'discharge',
      position: { x: 1, y: 0.5 },
      type: 'outlet',
      streamTypes: ['feed', 'product_water', 'waste_water'],
      diameter: 'DN100',
      maxPressure: 20.0
    }
  },
  strainer: {
    inlet: {
      id: 'inlet',
      position: { x: 0, y: 0.5 },
      type: 'inlet',
      streamTypes: ['feed', 'pretreated_water'],
      diameter: 'DN100',
      maxPressure: 10.0
    },
    outlet: {
      id: 'outlet',
      position: { x: 1, y: 0.5 },
      type: 'outlet',
      streamTypes: ['feed', 'pretreated_water'],
      diameter: 'DN100',
      maxPressure: 10.0
    },
    drain: {
      id: 'drain',
      position: { x: 0.5, y: 1 },
      type: 'outlet',
      streamTypes: ['waste_water', 'backwash_water'],
      diameter: 'DN25',
      maxPressure: 3.0
    }
  }
}