import database from '../.db/index'
import Consumption from '../.db/models/Consumption'
import { PaymentService } from './PaymentService'
import { ProductService } from './ProductService'

// In-memory fallback when database is not available
let mockConsumptions: any[] = []
let mockIdCounter = 1

const createMockConsumption = (
  clientId: string,
  productId: string,
  quantity: number,
  price: number,
  deviceId: string
) => ({
  id: `mock_${mockIdCounter++}`,
  clientId,
  productId,
  quantity,
  price,
  timestamp: Date.now(),
  deviceOrigin: deviceId,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const ConsumptionService = {
  async create(clientId: string, productId: string, quantity: number, price: number) {
    const now = Date.now()
    const deviceId = await this._getDeviceId()

    if (!database) {
      const consumption = createMockConsumption(clientId, productId, quantity, price, deviceId)
      mockConsumptions.push(consumption)
      
      // Update mock product quantity
      const product = await ProductService.getById(productId)
      if (product) {
        const newQuantity = (product.quantity || 0) - quantity
        await ProductService.update(productId, undefined, undefined, undefined, newQuantity)
      }
      
      return consumption
    }

    const product = await ProductService.getById(productId)
    if (!product) throw new Error('Produto não encontrado')
    
    const newQuantity = (product.quantity || 0) - quantity
    
    return await database.write(async () => {
      await ProductService.update(productId, undefined, undefined, undefined, newQuantity)
      
      return await database.collections.get('consumptions').create((consumption: any) => {
        consumption.clientId = clientId
        consumption.productId = productId
        consumption.quantity = quantity
        consumption.price = price
        consumption.timestamp = now
        consumption.deviceOrigin = deviceId
        consumption.createdAt = now
        consumption.updatedAt = now
      })
    })
  },

  async getAll(): Promise<Consumption[]> {
    if (!database) return mockConsumptions

    return await database.collections.get('consumptions').query().fetch()
  },

  async getByClientId(clientId: string): Promise<Consumption[]> {
    if (!database) {
      return mockConsumptions.filter((c) => c.clientId === clientId)
    }

    return await database.collections
      .get('consumptions')
      .query()
      .fetch()
      .then((consumptions) => consumptions.filter((c) => c.clientId === clientId))
  },

  async getByMonth(year: number, month: number): Promise<Consumption[]> {
    const startDate = new Date(year, month - 1, 1).getTime()
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime()

    if (!database) {
      return mockConsumptions.filter(
        (c) => c.timestamp >= startDate && c.timestamp <= endDate
      )
    }

    return await database.collections
      .get('consumptions')
      .query()
      .fetch()
      .then((consumptions) =>
        consumptions.filter(
          (c) => c.timestamp >= startDate && c.timestamp <= endDate
        )
      )
  },

  async getByClientAndMonth(
    clientId: string,
    year: number,
    month: number
  ): Promise<Consumption[]> {
    const startDate = new Date(year, month - 1, 1).getTime()
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime()

    if (!database) {
      return mockConsumptions.filter(
        (c) =>
          c.clientId === clientId &&
          c.timestamp >= startDate &&
          c.timestamp <= endDate
      )
    }

    return await database.collections
      .get('consumptions')
      .query()
      .fetch()
      .then((consumptions) =>
        consumptions.filter(
          (c) =>
            c.client_id === clientId &&
            c.timestamp >= startDate &&
            c.timestamp <= endDate
        )
      )
  },

  async delete(id: string) {
    if (!database) {
      mockConsumptions = mockConsumptions.filter((c) => c.id !== id)
      return
    }

    const consumption = await this._getById(id)
    if (!consumption) throw new Error('Lançamento não encontrado')

    return await database.write(async () => {
      await consumption.destroyPermanently()
    })
  },

  async _getById(id: string): Promise<Consumption | null> {
    if (!database) {
      return mockConsumptions.find((c) => c.id === id) || null
    }

    try {
      return await database.collections.get('consumptions').find(id)
    } catch {
      return null
    }
  },

  async _getDeviceId(): Promise<string> {
    // Generate a simple pseudo-random device ID
    // In Expo Go, native modules like react-native-device-info won't work
    // So we create a persistent-like ID based on timestamp and randomness
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    return `device_${timestamp}_${random}`
  },

  async getLastTwoMonthsInvoices(clientId: string): Promise<{ month: number; year: number; total: number; isPaid: boolean }[]> {
    const consumptions = await this.getByClientId(clientId)
    const now = new Date()
    const invoices: { month: number; year: number; total: number; isPaid: boolean }[] = []

    // Get last 2 months
    for (let i = 0; i < 2; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const monthConsumptions = consumptions.filter((c) => {
        const consumptionDate = new Date(c.timestamp)
        return consumptionDate.getMonth() + 1 === month && consumptionDate.getFullYear() === year
      })

      if (monthConsumptions.length > 0) {
        const total = monthConsumptions.reduce((sum, c) => sum + c.quantity * (c.price || 0), 0)
        const isPaid = await PaymentService.getPaymentStatus(clientId, month, year)
        invoices.push({
          month,
          year,
          total,
          isPaid,
        })
      }
    }

    return invoices
  },

  async togglePaymentStatus(clientId: string, month: number, year: number): Promise<boolean> {
    return await PaymentService.togglePaymentStatus(clientId, month, year)
  },

  async getPaymentStatus(clientId: string, month: number, year: number): Promise<boolean> {
    return await PaymentService.getPaymentStatus(clientId, month, year)
  },
}
