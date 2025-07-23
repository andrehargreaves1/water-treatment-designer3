"""
Feed Tank Model with Water Source Characterization
Allows definition of feed water composition and source parameters
"""
import numpy as np
from typing import Dict, Any, Optional
from pydantic import BaseModel
from .base import BaseEquipmentModel, ProcessResults
from ..utils.validation import EngineeringError
from ..config import settings


class WaterQuality(BaseModel):
    """Water quality parameters"""
    turbidity: float = 1.0  # NTU
    tss: float = 10.0  # mg/L Total Suspended Solids
    tds: float = 500.0  # mg/L Total Dissolved Solids
    fog: float = 5.0  # mg/L Fats, Oils and Grease
    bod: float = 20.0  # mg/L Biochemical Oxygen Demand
    cod: float = 50.0  # mg/L Chemical Oxygen Demand
    ph: float = 7.0  # pH units
    alkalinity: float = 100.0  # mg/L as CaCO3
    hardness: float = 150.0  # mg/L as CaCO3
    chloride: float = 50.0  # mg/L
    sulfate: float = 30.0  # mg/L
    nitrate: float = 10.0  # mg/L
    phosphate: float = 2.0  # mg/L
    iron: float = 0.5  # mg/L
    manganese: float = 0.1  # mg/L


class FeedTankInputs(BaseModel):
    """Feed tank process inputs"""
    volume: float = 1000.0  # m³
    height: float = 10.0  # m
    level: float = 75.0  # % (0-100)
    inflow_rate: float = 100.0  # m³/h
    temperature: float = 25.0  # °C
    
    # Water source information
    source_type: str = "surface_water"  # surface_water, groundwater, municipal, industrial
    source_description: str = "River intake"
    
    # Water quality parameters
    water_quality: WaterQuality = WaterQuality()
    
    # Additional contaminants (optional)
    heavy_metals: Dict[str, float] = {}  # metal_name: concentration (mg/L)
    organics: Dict[str, float] = {}  # compound_name: concentration (mg/L)
    pathogens: Dict[str, float] = {}  # pathogen_type: count (CFU/100mL or similar)


class FeedTankResults(BaseModel):
    """Feed tank calculation results"""
    outlet_flow: float  # m³/h
    residence_time: float  # hours
    water_volume: float  # m³
    overflow_risk: bool
    water_age: float  # hours
    
    # Water quality assessment
    treatment_difficulty: str  # "low", "medium", "high", "very_high"
    recommended_pretreatment: list[str]
    sdi_estimate: float  # Silt Density Index estimate
    fouling_potential: str  # "low", "medium", "high"
    
    # Quality parameters passed through
    outlet_quality: WaterQuality


class FeedTankModel(BaseEquipmentModel):
    """Feed tank model with water source characterization"""
    
    def __init__(self, equipment_id: str):
        super().__init__(equipment_id)
        
        # Water source type characteristics
        self.source_characteristics = {
            "surface_water": {
                "typical_turbidity": (2, 20),  # NTU range
                "typical_tss": (5, 50),  # mg/L range
                "seasonal_variation": "high",
                "pretreatment_needs": ["coagulation", "sedimentation", "filtration"]
            },
            "groundwater": {
                "typical_turbidity": (0.1, 2),
                "typical_tss": (1, 10),
                "seasonal_variation": "low",
                "pretreatment_needs": ["iron_removal", "hardness_removal"]
            },
            "municipal": {
                "typical_turbidity": (0.1, 1),
                "typical_tss": (1, 5),
                "seasonal_variation": "low",
                "pretreatment_needs": ["chlorine_removal", "ph_adjustment"]
            },
            "industrial": {
                "typical_turbidity": (1, 100),
                "typical_tss": (10, 500),
                "seasonal_variation": "medium",
                "pretreatment_needs": ["neutralization", "heavy_metal_removal", "organics_removal"]
            }
        }
    
    def calculate_performance(self, inputs: Dict[str, Any]) -> ProcessResults:
        """Calculate feed tank performance and water characterization"""
        try:
            # Parse inputs
            tank_inputs = FeedTankInputs(**inputs)
            errors = self.validate_feed_tank_inputs(tank_inputs)
            
            if errors:
                return ProcessResults(success=False, errors=errors)
            
            # Basic tank calculations
            water_volume = (tank_inputs.volume * tank_inputs.level / 100)
            residence_time = water_volume / tank_inputs.inflow_rate if tank_inputs.inflow_rate > 0 else 0
            
            # Outlet flow (assuming steady state)
            outlet_flow = tank_inputs.inflow_rate
            
            # Check for overflow risk
            overflow_risk = tank_inputs.level > 90.0
            
            # Estimate water age (simplified mixing model)
            water_age = residence_time * 0.37  # Exponential decay approximation
            
            # Water quality assessment
            treatment_difficulty = self.assess_treatment_difficulty(tank_inputs.water_quality)
            recommended_pretreatment = self.recommend_pretreatment(
                tank_inputs.source_type, 
                tank_inputs.water_quality
            )
            
            # SDI estimation
            sdi_estimate = self.estimate_sdi(tank_inputs.water_quality)
            
            # Fouling potential
            fouling_potential = self.assess_fouling_potential(tank_inputs.water_quality)
            
            # Water quality changes in tank (minimal for well-mixed tank)
            outlet_quality = self.calculate_outlet_quality(
                tank_inputs.water_quality, 
                residence_time,
                tank_inputs.temperature
            )
            
            results = FeedTankResults(
                outlet_flow=round(outlet_flow, 2),
                residence_time=round(residence_time, 2),
                water_volume=round(water_volume, 1),
                overflow_risk=overflow_risk,
                water_age=round(water_age, 2),
                treatment_difficulty=treatment_difficulty,
                recommended_pretreatment=recommended_pretreatment,
                sdi_estimate=round(sdi_estimate, 1),
                fouling_potential=fouling_potential,
                outlet_quality=outlet_quality
            )
            
            # Convert outlet quality to dict for stream propagation
            results_dict = results.dict()
            results_dict["outlet_quality"] = outlet_quality.dict()
            
            # Validation warnings
            validation_errors = self.validate_water_quality(tank_inputs.water_quality)
            
            return ProcessResults(
                success=True,
                data=results_dict,
                errors=validation_errors
            )
            
        except Exception as e:
            return ProcessResults(
                success=False,
                errors=[EngineeringError(
                    code="FEED_TANK_ERROR",
                    message=f"Feed tank calculation failed: {str(e)}",
                    equipment_id=self.equipment_id,
                    severity="critical"
                )]
            )
    
    def validate_feed_tank_inputs(self, inputs: FeedTankInputs) -> list[EngineeringError]:
        """Validate feed tank inputs"""
        errors = []
        
        if inputs.volume <= 0:
            errors.append(EngineeringError(
                code="INVALID_VOLUME",
                message="Tank volume must be positive",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        if inputs.level < 0 or inputs.level > 100:
            errors.append(EngineeringError(
                code="INVALID_LEVEL",
                message="Tank level must be between 0-100%",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        if inputs.inflow_rate < 0:
            errors.append(EngineeringError(
                code="INVALID_INFLOW",
                message="Inflow rate cannot be negative",
                equipment_id=self.equipment_id,
                severity="error"
            ))
        
        return errors
    
    def assess_treatment_difficulty(self, quality: WaterQuality) -> str:
        """Assess overall treatment difficulty based on water quality"""
        difficulty_score = 0
        
        # Turbidity contribution
        if quality.turbidity > 10: difficulty_score += 2
        elif quality.turbidity > 5: difficulty_score += 1
        
        # TSS contribution
        if quality.tss > 50: difficulty_score += 2
        elif quality.tss > 20: difficulty_score += 1
        
        # TDS contribution
        if quality.tds > 1000: difficulty_score += 2
        elif quality.tds > 500: difficulty_score += 1
        
        # Organics contribution
        if quality.cod > 100: difficulty_score += 2
        elif quality.cod > 50: difficulty_score += 1
        
        # FOG contribution
        if quality.fog > 20: difficulty_score += 2
        elif quality.fog > 10: difficulty_score += 1
        
        # pH contribution
        if quality.ph < 6 or quality.ph > 9: difficulty_score += 2
        elif quality.ph < 6.5 or quality.ph > 8.5: difficulty_score += 1
        
        # Hardness contribution
        if quality.hardness > 300: difficulty_score += 1
        
        if difficulty_score >= 6:
            return "very_high"
        elif difficulty_score >= 4:
            return "high"
        elif difficulty_score >= 2:
            return "medium"
        else:
            return "low"
    
    def recommend_pretreatment(self, source_type: str, quality: WaterQuality) -> list[str]:
        """Recommend pretreatment steps based on source and quality"""
        recommendations = []
        
        # Base recommendations by source type
        if source_type in self.source_characteristics:
            recommendations.extend(self.source_characteristics[source_type]["pretreatment_needs"])
        
        # Quality-specific recommendations
        if quality.turbidity > 5:
            if "coagulation" not in recommendations:
                recommendations.append("coagulation")
        
        if quality.ph < 6.5 or quality.ph > 8.5:
            recommendations.append("ph_adjustment")
        
        if quality.hardness > 200:
            if "hardness_removal" not in recommendations:
                recommendations.append("hardness_removal")
        
        if quality.iron > 0.3:
            if "iron_removal" not in recommendations:
                recommendations.append("iron_removal")
        
        if quality.cod > 50:
            recommendations.append("activated_carbon")
        
        if quality.tss > 30:
            if "filtration" not in recommendations:
                recommendations.append("filtration")
        
        if quality.fog > 10:
            recommendations.append("oil_water_separation")
        
        return recommendations
    
    def estimate_sdi(self, quality: WaterQuality) -> float:
        """Estimate Silt Density Index from water quality parameters"""
        # Empirical correlation based on turbidity and TSS
        # SDI typically ranges from 1-7 for membrane feed water
        
        base_sdi = 1.0
        
        # Turbidity contribution
        base_sdi += quality.turbidity * 0.2
        
        # TSS contribution  
        base_sdi += quality.tss * 0.05
        
        # Iron contribution (causes colloidal fouling)
        base_sdi += quality.iron * 2.0
        
        # Organics contribution
        base_sdi += quality.cod * 0.01
        
        # FOG contribution (can cause membrane fouling)
        base_sdi += quality.fog * 0.1
        
        return min(max(base_sdi, 1.0), 15.0)  # Clamp between realistic bounds
    
    def assess_fouling_potential(self, quality: WaterQuality) -> str:
        """Assess membrane fouling potential"""
        fouling_score = 0
        
        # Organic fouling
        if quality.cod > 10: fouling_score += 1
        if quality.bod > 5: fouling_score += 1
        if quality.fog > 5: fouling_score += 1
        
        # Inorganic fouling
        if quality.hardness > 200: fouling_score += 1
        if quality.iron > 0.2: fouling_score += 1
        if quality.manganese > 0.05: fouling_score += 1
        
        # Colloidal fouling
        if quality.turbidity > 1: fouling_score += 1
        if quality.tss > 10: fouling_score += 1
        
        if fouling_score >= 5:
            return "high"
        elif fouling_score >= 3:
            return "medium"
        else:
            return "low"
    
    def calculate_outlet_quality(self, inlet_quality: WaterQuality, 
                               residence_time: float, temperature: float) -> WaterQuality:
        """Calculate outlet water quality (minimal changes in storage tank)"""
        # For most parameters, assume no change in storage tank
        # In reality, some settling and biological activity might occur
        
        outlet_quality = inlet_quality.copy()
        
        # Slight settling of suspended solids if residence time > 2 hours
        if residence_time > 2.0:
            settling_efficiency = min(0.2, residence_time * 0.05)  # Max 20% settling
            outlet_quality.tss *= (1 - settling_efficiency)
            outlet_quality.turbidity *= (1 - settling_efficiency * 0.5)
        
        # Temperature equilibration (minor effect)
        # In practice, would approach ambient temperature
        
        return outlet_quality
    
    def validate_water_quality(self, quality: WaterQuality) -> list[EngineeringError]:
        """Validate water quality parameters against typical ranges"""
        errors = []
        
        if quality.ph < 4 or quality.ph > 11:
            errors.append(EngineeringError(
                code="EXTREME_PH",
                message=f"pH {quality.ph} is outside typical water treatment range (4-11)",
                equipment_id=self.equipment_id,
                severity="warning"
            ))
        
        if quality.turbidity > 100:
            errors.append(EngineeringError(
                code="HIGH_TURBIDITY", 
                message=f"Turbidity {quality.turbidity} NTU is very high - extensive pretreatment required",
                equipment_id=self.equipment_id,
                severity="warning"
            ))
        
        if quality.tds > 2000:
            errors.append(EngineeringError(
                code="HIGH_TDS",
                message=f"TDS {quality.tds} mg/L may require RO treatment",
                equipment_id=self.equipment_id,
                severity="info"
            ))
        
        return errors