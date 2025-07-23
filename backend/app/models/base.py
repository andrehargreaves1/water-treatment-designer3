"""
Base equipment model class with common functionality
"""
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel
from ..utils.validation import EngineeringError


class ProcessInputs(BaseModel):
    """Base process inputs"""
    temperature: float = 25.0  # °C
    pressure: float = 1.0  # bar


class ProcessResults(BaseModel):
    """Base process results"""
    success: bool
    data: Dict[str, Any] = {}
    errors: List[EngineeringError] = []
    warnings: List[str] = []


class BaseEquipmentModel(ABC):
    """Base class for all process equipment models"""
    
    def __init__(self, equipment_id: str):
        self.equipment_id = equipment_id
        self.equipment_type = self.__class__.__name__.replace('Model', '').lower()
    
    @abstractmethod
    def calculate_performance(self, inputs: Dict[str, Any]) -> ProcessResults:
        """Calculate equipment performance based on inputs"""
        pass
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> List[EngineeringError]:
        """Validate engineering inputs"""
        errors = []
        
        # Common validation checks
        if 'temperature' in inputs:
            if inputs['temperature'] < 0 or inputs['temperature'] > 100:
                errors.append(EngineeringError(
                    code="TEMP_RANGE",
                    message=f"Temperature {inputs['temperature']}°C outside valid range (0-100°C)",
                    equipment_id=self.equipment_id,
                    severity="error"
                ))
        
        return errors
    
    def water_density(self, temperature: float) -> float:
        """Water density as function of temperature (kg/m³)"""
        # Simplified correlation for pure water
        return 1000.0 * (1 - 0.0002 * (temperature - 20))
    
    def water_viscosity(self, temperature: float) -> float:
        """Water dynamic viscosity as function of temperature (Pa·s)"""
        # Simplified correlation for pure water
        return 0.001 * np.exp(1.3272 * (20 - temperature) / (temperature + 105))
    
    def reynolds_number(self, velocity: float, diameter: float, temperature: float) -> float:
        """Calculate Reynolds number"""
        density = self.water_density(temperature)
        viscosity = self.water_viscosity(temperature)
        return density * velocity * diameter / viscosity