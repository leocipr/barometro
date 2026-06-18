import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import Client from './models/Client'
import Consumption from './models/Consumption'
import Product from './models/Product'
import { schema } from './schema'

let database: any = null

try {
  const adapter = new SQLiteAdapter({
    dbName: 'barometro.db',
    schema,
  })

  database = new Database({
    adapter,
    modelClasses: [Product, Client, Consumption],
  })
} catch (error) {
  console.warn(
    'WatermelonDB initialization failed (this is expected in Expo Go):',
    error
  )
  database = null
}

export default database
