#!/bin/bash

echo "🧪 BARômetro WiFi Sync - Teste de Funcionalidade"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Inicia o servidor em background
echo "🚀 Iniciando servidor de sincronização..."
node sync-server-v2.js &
SERVER_PID=$!
sleep 2

# Testa health check
echo ""
echo "📋 Teste 1: Health Check"
RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ Servidor está online${NC}"
else
    echo -e "${RED}✗ Servidor não respondeu${NC}"
    kill $SERVER_PID
    exit 1
fi

# Testa upload
echo ""
echo "📋 Teste 2: Upload de Dados"
UPLOAD_DATA='{
  "products": [
    {
      "id": "prod_1",
      "name": "Cerveja Brahma 600ml",
      "costPrice": 15.50,
      "salePrice": 25.00,
      "profitPercent": 61.29,
      "quantity": 100,
      "initialQuantity": 200,
      "updatedAt": 1234567890
    }
  ],
  "clients": [
    {
      "id": "cli_1",
      "name": "Bar do João",
      "phone": "11 98765-4321",
      "notes": "Paga às quintas",
      "updatedAt": 1234567890
    }
  ],
  "consumptions": [],
  "payments": [],
  "timestamp": 1234567890,
  "deviceId": "device_test_1"
}'

RESPONSE=$(curl -s -X POST http://localhost:3000/sync/upload \
  -H "Content-Type: application/json" \
  -d "$UPLOAD_DATA")

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Upload de dados funcionando${NC}"
else
    echo -e "${RED}✗ Upload falhou${NC}"
    echo "Resposta: $RESPONSE"
fi

# Testa download
echo ""
echo "📋 Teste 3: Download de Dados"
RESPONSE=$(curl -s http://localhost:3000/sync/download)

if echo "$RESPONSE" | grep -q "products"; then
    echo -e "${GREEN}✓ Download de dados funcionando${NC}"
    PRODUCT_COUNT=$(echo "$RESPONSE" | grep -o '"products":\[' | wc -l)
    echo "  Produtos recebidos: $PRODUCT_COUNT"
else
    echo -e "${RED}✗ Download falhou${NC}"
fi

# Testa status
echo ""
echo "📋 Teste 4: Status do Servidor"
RESPONSE=$(curl -s http://localhost:3000/sync/status)

if echo "$RESPONSE" | grep -q "lastUpdate"; then
    echo -e "${GREEN}✓ Status endpoint funcionando${NC}"
    echo "Resposta: $RESPONSE"
else
    echo -e "${RED}✗ Status endpoint falhou${NC}"
fi

# Encerra o servidor
echo ""
echo "🛑 Encerrando servidor de teste..."
kill $SERVER_PID

echo ""
echo -e "${GREEN}✅ Todos os testes concluídos!${NC}"
echo ""
echo "Para iniciar o servidor em produção, execute:"
echo -e "${YELLOW}npm run sync-server${NC}"
