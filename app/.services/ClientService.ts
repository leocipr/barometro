import database from '../.db/index'
import Client from '../.db/models/Client'

// In-memory fallback when database is not available
let mockClients: any[] = []
let mockIdCounter = 1

const createMockClient = (name: string, phone: string, notes?: string) => ({
  id: `mock_${mockIdCounter++}`,
  name,
  phone,
  notes: notes || '',
  created_at: new Date(),
  updated_at: new Date(),
})

export const ClientService = {
  async create(name: string, phone: string, notes?: string) {
    const now = Date.now()

    if (!database) {
      const client = createMockClient(name, phone, notes)
      mockClients.push(client)
      return client
    }

    return await database.write(async () => {
      return await database.collections.get('clients').create((client: any) => {
        client.name = name
        client.phone = phone
        client.notes = notes || ''
        client.created_at = now
        client.updated_at = now
      })
    })
  },

  async getAll(): Promise<Client[]> {
    if (!database) return mockClients

    return await database.collections.get('clients').query().fetch()
  },

  async getById(id: string): Promise<Client | null> {
    if (!database) {
      return mockClients.find((c) => c.id === id) || null
    }

    try {
      return await database.collections.get('clients').find(id)
    } catch {
      return null
    }
  },

  async update(id: string, name?: string, phone?: string, notes?: string) {
    if (!database) {
      const client = mockClients.find((c) => c.id === id)
      if (!client) throw new Error('Cliente não encontrado')
      if (name !== undefined) client.name = name
      if (phone !== undefined) client.phone = phone
      if (notes !== undefined) client.notes = notes
      client.updated_at = new Date()
      return client
    }

    const client = await this.getById(id)
    if (!client) throw new Error('Cliente não encontrado')

    return await database.write(async () => {
      await client.update((c: any) => {
        if (name !== undefined) c.name = name
        if (phone !== undefined) c.phone = phone
        if (notes !== undefined) c.notes = notes
        c.updated_at = Date.now()
      })
    })
    return client
  },

  async delete(id: string) {
    if (!database) {
      mockClients = mockClients.filter((c) => c.id !== id)
      return
    }

    const client = await this.getById(id)
    if (!client) throw new Error('Cliente não encontrado')

    return await database.write(async () => {
      await client.destroyPermanently()
    })
  },

  async search(query: string): Promise<Client[]> {
    if (!database) {
      return mockClients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
      )
    }

    return await database.collections
      .get('clients')
      .query()
      .fetch()
      .then((clients) =>
        clients.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query)
        )
      )
  },
}
