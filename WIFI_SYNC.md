# BARômetro WiFi Sync - Guia de Uso

## O que é WiFi Sync?

O WiFi Sync permite que dois ou mais dispositivos (tablets/smartphones) conectados na mesma rede WiFi sincronizem dados automaticamente. Todos os dados de produtos, clientes, consumos e pagamentos são sincronizados em tempo real.

## Como Configurar

### 1. Instalar Dependências do Servidor

Primeiro, instale as dependências do servidor de sincronização:

```bash
npm install
```

### 2. Iniciar o Servidor de Sincronização

Em um computador conectado à mesma rede WiFi dos dispositivos, execute:

```bash
npm run sync-server
```

Você verá uma mensagem como:

```
╔════════════════════════════════════════╗
║   BARômetro Sync Server                ║
╚════════════════════════════════════════╝
🚀 Servidor rodando em: http://192.168.1.100:3000
📱 Use este IP em outro dispositivo para sincronizar
⏰ Aguardando conexões...
```

**IMPORTANTE**: Anote o IP mostrado (ex: 192.168.1.100)

### 3. Configurar Sincronização no Aplicativo

#### Opção A: Descoberta Automática (Recomendado)

1. Abra o app em cada dispositivo
2. Vá para a aba **"Sincronizar"**
3. Clique em **"Procurar na Rede"**
4. Aguarde até 10 segundos - o servidor será encontrado automaticamente
5. Clique em **"Sincronizar"** no dispositivo encontrado

#### Opção B: Adicionar Manualmente

1. Abra o app em cada dispositivo
2. Vá para a aba **"Sincronizar"**
3. Digite o IP do servidor (ex: 192.168.1.100)
4. Clique em **"Adicionar"**
5. Clique em **"Sincronizar"**

## Fluxo de Sincronização

1. **Upload**: O dispositivo envia todos os seus dados (produtos, clientes, consumos, pagamentos)
2. **Merge**: O servidor faz merge dos dados usando estratégia "Last-Write-Wins" (LWW)
3. **Download**: O dispositivo baixa os dados do servidor (incluindo dados de outros dispositivos)

## Estratégia de Merge (Last-Write-Wins)

Se dois dispositivos editam o mesmo produto/cliente ao mesmo tempo:
- O registro com `updatedAt` mais recente prevalece
- Isso evita conflitos simples de sincronização
- Para conflitos complexos, a última edição prevalece

## Endpoints do Servidor

### GET `/health`
Verifica se o servidor está online.

```bash
curl http://192.168.1.100:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "ip": "192.168.1.100",
  "port": 3000
}
```

### POST `/sync/upload`
Faz upload de dados do dispositivo para o servidor.

### GET `/sync/download`
Baixa dados sincronizados do servidor.

### GET `/sync/status`
Verifica status da sincronização.

Resposta:
```json
{
  "lastUpdate": 1234567890,
  "itemCount": {
    "products": 15,
    "clients": 8,
    "consumptions": 42,
    "payments": 24
  }
}
```

### POST `/sync/reset`
Limpa todos os dados no servidor (apenas para debug).

## Formato dos Dados Sincronizados

Todos os dados são sincronizados em formato camelCase (aplicação):

### Produtos
```json
{
  "id": "uuid",
  "name": "Cerveja Brahma 600ml",
  "costPrice": 15.50,
  "salePrice": 25.00,
  "profitPercent": 61.29,
  "quantity": 120,
  "initialQuantity": 200,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

### Clientes
```json
{
  "id": "uuid",
  "name": "Bar do João",
  "phone": "11 98765-4321",
  "notes": "Paga às quintas",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

### Consumos
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "productId": "uuid",
  "quantity": 12,
  "price": 300.00,
  "timestamp": 1234567890,
  "deviceOrigin": "device_1234567890_abc123",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

### Pagamentos
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "month": 1,
  "year": 2024,
  "isPaid": true,
  "paidAt": 1234567890,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

## Troubleshooting

### "Nenhum dispositivo encontrado"

1. Verifique se o servidor está rodando: `npm run sync-server`
2. Verifique se ambos os dispositivos estão na mesma rede WiFi
3. Tente adicionar o IP manualmente
4. Tente pingar o servidor: `ping 192.168.1.100`

### "Erro ao conectar"

1. Verifique se o firewall permite conexões na porta 3000
2. Tente acessar http://192.168.1.100:3000/health no navegador
3. Reinicie o servidor: Ctrl+C e execute `npm run sync-server` novamente

### "Dados não sincronizaram"

1. Clique em "Testar" antes de sincronizar
2. Verifique se há internet (pode funcionar sem, mas requer rede local)
3. Verifique os logs do servidor (aparecem no terminal)
4. Tente sincronizar novamente

## Boas Práticas

1. **Sincronize regularmente**: A cada 15-30 minutos durante o expediente
2. **Inicie o servidor no início do dia**: Mantenha o servidor rodando em um computador confiável
3. **Backup**: Faça backup regularmente dos dados
4. **Testes**: Teste a sincronização antes de usá-la em produção com dados reais
5. **Monitoramento**: Verifique se os dados estão sincronizando corretamente

## Limitações Atuais

- WiFi Sync não funciona com internet (apenas rede local)
- Sem autenticação/segurança (apenas para rede local privada)
- Sem criptografia (dados em texto claro)
- Sem suporte para mais de 2 dispositivos simultaneamente

## Próximas Melhorias

- [ ] Autenticação com token
- [ ] Criptografia de dados
- [ ] Sincronização contínua em background
- [ ] Histórico de sincronização
- [ ] Conflito avançado (3-way merge)
- [ ] WiFi automático (sem servidor externo)
