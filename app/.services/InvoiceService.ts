import { ClientService } from './ClientService'
import { ConsumptionService } from './ConsumptionService'
import { ProductService } from './ProductService'

export interface InvoiceItem {
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Invoice {
  clientId: string
  clientName: string
  clientPhone: string
  month: number
  year: number
  items: InvoiceItem[]
  totalAmount: number
  invoiceDate: Date
}

export const InvoiceService = {
  async generateInvoice(clientId: string, year: number, month: number): Promise<Invoice> {
    const client = await ClientService.getById(clientId)
    if (!client) throw new Error('Cliente não encontrado')

    const consumptions = await ConsumptionService.getByClientAndMonth(
      clientId,
      year,
      month
    )

    const items: InvoiceItem[] = []
    let totalAmount = 0

    // Agrupar consumos por produto
    const consumptionByProduct: { [key: string]: { quantity: number; price: number } } = {}

    for (const consumption of consumptions) {
      if (!consumptionByProduct[consumption.productId]) {
        consumptionByProduct[consumption.productId] = { quantity: 0, price: 0 }
      }
      consumptionByProduct[consumption.productId].quantity += consumption.quantity
      consumptionByProduct[consumption.productId].price = consumption.price
    }

    // Converter para items
    for (const productId in consumptionByProduct) {
      const product = await ProductService.getById(productId)
      if (product) {
        const { quantity, price } = consumptionByProduct[productId]
        const itemTotal = quantity * price
        items.push({
          productName: product.name,
          quantity,
          unitPrice: price,
          totalPrice: itemTotal,
        })
        totalAmount += itemTotal
      }
    }

    return {
      clientId,
      clientName: client.name,
      clientPhone: client.phone,
      month,
      year,
      items,
      totalAmount,
      invoiceDate: new Date(),
    }
  },

  async generateInvoiceText(invoice: Invoice): Promise<string> {
    const monthName = new Date(invoice.year, invoice.month - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })

    let text = `📋 Fatura de Consumo - ${monthName}\n\n`
    text += `Cliente: ${invoice.clientName}\n`
    text += `Data: ${invoice.invoiceDate.toLocaleDateString('pt-BR')}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    text += `💰 Total: R$ ${invoice.totalAmount.toFixed(2)}\n\n`
    text += `🏦 PIX: [Aguardando chave PIX]\n\n`
    text += `Obrigado pela preferência! 🙏`

    return text
  },

  getWhatsAppLink(phone: string, message: string): string {
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${phone}?text=${encodedMessage}`
  },
}
