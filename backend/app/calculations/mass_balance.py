"""
Mass Balance Solver for Water Treatment Flowsheet
Solves simultaneous mass balance equations for entire process flowsheet
"""
import numpy as np
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel
from ..utils.validation import EngineeringError


class StreamData(BaseModel):
    """Stream data model"""
    stream_id: str
    flow_rate: float = 0.0  # m³/h
    pressure: float = 1.0  # bar
    temperature: float = 25.0  # °C
    concentration: float = 0.0  # g/L
    source_equipment: str = ""
    target_equipment: str = ""
    source_port: str = ""
    target_port: str = ""


class EquipmentData(BaseModel):
    """Equipment configuration data"""
    equipment_id: str
    equipment_type: str
    config: Dict[str, Any]
    inlet_streams: List[str] = []
    outlet_streams: List[str] = []


class FlowsheetData(BaseModel):
    """Complete flowsheet data"""
    equipment: Dict[str, EquipmentData]
    streams: Dict[str, StreamData]
    connections: Dict[str, Dict[str, str]]


class MassBalanceResult(BaseModel):
    """Mass balance calculation result"""
    success: bool
    converged: bool = False
    iterations: int = 0
    max_error: float = 0.0
    streams: Dict[str, StreamData] = {}
    equipment_results: Dict[str, Dict[str, Any]] = {}
    errors: List[EngineeringError] = []


class MassBalanceSolver:
    """Professional mass balance solver for water treatment processes"""
    
    def __init__(self, tolerance: float = 1e-6, max_iterations: int = 100):
        self.tolerance = tolerance
        self.max_iterations = max_iterations
    
    def solve_flowsheet(self, flowsheet: FlowsheetData) -> MassBalanceResult:
        """Solve complete flowsheet mass balance"""
        try:
            # Initialize streams
            streams = dict(flowsheet.streams)
            equipment_results = {}
            
            # Iterative solution
            converged = False
            iteration = 0
            max_error = float('inf')
            
            while not converged and iteration < self.max_iterations:
                streams_old = {k: v.flow_rate for k, v in streams.items()}
                
                # Update each equipment unit
                for eq_id, equipment in flowsheet.equipment.items():
                    try:
                        result = self._solve_equipment(equipment, streams)
                        equipment_results[eq_id] = result
                        
                        # Update outlet streams
                        self._update_outlet_streams(equipment, result, streams)
                        
                    except Exception as e:
                        return MassBalanceResult(
                            success=False,
                            errors=[EngineeringError(
                                code="EQUIPMENT_CALC_ERROR",
                                message=f"Equipment {eq_id} calculation failed: {str(e)}",
                                equipment_id=eq_id,
                                severity="error"
                            )]
                        )
                
                # Check convergence
                max_error = 0.0
                for stream_id in streams:
                    if stream_id in streams_old:
                        error = abs(streams[stream_id].flow_rate - streams_old[stream_id])
                        max_error = max(max_error, error)
                
                converged = max_error < self.tolerance
                iteration += 1
            
            # Validate mass balance
            balance_errors = self._validate_mass_balance(flowsheet, streams)
            
            return MassBalanceResult(
                success=True,
                converged=converged,
                iterations=iteration,
                max_error=max_error,
                streams=streams,
                equipment_results=equipment_results,
                errors=balance_errors
            )
            
        except Exception as e:
            return MassBalanceResult(
                success=False,
                errors=[EngineeringError(
                    code="SOLVER_ERROR",
                    message=f"Mass balance solver failed: {str(e)}",
                    severity="critical"
                )]
            )
    
    def _solve_equipment(self, equipment: EquipmentData, streams: Dict[str, StreamData]) -> Dict[str, Any]:
        """Solve individual equipment unit"""
        from ..models.ultrafiltration import UltrafiltrationModel
        
        # Get inlet stream data
        inlet_data = {}
        total_inlet_flow = 0.0
        
        for stream_id in equipment.inlet_streams:
            if stream_id in streams:
                stream = streams[stream_id]
                inlet_data[f"{stream.source_port}_flow"] = stream.flow_rate
                inlet_data[f"{stream.source_port}_pressure"] = stream.pressure
                inlet_data[f"{stream.source_port}_temperature"] = stream.temperature
                total_inlet_flow += stream.flow_rate
        
        # Combine inlet data with equipment configuration
        calc_inputs = {**equipment.config, **inlet_data}
        
        # Add total feed flow if not specified
        if "feed_flow" not in calc_inputs and total_inlet_flow > 0:
            calc_inputs["feed_flow"] = total_inlet_flow
        
        # Calculate based on equipment type
        if equipment.equipment_type == "ultrafiltration":
            model = UltrafiltrationModel(equipment.equipment_id)
            result = model.calculate_performance(calc_inputs)
            
            if result.success:
                return result.data
            else:
                raise Exception(f"UF calculation failed: {[e.message for e in result.errors]}")
        
        elif equipment.equipment_type == "tank":
            # Simple tank model - outlet = inlet
            return {
                "outlet_flow": total_inlet_flow,
                "outlet_pressure": calc_inputs.get("pressure", 1.0),
                "outlet_temperature": calc_inputs.get("temperature", 25.0)
            }
        
        elif equipment.equipment_type == "pump":
            # Simple pump model
            pump_efficiency = calc_inputs.get("efficiency", 0.75)
            discharge_pressure = calc_inputs.get("discharge_pressure", 3.0)
            
            return {
                "discharge_flow": total_inlet_flow,
                "discharge_pressure": discharge_pressure,
                "power_consumption": self._calculate_pump_power(
                    total_inlet_flow, discharge_pressure, pump_efficiency
                )
            }
        
        else:
            # Generic equipment - outlet = inlet
            return {
                "outlet_flow": total_inlet_flow,
                "outlet_pressure": calc_inputs.get("pressure", 1.0),
                "outlet_temperature": calc_inputs.get("temperature", 25.0)
            }
    
    def _update_outlet_streams(self, equipment: EquipmentData, result: Dict[str, Any], 
                              streams: Dict[str, StreamData]):
        """Update outlet stream flows based on equipment calculation"""
        
        for stream_id in equipment.outlet_streams:
            if stream_id in streams:
                stream = streams[stream_id]
                
                # Map calculation results to stream properties
                if stream.source_port == "permeate_outlet" and "permeate_flow" in result:
                    stream.flow_rate = result["permeate_flow"]
                elif stream.source_port == "concentrate_outlet" and "concentrate_flow" in result:
                    stream.flow_rate = result["concentrate_flow"]
                elif stream.source_port == "discharge" and "discharge_flow" in result:
                    stream.flow_rate = result["discharge_flow"]
                    stream.pressure = result.get("discharge_pressure", stream.pressure)
                elif "outlet_flow" in result:
                    stream.flow_rate = result["outlet_flow"]
                
                # Update other properties
                stream.pressure = result.get("outlet_pressure", stream.pressure)
                stream.temperature = result.get("outlet_temperature", stream.temperature)
    
    def _calculate_pump_power(self, flow_rate: float, head: float, efficiency: float) -> float:
        """Calculate pump power consumption (kW)"""
        # Power = ρ × g × Q × H / η
        density = 1000  # kg/m³
        gravity = 9.81  # m/s²
        flow_m3_s = flow_rate / 3600  # m³/s
        head_m = head * 10.2  # bar to m
        
        power_kw = (density * gravity * flow_m3_s * head_m) / (efficiency * 1000)
        return max(power_kw, 0.0)
    
    def _validate_mass_balance(self, flowsheet: FlowsheetData, 
                              streams: Dict[str, StreamData]) -> List[EngineeringError]:
        """Validate overall mass balance"""
        errors = []
        
        # Check each equipment for mass balance
        for eq_id, equipment in flowsheet.equipment.items():
            inlet_flow = sum(
                streams[stream_id].flow_rate 
                for stream_id in equipment.inlet_streams 
                if stream_id in streams
            )
            
            outlet_flow = sum(
                streams[stream_id].flow_rate 
                for stream_id in equipment.outlet_streams 
                if stream_id in streams
            )
            
            if inlet_flow > 0:  # Avoid division by zero
                balance_error = abs(inlet_flow - outlet_flow) / inlet_flow * 100
                
                if balance_error > 1.0:  # 1% tolerance
                    errors.append(EngineeringError(
                        code="MASS_BALANCE_ERROR",
                        message=f"Mass balance error in {eq_id}: {balance_error:.1f}% "
                               f"(In: {inlet_flow:.3f}, Out: {outlet_flow:.3f} m³/h)",
                        equipment_id=eq_id,
                        severity="error" if balance_error > 5.0 else "warning"
                    ))
        
        return errors
    
    def calculate_system_recovery(self, streams: Dict[str, StreamData]) -> float:
        """Calculate overall system recovery"""
        total_feed = 0.0
        total_product = 0.0
        
        for stream in streams.values():
            if "feed" in stream.stream_id.lower():
                total_feed += stream.flow_rate
            elif "product" in stream.stream_id.lower() or "permeate" in stream.stream_id.lower():
                total_product += stream.flow_rate
        
        return (total_product / total_feed * 100) if total_feed > 0 else 0.0