# 🎯 COMPREHENSIVE PROMPT: Water Treatment Designer - Professional Implementation

You are tasked with building a **professional water treatment plant design platform** for **enterprise water treatment companies** (Veolia, Suez, Evoqua, etc.) similar to WAVE, GPS-X, or Visio P&ID tools. This is a **mission-critical industrial engineering application** that must meet professional standards for large-scale water treatment facility design.

---

## 🚨 CRITICAL REQUIREMENTS

### 1. **ZERO HARD-CODED CALCULATIONS**
```javascript
// ❌ NEVER DO THIS:
const permeateFlow = feedFlow * 0.95; // Hard-coded recovery
const tmp = 1.5; // Hard-coded pressure

// ✅ ALWAYS DO THIS:
const results = await processCalculator.calculateUF({
  feedFlow: state.feedFlow,
  membraneArea: equipment.specs.area,
  temperature: state.temperature,
  feedQuality: state.waterQuality
});
```

**ALL calculations must:**
- Come from engineering models/equations
- Use real process engineering libraries (Python backend)
- Propagate through connected equipment
- Validate against engineering constraints
- Handle edge cases and errors

### 2. **Professional Industrial UI - NOT Consumer/Kid-like**
```css
/* ❌ Consumer/Kid-like styling */
.equipment { 
  border-radius: 20px; 
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

/* ✅ Professional Industrial styling */
.equipment {
  border: 1px solid #475569;
  background: #f8fafc;
  font-family: 'JetBrains Mono', monospace;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### 3. **User Values Must Propagate Throughout System**
- Equipment configuration changes trigger recalculation of entire flowsheet
- Mass balance validation across all connected equipment  
- Real-time updates when user modifies any parameter
- Error detection when mass balance fails

---

## 🏗️ REQUIRED ARCHITECTURE

### Directory Structure:
```
water-treatment-designer3/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── equipment/      # Pure SVG symbols (ISA-5.1 compliant)
│   │   │   │   ├── UFSymbol.jsx
│   │   │   │   ├── TankSymbol.jsx
│   │   │   │   └── PumpSymbol.jsx
│   │   │   ├── canvas/         # React Flow integration
│   │   │   │   ├── FlowsheetCanvas.jsx
│   │   │   │   ├── EquipmentNode.jsx
│   │   │   │   └── ProcessStream.jsx
│   │   │   └── ui/             # Professional UI components
│   │   │       ├── PropertyPanel.jsx
│   │   │       ├── StatusBar.jsx
│   │   │       └── Toolbar.jsx
│   │   ├── models/             # Frontend data models
│   │   │   ├── Equipment.js
│   │   │   ├── Stream.js
│   │   │   └── Flowsheet.js
│   │   ├── store/              # State management (Zustand)
│   │   │   ├── flowsheetStore.js
│   │   │   ├── equipmentStore.js
│   │   │   └── calculationStore.js
│   │   ├── api/                # Backend communication
│   │   │   └── processApi.js
│   │   └── utils/
│   │       ├── portManager.js
│   │       └── connectionValidator.js
│   └── package.json
└── backend/                     # Python calculation engine
    ├── app/
    │   ├── models/             # Process engineering models
    │   │   ├── ultrafiltration.py
    │   │   ├── reverse_osmosis.py
    │   │   ├── tank.py
    │   │   └── pump.py
    │   ├── calculations/       # Engineering calculations
    │   │   ├── mass_balance.py
    │   │   ├── membrane_performance.py
    │   │   └── hydraulics.py
    │   ├── api/               # FastAPI endpoints
    │   │   └── routes.py
    │   └── utils/
    │       ├── validation.py
    │       └── units.py
    ├── requirements.txt       # numpy, scipy, CoolProp, pandas
    └── main.py
```

---

## 🎨 VISUAL DESIGN REQUIREMENTS

### Professional Industrial Aesthetic:
1. **Color Palette** (ISA-5.1 compliant):
   - Background: #f8fafc (light gray)
   - Equipment: #1e293b outlines, #ffffff fill
   - Text: #1e293b (dark slate)
   - Feed streams: #ea580c (orange)
   - Product streams: #2563eb (blue) 
   - Waste streams: #6b7280 (gray)
   - Chemicals: #d97706 (amber)

2. **Typography**:
   - Headers: Inter 600 weight
   - Data/Values: JetBrains Mono (monospace)
   - Labels: Inter 400 weight
   - Sizes: 12px-14px for data, 16px+ for headers

3. **Equipment Symbols** (Must match Visio P&ID quality):
   - Clean, technical line work (1.5px stroke weight)
   - ISA-5.1 compliant symbols
   - Minimal fill colors
   - Professional proportions

### Example Professional Equipment Symbol:
```jsx
const UFSymbol = ({ width = 120, height = 60 }) => (
  <svg viewBox="0 0 120 60" className="equipment-symbol">
    {/* Housing */}
    <rect x="10" y="15" width="100" height="30" rx="4" 
          fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
    
    {/* Membrane elements */}
    {[0,1,2,3,4,5].map(i => (
      <line key={i} 
            x1={20 + i * 15} y1="18" 
            x2={20 + i * 15} y2="42"
            stroke="#475569" strokeWidth="1"/>
    ))}
    
    {/* No decorative elements - pure function */}
  </svg>
);
```

---

## ⚙️ PROCESS ENGINEERING REQUIREMENTS

### Python Backend Must Include:

1. **Real Process Models**:
```python
import numpy as np
from scipy.optimize import minimize
import CoolProp as CP

class UltrafiltrationModel:
    def __init__(self, membrane_type='PVDF', area=500):
        self.membrane_area = area  # m²
        self.resistance = self.get_membrane_resistance(membrane_type)
        
    def calculate_performance(self, feed_flow, tmp, temperature, feed_quality):
        """Real membrane transport equations"""
        viscosity = self.water_viscosity(temperature)  # Use CoolProp
        flux = (tmp - self.osmotic_pressure(feed_quality)) / (viscosity * self.resistance)
        permeate_flow = flux * self.membrane_area / 1000  # m³/h
        
        # Mass balance
        concentrate_flow = feed_flow - permeate_flow
        recovery = permeate_flow / feed_flow * 100
        
        return {
            'permeate_flow': permeate_flow,
            'concentrate_flow': concentrate_flow,
            'recovery': recovery,
            'flux': flux,
            'energy_consumption': self.calculate_energy(tmp, permeate_flow)
        }
```

2. **Mass Balance Engine**:
```python
class FlowsheetCalculator:
    def solve_flowsheet(self, equipment_list, connections):
        """Solve entire flowsheet with mass balance"""
        # Build system of equations
        # Solve simultaneously
        # Validate mass balance
        # Return converged solution or errors
        pass
```

3. **Engineering Validation**:
```python
def validate_design(self, flowsheet):
    """Check engineering constraints"""
    errors = []
    
    if recovery > 98:
        errors.append("UF recovery too high - membrane fouling risk")
    if tmp > 3.0:
        errors.append("TMP exceeds membrane pressure rating")
    if flux > 120:
        errors.append("Flux too high - consider more membrane area")
        
    return errors
```

---

## 🔌 CONNECTION & PORT SYSTEM

### Requirements:
1. **ISA-5.1 Compliant Port Naming**:
   - `feed_inlet`, `permeate_outlet`, `concentrate_outlet`
   - `backwash_inlet`, `cip_inlet`, `drain_outlet`
   - `suction`, `discharge` (for pumps)

2. **Stream Compatibility Matrix**:
```javascript
const STREAM_COMPATIBILITY = {
  'feed': ['feed', 'permeate', 'product'],
  'concentrate': ['concentrate', 'reject', 'waste'],
  'backwash': ['backwash'],
  'chemicals': ['chemicals', 'cip'],
  'waste': ['waste', 'drain']
};
```

3. **Magnetic Port Snapping**:
   - 25px snap distance
   - Visual feedback during drag
   - Connection validation
   - Incompatible connections blocked

---

## 📊 DATA FLOW REQUIREMENTS

### State Management (Zustand):
```javascript
const useFlowsheetStore = create((set, get) => ({
  equipment: {},
  streams: {},
  connections: {},
  
  // When user changes ANY value, trigger recalculation
  updateEquipmentConfig: async (equipmentId, newConfig) => {
    set(state => ({ 
      equipment: { 
        ...state.equipment, 
        [equipmentId]: { ...state.equipment[equipmentId], ...newConfig }
      }
    }));
    
    // Trigger backend recalculation
    await get().recalculateFlowsheet();
  },
  
  recalculateFlowsheet: async () => {
    const { equipment, connections } = get();
    const results = await processApi.calculateFlowsheet(equipment, connections);
    
    // Update all dependent values
    set({ 
      streams: results.streams,
      massBalance: results.massBalance,
      errors: results.errors 
    });
  }
}));
```

---

## 🎯 SUCCESS CRITERIA

Your implementation MUST achieve:

1. **✅ Professional Appearance**: Looks like industrial engineering software
2. **✅ Real Calculations**: No hard-coded values, all from engineering models  
3. **✅ Value Propagation**: Changes update entire flowsheet
4. **✅ Mass Balance**: Validates conservation of mass
5. **✅ Error Handling**: Shows engineering constraint violations
6. **✅ ISA-5.1 Compliance**: Equipment symbols match industry standards
7. **✅ Performance**: Fast recalculation, smooth interactions
8. **✅ Extensibility**: Easy to add new equipment types

---

## 🚀 IMPLEMENTATION STEPS

### Phase 1: Backend (Python)
1. Set up FastAPI with process calculation models
2. Implement real ultrafiltration transport equations
3. Create mass balance solver
4. Add engineering validation

### Phase 2: Frontend Core
1. Professional UI components (NO consumer styling)
2. State management with automatic recalculation
3. Equipment symbol components (ISA-5.1 compliant)
4. Port management system

### Phase 3: Integration
1. Connect frontend to Python backend
2. Implement real-time calculation updates
3. Add connection validation
4. Professional flowsheet canvas

### Phase 4: Polish
1. Error handling and validation feedback
2. Performance optimization
3. Professional styling refinement
4. User experience testing

---

## 💡 KEY SUCCESS PRINCIPLES

1. **Separation of Concerns**: UI components don't do calculations
2. **Real Engineering**: Use actual process engineering equations
3. **Professional Design**: Industrial aesthetic, not consumer
4. **Dynamic System**: Everything recalculates when inputs change
5. **Validation**: Engineering constraints enforced
6. **Extensibility**: Architecture supports adding new equipment
7. **Performance**: Sub-second recalculation times

---

**Remember: This is professional engineering software for water treatment plant design. Every decision should reflect industrial/technical requirements, not consumer app patterns.**