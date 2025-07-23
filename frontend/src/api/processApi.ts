// API client for backend process calculations

const API_BASE_URL = '/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  errors?: Array<{
    code: string
    message: string
    equipment_id?: string
    severity: 'info' | 'warning' | 'error' | 'critical'
  }>
  warnings?: string[]
}

interface FlowsheetResponse extends ApiResponse {
  converged?: boolean
  iterations?: number
  max_error?: number
  streams?: Record<string, any>
  equipment_results?: Record<string, any>
  system_recovery?: number
}

class ProcessApi {
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async calculateUltrafiltration(inputs: Record<string, any>): Promise<ApiResponse> {
    return this.request('/calculate/ultrafiltration', {
      method: 'POST',
      body: JSON.stringify(inputs),
    })
  }

  async calculateFlowsheet(flowsheetData: Record<string, any>): Promise<FlowsheetResponse> {
    return this.request('/calculate/flowsheet', {
      method: 'POST',
      body: JSON.stringify(flowsheetData),
    })
  }

  async validateEquipment(equipmentData: Record<string, any>): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request('/validate/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    })
  }

  async getEquipmentTypes(): Promise<ApiResponse<Record<string, any>>> {
    return this.request('/equipment/types')
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health')
  }
}

export const processApi = new ProcessApi()