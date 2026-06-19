import { ClientService } from './ClientService'
import { ConsumptionService } from './ConsumptionService'
import { PaymentService } from './PaymentService'
import { ProductService } from './ProductService'
import { SyncData, SyncService } from './SyncService'

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error'
  message: string
  progress?: number
  lastSync?: number
}

export const SyncClientService = {
  currentStatus: {
    status: 'idle' as const,
    message: 'Pronto para sincronizar',
  },

  async uploadToServer(serverUrl: string): Promise<SyncStatus> {
    try {
      this.currentStatus = { status: 'syncing', message: 'Exportando dados...' }

      const data = await SyncService.exportData()

      this.currentStatus = { status: 'syncing', message: 'Enviando para servidor...' }

      const response = await fetch(`http://${serverUrl}/sync/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.statusText}`)
      }

      this.currentStatus = {
        status: 'success',
        message: 'Upload realizado com sucesso',
        lastSync: Date.now(),
      }

      return this.currentStatus
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sincronizar'
      this.currentStatus = { status: 'error', message }
      return this.currentStatus
    }
  },

  async downloadFromServer(serverUrl: string): Promise<SyncStatus> {
    try {
      this.currentStatus = { status: 'syncing', message: 'Conectando ao servidor...' }

      const response = await fetch(`http://${serverUrl}/sync/download`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.statusText}`)
      }

      this.currentStatus = { status: 'syncing', message: 'Baixando dados...' }

      const data: SyncData = await response.json()

      this.currentStatus = { status: 'syncing', message: 'Importando dados...' }

      await this.importData(data)

      this.currentStatus = {
        status: 'success',
        message: 'Download realizado com sucesso',
        lastSync: Date.now(),
      }

      return this.currentStatus
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sincronizar'
      this.currentStatus = { status: 'error', message }
      return this.currentStatus
    }
  },

  async bidirectionalSync(serverUrl: string): Promise<SyncStatus> {
    try {
      // Primeiro, fazer upload
      const uploadResult = await this.uploadToServer(serverUrl)
      if (uploadResult.status === 'error') return uploadResult

      // Depois, fazer download
      return await this.downloadFromServer(serverUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sincronizar'
      this.currentStatus = { status: 'error', message }
      return this.currentStatus
    }
  },

  async importData(syncData: SyncData): Promise<void> {
    // Produtos
    for (const product of syncData.products) {
      const existing = await ProductService.getById(product.id)
      if (!existing) {
        await ProductService.create(
          product.name,
          product.costPrice,
          product.salePrice,
          product.quantity || 0
        )
      } else if ((product.updatedAt || 0) > ((existing as any).updatedAt || 0)) {
        await ProductService.update(
          product.id,
          product.name,
          product.costPrice,
          product.salePrice,
          product.quantity
        )
      }
    }

    // Clientes
    for (const client of syncData.clients) {
      const existing = await ClientService.getById(client.id)
      if (!existing) {
        await ClientService.create(client.name, client.phone, client.notes)
      }
    }

    // Consumos
    for (const consumption of syncData.consumptions) {
      const existing = await ConsumptionService._getById(consumption.id)
      if (!existing) {
        await ConsumptionService.create(
          consumption.clientId,
          consumption.productId,
          consumption.quantity,
          consumption.price
        )
      }
    }

    // Pagamentos
    for (const payment of syncData.payments) {
      const existing = await PaymentService.getPayment(
        payment.clientId,
        payment.month,
        payment.year
      )
      if (!existing) {
        await PaymentService.create(
          payment.clientId,
          payment.month,
          payment.year,
          payment.isPaid
        )
      }
    }
  },

  getStatus(): SyncStatus {
    return this.currentStatus
  },
}
