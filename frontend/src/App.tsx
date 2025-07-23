import React from 'react'
import { FlowsheetCanvas } from './components/canvas/FlowsheetCanvas'
import { Toolbar } from './components/ui/Toolbar'
import { PropertyPanel } from './components/panels/PropertyPanel'
import { EquipmentPalette } from './components/ui/EquipmentPalette'

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="bg-panel border-b border-border shadow-panel">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-equipment-selected rounded-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                Water Treatment Designer
              </h1>
              <p className="text-sm text-text-secondary">
                Professional Process Engineering Platform v3.0
              </p>
            </div>
          </div>
          
          <Toolbar />
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Equipment Palette */}
        <aside className="w-80 bg-panel border-r border-border shadow-panel overflow-y-auto">
          <EquipmentPalette />
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 relative">
          <FlowsheetCanvas />
        </main>

        {/* Property Panel */}
        <aside className="w-88 bg-panel border-l border-border shadow-panel overflow-y-auto">
          <PropertyPanel />
        </aside>
      </div>
    </div>
  )
}

export default App