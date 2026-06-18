import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'cost_price', type: 'number' },
        { name: 'sale_price', type: 'number' },
        { name: 'profit_percent', type: 'number' },
        { name: 'quantity', type: 'number', isOptional: true },
        { name: 'initial_quantity', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'clients',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'consumptions',
      columns: [
        { name: 'client_id', type: 'string' },
        { name: 'product_id', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'price', type: 'number' },
        { name: 'timestamp', type: 'number' },
        { name: 'device_origin', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
})
