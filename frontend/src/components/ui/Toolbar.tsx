import React from 'react'
import { useFlowsheetStore } from '../../store/flowsheetStore'
import { Play, Square, RotateCcw, Save, FolderOpen, AlertTriangle } from 'lucide-react'

export const Toolbar: React.FC = () => {
  const { 
    isCalculating, 
    errors, 
    massBalanceValid,
    systemRecovery,
    recalculateFlowsheet,
    clearAll,
    exportFlowsheet,
    importFlowsheet 
  } = useFlowsheetStore()

  const handleExport = () => {
    const data = exportFlowsheet()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flowsheet-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            importFlowsheet(data)
          } catch (error) {
            alert('Invalid file format')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="flex items-center space-x-2">
      {/* System status indicators */}
      <div className="flex items-center space-x-3 mr-4">
        {/* Mass balance status */}
        <div className="flex items-center space-x-1">
          <div 
            className={`w-2 h-2 rounded-full ${massBalanceValid ? 'bg-green-500' : 'bg-red-500'}`}
            title={massBalanceValid ? 'Mass balance valid' : 'Mass balance error'}
          />
          <span className="text-sm text-text-secondary">Balance</span>
        </div>
        
        {/* Recovery display */}
        {systemRecovery > 0 && (
          <div className="text-sm font-mono text-text-primary">
            {systemRecovery.toFixed(1)}% Recovery
          </div>
        )}
        
        {/* Error count */}
        {errors.length > 0 && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle size={16} />
            <span className="text-sm">{errors.length}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <button
        onClick={recalculateFlowsheet}
        disabled={isCalculating}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-sm font-medium transition-colors
          ${isCalculating 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-equipment-selected text-white hover:bg-blue-700'
          }
        `}
        title="Calculate flowsheet"
      >
        {isCalculating ? <Square size={16} /> : <Play size={16} />}
        <span>{isCalculating ? 'Calculating...' : 'Calculate'}</span>
      </button>

      <button
        onClick={clearAll}
        className="flex items-center space-x-2 px-4 py-2 rounded-sm font-medium bg-gray-100 text-text-primary hover:bg-gray-200 transition-colors"
        title="Clear all"
      >
        <RotateCcw size={16} />
        <span>Clear</span>
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      <button
        onClick={handleExport}
        className="flex items-center space-x-2 px-3 py-2 rounded-sm font-medium bg-gray-100 text-text-primary hover:bg-gray-200 transition-colors"
        title="Export flowsheet"
      >
        <Save size={16} />
        <span>Export</span>
      </button>

      <button
        onClick={handleImport}
        className="flex items-center space-x-2 px-3 py-2 rounded-sm font-medium bg-gray-100 text-text-primary hover:bg-gray-200 transition-colors"
        title="Import flowsheet"
      >
        <FolderOpen size={16} />
        <span>Import</span>
      </button>
    </div>
  )
}