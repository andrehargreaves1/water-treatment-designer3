# 📁 Project Structure Template

## Directory Layout
```
water-treatment-designer3/
├── README.md
├── LESSONS_LEARNED.md
├── TECHNICAL_REQUIREMENTS.md
├── CLAUDE_PROMPT_FOR_REDO.md
├── 
├── frontend/                           # React TypeScript App
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx                   # Entry point
│   │   ├── App.tsx                    # Root component
│   │   ├── 
│   │   ├── components/
│   │   │   ├── equipment/             # Pure SVG equipment symbols
│   │   │   │   ├── UFSymbol.tsx       # Ultrafiltration symbol (ISA-5.1)
│   │   │   │   ├── TankSymbol.tsx     # Storage tank symbol
│   │   │   │   ├── PumpSymbol.tsx     # Centrifugal pump symbol
│   │   │   │   ├── StrainerSymbol.tsx # Strainer/filter symbol
│   │   │   │   └── index.ts           # Export all symbols
│   │   │   │   
│   │   │   ├── canvas/                # React Flow integration
│   │   │   │   ├── FlowsheetCanvas.tsx    # Main flowsheet canvas
│   │   │   │   ├── EquipmentNode.tsx      # Generic equipment node wrapper
│   │   │   │   ├── ProcessStream.tsx      # Animated process stream
│   │   │   │   ├── PortConnector.tsx      # Port connection logic
│   │   │   │   └── ConnectionValidator.tsx # Stream compatibility validation
│   │   │   │   
│   │   │   ├── panels/                # Property panels & UI
│   │   │   │   ├── PropertyPanel.tsx      # Equipment configuration panel
│   │   │   │   ├── StreamTable.tsx        # Stream summary table
│   │   │   │   ├── MassBalancePanel.tsx   # Mass balance validation
│   │   │   │   ├── ErrorPanel.tsx         # Engineering error display
│   │   │   │   └── ToolbarPanel.tsx       # Main toolbar
│   │   │   │   
│   │   │   └── ui/                    # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── Table.tsx
│   │   │       └── StatusIndicator.tsx
│   │   │       
│   │   ├── models/                    # TypeScript data models
│   │   │   ├── Equipment.ts           # Equipment interface definitions
│   │   │   ├── Stream.ts              # Stream data structures  
│   │   │   ├── Connection.ts          # Port connection model
│   │   │   ├── Flowsheet.ts           # Complete flowsheet model
│   │   │   └── ProcessResults.ts      # Calculation result types
│   │   │   
│   │   ├── store/                     # Zustand state management
│   │   │   ├── flowsheetStore.ts      # Main flowsheet state
│   │   │   ├── equipmentStore.ts      # Equipment configurations
│   │   │   ├── streamStore.ts         # Stream properties
│   │   │   ├── calculationStore.ts    # Calculation results & status
│   │   │   └── index.ts               # Combined store exports
│   │   │   
│   │   ├── api/                       # Backend communication
│   │   │   ├── processApi.ts          # Process calculation API calls
│   │   │   ├── equipmentApi.ts        # Equipment data API
│   │   │   ├── validationApi.ts       # Engineering validation API
│   │   │   └── types.ts               # API request/response types
│   │   │   
│   │   ├── utils/                     # Utility functions
│   │   │   ├── portManager.ts         # Port positioning & management
│   │   │   ├── streamCompatibility.ts # Stream type validation
│   │   │   ├── unitConversions.ts     # Engineering unit conversions
│   │   │   ├── calculations.ts        # Client-side validation helpers
│   │   │   └── constants.ts           # Engineering constants
│   │   │   
│   │   ├── styles/                    # Global styles
│   │   │   ├── globals.css            # Tailwind & global styles
│   │   │   ├── equipment.css          # Equipment-specific styles  
│   │   │   └── professional.css       # Professional P&ID styling
│   │   │   
│   │   └── hooks/                     # Custom React hooks
│   │       ├── useCalculation.ts      # Calculation state management
│   │       ├── useConnection.ts       # Connection drag & drop
│   │       ├── usePortSnapping.ts     # Port magnetic snapping
│   │       └── useFlowsheetSync.ts    # Real-time flowsheet sync
│   │       
│   └── public/
│       ├── index.html
│       └── favicon.ico
│
├── backend/                           # Python FastAPI Backend
│   ├── requirements.txt               # Python dependencies
│   ├── main.py                        # FastAPI application entry
│   ├── 
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                  # Application configuration
│   │   ├── 
│   │   ├── models/                    # Process engineering models
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base equipment model class
│   │   │   ├── ultrafiltration.py     # UF membrane transport model
│   │   │   ├── reverse_osmosis.py     # RO membrane transport model  
│   │   │   ├── storage_tank.py        # Tank level & hydraulics model
│   │   │   ├── centrifugal_pump.py    # Pump performance curves
│   │   │   ├── strainer.py            # Pressure drop & efficiency model
│   │   │   └── heat_exchanger.py      # Heat transfer model (if needed)
│   │   │   
│   │   ├── calculations/              # Core engineering calculations
│   │   │   ├── __init__.py
│   │   │   ├── mass_balance.py        # Mass balance solver
│   │   │   ├── hydraulics.py          # Pressure drop & pump sizing
│   │   │   ├── membrane_performance.py # Membrane flux & fouling
│   │   │   ├── water_properties.py    # Water property calculations
│   │   │   ├── energy_balance.py      # Energy consumption calculations
│   │   │   └── optimization.py        # Process optimization algorithms
│   │   │   
│   │   ├── api/                       # FastAPI route handlers
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # Main API routes
│   │   │   ├── equipment.py           # Equipment calculation endpoints
│   │   │   ├── flowsheet.py           # Flowsheet solving endpoints
│   │   │   ├── validation.py          # Engineering validation endpoints
│   │   │   └── websocket.py           # Real-time updates (future)
│   │   │   
│   │   ├── schemas/                   # Pydantic data schemas
│   │   │   ├── __init__.py
│   │   │   ├── equipment.py           # Equipment configuration schemas
│   │   │   ├── stream.py              # Stream property schemas
│   │   │   ├── flowsheet.py           # Flowsheet data schemas
│   │   │   └── results.py             # Calculation result schemas
│   │   │   
│   │   ├── utils/                     # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── validation.py          # Input validation helpers
│   │   │   ├── units.py               # Unit conversion functions
│   │   │   ├── constants.py           # Physical constants
│   │   │   └── exceptions.py          # Custom exception classes
│   │   │   
│   │   └── tests/                     # Unit tests
│   │       ├── __init__.py
│   │       ├── test_models.py         # Test process models
│   │       ├── test_calculations.py   # Test calculations
│   │       ├── test_api.py            # Test API endpoints
│   │       └── fixtures/              # Test data fixtures
│   │           ├── flowsheet_data.json
│   │           └── equipment_configs.json
│   │
│   └── docs/                          # Documentation
│       ├── api.md                     # API documentation
│       ├── models.md                  # Process model documentation
│       └── calculations.md            # Engineering calculation references
│
├── docs/                              # Project documentation
│   ├── README.md                      # Project overview
│   ├── SETUP.md                       # Development setup instructions
│   ├── API.md                         # API documentation
│   ├── ARCHITECTURE.md                # System architecture
│   └── ENGINEERING.md                 # Process engineering references
│
└── scripts/                           # Development scripts
    ├── setup.sh                       # Project setup script
    ├── run-dev.sh                     # Development server startup
    └── test.sh                        # Test runner script
```

---

## 📦 Package Configuration

### Frontend package.json:
```json
{
  "name": "water-treatment-designer",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "@reactflow/core": "^11.10.0",
    "@reactflow/controls": "^11.2.0",
    "@reactflow/background": "^11.3.0",
    "@reactflow/minimap": "^11.7.0",
    "zustand": "^4.5.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "typescript": "^5.2.0",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  }
}
```

### Backend requirements.txt:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
numpy==1.25.2
scipy==1.11.4
pandas==2.1.4
CoolProp==6.4.4
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

---

## 🎯 Key Implementation Principles

### 1. **Separation of Concerns**
```typescript
// ❌ Bad - Mixed responsibilities
const UFNode = () => {
  const [tmp, setTmp] = useState(1.5);  // UI state
  const permeate = feedFlow * 0.95;     // Calculation
  return <div>{/* Rendering */}</div>;   // UI
};

// ✅ Good - Clear separation
const UFSymbol = ({ width, height }) => (/* Pure SVG symbol */);
const EquipmentNode = ({ equipment, results }) => (/* Pure UI wrapper */);
const useProcessCalculation = () => (/* Business logic hook */);
```

### 2. **Professional Industrial Styling**
```css
/* Professional P&ID styling patterns */
.equipment-node {
  background: #ffffff;
  border: 1px solid #1e293b;
  border-radius: 2px;  /* Minimal rounding */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', system-ui;
}

.technical-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #1e293b;
  font-weight: 500;
}
```

### 3. **Real Engineering Models Only**
```python
# All calculations must use real engineering equations
def calculate_membrane_flux(tmp, osmotic_pressure, membrane_resistance, viscosity):
    """
    Calculate membrane flux using Darcy's Law:
    J = (ΔP - Δπ) / (μ × Rm)
    """
    net_pressure = tmp - osmotic_pressure  # bar
    flux = net_pressure / (viscosity * membrane_resistance)  # L/m²/h
    return max(0, flux)  # Physical constraint
```

### 4. **Comprehensive Error Handling**
```typescript
interface CalculationResult {
  success: boolean;
  data?: ProcessResults;
  errors: EngineeringError[];
  warnings: EngineeringWarning[];
}

interface EngineeringError {
  code: string;
  message: string;
  equipment_id?: string;
  severity: 'warning' | 'error' | 'critical';
}
```

---

## 🚀 Development Workflow

### Initial Setup:
1. Create project structure
2. Set up backend with real calculation models
3. Create professional UI components
4. Implement state management
5. Connect frontend to backend
6. Add comprehensive testing
7. Optimize performance

### Quality Gates:
- All calculations validated against engineering references
- UI matches industrial P&ID standards
- Mass balance validates to <0.1% error
- No hard-coded values anywhere in codebase
- Response times meet performance targets

---

This structure ensures we build a professional, maintainable, and extensible water treatment design platform that avoids all previous architectural mistakes.