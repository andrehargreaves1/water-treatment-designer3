"""
Engineering validation utilities
"""
from pydantic import BaseModel
from typing import Literal


class EngineeringError(BaseModel):
    """Engineering validation error model"""
    code: str
    message: str
    equipment_id: str = ""
    severity: Literal["info", "warning", "error", "critical"] = "error"


def validate_flow_rate(flow_rate: float, min_flow: float = 0.0, max_flow: float = 1000.0) -> list[EngineeringError]:
    """Validate flow rate range"""
    errors = []
    
    if flow_rate < min_flow:
        errors.append(EngineeringError(
            code="FLOW_TOO_LOW",
            message=f"Flow rate {flow_rate} m³/h below minimum {min_flow} m³/h",
            severity="error"
        ))
    
    if flow_rate > max_flow:
        errors.append(EngineeringError(
            code="FLOW_TOO_HIGH",
            message=f"Flow rate {flow_rate} m³/h exceeds maximum {max_flow} m³/h",
            severity="warning"
        ))
    
    return errors


def validate_pressure(pressure: float, min_pressure: float = 0.0, max_pressure: float = 10.0) -> list[EngineeringError]:
    """Validate pressure range"""
    errors = []
    
    if pressure < min_pressure:
        errors.append(EngineeringError(
            code="PRESSURE_TOO_LOW",
            message=f"Pressure {pressure} bar below minimum {min_pressure} bar",
            severity="error"
        ))
    
    if pressure > max_pressure:
        errors.append(EngineeringError(
            code="PRESSURE_TOO_HIGH",
            message=f"Pressure {pressure} bar exceeds maximum {max_pressure} bar",
            severity="error"
        ))
    
    return errors


def validate_temperature(temperature: float) -> list[EngineeringError]:
    """Validate temperature range for water treatment"""
    errors = []
    
    if temperature < 0:
        errors.append(EngineeringError(
            code="TEMP_BELOW_FREEZING",
            message=f"Temperature {temperature}°C below freezing point",
            severity="error"
        ))
    
    if temperature > 80:
        errors.append(EngineeringError(
            code="TEMP_TOO_HIGH",
            message=f"Temperature {temperature}°C may damage equipment",
            severity="warning"
        ))
    
    return errors