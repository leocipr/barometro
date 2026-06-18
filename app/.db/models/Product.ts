import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class Product extends Model {
  static table = 'products'

  @field('name') name!: string
  @field('cost_price') costPrice!: number
  @field('sale_price') salePrice!: number
  @field('profit_percent') profitPercent!: number
  @field('quantity') quantity?: number
  @field('initial_quantity') initialQuantity?: number
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
