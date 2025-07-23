import React from 'react'
import { useFlowsheetStore } from '../../store/flowsheetStore'
import { Equipment } from '../../models/Equipment'
import { UFSymbol, TankSymbol, PumpSymbol, StrainerSymbol } from '../equipment'

interface EquipmentTemplate {
  type: string
  name: string
  description: string
  defaultConfig: Record<string, any>
  icon: React.ReactNode
}

const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  {
    type: 'ultrafiltration',
    name: 'Ultrafiltration',
    description: 'Membrane filtration system',
    defaultConfig: {
      membrane_area: 500,
      transmembrane_pressure: 1.5,
      temperature: 25,
      feed_concentration: 0.1,
      crossflow_velocity: 2.0,
      membrane_type: 'PVDF',
      operating_hours: 0
    },
    icon: <UFSymbol width={60} height={30} />
  },
  {
    type: 'tank',
    name: 'Storage Tank',
    description: 'Water storage vessel',
    defaultConfig: {
      volume: 100,
      height: 5,
      level: 75
    },
    icon: <TankSymbol width={40} height={50} />
  },
  {
    type: 'pump',
    name: 'Centrifugal Pump',
    description: 'Water circulation pump',
    defaultConfig: {
      discharge_pressure: 3.0,
      efficiency: 0.75,
      running: false
    },
    icon: <PumpSymbol width={50} height={30} />
  },
  {
    type: 'strainer',
    name: 'Strainer',
    description: 'Mechanical filtration',
    defaultConfig: {
      mesh_size: 1.0,
      pressure_drop: 0.1
    },
    icon: <StrainerSymbol width={60} height={30} />
  }
]

export const EquipmentPalette: React.FC = () => {
  const { addEquipment, equipment } = useFlowsheetStore()

  const handleAddEquipment = (template: EquipmentTemplate) => {
    // Generate unique ID
    const existingIds = Object.keys(equipment).filter(id => id.startsWith(template.type.toUpperCase()))
    const nextNumber = existingIds.length + 1
    const paddedNumber = nextNumber.toString().padStart(3, '0')
    
    const newEquipment: Equipment = {
      id: `${template.type.toUpperCase()}-${paddedNumber}`,
      type: template.type,
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      config: { ...template.defaultConfig },
      label: `${template.name} ${nextNumber}`
    } as Equipment

    addEquipment(newEquipment)
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="panel-header">
        <h2 className="text-lg font-semibold text-text-primary">Equipment Library</h2>
        <p className="text-sm text-text-secondary mt-1">
          Drag equipment to canvas or click to add
        </p>
      </div>

      {/* Equipment list */}
      <div className="panel-content space-y-3">
        {EQUIPMENT_TEMPLATES.map((template) => (
          <div
            key={template.type}
            className="group cursor-pointer"
            onClick={() => handleAddEquipment(template)}
          >
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-sm hover:border-equipment-selected hover:bg-blue-50 transition-all">
              <div className="flex items-center space-x-3">
                {/* Equipment icon */}
                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-sm group-hover:bg-white transition-colors">
                  {template.icon}
                </div>
                
                {/* Equipment info */}
                <div className="flex-1 min-w-0">
                  <div className="equipment-label text-text-primary group-hover:text-equipment-selected transition-colors">
                    {template.name}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {template.description}
                  </div>
                  
                  {/* Key specifications */}
                  <div className="mt-2 space-y-1">
                    {template.type === 'ultrafiltration' && (
                      <>
                        <div className="text-xs technical-data text-text-secondary">
                          Area: {template.defaultConfig.membrane_area} m²
                        </div>
                        <div className="text-xs technical-data text-text-secondary">
                          TMP: {template.defaultConfig.transmembrane_pressure} bar
                        </div>
                      </>
                    )}
                    {template.type === 'tank' && (
                      <>
                        <div className="text-xs technical-data text-text-secondary">
                          Volume: {template.defaultConfig.volume} m³
                        </div>
                        <div className="text-xs technical-data text-text-secondary">
                          Height: {template.defaultConfig.height} m
                        </div>
                      </>
                    )}
                    {template.type === 'pump' && (
                      <>
                        <div className="text-xs technical-data text-text-secondary">
                          Pressure: {template.defaultConfig.discharge_pressure} bar
                        </div>
                        <div className="text-xs technical-data text-text-secondary">
                          Efficiency: {(template.defaultConfig.efficiency * 100)}%
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick reference */}
      <div className="mt-6 p-4 bg-gray-50 rounded-sm">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Quick Reference</h3>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-stream-feed"></div>
            <span>Feed water streams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-stream-product"></div>
            <span>Product water streams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-stream-waste"></div>
            <span>Waste/concentrate streams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-stream-chemical"></div>
            <span>Chemical/cleaning streams</span>
          </div>
        </div>
      </div>
    </div>
  )
}