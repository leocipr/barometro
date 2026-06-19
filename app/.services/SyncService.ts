import database from '../.db/index'
import { ClientService } from './ClientService'
import { ConsumptionService } from './ConsumptionService'
import { ProductService } from './ProductService'
import { PaymentService } from './PaymentService'

export interface SyncData {
  products: any[]
  clients: any[]
  consumptions: any[]
  payments: any[]
  timestamp: number
  deviceId: string
}

export const SyncService = {
  async exportData(): Promise<SyncData> {
    try {
      const [products, clients, consumptions] = await Promise.all([
        ProductService.getAll(),
        ClientService.getAll(),
        ConsumptionService.getAll(),
      ])

      // Get all payments from mock or database
      const allPayments = (await PaymentService.getByClient('')) || []

      return {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          costPrice: p.costPrice || p.cost_price,
          salePrice: p.salePrice || p.sale_price,
          profitPercent: p.profitPercent || p.profit_percent,
          quantity: p.quantity,
          initialQuantity: p.initialQuantity || p.initial_quantity,
          createdAt: p.createdAt || p.created_at,
          updatedAt: p.updatedAt || p.updated_at,
        })),
        clients: clients.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          notes: c.notes,
          createdAt: c.createdAt || c.created_at,
          updatedAt: c.updatedAt || c.updated_at,
        })),
        consumptions: consumptions.map((c) => ({
          id: c.id,
          clientId: c.clientId || c.client_id,
          productId: c.productId || c.product_id,
          quantity: c.quantity,
          price: c.price,
          timestamp: c.timestamp,
          deviceOrigin: c.deviceOrigin || c.device_origin,
          createdAt: c.createdAt || c.created_at,
          updatedAt: c.updatedAt || c.updated_at,
        })),
        payments: allPayments.map((p: any) => ({
          id: p.id,
          clientId: p.clientId || p.client_id,
          month: p.month,
          year: p.year,
          isPaid: p.isPaid || p.is_paid,
          paidAt: p.paidAt || p.paid_at,
          createdAt: p.createdAt || p.created_at,
          updatedAt: p.updatedAt || p.updated_at,
        })),
        timestamp: Date.now(),
        deviceId: 'device_' + Date.now(),
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  },
        })),
        timestamp: Date.now(),
        deviceId: 'device_' + Date.now(), // Pode ser melhorado com deviceInfo
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  },

  async importData(syncData: SyncData): Promise<void> {
    try {
      // Para simplificar, vamos usar uma estratégia de última gravação vence (last-write-wins)
      
      // Sincronizar produtos
      for (const productData of syncData.products) {
        const existing = await ProductService.getById(productData.id)
        if (!existing) {
          // Criar novo
          await database.write(async () => {
            await database.collections.get('products').create((p: any) => {
              p._raw = {
                id: productData.id,
                created_at: productData.created_at,
              }
              p.name = productData.name
              p.cost_price = productData.cost_price
              p.sale_price = productData.sale_price
              p.profit_percent = productData.profit_percent
              p.updated_at = productData.updated_at
            })
          })
        } else if (productData.updated_at > existing.updatedAt) {
          // Atualizar se o remoto é mais recente
          await ProductService.update(
            productData.id,
            productData.name,
            productData.cost_price,
            productData.sale_price
          )
        }
      }

      // Sincronizar clientes
      for (const clientData of syncData.clients) {
        const existing = await ClientService.getById(clientData.id)
        if (!existing) {
          // Criar novo
          await database.write(async () => {
            await database.collections.get('clients').create((c: any) => {
              c._raw = {
                id: clientData.id,
                created_at: clientData.created_at,
              }
              c.name = clientData.name
              c.phone = clientData.phone
              c.notes = clientData.notes
              c.updated_at = clientData.updated_at
            })
          })
        } else if (clientData.updated_at > existing.updatedAt) {
          // Atualizar se o remoto é mais recente
          await ClientService.update(
            clientData.id,
            clientData.name,
            clientData.phone,
            clientData.notes
          )
        }
      }

      // Sincronizar consumos
      for (const consumptionData of syncData.consumptions) {
        try {
          const existing = await ConsumptionService._getById(consumptionData.id)
          if (!existing) {
            // Criar novo
            await database.write(async () => {
              await database.collections.get('consumptions').create((c: any) => {
                c._raw = {
                  id: consumptionData.id,
                  created_at: consumptionData.created_at,
                }
                c.client_id = consumptionData.client_id
                c.product_id = consumptionData.product_id
                c.quantity = consumptionData.quantity
                c.price = consumptionData.price
                c.timestamp = consumptionData.timestamp
                c.device_origin = consumptionData.device_origin
                c.updated_at = consumptionData.updated_at
              })
            })
          }
          // Para consumos, nunca atualizamos, apenas sincronizamos novos (imutáveis)
        } catch (error) {
          console.error('Erro ao sincronizar consumo:', error)
        }
      }

      console.log('Dados sincronizados com sucesso')
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      throw error
    }
  },
}
