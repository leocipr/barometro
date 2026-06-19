import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class Payment extends Model {
  static table = 'payments'

  @field('client_id') clientId!: string
  @field('month') month!: number
  @field('year') year!: number
  @field('is_paid') isPaid!: boolean
  @field('paid_at') paidAt?: number
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
