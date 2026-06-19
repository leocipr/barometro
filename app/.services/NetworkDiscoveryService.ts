
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
        `http://${device.ipAddress}:${device.port}/health`,
        { timeout: 5000 }
      )
      return response.ok
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return false
    }
  },

  // Função para descobrir dispositivos na rede
  async discoverDevices(timeout: number = 8000): Promise<DiscoveredDevice[]> {
    const devices: DiscoveredDevice[] = []

    // Adicionar localhost automaticamente para testar localmente
    const localDevice: DiscoveredDevice = {
      id: 'localhost:3000',
      name: 'Servidor Local',
      ipAddress: 'localhost',
      port: 3000,
      lastSeen: Date.now(),
    }
    devices.push(localDevice)
    this.discoveredDevices.set(localDevice.id, localDevice)

    // Tentar IP ranges comuns (rodar em paralelo com timeout)
    const ipRanges = ['192.168.1', '192.168.0', '10.0.0']
    const promises: Promise<void>[] = []

    for (const range of ipRanges) {
      for (let i = 1; i <= 254; i++) {
        const ip = `${range}.${i}`
        promises.push(
          this._checkDevice(ip, 3000)
            .then((device) => {
              if (device) {
                devices.push(device)
                this.discoveredDevices.set(device.id, device)
              }
            })
            .catch(() => {})
        )
      }
    }

    // Esperar todas as promessas ou timeout
    await Promise.race([
      Promise.all(promises),
      new Promise((resolve) => setTimeout(() => resolve(undefined), timeout)),
    ])

    this._notifyListeners()
    return devices.filter((d) => d.id !== 'localhost:3000') // Remover localhost da lista
  },

  // Função privada para verificar um dispositivo
  async _checkDevice(ip: string, port: number): Promise<DiscoveredDevice | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const response = await fetch(`http://${ip}:${port}/health`, {
        method: 'GET',
        signal: controller.signal as any,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return {
          id: `${ip}:${port}`,
          name: `Dispositivo ${ip}`,
          ipAddress: ip,
          port,
          lastSeen: Date.now(),
        }
      }
    } catch (error) {
      // Ignorar erro
    }

    return null
  },
}
