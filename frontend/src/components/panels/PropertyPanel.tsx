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
    selectedStream,
    equipment, 
    connections,
    calculations,
    streamProperties,
    errors,
    isCalculating,
    updateEquipment,
    recalculateFlowsheet
  } = useFlowsheetStore()

  const selectedEq = selectedEquipment ? equipment[selectedEquipment] : null
  const selectedStreamData = selectedStream ? connections[selectedStream] : null
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
      case 'feed_tank':
        return (
          <div className="space-y-6">
            {/* Tank Configuration */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Tank Configuration</h4>
              <div className="space-y-4">
                <PropertyInput
                  label="Volume"
                  value={selectedEq.config.volume}
                  unit="m³"
                  onChange={(value) => handleConfigChange('volume', value)}
                  min={1}
                  max={50000}
                />
                <PropertyInput
                  label="Height"
                  value={selectedEq.config.height}
                  unit="m"
                  onChange={(value) => handleConfigChange('height', value)}
                  min={1}
                  max={50}
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
                <PropertyInput
                  label="Inflow Rate"
                  value={selectedEq.config.inflow_rate}
                  unit="m³/h"
                  onChange={(value) => handleConfigChange('inflow_rate', value)}
                  min={0}
                  max={10000}
                />
                <PropertyInput
                  label="Temperature"
                  value={selectedEq.config.temperature}
                  unit="°C"
                  onChange={(value) => handleConfigChange('temperature', value)}
                  min={0}
                  max={50}
                />
              </div>
            </div>

            {/* Water Source */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Water Source</h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-primary">
                    Source Type
                  </label>
                  <select
                    value={selectedEq.config.source_type}
                    onChange={(e) => handleConfigChange('source_type', e.target.value)}
                    className="technical-input w-full"
                  >
                    <option value="surface_water">🏞️ Surface Water</option>
                    <option value="groundwater">💧 Groundwater</option>
                    <option value="municipal">🏢 Municipal</option>
                    <option value="industrial">🏭 Industrial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-primary">
                    Source Description
                  </label>
                  <input
                    type="text"
                    value={selectedEq.config.source_description}
                    onChange={(e) => handleConfigChange('source_description', e.target.value)}
                    className="technical-input w-full"
                    placeholder="e.g., River intake, Well #3"
                  />
                </div>
              </div>
            </div>

            {/* Water Quality - Physical Parameters */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Physical Parameters</h4>
              <div className="space-y-4">
                <PropertyInput
                  label="Turbidity"
                  value={selectedEq.config.turbidity}
                  unit="NTU"
                  onChange={(value) => handleConfigChange('turbidity', value)}
                  min={0}
                  max={200}
                  step={0.1}
                />
                <PropertyInput
                  label="Total Suspended Solids"
                  value={selectedEq.config.tss}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('tss', value)}
                  min={0}
                  max={1000}
                  step={0.1}
                />
                <PropertyInput
                  label="Total Dissolved Solids"
                  value={selectedEq.config.tds}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('tds', value)}
                  min={0}
                  max={5000}
                  step={1}
                />
                <PropertyInput
                  label="FOG (Fats, Oils & Grease)"
                  value={selectedEq.config.fog}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('fog', value)}
                  min={0}
                  max={100}
                  step={0.1}
                />
                <PropertyInput
                  label="pH"
                  value={selectedEq.config.ph}
                  unit="units"
                  onChange={(value) => handleConfigChange('ph', value)}
                  min={4}
                  max={11}
                  step={0.1}
                />
              </div>
            </div>

            {/* Water Quality - Chemical Parameters */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Chemical Parameters</h4>
              <div className="space-y-4">
                <PropertyInput
                  label="Alkalinity"
                  value={selectedEq.config.alkalinity}
                  unit="mg/L CaCO₃"
                  onChange={(value) => handleConfigChange('alkalinity', value)}
                  min={0}
                  max={500}
                  step={1}
                />
                <PropertyInput
                  label="Hardness"
                  value={selectedEq.config.hardness}
                  unit="mg/L CaCO₃"
                  onChange={(value) => handleConfigChange('hardness', value)}
                  min={0}
                  max={1000}
                  step={1}
                />
                <PropertyInput
                  label="Chloride"
                  value={selectedEq.config.chloride}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('chloride', value)}
                  min={0}
                  max={500}
                  step={0.1}
                />
                <PropertyInput
                  label="Sulfate"
                  value={selectedEq.config.sulfate}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('sulfate', value)}
                  min={0}
                  max={300}
                  step={0.1}
                />
                <PropertyInput
                  label="Iron"
                  value={selectedEq.config.iron}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('iron', value)}
                  min={0}
                  max={10}
                  step={0.01}
                />
                <PropertyInput
                  label="Manganese"
                  value={selectedEq.config.manganese}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('manganese', value)}
                  min={0}
                  max={2}
                  step={0.01}
                />
              </div>
            </div>

            {/* Water Quality - Biological Parameters */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Biological Parameters</h4>
              <div className="space-y-4">
                <PropertyInput
                  label="BOD"
                  value={selectedEq.config.bod}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('bod', value)}
                  min={0}
                  max={500}
                  step={0.1}
                />
                <PropertyInput
                  label="COD"
                  value={selectedEq.config.cod}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('cod', value)}
                  min={0}
                  max={1000}
                  step={0.1}
                />
                <PropertyInput
                  label="Nitrate"
                  value={selectedEq.config.nitrate}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('nitrate', value)}
                  min={0}
                  max={100}
                  step={0.1}
                />
                <PropertyInput
                  label="Phosphate"
                  value={selectedEq.config.phosphate}
                  unit="mg/L"
                  onChange={(value) => handleConfigChange('phosphate', value)}
                  min={0}
                  max={20}
                  step={0.01}
                />
              </div>
            </div>
          </div>
        )

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

  const renderStreamProperties = () => {
    if (!selectedStreamData) return null

    // Get stream properties from calculation results
    const streamProps = selectedStream ? streamProperties[selectedStream] : null
    
    // Debug: log what we have
    console.log('Selected stream:', selectedStream)
    console.log('Stream properties:', streamProperties)
    console.log('Stream props for selected:', streamProps)
    
    return (
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="panel-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              Stream {selectedStream}
            </h2>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            {selectedStreamData.sourceEquipmentId} → {selectedStreamData.targetEquipmentId}
          </p>
        </div>

        <div className="panel-content">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-xs">
            <div><strong>Stream ID:</strong> {selectedStream}</div>
            <div><strong>Available streams:</strong> {Object.keys(streamProperties).join(', ') || 'None'}</div>
            <div><strong>Has data:</strong> {streamProps ? 'Yes' : 'No'}</div>
            <div><strong>Equipment count:</strong> {Object.keys(equipment).length}</div>
            <div><strong>Connection count:</strong> {Object.keys(connections).length}</div>
            <button 
              onClick={() => recalculateFlowsheet()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Recalculate'}
            </button>
          </div>

          {/* Flow Properties */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
              <Zap size={16} className="mr-2" />
              Flow Properties
            </h3>
            <div className="space-y-3">
              {streamProps ? [
                { key: 'flow_rate', label: 'Flow Rate', unit: 'm³/h' },
                { key: 'pressure', label: 'Pressure', unit: 'bar' },
                { key: 'temperature', label: 'Temperature', unit: '°C' },
              ].map(({ key, label, unit }) => (
                <div key={key} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-text-primary">{label}</span>
                  <span className="text-sm text-text-secondary font-mono">
                    {(streamProps as any)[key]?.toFixed(2) || '0.00'} {unit}
                  </span>
                </div>
              )) : (
                <div className="text-sm text-text-secondary p-3 bg-gray-50 rounded-lg">
                  No stream data available. Run calculations first by adding equipment and connecting streams.
                </div>
              )}
            </div>
          </div>

          {/* Water Quality */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Water Quality Parameters
            </h3>
            <div className="space-y-3">
              {streamProps ? [
                { key: 'turbidity', label: 'Turbidity', unit: 'NTU' },
                { key: 'tss', label: 'TSS', unit: 'mg/L' },
                { key: 'tds', label: 'TDS', unit: 'mg/L' },
                { key: 'fog', label: 'FOG', unit: 'mg/L' },
                { key: 'bod', label: 'BOD', unit: 'mg/L' },
                { key: 'cod', label: 'COD', unit: 'mg/L' },
                { key: 'ph', label: 'pH', unit: 'units' },
                { key: 'alkalinity', label: 'Alkalinity', unit: 'mg/L CaCO₃' },
                { key: 'hardness', label: 'Hardness', unit: 'mg/L CaCO₃' },
                { key: 'chloride', label: 'Chloride', unit: 'mg/L' },
                { key: 'sulfate', label: 'Sulfate', unit: 'mg/L' },
                { key: 'nitrate', label: 'Nitrate', unit: 'mg/L' },
                { key: 'phosphate', label: 'Phosphate', unit: 'mg/L' },
                { key: 'iron', label: 'Iron', unit: 'mg/L' },
                { key: 'manganese', label: 'Manganese', unit: 'mg/L' },
              ].map(({ key, label, unit }) => (
                <div key={key} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-text-primary">{label}</span>
                  <span className="text-sm text-text-secondary font-mono">
                    {(streamProps as any)[key]?.toFixed(key === 'ph' ? 1 : 2) || '0.00'} {unit}
                  </span>
                </div>
              )) : (
                <div className="text-sm text-text-secondary p-3 bg-gray-50 rounded-lg">
                  No water quality data available. Run calculations first.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show stream properties if a stream is selected
  if (selectedStream && !selectedEquipment) {
    return renderStreamProperties()
  }

  // Show equipment properties if equipment is selected
  if (!selectedEq) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p className="text-sm">Select equipment or stream to view properties</p>
        </div>
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