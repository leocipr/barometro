# 🚀 Quick Start - Barômetro App

## ⚡ Início Rápido em 5 Minutos

### Passo 1: Instalar e Rodar

```bash
cd d:\Projetos\barometro
npm start
```

### Passo 2: Abrir no Emulador/Dispositivo

- **No emulador Android Studio**: Pressione `a` no terminal
- **Expo Go**: Escaneie o QR code com seu telefone
- **Dispositivo real**: Conectar USB e pressionar `a`

### Passo 3: Testar as Funcionalidades

1. **Aba "Produtos"**: Crie um produto de teste
   - Nome: Cerveja
   - Custo: 5.00
   - Venda: 10.00

2. **Aba "Clientes"**: Crie um cliente
   - Nome: João
   - Telefone: +5511999999999

3. **Aba "Lançamentos"**: Registre um consumo
   - Cliente: João
   - Produto: Cerveja
   - Quantidade: 2

4. **Aba "Faturas"**: Gere fatura do mês
   - Deve mostrar "Cerveja x 2 = R$ 20.00"

5. **Aba "Sincronizar"**: (Teste mais adiante com 2 dispositivos)

## 📱 O que foi Implementado

✅ **Banco de Dados Local** (WatermelonDB + SQLite)
- Produtos (nome, custo, venda, % lucro)
- Clientes (nome, telefone, notas)
- Consumos (cliente, produto, quantidade, data/hora)

✅ **Telas e Funcionalidades**
- Gerenciar Produtos (CRUD)
- Gerenciar Clientes (CRUD)
- Registrar Consumos
- Gerar Faturas Mensais
- Enviar via WhatsApp

✅ **Sincronização Local**
- Dois dispositivos na mesma WiFi
- Manual (pull de um para o outro)
- Estratégia: Última gravação vence

✅ **Suporte Android**
- Aplicativo nativo (.apk)
- Compatível com Android 8+

## 🔧 Arquitetura do Projeto

```
d:\Projetos\barometro/
├── app/
│   ├── (tabs)/                    # Abas principais
│   │   ├── _layout.tsx            # Layout das abas
│   │   ├── index.tsx              # Home
│   │   ├── explore.tsx            # Explore
│   │   ├── products.tsx           # Gerenciar Produtos
│   │   ├── clients.tsx            # Gerenciar Clientes
│   │   ├── consumptions.tsx       # Registrar Consumos
│   │   ├── invoices.tsx           # Gerar Faturas
│   │   └── sync.tsx               # Sincronizar Dados
│   ├── db/                         # Banco de Dados
│   │   ├── schema.ts              # Schema do banco
│   │   ├── index.ts               # Inicialização
│   │   └── models/                # Modelos (Product, Client, Consumption)
│   ├── services/                   # Lógica de negócio
│   │   ├── ProductService.ts      # CRUD de Produtos
│   │   ├── ClientService.ts       # CRUD de Clientes
│   │   ├── ConsumptionService.ts  # Registros de Consumo
│   │   ├── InvoiceService.ts      # Geração de Faturas
│   │   ├── SyncService.ts         # Sincronização
│   │   └── NetworkDiscoveryService.ts # Descoberta de dispositivos
│   ├── hooks/                      # React Hooks customizados
│   └── components/                 # Componentes UI
├── android/                        # Código nativo Android (gerado)
├── package.json                    # Dependências
├── tsconfig.json                   # Configuração TypeScript
├── TESTING.md                      # Guia de Testes
├── README_APP.md                   # Documentação Completa
└── sync-server.js                  # Servidor para testes de sincronização
```

## 📦 Dependências Principais

```json
{
  "@nozbe/watermelondb": "0.28.0",           // Banco de dados reativo
  "react-native-sqlite-storage": "6.0.1",    // Driver SQLite nativo
  "@react-native-picker/picker": "2.11.4",   // Picker para seleção
  "react-native-device-info": "15.0.2",      // Info do dispositivo
  "react-native-zeroconf": "0.14.0",         // mDNS discovery (preparado)
  "uuid": "14.0.0",                          // UUIDs únicos
  "react-native-get-random-values": "2.0.0"  // Random values para UUID
}
```

## 🎯 Próximas Etapas

### Para Testar Agora

1. **Teste individual no emulador**:
   ```bash
   npm start  # (servidor já está rodando)
   # Pressione 'a' para abrir Android
   ```

2. **Teste de sincronização com 2 emuladores**:
   ```bash
   # Terminal 1: npm start
   # Terminal 2: Abra outro emulador e `npm start` nele também
   # Sincronize IP de um para o outro em http://10.0.2.2:3000
   ```

3. **Teste com 2 dispositivos reais**:
   ```bash
   # Terminal 1: node sync-server.js (no seu PC)
   # Descobra seu IP: ipconfig | grep "IPv4"
   # No app, adicione dispositivo com esse IP na aba Sincronizar
   ```

### Melhorias Futuras

- [ ] Login/Autenticação de múltiplos admins
- [ ] Histórico de preços
- [ ] Relatórios avançados (gráficos)
- [ ] Backup na nuvem
- [ ] Sincronização automática (background)
- [ ] Suporte iOS
- [ ] Servidor HTTP nativo em RN

## 🆘 Solução Rápida de Problemas

**App não compila?**
```bash
npm cache clean --force
npm install
npx expo start --clear
```

**Sincronização não funciona?**
- Certifique-se de ambos os dispositivos estão na **mesma rede WiFi**
- Verifique o IP com: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Teste ping: `ping <IP_DO_DISPOSITIVO>`

**WhatsApp não abre?**
- Verifique se o formato do telefone está correto: `+5511999999999`
- Instale WhatsApp no dispositivo
- Tente copiar manualmente e enviar

## 📚 Documentação Completa

- [README_APP.md](README_APP.md) - Guia completo de uso
- [TESTING.md](TESTING.md) - Testes detalhados
- [SETUP_WATERMELONDB.md](SETUP_WATERMELONDB.md) - Setup técnico

## ✅ Checklist de Funcionalidades

### Implementadas ✅

- [x] Banco de dados local com WatermelonDB
- [x] Modelo de Produtos (CRUD)
- [x] Modelo de Clientes (CRUD)
- [x] Modelo de Consumos (Create + List)
- [x] Geração de Faturas (agrupamento por produto)
- [x] Envio via WhatsApp (links pré-preenchidos)
- [x] Sincronização manual entre dispositivos
- [x] Interface com 6 abas principais
- [x] Cálculo automático de margem de lucro
- [x] Persistência de dados em SQLite

### Não Implementadas (Futuro)

- [ ] Autenticação de usuários
- [ ] Sincronização automática em background
- [ ] Servidor HTTP nativo (atualmente manual)
- [ ] Backup automático na nuvem
- [ ] Suporte iOS
- [ ] Relatórios e gráficos

---

## 🎉 Você está Pronto!

O app está totalmente funcional para:
1. Cadastrar e gerenciar produtos
2. Cadastrar e gerenciar clientes
3. Registrar consumos em tempo real
4. Gerar faturas mensais automáticas
5. Enviar faturas via WhatsApp
6. Sincronizar dados entre 2 dispositivos na mesma rede

**Próximo passo**: Leia [TESTING.md](TESTING.md) para testar todas as funcionalidades.

---

**Desenvolvido com ❤️ para otimizar seu negócio no mar!** 🌊⛵

Para mais informações ou problemas, consulte a documentação ou abra uma issue.
