# 🔧 Technical Requirements & Architecture Specification

## 🎯 Core Engineering Requirements

### 1. **Dynamic Calculation Engine** 
**ZERO hard-coded values allowed in any component.**

#### Bad Examples (Never do this):
```javascript
// ❌ WRONG - Hard-coded calculations
const permeateFlow = feedFlow * 0.95;
const concentrateFlow = feedFlow * 0.05;
const tmp = 1.5;
const recovery = 95;
```

#### Correct Implementation:
```javascript
// ✅ CORRECT - Dynamic calculations from backend
const equipmentResults = await processAPI.calculateUltrafiltration({
  feedFlow: userInputs.feedFlow,
  membraneArea: equipment.specifications.area,
  temperature: processConditions.temperature,
  feedWaterQuality: waterAnalysis.current,
  operatingPressure: userInputs.pressure
});

// All values come from real engineering calculations
const { permeateFlow, concentrateFlow, recovery, tmp, energyConsumption } = equipmentResults;
```

### 2. **Real Process Engineering Models**
All calculations must use proper water treatment engineering:

#### Ultrafiltration Model:
```python
class UltrafiltrationModel:
    def calculate_performance(self, inputs):
        """
        Real membrane transport model based on:
        - Darcy's Law: J = (ΔP - Δπ) / (μ * Rm)
        - Concentration polarization
        - Membrane fouling resistance
        """
        # Water viscosity (temperature dependent)
        viscosity = self.water_viscosity(inputs.temperature)
        
        # Osmotic pressure calculation
        osmotic_pressure = self.van_hoff_equation(inputs.feed_concentration)
        
        # Net driving pressure
        net_pressure = inputs.tmp - osmotic_pressure
        
        # Membrane resistance (clean + fouling)
        total_resistance = self.membrane_resistance + self.fouling_resistance(inputs.flux_history)
        
        # Flux calculation (L/m²/h)
        flux = net_pressure / (viscosity * total_resistance)
        
        # Flow calculations
        permeate_flow = flux * inputs.membrane_area / 1000  # m³/h
        concentrate_flow = inputs.feed_flow - permeate_flow
        recovery = (permeate_flow / inputs.feed_flow) * 100
        
        # Energy calculations
        energy = self.calculate_pump_energy(inputs.feed_flow, inputs.tmp)
        
        return ProcessResults(
            permeate_flow=permeate_flow,
            concentrate_flow=concentrate_flow,
            recovery=recovery,
            flux=flux,
            energy_consumption=energy,
            membrane_life=self.predict_membrane_life(flux, inputs.feed_quality)
        )
```

### 3. **Mass Balance Validation Engine**
```python
class FlowsheetSolver:
    def solve_mass_balance(self, equipment_dict, connections):
        """
        Solve simultaneous mass balance equations for entire flowsheet
        """
        # Build system of linear equations: Ax = b
        A = self.build_mass_balance_matrix(equipment_dict, connections)
        b = self.build_constraint_vector(equipment_dict)
        
        # Solve system
        try:
            solution = np.linalg.solve(A, b)
            return self.validate_solution(solution)
        except np.linalg.LinAlgError:
            return {"error": "Mass balance cannot be solved - check flowsheet connectivity"}
```

---

## 🎨 Professional Industrial UI Standards

### Visual Design System:

#### Color Palette (P&ID Standard):
```css
:root {
  /* Equipment */
  --equipment-outline: #1e293b;    /* Dark slate */
  --equipment-fill: #ffffff;       /* White */
  --equipment-selected: #2563eb;   /* Blue */
  
  /* Streams (ISA-5.1 colors) */
  --stream-feed: #ea580c;          /* Orange - feed water */
  --stream-product: #2563eb;       /* Blue - clean water */  
  --stream-waste: #6b7280;         /* Gray - waste/reject */
  --stream-chemical: #d97706;      /* Amber - chemicals */
  --stream-air: #059669;           /* Green - air/gas */
  
  /* UI */
  --background: #f8fafc;           /* Light gray */
  --panel: #ffffff;                /* White panels */
  --border: #e2e8f0;               /* Light border */
  --text: #1e293b;                 /* Dark text */
  --text-secondary: #64748b;       /* Gray text */
}
```

#### Typography System:
```css
.technical-data {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.equipment-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
}

.process-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  font-size: 13px;
}
```

#### Equipment Symbol Standards:
```jsx
// Professional equipment symbols - ISA-5.1 compliant
const ProfessionalUFSymbol = ({ width = 120, height = 60 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 120 60"
    className="equipment-symbol"
  >
    {/* Clean technical lines - no decorative elements */}
    <rect 
      x="10" y="15" width="100" height="30" rx="3"
      fill="var(--equipment-fill)" 
      stroke="var(--equipment-outline)" 
      strokeWidth="1.5"
    />
    
    {/* Membrane elements - functional representation */}
    {Array.from({length: 6}, (_, i) => (
      <line 
        key={i}
        x1={20 + i * 15} y1="18" 
        x2={20 + i * 15} y2="42"
        stroke="var(--equipment-outline)" 
        strokeWidth="1"
        opacity="0.7"
      />
    ))}
    
    {/* No gradients, shadows, or consumer styling */}
  </svg>
);
```

---

## 🔌 Port & Connection Architecture

### Port Management System:
```javascript
// Professional port configuration
const EQUIPMENT_PORT_CONFIG = {
  ultrafiltration: {
    feed_inlet: {
      position: { x: 0, y: 0.5 },     // Left center
      type: 'inlet',
      streamTypes: ['feed', 'pretreated_water'],
      diameter: 'DN100',
      maxPressure: 6.0  // bar
    },
    permeate_outlet: {
      position: { x: 1, y: 0.3 },     // Right upper
      type: 'outlet', 
      streamTypes: ['permeate', 'product_water'],
      diameter: 'DN80',
      maxPressure: 2.0
    },
    concentrate_outlet: {
      position: { x: 1, y: 0.7 },     // Right lower
      type: 'outlet',
      streamTypes: ['concentrate', 'waste_water'],
      diameter: 'DN50', 
      maxPressure: 6.0
    },
    backwash_inlet: {
      position: { x: 0.3, y: 1 },     // Bottom left
      type: 'inlet',
      streamTypes: ['backwash_water'],
      diameter: 'DN50',
      maxPressure: 4.0
    },
    cip_inlet: {
      position: { x: 0.7, y: 1 },     // Bottom right
      type: 'inlet',
      streamTypes: ['cleaning_chemicals'],
      diameter: 'DN25',
      maxPressure: 10.0
    }
  }
};

// Connection validation with engineering constraints
class ConnectionValidator {
  static validateConnection(sourcePort, targetPort, flowRate, pressure) {
    const errors = [];
    
    // Stream compatibility
    if (!this.streamsCompatible(sourcePort.streamTypes, targetPort.streamTypes)) {
      errors.push("Incompatible stream types");
    }
    
    // Pressure constraints
    if (pressure > targetPort.maxPressure) {
      errors.push(`Pressure ${pressure} bar exceeds port rating ${targetPort.maxPressure} bar`);
    }
    
    // Flow constraints based on pipe diameter
    const maxVelocity = 3.0; // m/s - engineering standard
    const maxFlow = this.calculateMaxFlow(targetPort.diameter, maxVelocity);
    if (flowRate > maxFlow) {
      errors.push(`Flow rate ${flowRate} m³/h exceeds maximum ${maxFlow} m³/h for ${targetPort.diameter}`);
    }
    
    return errors;
  }
}
```

---

## 📊 State Management Architecture

### Zustand Store Structure:
```javascript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useFlowsheetStore = create(
  devtools(
    (set, get) => ({
      // Core data
      equipment: {},           // Equipment configurations
      streams: {},            // Stream properties (flow, pressure, composition)
      connections: {},        // Physical connections between equipment
      calculations: {},       // Latest calculation results
      errors: [],            // Engineering validation errors
      
      // System state
      isCalculating: false,
      lastCalculation: null,
      massBalanceValid: false,
      
      // Actions that trigger recalculation
      updateEquipmentConfig: async (equipmentId, newConfig) => {
        set({ isCalculating: true });
        
        // Update equipment
        set(state => ({
          equipment: {
            ...state.equipment,
            [equipmentId]: { ...state.equipment[equipmentId], ...newConfig }
          }
        }));
        
        // Recalculate entire flowsheet
        await get().recalculateFlowsheet();
      },
      
      addConnection: async (sourceId, sourcePort, targetId, targetPort) => {
        const connectionId = `${sourceId}-${sourcePort}-${targetId}-${targetPort}`;
        
        set(state => ({
          connections: {
            ...state.connections,
            [connectionId]: { sourceId, sourcePort, targetId, targetPort }
          }
        }));
        
        await get().recalculateFlowsheet();
      },
      
      recalculateFlowsheet: async () => {
        try {
          const { equipment, connections } = get();
          
          // Send to Python backend for real calculations
          const response = await fetch('/api/calculate-flowsheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipment, connections })
          });
          
          const results = await response.json();
          
          if (results.success) {
            set({
              streams: results.streams,
              calculations: results.calculations,
              massBalanceValid: results.mass_balance_valid,
              errors: results.errors || [],
              isCalculating: false,
              lastCalculation: new Date().toISOString()
            });
          } else {
            set({
              errors: results.errors,
              isCalculating: false
            });
          }
        } catch (error) {
          set({
            errors: [`Calculation failed: ${error.message}`],
            isCalculating: false
          });
        }
      }
    }),
    { name: 'flowsheet-store' }
  )
);
```

---

## 🧪 Python Backend Requirements

### Required Libraries:
```txt
# requirements.txt
fastapi>=0.100.0
uvicorn[standard]>=0.22.0
numpy>=1.24.0
scipy>=1.10.0
pandas>=2.0.0
CoolProp>=6.4.1        # Thermodynamic properties
pydantic>=2.0.0        # Data validation
```

### Process Engineering Models:
```python
# app/models/membrane.py
import numpy as np
from scipy.optimize import fsolve
import CoolProp.CoolProp as CP

class MembraneModel:
    """
    Professional membrane modeling based on solution-diffusion theory
    """
    
    def __init__(self, membrane_type: str):
        self.membrane_properties = self.load_membrane_data(membrane_type)
        
    def calculate_ultrafiltration(self, inputs: UFInputs) -> UFResults:
        """
        Calculate UF performance using real transport equations
        """
        # Water viscosity (temperature dependent)
        mu_w = CP.PropsSI('V', 'T', inputs.temperature + 273.15, 'P', 101325, 'Water') / 1000
        
        # Membrane resistance
        Rm = self.membrane_properties.clean_resistance  # m⁻¹
        
        # Fouling resistance (time dependent)
        Rf = self.calculate_fouling_resistance(inputs.operating_hours, inputs.flux_history)
        
        # Concentration polarization
        Cp = self.concentration_polarization_factor(inputs.crossflow_velocity, inputs.feed_concentration)
        
        # Osmotic pressure at membrane surface
        pi_m = self.osmotic_pressure(inputs.feed_concentration * Cp)
        
        # Net driving pressure
        delta_p = inputs.transmembrane_pressure - pi_m
        
        # Flux calculation (Darcy's law)
        J = delta_p / (mu_w * (Rm + Rf))  # L/m²/h
        
        # Flow calculations
        permeate_flow = J * inputs.membrane_area / 1000  # m³/h
        concentrate_flow = inputs.feed_flow - permeate_flow
        recovery = (permeate_flow / inputs.feed_flow) * 100
        
        # Validate engineering limits
        self.validate_performance(J, recovery, inputs.transmembrane_pressure)
        
        return UFResults(
            permeate_flow=permeate_flow,
            concentrate_flow=concentrate_flow,
            recovery=recovery,
            flux=J,
            energy_consumption=self.calculate_energy(inputs),
            membrane_life_prediction=self.predict_membrane_life(J, Rf),
            fouling_rate=self.calculate_fouling_rate(inputs)
        )
    
    def validate_performance(self, flux, recovery, tmp):
        """Validate against engineering constraints"""
        if flux > 120:  # LMH
            raise ValueError(f"Flux {flux} LMH exceeds recommended maximum 120 LMH")
        if recovery > 95:
            raise ValueError(f"Recovery {recovery}% may cause excessive fouling")
        if tmp > 3.0:  # bar
            raise ValueError(f"TMP {tmp} bar exceeds membrane pressure rating")
```

---

## ⚡ Performance Requirements

### Response Time Targets:
- **Equipment configuration change**: < 500ms total response
- **Connection creation**: < 200ms visual feedback
- **Flowsheet recalculation**: < 2s for typical 10-equipment flowsheet
- **Mass balance validation**: < 1s

### Memory Usage:
- **Frontend state**: < 10MB for large flowsheets
- **Backend calculation**: < 100MB memory usage per calculation

### Scalability:
- Support flowsheets with 50+ equipment units
- Handle 100+ stream connections
- Real-time collaboration (future requirement)

---

## 🎯 Success Metrics

### Functional Requirements Met:
1. ✅ **No hard-coded calculations** - All values from engineering models
2. ✅ **Professional appearance** - Matches industrial P&ID software  
3. ✅ **Real-time propagation** - Changes trigger immediate recalculation
4. ✅ **Engineering validation** - Constraint checking and error reporting
5. ✅ **Mass balance** - Conservation of mass validated across flowsheet
6. ✅ **ISA compliance** - Equipment symbols match industry standards

### Technical Quality Gates:
- All components pass TypeScript strict mode
- 90%+ test coverage on calculation functions
- No console errors or warnings
- Accessibility compliance (WCAG 2.1 AA)
- Performance budgets met

---

This technical specification ensures we build a professional, engineering-grade water treatment design platform that avoids all the pitfalls of our previous attempts.