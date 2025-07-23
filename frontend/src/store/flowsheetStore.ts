import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Equipment, EquipmentResults } from '../models/Equipment'
import { Stream, StreamProperties } from '../models/Stream'
import { processApi } from '../api/processApi'

interface EngineeringError {
  code: string
  message: string
  equipment_id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

interface FlowsheetState {
  // Core data
  equipment: Record<string, Equipment>
  streams: Record<string, Stream>
  connections: Record<string, any>
  
  // Calculation results
  calculations: EquipmentResults
  streamProperties: Record<string, StreamProperties>
  
  // System state
  isCalculating: boolean
  lastCalculation: string | null
  massBalanceValid: boolean
  systemRecovery: number
  
  // Validation
  errors: EngineeringError[]
  warnings: string[]
  
  // Selection state
  selectedEquipment: string | null
  selectedStream: string | null
  
  // Actions
  addEquipment: (equipment: Equipment) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>
  removeEquipment: (id: string) => void
  
  addConnection: (sourceId: string, sourcePort: string, targetId: string, targetPort: string) => Promise<void>
  removeConnection: (connectionId: string) => void
  
  selectEquipment: (id: string | null) => void
  selectStream: (id: string | null) => void
  
  recalculateFlowsheet: () => Promise<void>
  validateFlowsheet: () => Promise<boolean>
  
  // Utility actions
  clearAll: () => void
  exportFlowsheet: () => any
  importFlowsheet: (data: any) => void
}

export const useFlowsheetStore = create<FlowsheetState>()(
  devtools(
    (set, get) => ({
      // Initial state
      equipment: {},
      streams: {},
      connections: {},
      calculations: {},
      streamProperties: {},
      isCalculating: false,
      lastCalculation: null,
      massBalanceValid: false,
      systemRecovery: 0,
      errors: [],
      warnings: [],
      selectedEquipment: null,
      selectedStream: null,

      // Equipment actions
      addEquipment: (equipment: Equipment) => {
        set(state => ({
          equipment: {
            ...state.equipment,
            [equipment.id]: equipment
          }
        }))
      },

      updateEquipment: async (id: string, updates: Partial<Equipment>) => {
        set({ isCalculating: true })
        
        // Update equipment configuration
        set(state => ({
          equipment: {
            ...state.equipment,
            [id]: { ...state.equipment[id], ...updates }
          }
        }))
        
        // Trigger recalculation
        await get().recalculateFlowsheet()
      },

      removeEquipment: (id: string) => {
        set(state => {
          const newEquipment = { ...state.equipment }
          delete newEquipment[id]
          
          // Remove connections involving this equipment
          const newConnections = { ...state.connections }
          Object.keys(newConnections).forEach(connId => {
            const conn = newConnections[connId]
            if (conn.sourceEquipmentId === id || conn.targetEquipmentId === id) {
              delete newConnections[connId]
            }
          })
          
          return {
            equipment: newEquipment,
            connections: newConnections,
            selectedEquipment: state.selectedEquipment === id ? null : state.selectedEquipment
          }
        })
      },

      // Connection actions
      addConnection: async (sourceId: string, sourcePort: string, targetId: string, targetPort: string) => {
        const connectionId = `${sourceId}-${sourcePort}-${targetId}-${targetPort}`
        
        // Create stream for this connection
        const streamId = `stream-${Date.now()}`
        
        set(state => ({
          connections: {
            ...state.connections,
            [connectionId]: {
              id: connectionId,
              sourceEquipmentId: sourceId,
              sourcePort,
              targetEquipmentId: targetId,
              targetPort,
              streamId
            }
          },
          streams: {
            ...state.streams,
            [streamId]: {
              id: streamId,
              sourceEquipmentId: sourceId,
              sourcePort,
              targetEquipmentId: targetId,
              targetPort,
              properties: {
                flowRate: 0,
                pressure: 1.0,
                temperature: 25.0,
                concentration: 0
              }
            }
          }
        }))
        
        // Trigger recalculation
        await get().recalculateFlowsheet()
      },

      removeConnection: (connectionId: string) => {
        set(state => {
          const newConnections = { ...state.connections }
          const connection = newConnections[connectionId]
          
          if (connection) {
            // Remove associated stream
            const newStreams = { ...state.streams }
            delete newStreams[connection.streamId]
            delete newConnections[connectionId]
            
            return {
              connections: newConnections,
              streams: newStreams
            }
          }
          
          return state
        })
      },

      // Selection actions
      selectEquipment: (id: string | null) => {
        set({ selectedEquipment: id, selectedStream: null })
      },

      selectStream: (id: string | null) => {
        set({ selectedStream: id, selectedEquipment: null })
      },

      // Calculation actions
      recalculateFlowsheet: async () => {
        const { equipment, connections } = get()
        
        if (Object.keys(equipment).length === 0) {
          set({ isCalculating: false })
          return
        }

        try {
          set({ isCalculating: true, errors: [], warnings: [] })

          // Build inlet/outlet stream maps for each equipment
          const equipmentStreams: Record<string, {inlet_streams: string[], outlet_streams: string[]}> = {}
          
          // Initialize empty arrays for all equipment
          Object.keys(equipment).forEach(eqId => {
            equipmentStreams[eqId] = { inlet_streams: [], outlet_streams: [] }
          })
          
          // Populate stream connections
          Object.entries(connections).forEach(([streamId, connection]) => {
            const sourceEqId = connection.sourceEquipmentId
            const targetEqId = connection.targetEquipmentId
            
            if (equipmentStreams[sourceEqId]) {
              equipmentStreams[sourceEqId].outlet_streams.push(streamId)
            }
            if (equipmentStreams[targetEqId]) {
              equipmentStreams[targetEqId].inlet_streams.push(streamId)
            }
          })

          // Prepare flowsheet data for backend
          const flowsheetData = {
            equipment: Object.fromEntries(
              Object.entries(equipment).map(([id, eq]) => [
                id, 
                {
                  equipment_id: id,
                  equipment_type: eq.type,
                  config: eq.config,
                  inlet_streams: equipmentStreams[id]?.inlet_streams || [],
                  outlet_streams: equipmentStreams[id]?.outlet_streams || []
                }
              ])
            ),
            streams: Object.fromEntries(
              Object.entries(connections).map(([streamId, connection]) => {
                // Get water quality from source equipment if it's a feed tank
                const sourceEq = equipment[connection.sourceEquipmentId]
                let streamData = {
                  stream_id: streamId,
                  source_equipment: connection.sourceEquipmentId,
                  target_equipment: connection.targetEquipmentId,
                  source_port: connection.sourcePort,
                  target_port: connection.targetPort,
                  flow_rate: 0.0,
                  pressure: 1.0,
                  temperature: 25.0,
                  concentration: 0.0,
                  // Initialize with default water quality
                  turbidity: 1.0,
                  tss: 10.0,
                  tds: 500.0,
                  fog: 5.0,
                  bod: 20.0,
                  cod: 50.0,
                  ph: 7.0,
                  alkalinity: 100.0,
                  hardness: 150.0,
                  chloride: 50.0,
                  sulfate: 30.0,
                  nitrate: 10.0,
                  phosphate: 2.0,
                  iron: 0.5,
                  manganese: 0.1
                }
                
                // For feed tanks, initialize with their water quality
                if (sourceEq?.type === 'feed_tank' && sourceEq.config) {
                  streamData = {
                    ...streamData,
                    flow_rate: sourceEq.config.inflow_rate || 0,
                    temperature: sourceEq.config.temperature || 25.0,
                    turbidity: sourceEq.config.turbidity || 1.0,
                    tss: sourceEq.config.tss || 10.0,
                    tds: sourceEq.config.tds || 500.0,
                    fog: sourceEq.config.fog || 5.0,
                    bod: sourceEq.config.bod || 20.0,
                    cod: sourceEq.config.cod || 50.0,
                    ph: sourceEq.config.ph || 7.0,
                    alkalinity: sourceEq.config.alkalinity || 100.0,
                    hardness: sourceEq.config.hardness || 150.0,
                    chloride: sourceEq.config.chloride || 50.0,
                    sulfate: sourceEq.config.sulfate || 30.0,
                    nitrate: sourceEq.config.nitrate || 10.0,
                    phosphate: sourceEq.config.phosphate || 2.0,
                    iron: sourceEq.config.iron || 0.5,
                    manganese: sourceEq.config.manganese || 0.1
                  }
                }
                
                return [streamId, streamData]
              })
            ),
            connections
          }

          // Calculate flowsheet
          console.log('Sending flowsheet data:', flowsheetData)
          const result = await processApi.calculateFlowsheet(flowsheetData)
          console.log('Received calculation result:', result)

          if (result.success) {
            console.log('Setting stream properties:', result.streams)
            set({
              calculations: result.equipment_results || {},
              streamProperties: result.streams || {},
              massBalanceValid: result.converged || false,
              systemRecovery: result.system_recovery || 0,
              errors: result.errors || [],
              isCalculating: false,
              lastCalculation: new Date().toISOString()
            })
          } else {
            console.error('Calculation failed:', result.errors)
            set({
              errors: result.errors || [],
              isCalculating: false
            })
          }

        } catch (error) {
          set({
            errors: [{
              code: 'CALCULATION_ERROR',
              message: `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              equipment_id: '',
              severity: 'critical' as const
            }],
            isCalculating: false
          })
        }
      },

      validateFlowsheet: async () => {
        const { equipment } = get()
        let isValid = true
        const validationErrors: EngineeringError[] = []

        // Validate each equipment
        for (const [id, eq] of Object.entries(equipment)) {
          try {
            const result = await processApi.validateEquipment({
              equipment_id: id,
              equipment_type: eq.type,
              config: eq.config
            })
            
            if (!result.valid) {
              validationErrors.push(...(result.errors || []))
              isValid = false
            }
          } catch (error) {
            validationErrors.push({
              code: 'VALIDATION_ERROR',
              message: `Validation failed for ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              equipment_id: id,
              severity: 'error' as const
            })
            isValid = false
          }
        }

        set({ errors: validationErrors })
        return isValid
      },

      // Utility actions
      clearAll: () => {
        set({
          equipment: {},
          streams: {},
          connections: {},
          calculations: {},
          streamProperties: {},
          errors: [],
          warnings: [],
          selectedEquipment: null,
          selectedStream: null,
          isCalculating: false,
          lastCalculation: null,
          massBalanceValid: false,
          systemRecovery: 0
        })
      },

      exportFlowsheet: () => {
        const state = get()
        return {
          equipment: state.equipment,
          streams: state.streams,
          connections: state.connections,
          version: '3.0.0',
          timestamp: new Date().toISOString()
        }
      },

      importFlowsheet: (data: any) => {
        if (data.version && data.equipment) {
          set({
            equipment: data.equipment || {},
            streams: data.streams || {},
            connections: data.connections || {},
            calculations: {},
            streamProperties: {},
            errors: [],
            warnings: [],
            selectedEquipment: null,
            selectedStream: null
          })
          
          // Trigger recalculation after import
          setTimeout(() => get().recalculateFlowsheet(), 100)
        }
      }
    }),
    {
      name: 'flowsheet-store',
      partialize: (state) => ({
        equipment: state.equipment,
        streams: state.streams,
        connections: state.connections
      })
    }
  )
)