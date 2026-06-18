/**
 * Servidor HTTP simples para sincronização local
 * Para rodar: node sync-server.js
 * O servidor ficará disponível em http://localhost:3000
 */

const http = require('http')
const { v4: uuidv4 } = require('uuid')

// Base de dados em memória (para teste)
let syncData = {
  products: [],
  clients: [],
  consumptions: [],
  timestamp: Date.now(),
  deviceId: `device_${uuidv4()}`,
}

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Rota de health check
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'ok', deviceId: syncData.deviceId }))
    return
  }

  // Rota para exportar dados
  if (req.url === '/api/sync/export' && req.method === 'GET') {
    res.writeHead(200)
    res.end(JSON.stringify(syncData))
    return
  }

  // Rota para importar dados (POST)
  if (req.url === '/api/sync/import' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const incomingData = JSON.parse(body)

        // Mesclar dados com estratégia last-write-wins
        syncData.products = mergeArray(syncData.products, incomingData.products)
        syncData.clients = mergeArray(syncData.clients, incomingData.clients)
        syncData.consumptions = mergeArray(
          syncData.consumptions,
          incomingData.consumptions
        )
        syncData.timestamp = Date.now()

        res.writeHead(200)
        res.end(JSON.stringify({ success: true, timestamp: syncData.timestamp }))
      } catch (error) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
    return
  }

  // 404
  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

function mergeArray(local, remote) {
  const merged = { ...local }

  remote.forEach((item) => {
    const existing = merged.find((m) => m.id === item.id)
    if (!existing || item.updated_at > existing.updated_at) {
      merged[item.id] = item
    }
  })

  return Object.values(merged)
}

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`📡 Sync Server rodando em http://localhost:${PORT}`)
  console.log(`Device ID: ${syncData.deviceId}`)
  console.log(`\nEndpoints disponíveis:`)
  console.log(`  GET  /api/health         - Health check`)
  console.log(`  GET  /api/sync/export    - Exportar dados`)
  console.log(`  POST /api/sync/import    - Importar dados`)
})
