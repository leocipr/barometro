import database from '../.db/index'
import Payment from '../.db/models/Payment'

// In-memory fallback when database is not available
let mockPayments: any[] = []

const createMockPayment = (clientId: string, month: number, year: number, isPaid: boolean) => ({
  id: `mock_payment_${clientId}_${month}_${year}`,
  clientId,
  month,
  year,
  isPaid,
  paidAt: isPaid ? Date.now() : null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const PaymentService = {
  async create(clientId: string, month: number, year: number, isPaid: boolean = false) {
    const now = Date.now()

    if (!database) {
      const payment = createMockPayment(clientId, month, year, isPaid)
      mockPayments.push(payment)
      return payment
    }

    return await database.write(async () => {
      return await database.collections.get('payments').create((payment: any) => {
        payment.clientId = clientId
        payment.month = month
        payment.year = year
        payment.isPaid = isPaid
        payment.paidAt = isPaid ? now : null
        payment.createdAt = now
        payment.updatedAt = now
      })
    })
  },

  async getPaymentStatus(
    clientId: string,
    month: number,
    year: number
  ): Promise<boolean> {
    const payment = await this.getPayment(clientId, month, year)
    return payment ? payment.isPaid : false
  },

  async getPayment(clientId: string, month: number, year: number): Promise<Payment | null> {
    if (!database) {
      return (
        mockPayments.find(
          (p) => p.clientId === clientId && p.month === month && p.year === year
        ) || null
      )
    }

    try {
      const payments = await database.collections
        .get('payments')
        .query()
        .fetch()
      return (
        (payments.find(
          (p) => p.clientId === clientId && p.month === month && p.year === year
        ) as Payment) || null
      )
    } catch {
      return null
    }
  },

  async togglePaymentStatus(
    clientId: string,
    month: number,
    year: number
  ): Promise<boolean> {
    const existing = await this.getPayment(clientId, month, year)
    const newStatus = existing ? !existing.isPaid : true

    if (!database) {
      if (existing) {
        existing.isPaid = newStatus
        existing.paidAt = newStatus ? Date.now() : null
        existing.updatedAt = new Date()
      } else {
        const payment = createMockPayment(clientId, month, year, newStatus)
        mockPayments.push(payment)
      }
      return newStatus
    }

    if (existing) {
      return await database.write(async () => {
        await existing.update((payment: any) => {
          payment.isPaid = newStatus
          payment.paidAt = newStatus ? Date.now() : null
          payment.updatedAt = Date.now()
        })
        return newStatus
      })
    } else {
      await this.create(clientId, month, year, newStatus)
      return newStatus
    }
  },

  async getByClient(clientId: string): Promise<Payment[]> {
    if (!database) {
      return mockPayments.filter((p) => p.clientId === clientId)
    }

    try {
      const payments = await database.collections
        .get('payments')
        .query()
        .fetch()
      return (payments.filter((p) => p.clientId === clientId) as Payment[]) || []
    } catch {
      return []
    }
  },

  async deletePayment(clientId: string, month: number, year: number) {
    if (!database) {
      mockPayments = mockPayments.filter(
        (p) => !(p.clientId === clientId && p.month === month && p.year === year)
      )
      return
    }

    const payment = await this.getPayment(clientId, month, year)
    if (!payment) return

    return await database.write(async () => {
      await payment.destroyPermanently()
    })
  },
}
