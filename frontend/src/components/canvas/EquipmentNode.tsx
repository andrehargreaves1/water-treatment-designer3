import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Equipment, EQUIPMENT_PORTS } from '../../models/Equipment'
import { UFSymbol, TankSymbol, PumpSymbol, StrainerSymbol, FeedTankSymbol } from '../equipment'
import { useFlowsheetStore } from '../../store/flowsheetStore'

interface EquipmentNodeData {
  equipment: Equipment
  selected: boolean
}

export const EquipmentNode: React.FC<NodeProps<EquipmentNodeData>> = ({ 
  data, 
  selected 
}) => {
  const { equipment } = data
  const { calculations } = useFlowsheetStore()
  
  const results = calculations[equipment.id] || {}
  
  // Get port configuration for this equipment type
  const ports = EQUIPMENT_PORTS[equipment.type] || {}

  const renderEquipmentSymbol = () => {
    const commonProps = {
      selected,
      className: 'drop-shadow-sm'
    }

    switch (equipment.type) {
      case 'feed_tank':
        return (
          <FeedTankSymbol 
            {...commonProps} 
            level={equipment.config.level || 75}
            sourceType={equipment.config.source_type || 'surface_water'}
          />
        )
      case 'ultrafiltration':
        return <UFSymbol {...commonProps} />
      case 'tank':
        return (
          <TankSymbol 
            {...commonProps} 
            level={equipment.config.level || 75} 
          />
        )
      case 'pump':
        return (
          <PumpSymbol 
            {...commonProps} 
            running={equipment.config.running || false} 
          />
        )
      case 'strainer':
        return <StrainerSymbol {...commonProps} />
      default:
        return (
          <div className="w-20 h-12 bg-panel border border-border rounded-sm flex items-center justify-center">
            <span className="text-xs text-text-secondary">{equipment.type}</span>
          </div>
        )
    }
  }

  const renderPorts = () => {
    return Object.entries(ports).map(([portId, portConfig]) => {
      const position = portConfig.type === 'inlet' ? Position.Left : Position.Right
      const handleStyle = {
        background: '#fff',
        border: '2px solid #64748b',
        width: '8px',
        height: '8px',
      }

      // Adjust position based on port configuration
      let top = '50%'
      if (portConfig.position.y !== 0.5) {
        top = `${portConfig.position.y * 100}%`
      }

      let left = '50%'
      if (portConfig.position.x === 0) {
        left = '0%'
      } else if (portConfig.position.x === 1) {
        left = '100%'
      } else {
        left = `${portConfig.position.x * 100}%`
      }

      return (
        <Handle
          key={portId}
          id={portId}
          type={portConfig.type === 'inlet' ? 'target' : 'source'}
          position={position}
          style={{
            ...handleStyle,
            top,
            left: portConfig.position.x === 0.5 ? left : undefined,
            right: portConfig.position.x === 1 ? '0%' : undefined,
            left: portConfig.position.x === 0 ? '0%' : portConfig.position.x === 0.5 ? left : undefined,
            transform: portConfig.position.x === 0.5 ? 'translateX(-50%)' : 
                     portConfig.position.y === 0.5 ? 'translateY(-50%)' : 
                     'translate(-50%, -50%)',
          }}
          isConnectable={true}
        />
      )
    })
  }

  return (
    <div 
      className={`
        relative bg-transparent
        ${selected ? 'ring-2 ring-equipment-selected ring-offset-2 ring-offset-background' : ''}
      `}
    >
      {/* Equipment symbol */}
      <div className="relative">
        {renderEquipmentSymbol()}
        {renderPorts()}
      </div>
      
      {/* Equipment label and ID */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-mono text-text-primary bg-panel px-2 py-1 rounded border border-border shadow-sm">
          {equipment.label || equipment.id}
        </div>
      </div>
      
      {/* Key performance indicator */}
      {results && Object.keys(results).length > 0 && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="text-xs font-mono text-equipment-selected bg-panel px-2 py-1 rounded border border-border shadow-sm">
            {equipment.type === 'ultrafiltration' && results.recovery && (
              <span>{Math.round(results.recovery as number)}% REC</span>
            )}
            {equipment.type === 'pump' && results.power_consumption && (
              <span>{Math.round((results.power_consumption as number) * 10) / 10} kW</span>
            )}
            {equipment.type === 'tank' && equipment.config.level && (
              <span>{equipment.config.level}% FULL</span>
            )}
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      <div className="absolute -top-2 -right-2">
        <div 
          className={`
            w-3 h-3 rounded-full border-2 border-white
            ${Object.keys(results).length > 0 ? 'bg-green-500' : 'bg-gray-400'}
          `}
          title={Object.keys(results).length > 0 ? 'Calculated' : 'Not calculated'}
        />
      </div>
    </div>
  )
}