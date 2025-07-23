import React from 'react'
import { useFlowsheetStore } from '../../store/flowsheetStore'
import { Equipment } from '../../models/Equipment'
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'

interface PropertyInputProps {
  label: string
  value: number
  unit: string
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const PropertyInput: React.FC<PropertyInputProps> = ({
  label,
  value,
  unit,
  onChange,
  min,
  max,
  step = 0.1
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-text-primary">
        {label}
        <span className="text-text-secondary ml-1">({unit})</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="technical-input w-full"
      />
    </div>
  )
}

export const PropertyPanel: React.FC = () => {
  const { 
    selectedEquipment, 
    equipment, 
    calculations,
    errors,
    isCalculating,
    updateEquipment 
  } = useFlowsheetStore()

  const selectedEq = selectedEquipment ? equipment[selectedEquipment] : null
  const results = selectedEquipment ? calculations[selectedEquipment] : null
  const equipmentErrors = errors.filter(e => e.equipment_id === selectedEquipment)

  const handleConfigChange = (key: string, value: any) => {
    if (selectedEq) {
      const updatedConfig = {
        ...selectedEq.config,
        [key]: value
      }
      updateEquipment(selectedEquipment!, { config: updatedConfig })
    }
  }

  if (!selectedEq) {
    return (
      <div className="h-full">
        <div className="panel-header">
          <h2 className="text-lg font-semibold text-text-primary">Properties</h2>
        </div>
        <div className="panel-content">
          <div className="text-center text-text-secondary py-8">
            <p>Select equipment to view properties</p>
          </div>
        </div>
      </div>
    )
  }

  const renderEquipmentInputs = () => {
    switch (selectedEq.type) {
      case 'ultrafiltration':
        return (
          <div className="space-y-4">
            <PropertyInput
              label="Membrane Area"
              value={selectedEq.config.membrane_area}
              unit="m²"
              onChange={(value) => handleConfigChange('membrane_area', value)}
              min={1}
              max={10000}
            />
            <PropertyInput
              label="Transmembrane Pressure"
              value={selectedEq.config.transmembrane_pressure}
              unit="bar"
              onChange={(value) => handleConfigChange('transmembrane_pressure', value)}
              min={0.1}
              max={3.0}
              step={0.1}
            />
            <PropertyInput
              label="Temperature"
              value={selectedEq.config.temperature}
              unit="°C"
              onChange={(value) => handleConfigChange('temperature', value)}
              min={5}
              max={60}
            />
            <PropertyInput
              label="Feed Concentration"
              value={selectedEq.config.feed_concentration}
              unit="g/L"
              onChange={(value) => handleConfigChange('feed_concentration', value)}
              min={0}
              max={10}
              step={0.01}
            />
            <PropertyInput
              label="Crossflow Velocity"
              value={selectedEq.config.crossflow_velocity}
              unit="m/s"
              onChange={(value) => handleConfigChange('crossflow_velocity', value)}
              min={0.5}
              max={5.0}
              step={0.1}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-primary">
                Membrane Type
              </label>
              <select
                value={selectedEq.config.membrane_type}
                onChange={(e) => handleConfigChange('membrane_type', e.target.value)}
                className="technical-input w-full"
              >
                <option value="PVDF">PVDF</option>
                <option value="PTFE">PTFE</option>
              </select>
            </div>
          </div>
        )

      case 'tank':
        return (
          <div className="space-y-4">
            <PropertyInput
              label="Volume"
              value={selectedEq.config.volume}
              unit="m³"
              onChange={(value) => handleConfigChange('volume', value)}
              min={0.1}
              max={10000}
            />
            <PropertyInput
              label="Height"
              value={selectedEq.config.height}
              unit="m"
              onChange={(value) => handleConfigChange('height', value)}
              min={0.5}
              max={20}
            />
            <PropertyInput
              label="Level"
              value={selectedEq.config.level}
              unit="%"
              onChange={(value) => handleConfigChange('level', value)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        )

      case 'pump':
        return (
          <div className="space-y-4">
            <PropertyInput
              label="Discharge Pressure"
              value={selectedEq.config.discharge_pressure}
              unit="bar"
              onChange={(value) => handleConfigChange('discharge_pressure', value)}
              min={1}
              max={20}
            />
            <PropertyInput
              label="Efficiency"
              value={selectedEq.config.efficiency * 100}
              unit="%"
              onChange={(value) => handleConfigChange('efficiency', value / 100)}
              min={50}
              max={90}
              step={1}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="running"
                checked={selectedEq.config.running}
                onChange={(e) => handleConfigChange('running', e.target.checked)}
                className="w-4 h-4 text-equipment-selected"
              />
              <label htmlFor="running" className="text-sm font-medium text-text-primary">
                Running
              </label>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-text-secondary">
            No configurable properties for this equipment type.
          </div>
        )
    }
  }

  const renderResults = () => {
    if (!results || Object.keys(results).length === 0) {
      return (
        <div className="text-center text-text-secondary py-4">
          <Clock size={24} className="mx-auto mb-2" />
          <p>No calculation results</p>
          <p className="text-xs mt-1">Click Calculate to see results</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {Object.entries(results).map(([key, value]) => {
          const displayValue = typeof value === 'number' ? 
            (value < 0.1 ? value.toFixed(4) : value.toFixed(2)) : 
            String(value)
          
          let unit = ''
          if (key.includes('flow')) unit = ' m³/h'
          else if (key.includes('pressure')) unit = ' bar'
          else if (key.includes('recovery')) unit = '%'
          else if (key.includes('flux')) unit = ' L/m²/h'
          else if (key.includes('energy')) unit = ' kWh/m³'
          else if (key.includes('power')) unit = ' kW'
          else if (key.includes('life')) unit = ' months'

          return (
            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-text-secondary capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="technical-data text-text-primary font-semibold">
                {displayValue}{unit}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {selectedEq.label || selectedEq.id}
          </h2>
          <div className="flex items-center space-x-2">
            {isCalculating && (
              <div className="animate-spin w-4 h-4 border-2 border-equipment-selected border-t-transparent rounded-full" />
            )}
            {equipmentErrors.length > 0 ? (
              <AlertTriangle size={16} className="text-red-600" />
            ) : results && Object.keys(results).length > 0 ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <Clock size={16} className="text-gray-400" />
            )}
          </div>
        </div>
        <p className="text-sm text-text-secondary capitalize">
          {selectedEq.type.replace('_', ' ')}
        </p>
      </div>

      <div className="panel-content">
        {/* Configuration section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
            <Zap size={16} className="mr-2" />
            Configuration
          </h3>
          {renderEquipmentInputs()}
        </div>

        {/* Results section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
            <CheckCircle size={16} className="mr-2" />
            Calculation Results
          </h3>
          <div className="bg-gray-50 rounded-sm p-3">
            {renderResults()}
          </div>
        </div>

        {/* Errors section */}
        {equipmentErrors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              Validation Errors
            </h3>
            <div className="space-y-2">
              {equipmentErrors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-sm p-3">
                  <div className="text-sm font-medium text-red-800">
                    {error.code}
                  </div>
                  <div className="text-sm text-red-600 mt-1">
                    {error.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}