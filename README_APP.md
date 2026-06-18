# 📱 Barômetro - App de Controle de Bar

Aplicativo mobile (Android) para gerenciar clientes, produtos e consumos em um bar com sincronização local via WiFi.

## 🎯 Funcionalidades

- ✅ Cadastro de Clientes (com telefone para WhatsApp)
- ✅ Cadastro de Produtos (com preço de custo, venda e % lucro)
- ✅ Registrar Consumos (lançamentos de produtos consumidos)
- ✅ Gerar Faturas Mensais (resumo de consumo por cliente)
- ✅ Enviar Faturas via WhatsApp (com texto pré-formatado)
- ✅ Sincronização Local entre Dispositivos na mesma rede WiFi
- 🗄️ Banco de dados local (WatermelonDB/SQLite)

## 🛠️ Requisitos

- Node.js 16+ e npm
- Android SDK configurado (para testar em emulador ou dispositivo)
- Dos dispositivos conectados na **mesma rede WiFi**
- Aplicativo instalado em ambos os dispositivos

## 📦 Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Build do Projeto Android

```bash
npm run prebuild:android
```

Se já tiver prebuild executado, apenas faça:

```bash
cd android
./gradlew assembleDebug
npx react-native run-android
```

### 3. Executar em Emulador Android

```bash
npx react-native run-android
```

Ou via Expo (se disponível):

```bash
npm start
```

E selecione a opção `a` para Android.

## 🚀 Como Usar

### 1. Gerenciar Produtos

1. Abra o app e vá para a aba **"Produtos"**
2. Preencha os dados:
   - **Nome**: ex: "Cerveja"
   - **Preço de Custo**: ex: 5.00
   - **Preço de Venda**: ex: 10.00
3. Clique em **"Adicionar Produto"**
4. O % de lucro será calculado automaticamente

### 2. Gerenciar Clientes

1. Vá para a aba **"Clientes"**
2. Preencha:
   - **Nome**: ex: "João Silva"
   - **Telefone**: ex: `+5511999999999` (no formato do WhatsApp)
   - **Notas** (opcional): ex: "Prefere Coca"
3. Clique em **"Adicionar Cliente"**

### 3. Registrar Consumos

1. Vá para a aba **"Lançamentos"**
2. Selecione um cliente
3. Selecione um produto
4. Digite a quantidade
5. Clique em **"Registrar Lançamento"**
6. O consumo é registrado com data e hora automáticas

### 4. Gerar e Enviar Faturas

1. Vá para a aba **"Faturas"**
2. Selecione um cliente
3. Selecione o mês e ano
4. Clique em **"Gerar Fatura"**
5. Revise o resumo de consumos
6. Clique em **"💬 Enviar via WhatsApp"**
7. Será aberto o WhatsApp com a fatura pré-preenchida (se instalado)

### 5. Sincronizar Dados entre Dispositivos

#### Via Rede WiFi Local (Recomendado)

1. Certifique-se de que **ambos os dispositivos estão na mesma rede WiFi**
2. Vá para a aba **"Sincronizar"** no segundo dispositivo
3. Digite o **endereço IP do primeiro dispositivo**
   - Para descobrir o IP: Configurações > WiFi > Rede conectada
4. Clique em **"Adicionar Dispositivo"**
5. Clique em **"Sincronizar"** para puxar dados do outro dispositivo
6. Repita no primeiro dispositivo para sincronizar os dados dele também

#### Via Servidor de Teste (Desenvolvimento)

Se quiser testar a sincronização em seu computador:

```bash
# Terminal 1 - Rodando o app
npm start

# Terminal 2 - Servidor de sincronização
node sync-server.js
```

O servidor ficará em `http://localhost:3000`

**No app**, digite o IP da sua máquina (ex: `192.168.1.100`) e porta `3000`.

## 🔄 Estratégia de Sincronização

- **Tipo**: Unidirecional (o app puxa dados de outro dispositivo)
- **Conflitos**: Última gravação vence (last-write-wins)
- **Dados Sincronizados**:
  - Produtos (id, nome, preços, lucro)
  - Clientes (id, nome, telefone, notas)
  - Consumos (não são alterados após criação, apenas sincronizados)

## 📋 Estrutura do Banco de Dados

### Produtos
- `id`: ID único
- `name`: Nome do produto
- `cost_price`: Preço de custo
- `sale_price`: Preço de venda
- `profit_percent`: % de lucro (calculado automaticamente)
- `created_at`, `updated_at`: Timestamps

### Clientes
- `id`: ID único
- `name`: Nome do cliente
- `phone`: Telefone WhatsApp
- `notes`: Notas opcionais
- `created_at`, `updated_at`: Timestamps

### Consumos
- `id`: ID único
- `client_id`: ID do cliente
- `product_id`: ID do produto
- `quantity`: Quantidade consumida
- `price`: Preço unitário (snapshot)
- `timestamp`: Quando foi consumido
- `device_origin`: Qual dispositivo registrou
- `created_at`, `updated_at`: Timestamps

## 🐛 Solução de Problemas

### App não abre / Erro na inicialização

```bash
# Limpar cache
npm cache clean --force
npm install

# Reconstruir Android
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Sincronização não funciona

1. Verifique se ambos os dispositivos estão na **mesma rede WiFi**
2. Certifique-se de que o IP está **correto**
3. Teste a conexão: ping para o dispositivo
4. Verifique se a porta 3000 não está bloqueada pelo firewall
5. Tente adicionar o dispositivo novamente

### Faturas não aparecem no WhatsApp

1. Verifique se o número de telefone está no formato correto: `+5511999999999`
2. Certifique-se de que WhatsApp está instalado no dispositivo
3. Tente copiar o texto manualmente e enviar

### Dados duplicados após sincronização

Isso pode acontecer se a sincronização for feita em ambas as direções. Para evitar:
- Sincronize em **um sentido** (ex: sempre do Dispositivo A para B)
- Ou faça a sincronização uma vez por sessão

## 📱 Testando em Emulador

### Android Studio

1. Abra **Android Studio**
2. Crie ou abra um **Android Virtual Device (AVD)**
3. Inicie o emulador
4. Execute:
   ```bash
   npx react-native run-android
   ```

### Para Sincronização em Emulador

Se testar com dois emuladores:
- **Emulador 1**: IP será algo como `10.0.2.2` (gateway do emulador)
- **Emulador 2**: Use o mesmo `10.0.2.2`

Ou use o servidor local com `node sync-server.js` e conecte ambos a `localhost:3000`.

## 🔐 Notas de Segurança

- ⚠️ **Conta Admin**: Embutida no código (vide próximas versões para autenticação)
- ⚠️ **Sincronização**: Funciona apenas em rede local (sem internet)
- ⚠️ **Backup**: Recomenda-se fazer backup regular dos dados
- ⚠️ **WhatsApp**: O link é enviado sem criptografia (use em rede segura)

## 🚀 Próximas Melhorias

- [ ] Autenticação de usuários
- [ ] Histórico de preços de produtos
- [ ] Relatórios de vendas e lucro
- [ ] Backup automático na nuvem
- [ ] Notificações de pendências
- [ ] Suporte a múltiplos bars
- [ ] App para iOS
- [ ] Servidor HTTP nativo em React Native

## 📝 Licença

Privado - Uso interno apenas

## 📧 Suporte

Para problemas, abra um issue ou entre em contato com o desenvolvedor.

---

**Desenvolvido com ❤️ para gerenciar bars no mar!**
