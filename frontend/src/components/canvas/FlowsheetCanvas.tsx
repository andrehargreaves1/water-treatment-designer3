import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeTypes,
  ConnectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './StreamEdge.css'

import { EquipmentNode } from './EquipmentNode'
import { useFlowsheetStore } from '../../store/flowsheetStore'
import { Equipment } from '../../models/Equipment'
import { STREAM_TYPES, getStreamType } from '../../models/Stream'

const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
}

export const FlowsheetCanvas: React.FC = () => {
  const {
    equipment,
    connections,
    streamProperties,
    selectedEquipment,
    selectedStream,
    selectEquipment,
    selectStream,
    addConnection,
    removeConnection,
  } = useFlowsheetStore()

  // Convert equipment to React Flow nodes
  const nodes = useMemo(() => {
    return Object.values(equipment).map((eq: Equipment) => ({
      id: eq.id,
      type: 'equipment',
      position: eq.position,
      data: {
        equipment: eq,
        selected: selectedEquipment === eq.id,
      },
      selected: selectedEquipment === eq.id,
    }))
  }, [equipment, selectedEquipment])

  // Convert connections to React Flow edges
  const edges = useMemo(() => {
    return Object.entries(connections).map(([id, connection]: [string, any]) => {
      const streamType = getStreamType(connection.sourcePort || 'feed')
      const streamConfig = STREAM_TYPES[streamType]
      
      // Get flow rate for animation speed
      const streamProps = streamProperties[id]
      const flowRate = streamProps?.flow_rate || 0
      
      // Calculate animation speed based on flow rate
      let animationDuration = '3s' // slow
      if (flowRate > 100) animationDuration = '0.5s' // fast
      else if (flowRate > 50) animationDuration = '1.5s' // medium
      
      const isSelected = selectedStream === id
      
      return {
        id,
        source: connection.sourceEquipmentId,
        target: connection.targetEquipmentId,
        sourceHandle: connection.sourcePort,
        targetHandle: connection.targetPort,
        animated: flowRate > 0,
        style: {
          stroke: streamConfig.color,
          strokeWidth: isSelected ? 4 : 3,
          strokeDasharray: '8,4',
          strokeDashoffset: '0',
          animation: flowRate > 0 ? `dash-flow ${animationDuration} linear infinite` : 'none',
        },
        data: {
          streamType,
          label: streamConfig.label,
          flowRate,
        },
      }
    })
  }, [connections, selectedStream, streamProperties])

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes)
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges)

  // Update React Flow state when store changes
  React.useEffect(() => {
    setNodes(nodes)
  }, [nodes, setNodes])

  React.useEffect(() => {
    setEdges(edges)
  }, [edges, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && params.sourceHandle && params.targetHandle) {
        addConnection(
          params.source,
          params.sourceHandle,
          params.target,
          params.targetHandle
        )
      }
    },
    [addConnection]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectEquipment(node.id)
    },
    [selectEquipment]
  )

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: any) => {
      selectStream(edge.id)
    },
    [selectStream]
  )

  const onPaneClick = useCallback(() => {
    selectEquipment(null)
    selectStream(null)
  }, [selectEquipment, selectStream])

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Update equipment position in store
      const eq = equipment[node.id]
      if (eq) {
        const updatedEquipment = {
          ...eq,
          position: node.position,
        }
        // Note: This would trigger recalculation, but for position changes
        // we might want to avoid that. For now, we'll update silently.
        useFlowsheetStore.setState(state => ({
          equipment: {
            ...state.equipment,
            [node.id]: updatedEquipment
          }
        }))
      }
    },
    [equipment]
  )

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
        attributionPosition="bottom-left"
      >
        {/* Professional grid background */}
        <Background 
          color="#e2e8f0" 
          gap={20} 
          size={1}
          className="opacity-50"
        />
        
        {/* Navigation controls */}
        <Controls 
          className="bg-panel border border-border shadow-panel"
          showInteractive={false}
        />
        
        {/* Minimap for large flowsheets */}
        <MiniMap 
          className="bg-panel border border-border shadow-panel"
          nodeColor="#e2e8f0"
          maskColor="rgba(0, 0, 0, 0.2)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  )
}