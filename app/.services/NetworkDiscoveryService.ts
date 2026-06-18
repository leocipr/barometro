
// Para esta primeira versão, vamos criar um serviço simplificado
// que permite sincronizar manualmente pelo IP de um dispositivo

export interface DiscoveredDevice {
  id: string
  name: string
  ipAddress: string
  port: number
  lastSeen: number
}

export const NetworkDiscoveryService = {
  discoveredDevices: new Map<string, DiscoveredDevice>(),
  listeners: new Set<(devices: DiscoveredDevice[]) => void>(),

  // Função para adicionar um dispositivo manualmente (temporariamente)
  addDevice(ipAddress: string, port: number = 3000) {
    const id = ipAddress + ':' + port
    const device: DiscoveredDevice = {
      id,
      name: `Dispositivo em ${ipAddress}`,
      ipAddress,
      port,
      lastSeen: Date.now(),
    }
    this.discoveredDevices.set(id, device)
    this._notifyListeners()
    return device
  },

  getDiscoveredDevices(): DiscoveredDevice[] {
    return Array.from(this.discoveredDevices.values()).filter(
      (d) => Date.now() - d.lastSeen < 30000 // Últimos 30 segundos
    )
  },

  subscribe(listener: (devices: DiscoveredDevice[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  },

  _notifyListeners() {
    const devices = this.getDiscoveredDevices()
    this.listeners.forEach((listener) => {
      try {
        listener(devices)
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  },

  // Função para testar conexão com um dispositivo
  async testConnection(device: DiscoveredDevice): Promise<boolean> {
    try {
      const response = await fetch(
        `http://${device.ipAddress}:${device.port}/api/health`,
        { timeout: 5000 }
      )
      return response.ok
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return false
    }
  },
}
