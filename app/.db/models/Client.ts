import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class Client extends Model {
  static table = 'clients'

  @field('name') name!: string
  @field('phone') phone!: string
  @field('notes') notes?: string
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
