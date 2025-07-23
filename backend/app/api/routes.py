"""
FastAPI routes for water treatment calculations
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..models.ultrafiltration import UltrafiltrationModel
from ..models.feed_tank import FeedTankModel
from ..calculations.mass_balance import MassBalanceSolver, FlowsheetData
from ..utils.validation import EngineeringError

router = APIRouter()


@router.post("/calculate/ultrafiltration")
async def calculate_ultrafiltration(inputs: Dict[str, Any]):
    """Calculate ultrafiltration performance"""
    try:
        equipment_id = inputs.get("equipment_id", "UF-001")
        uf_model = UltrafiltrationModel(equipment_id)
        result = uf_model.calculate_performance(inputs)
        
        return {
            "success": result.success,
            "data": result.data,
            "errors": [error.dict() for error in result.errors],
            "warnings": result.warnings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"UF calculation failed: {str(e)}")


@router.post("/calculate/feed_tank")
async def calculate_feed_tank(inputs: Dict[str, Any]):
    """Calculate feed tank performance and water characterization"""
    try:
        equipment_id = inputs.get("equipment_id", "FEED_TANK-001")
        feed_tank_model = FeedTankModel(equipment_id)
        result = feed_tank_model.calculate_performance(inputs)
        
        return {
            "success": result.success,
            "data": result.data,
            "errors": [error.dict() for error in result.errors],
            "warnings": result.warnings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feed tank calculation failed: {str(e)}")


@router.post("/calculate/flowsheet")
async def calculate_flowsheet(flowsheet_data: Dict[str, Any]):
    """Calculate complete flowsheet mass balance"""
    try:
        # Convert input data to FlowsheetData model
        flowsheet = FlowsheetData(**flowsheet_data)
        
        # Solve mass balance
        solver = MassBalanceSolver()
        result = solver.solve_flowsheet(flowsheet)
        
        return {
            "success": result.success,
            "converged": result.converged,
            "iterations": result.iterations,
            "max_error": result.max_error,
            "streams": {k: v.dict() for k, v in result.streams.items()},
            "equipment_results": result.equipment_results,
            "errors": [error.dict() for error in result.errors],
            "system_recovery": solver.calculate_system_recovery(result.streams) if result.success else 0.0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flowsheet calculation failed: {str(e)}")


@router.post("/validate/equipment")
async def validate_equipment_config(equipment_data: Dict[str, Any]):
    """Validate equipment configuration"""
    try:
        equipment_type = equipment_data.get("equipment_type", "")
        equipment_id = equipment_data.get("equipment_id", "")
        config = equipment_data.get("config", {})
        
        errors = []
        
        if equipment_type == "ultrafiltration":
            uf_model = UltrafiltrationModel(equipment_id)
            errors = uf_model.validate_inputs(config)
        
        return {
            "valid": len(errors) == 0,
            "errors": [error.dict() for error in errors]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/equipment/types")
async def get_equipment_types():
    """Get available equipment types and their configurations"""
    return {
        "feed_tank": {
            "name": "Feed Tank",
            "description": "Water source characterization tank",
            "inputs": [
                {"name": "volume", "type": "float", "unit": "m³", "min": 1, "max": 50000},
                {"name": "height", "type": "float", "unit": "m", "min": 1, "max": 50},
                {"name": "level", "type": "float", "unit": "%", "min": 0, "max": 100},
                {"name": "inflow_rate", "type": "float", "unit": "m³/h", "min": 0, "max": 10000},
                {"name": "temperature", "type": "float", "unit": "°C", "min": 0, "max": 50},
                {"name": "source_type", "type": "select", "options": ["surface_water", "groundwater", "municipal", "industrial"]},
                {"name": "turbidity", "type": "float", "unit": "NTU", "min": 0, "max": 200},
                {"name": "tss", "type": "float", "unit": "mg/L", "min": 0, "max": 1000},
                {"name": "tds", "type": "float", "unit": "mg/L", "min": 0, "max": 5000},
                {"name": "ph", "type": "float", "unit": "units", "min": 4, "max": 11},
                {"name": "hardness", "type": "float", "unit": "mg/L CaCO₃", "min": 0, "max": 1000},
                {"name": "iron", "type": "float", "unit": "mg/L", "min": 0, "max": 10},
                {"name": "cod", "type": "float", "unit": "mg/L", "min": 0, "max": 1000}
            ],
            "outputs": [
                {"name": "outlet_flow", "unit": "m³/h"},
                {"name": "residence_time", "unit": "hours"},
                {"name": "treatment_difficulty", "unit": "rating"},
                {"name": "sdi_estimate", "unit": "index"},
                {"name": "fouling_potential", "unit": "rating"},
                {"name": "recommended_pretreatment", "unit": "list"}
            ]
        },
        "ultrafiltration": {
            "name": "Ultrafiltration",
            "description": "Membrane filtration system",
            "inputs": [
                {"name": "membrane_area", "type": "float", "unit": "m²", "min": 1, "max": 10000},
                {"name": "transmembrane_pressure", "type": "float", "unit": "bar", "min": 0.1, "max": 3.0},
                {"name": "temperature", "type": "float", "unit": "°C", "min": 5, "max": 60},
                {"name": "feed_concentration", "type": "float", "unit": "g/L", "min": 0, "max": 10},
                {"name": "crossflow_velocity", "type": "float", "unit": "m/s", "min": 0.5, "max": 5.0},
                {"name": "membrane_type", "type": "select", "options": ["PVDF", "PTFE"]}
            ],
            "outputs": [
                {"name": "permeate_flow", "unit": "m³/h"},
                {"name": "concentrate_flow", "unit": "m³/h"},
                {"name": "recovery", "unit": "%"},
                {"name": "flux", "unit": "L/m²/h"},
                {"name": "energy_consumption", "unit": "kWh/m³"}
            ]
        },
        "tank": {
            "name": "Storage Tank",
            "description": "Water storage vessel",
            "inputs": [
                {"name": "volume", "type": "float", "unit": "m³", "min": 0.1, "max": 10000},
                {"name": "height", "type": "float", "unit": "m", "min": 0.5, "max": 20}
            ],
            "outputs": [
                {"name": "outlet_flow", "unit": "m³/h"},
                {"name": "residence_time", "unit": "min"}
            ]
        },
        "pump": {
            "name": "Centrifugal Pump",
            "description": "Water circulation pump",
            "inputs": [
                {"name": "discharge_pressure", "type": "float", "unit": "bar", "min": 1, "max": 20},
                {"name": "efficiency", "type": "float", "unit": "-", "min": 0.5, "max": 0.9}
            ],
            "outputs": [
                {"name": "discharge_flow", "unit": "m³/h"},
                {"name": "power_consumption", "unit": "kW"}
            ]
        }
    }