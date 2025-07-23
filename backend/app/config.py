"""
Application configuration
"""
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "Water Treatment Designer"
    debug: bool = True
    
    # Engineering constants
    water_density: float = 1000.0  # kg/m³ at 20°C
    gravity: float = 9.81  # m/s²
    
    # Default membrane properties
    default_uf_permeability: float = 50.0  # L/m²/h/bar
    default_uf_resistance: float = 2e11  # m⁻¹
    
    # Calculation limits
    max_recovery: float = 98.0  # %
    max_flux: float = 120.0  # L/m²/h
    max_tmp: float = 3.0  # bar
    
    class Config:
        env_file = ".env"


settings = Settings()