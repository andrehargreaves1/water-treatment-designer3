"""
Professional Ultrafiltration Model
Real membrane transport equations based on Darcy's Law and concentration polarization
"""
import numpy as np
from typing import Dict, Any
from pydantic import BaseModel
from .base import BaseEquipmentModel, ProcessResults
from ..utils.validation import EngineeringError
from ..config import settings


class UFInputs(BaseModel):
    """Ultrafiltration process inputs"""
    feed_flow: float  # m³/h
    membrane_area: float  # m²
    transmembrane_pressure: float  # bar
    temperature: float = 25.0  # °C
    feed_concentration: float = 0.1  # g/L suspended solids
    crossflow_velocity: float = 2.0  # m/s
    operating_hours: float = 0.0  # h (for fouling calculation)
    membrane_type: str = "PVDF"


class UFResults(BaseModel):
    """Ultrafiltration calculation results"""
    permeate_flow: float  # m³/h
    concentrate_flow: float  # m³/h
    recovery: float  # %
    flux: float  # L/m²/h
    transmembrane_pressure: float  # bar
    energy_consumption: float  # kWh/m³
    membrane_life_prediction: float  # months
    fouling_resistance: float  # m⁻¹


class UltrafiltrationModel(BaseEquipmentModel):
    """Professional ultrafiltration membrane model"""
    
    def __init__(self, equipment_id: str):
        super().__init__(equipment_id)
        self.membrane_properties = {
            "PVDF": {
                "clean_resistance": 2e11,  # m⁻¹
                "permeability": 50.0,  # L/m²/h/bar
                "max_pressure": 3.0,  # bar
                "max_temperature": 60.0  # °C
            },
            "PTFE": {
                "clean_resistance": 1.5e11,  # m⁻¹
                "permeability": 60.0,  # L/m²/h/bar
                "max_pressure": 4.0,  # bar
                "max_temperature": 80.0  # °C
            }
        }
    
    def calculate_performance(self, inputs: Dict[str, Any]) -> ProcessResults:
        """Calculate UF performance using real membrane transport equations"""
        try:
            # Validate inputs
            uf_inputs = UFInputs(**inputs)
            errors = self.validate_uf_inputs(uf_inputs)
            
            if errors:
                return ProcessResults(success=False, errors=errors)
            
            # Get membrane properties
            membrane_props = self.membrane_properties.get(
                uf_inputs.membrane_type, 
                self.membrane_properties["PVDF"]
            )
            
            # Calculate water viscosity (temperature dependent)
            viscosity = self.water_viscosity(uf_inputs.temperature)  # Pa·s
            
            # Calculate membrane resistance
            clean_resistance = membrane_props["clean_resistance"]  # m⁻¹
            fouling_resistance = self.calculate_fouling_resistance(
                uf_inputs.operating_hours, 
                uf_inputs.feed_concentration
            )
            total_resistance = clean_resistance + fouling_resistance
            
            # Concentration polarization factor
            cp_factor = self.concentration_polarization_factor(
                uf_inputs.crossflow_velocity,
                uf_inputs.feed_concentration
            )
            
            # Osmotic pressure at membrane surface
            surface_concentration = uf_inputs.feed_concentration * cp_factor
            osmotic_pressure = self.osmotic_pressure(surface_concentration)  # bar
            
            # Net driving pressure
            net_pressure = uf_inputs.transmembrane_pressure - osmotic_pressure  # bar
            
            if net_pressure <= 0:
                return ProcessResults(
                    success=False,
                    errors=[EngineeringError(
                        code="NEGATIVE_NET_PRESSURE",
                        message=f"Net pressure {net_pressure:.2f} bar is negative. Increase TMP or reduce fouling.",
                        equipment_id=self.equipment_id,
                        severity="error"
                    )]
                )
            
            # Flux calculation using Darcy's Law: J = ΔP / (μ × R_total)
            flux = (net_pressure * 1e5) / (viscosity * total_resistance)  # m/s
            flux_lmh = flux * 3600  # L/m²/h
            
            # Flow calculations
            permeate_flow = flux_lmh * uf_inputs.membrane_area / 1000  # m³/h
            concentrate_flow = uf_inputs.feed_flow - permeate_flow
            recovery = (permeate_flow / uf_inputs.feed_flow) * 100 if uf_inputs.feed_flow > 0 else 0
            
            # Energy calculation
            energy_consumption = self.calculate_energy_consumption(
                uf_inputs.feed_flow,
                uf_inputs.transmembrane_pressure,
                permeate_flow
            )
            
            # Membrane life prediction
            membrane_life = self.predict_membrane_life(flux_lmh, fouling_resistance)
            
            # Validation checks
            validation_errors = self.validate_results(flux_lmh, recovery, uf_inputs.transmembrane_pressure)
            
            results = UFResults(
                permeate_flow=round(permeate_flow, 3),
                concentrate_flow=round(concentrate_flow, 3),
                recovery=round(recovery, 1),
                flux=round(flux_lmh, 1),
                transmembrane_pressure=uf_inputs.transmembrane_pressure,
                energy_consumption=round(energy_consumption, 3),
                membrane_life_prediction=round(membrane_life, 1),
                fouling_resistance=fouling_resistance
            )
            
            return ProcessResults(
                success=True,
                data=results.dict(),
                errors=validation_errors
            )
            
        except Exception as e:
            return ProcessResults(
                success=False,
                errors=[EngineeringError(
                    code="CALCULATION_ERROR",
                    message=f"UF calculation failed: {str(e)}",
                    equipment_id=self.equipment_id,
                    severity="critical"
                )]
            )
    
    def validate_uf_inputs(self, inputs: UFInputs) -> list[EngineeringError]:
        """Validate UF-specific inputs"""
        errors = []
        
        if inputs.feed_flow <= 0:
            errors.append(EngineeringError(
                code="INVALID_FEED_FLOW",
                message="Feed flow must be positive",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        if inputs.membrane_area <= 0:
            errors.append(EngineeringError(
                code="INVALID_MEMBRANE_AREA",
                message="Membrane area must be positive",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        if inputs.transmembrane_pressure <= 0:
            errors.append(EngineeringError(
                code="INVALID_TMP",
                message="Transmembrane pressure must be positive",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        return errors
    
    def calculate_fouling_resistance(self, operating_hours: float, feed_concentration: float) -> float:
        """Calculate fouling resistance based on operating time and feed quality"""
        # Simplified fouling model - exponential buildup
        base_fouling_rate = 1e9  # m⁻¹/h
        concentration_factor = 1 + (feed_concentration / 10.0)  # Higher concentration = more fouling
        
        fouling_resistance = base_fouling_rate * concentration_factor * operating_hours
        return min(fouling_resistance, 5e11)  # Cap at maximum fouling
    
    def concentration_polarization_factor(self, crossflow_velocity: float, feed_concentration: float) -> float:
        """Calculate concentration polarization factor"""
        # Based on film theory: CP = exp(J / k)
        # Mass transfer coefficient k depends on crossflow velocity
        
        if crossflow_velocity <= 0:
            return 2.0  # High polarization with no crossflow
        
        # Mass transfer coefficient (simplified correlation)
        k = 1e-6 * (crossflow_velocity ** 0.8)  # m/s
        
        # Estimate flux for CP calculation (iterative in real implementation)
        estimated_flux = 5e-6  # m/s (typical UF flux)
        
        cp_factor = np.exp(estimated_flux / k)
        return min(cp_factor, 3.0)  # Practical limit
    
    def osmotic_pressure(self, concentration: float) -> float:
        """Calculate osmotic pressure from concentration (bar)"""
        # Van't Hoff equation for dilute solutions
        # π = i × c × R × T
        # For suspended solids, assume i = 1, simplified calculation
        
        osmotic_pressure_bar = concentration * 0.001  # Very approximate for suspended solids
        return min(osmotic_pressure_bar, 0.1)  # Practical limit for UF
    
    def calculate_energy_consumption(self, feed_flow: float, tmp: float, permeate_flow: float) -> float:
        """Calculate energy consumption (kWh/m³ permeate)"""
        # Energy for pressurization
        pump_efficiency = 0.75  # Typical centrifugal pump efficiency
        
        # Pressure energy (assuming 1 bar feed pressure, TMP additional pressure)
        pressure_energy = tmp * 1e5  # J/m³ = Pa
        
        # Energy per cubic meter of feed
        energy_per_m3_feed = pressure_energy / (pump_efficiency * 3.6e6)  # kWh/m³
        
        # Energy per cubic meter of permeate
        if permeate_flow > 0:
            energy_per_m3_permeate = energy_per_m3_feed * (feed_flow / permeate_flow)
        else:
            energy_per_m3_permeate = float('inf')
        
        return min(energy_per_m3_permeate, 2.0)  # Practical limit
    
    def predict_membrane_life(self, flux: float, fouling_resistance: float) -> float:
        """Predict membrane replacement time (months)"""
        # Simple model based on flux decline
        base_life = 24  # months at low flux
        flux_factor = max(1.0, flux / 60.0)  # Higher flux = shorter life
        fouling_factor = max(1.0, fouling_resistance / 1e11)  # More fouling = shorter life
        
        predicted_life = base_life / (flux_factor * fouling_factor)
        return max(predicted_life, 6.0)  # Minimum 6 months
    
    def validate_results(self, flux: float, recovery: float, tmp: float) -> list[EngineeringError]:
        """Validate calculated results against engineering constraints"""
        errors = []
        
        if flux > settings.max_flux:
            errors.append(EngineeringError(
                code="HIGH_FLUX",
                message=f"Flux {flux:.1f} LMH exceeds recommended maximum {settings.max_flux} LMH",
                equipment_id=self.equipment_id,
                severity="warning"
            ))
        
        if recovery > settings.max_recovery:
            errors.append(EngineeringError(
                code="HIGH_RECOVERY",
                message=f"Recovery {recovery:.1f}% may cause excessive fouling",
                equipment_id=self.equipment_id,
                severity="warning"
            ))
        
        if tmp > settings.max_tmp:
            errors.append(EngineeringError(
                code="HIGH_TMP",
                message=f"TMP {tmp} bar exceeds membrane pressure rating",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        return errors