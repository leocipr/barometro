const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const os = require('os')

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Armazenar dados sincronizados
let syncData = {
  products: [],
  clients: [],
  consumptions: [],
  payments: [],
  lastUpdate: Date.now(),
}

// Função para obter IP da máquina
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar IPv6 e localhost
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    ip: getLocalIP(),
    port: PORT,
  })
})

// Upload de dados
app.post('/sync/upload', (req, res) => {
  try {
    const incomingData = req.body

    // Estratégia: Last-Write-Wins (LWW) - comparar timestamp
    syncData.products = mergeLWW(syncData.products, incomingData.products || [])
    syncData.clients = mergeLWW(syncData.clients, incomingData.clients || [])
    syncData.consumptions = mergeLWW(syncData.consumptions, incomingData.consumptions || [])
    syncData.payments = mergeLWW(syncData.payments, incomingData.payments || [])
    syncData.lastUpdate = Date.now()

    res.json({
      status: 'success',
      message: 'Dados sincronizados com sucesso',
      timestamp: syncData.lastUpdate,
    })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// Download de dados
app.get('/sync/download', (req, res) => {
  try {
    res.json({
      ...syncData,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Erro ao fazer download:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// Retornar timestamp da última sincronização
app.get('/sync/status', (req, res) => {
  res.json({
    lastUpdate: syncData.lastUpdate,
    itemCount: {
      products: syncData.products.length,
      clients: syncData.clients.length,
      consumptions: syncData.consumptions.length,
      payments: syncData.payments.length,
    },
  })
})

// Limpar todos os dados (apenas para debug)
app.post('/sync/reset', (req, res) => {
  syncData = {
    products: [],
    clients: [],
    consumptions: [],
    payments: [],
    lastUpdate: Date.now(),
  }
  res.json({ status: 'success', message: 'Dados resetados' })
})

// Função para fazer merge com Last-Write-Wins
function mergeLWW(existing, incoming) {
  const merged = {}

  // Adicionar dados existentes
  for (const item of existing) {
    merged[item.id] = item
  }

  // Fazer merge com incoming
  for (const item of incoming) {
    if (!merged[item.id] || item.updatedAt > (merged[item.id].updatedAt || 0)) {
      merged[item.id] = item
    }
  }

  return Object.values(merged)
}

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP()
  console.log(`
╔════════════════════════════════════════╗
║   BARômetro Sync Server                ║
╚════════════════════════════════════════╝
🚀 Servidor rodando em: http://${ip}:${PORT}
📱 Use este IP em outro dispositivo para sincronizar
⏰ Aguardando conexões...
  `)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Servidor encerrado')
  server.close()
  process.exit(0)
})
