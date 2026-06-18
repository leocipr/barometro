import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class Consumption extends Model {
  static table = 'consumptions'

  @field('client_id') clientId!: string
  @field('product_id') productId!: string
  @field('quantity') quantity!: number
  @field('price') price!: number
  @field('timestamp') timestamp!: number
  @field('device_origin') deviceOrigin!: string
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
