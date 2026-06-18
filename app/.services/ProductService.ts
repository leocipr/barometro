import database from '../.db/index'
import Product from '../.db/models/Product'

// In-memory fallback when database is not available
let mockProducts: any[] = []
let mockIdCounter = 1

const createMockProduct = (name: string, costPrice: number, salePrice: number, quantity: number = 0) => ({
  id: `mock_${mockIdCounter++}`,
  name,
  costPrice,
  salePrice,
  quantity,
  initialQuantity: quantity,
  profitPercent: ((salePrice - costPrice) / costPrice) * 100,
  created_at: new Date(),
  updated_at: new Date(),
})

export const ProductService = {
  async create(name: string, costPrice: number, salePrice: number, quantity: number = 0) {
    const now = Date.now()
    const profitPercent = ((salePrice - costPrice) / costPrice) * 100

    if (!database) {
      const product = createMockProduct(name, costPrice, salePrice, quantity)
      mockProducts.push(product)
      return product
    }

    return await database.write(async () => {
      return await database.collections.get('products').create((product: any) => {
        product.name = name
        product.cost_price = costPrice
        product.sale_price = salePrice
        product.quantity = quantity
        product.initial_quantity = quantity
        product.profit_percent = profitPercent
        product.created_at = now
        product.updated_at = now
      })
    })
  },

  async getAll(): Promise<Product[]> {
    if (!database) return mockProducts

    return await database.collections.get('products').query().fetch()
  },

  async getById(id: string): Promise<Product | null> {
    if (!database) {
      return mockProducts.find((p) => p.id === id) || null
    }

    try {
      return await database.collections.get('products').find(id)
    } catch {
      return null
    }
  },

  async update(
    id: string,
    name?: string,
    costPrice?: number,
    salePrice?: number,
    quantity?: number
  ) {
    if (!database) {
      const product = mockProducts.find((p) => p.id === id)
      if (!product) throw new Error('Produto não encontrado')
      if (name !== undefined) product.name = name
      if (costPrice !== undefined) product.costPrice = costPrice
      if (salePrice !== undefined) product.salePrice = salePrice
      if (quantity !== undefined) product.quantity = quantity
      if (costPrice !== undefined && salePrice !== undefined) {
        product.profitPercent = ((salePrice - costPrice) / costPrice) * 100
      }
      product.updated_at = new Date()
      return product
    }

    const product = await this.getById(id)
    if (!product) throw new Error('Produto não encontrado')

    return await database.write(async () => {
      await product.update((p: any) => {
        if (name !== undefined) p.name = name
        if (costPrice !== undefined) p.cost_price = costPrice
        if (salePrice !== undefined) p.sale_price = salePrice
        if (quantity !== undefined) p.quantity = quantity

        if (costPrice !== undefined && salePrice !== undefined) {
          p.profit_percent = ((salePrice - costPrice) / costPrice) * 100
        }

        p.updated_at = Date.now()
      })
    })
    return product
  },

  async delete(id: string) {
    if (!database) {
      mockProducts = mockProducts.filter((p) => p.id !== id)
      return
    }

    const product = await this.getById(id)
    if (!product) throw new Error('Produto não encontrado')

    return await database.write(async () => {
      await product.destroyPermanently()
    })
  },
}
