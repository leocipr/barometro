# 🧪 Guia de Testes - Barômetro App

Este guia descreve como testar o aplicativo em diferentes ambientes e cenários.

## 🎬 Teste Inicial Rápido

### Opção 1: Via Expo Go (Recomendado para Desenvolvimento Rápido)

1. **Certificar-se de que o servidor está rodando:**
   ```bash
   npm start
   ```

2. **No emulador Android ou dispositivo físico:**
   - Instale o app **Expo Go** (Google Play Store)
   - Escaneie o QR code mostrado no terminal
   - O app será carregado em segundos

3. **Teste básico:**
   - A aba "Home" deve aparecer sem erros
   - Vá para cada aba: Produtos, Clientes, Lançamentos, Faturas, Sincronizar

### Opção 2: Build Nativo Android (Mais Completo)

1. **Fazer rebuild:**
   ```bash
   npm run prebuild:android
   ```

2. **Compilar e rodar:**
   ```bash
   cd android
   ./gradlew assembleDebug
   npx react-native run-android
   ```

## ✅ Casos de Teste

### 1️⃣ Testar Cadastro de Produtos

**Objetivo**: Verificar se produtos são criados corretamente com cálculo de margem

**Passos**:
1. Vá para aba **"Produtos"**
2. Preencha:
   - Nome: "Cerveja Brahma"
   - Preço de Custo: 5.00
   - Preço de Venda: 10.00
3. Clique em "Adicionar Produto"
4. **Resultado esperado**: 
   - Produto aparece na lista
   - Lucro mostra: 100.0%

**Teste de Validação**:
- Tente criar sem nome → deve mostrar erro
- Tente criar com preço de venda menor que custo → verificar se margem fica negativa (está OK, apenas documenta)

---

### 2️⃣ Testar Cadastro de Clientes

**Objetivo**: Verificar cadastro de clientes com telefone

**Passos**:
1. Vá para aba **"Clientes"**
2. Preencha:
   - Nome: "João Silva"
   - Telefone: +5511999999999
   - Notas: "Gosta de cerveja fria"
3. Clique em "Adicionar Cliente"
4. **Resultado esperado**: Cliente aparece na lista com nome e telefone

**Teste de Validação**:
- Tente criar sem telefone → deve mostrar erro
- Verifique se o telefone é salvo exatamente como digitou (com +55)

---

### 3️⃣ Testar Registrar Consumos

**Pré-requisitos**: Ter criado pelo menos 1 cliente e 1 produto

**Objetivo**: Registrar que um cliente consumiu um produto

**Passos**:
1. Vá para aba **"Lançamentos"**
2. Selecione:
   - Cliente: "João Silva"
   - Produto: "Cerveja Brahma"
   - Quantidade: 3
3. Clique em "Registrar Lançamento"
4. **Resultado esperado**: 
   - Lançamento aparece na lista
   - Mostra: "João Silva" | "Cerveja Brahma x 3" | "R$ 30.00"
   - Data de hoje aparece

**Teste de Persistência**:
- Fecha o app completamente (Ctrl+C no servidor ou mata o processo)
- Reabre o app (`npm start`)
- O lançamento ainda deve estar lá

---

### 4️⃣ Testar Geração de Faturas

**Pré-requisitos**: Ter registrado consumos para um cliente

**Objetivo**: Gerar fatura mensal para um cliente

**Passos**:
1. Vá para aba **"Faturas"**
2. Selecione:
   - Cliente: "João Silva"
   - Mês: Mesmo mês de hoje
   - Ano: 2025 (ou ano atual)
3. Clique em "Gerar Fatura"
4. **Resultado esperado**:
   - Prévia da fatura mostra:
     ```
     📋 Fatura de Consumo - [Mês/Ano]
     Cliente: João Silva
     ...
     Cerveja Brahma
     3 x R$ 10.00 = R$ 30.00
     ...
     💰 Total: R$ 30.00
     ```

**Teste de Período Vazio**:
- Gere fatura para um mês sem consumos
- Deve mostrar: "Nenhum consumo registrado neste período"

---

### 5️⃣ Testar Envio via WhatsApp

**Pré-requisitos**: Fatura gerada, WhatsApp instalado no dispositivo

**Objetivo**: Abrir WhatsApp com mensagem pré-preenchida

**Passos**:
1. Tenha uma fatura gerada
2. Clique em "💬 Enviar via WhatsApp"
3. **Resultado esperado**:
   - WhatsApp abre
   - Conversa/contato do cliente abre (usando o +55 do número)
   - Mensagem com fatura está no campo de entrada
4. **Teste final**: Envie a mensagem e verifique formatação

**Se WhatsApp não estiver instalado**:
- Deve mostrar mensagem: "WhatsApp não está instalado"
- Cópia o texto para enviar manualmente depois

---

### 6️⃣ Testar Sincronização Entre Dispositivos

#### 🖥️ Setup: Dois Emuladores

1. **Emulador 1** (Porta 5554):
   ```bash
   npm start
   ```
   Selecione `a` para abrir Android

2. **Emulador 2** (Porta 5556):
   Abra outro terminal:
   ```bash
   $ANDROID_HOME/emulator/emulator -avd Emulator2
   npx expo start
   ```
   Selecione `a`

#### 🔄 Teste de Sincronização

**Cenário**: Dois dispositivos na mesma rede

**Passos Emulador 1**:
1. Crie produto: "Cerveja" (R$ 5 custo, R$ 10 venda)
2. Crie cliente: "João" (+5511999999999)
3. Vá para "Sincronizar"
4. Deixe aberto

**Passos Emulador 2**:
1. Vá para "Sincronizar"
2. Adicione dispositivo:
   - IP: `10.0.2.2` (localhost do outro emulador)
   - Porta: `3000`
3. Clique em "Sincronizar"
4. **Resultado esperado**:
   - Sucesso: "Dados sincronizados com 10.0.2.2"
   - Vá para "Produtos" → "Cerveja" deve estar lá
   - Vá para "Clientes" → "João" deve estar lá

---

## 🌐 Teste com Dispositivos Reais na Mesma Rede

### Setup

1. **Computador/Servidor**:
   ```bash
   node sync-server.js
   ```
   Verá output: `📡 Sync Server rodando em http://localhost:3000`

2. **Descobrir IP do computador**:
   ```bash
   # Windows
   ipconfig
   # Procure por "IPv4 Address" na sua rede WiFi (ex: 192.168.0.100)
   
   # Mac/Linux
   ifconfig
   ```

3. **Ambos os dispositivos**:
   - Conectar na **mesma rede WiFi**
   - Abrir app (Expo ou nativo)

### Teste Prático

**Dispositivo 1**:
1. Crie 2-3 produtos
2. Crie 2 clientes
3. Faça alguns lançamentos

**Dispositivo 2**:
1. Vá para "Sincronizar"
2. Digite o IP descoberto (ex: 192.168.0.100)
3. Clique "Adicionar Dispositivo"
4. Clique "Sincronizar"
5. Verifique que produtos e clientes aparecem

---

## 🐛 Testes de Edge Cases

### Teste: Produto Deletado

1. Crie um produto
2. Crie um lançamento com esse produto
3. Delete o produto
4. Vá para "Lançamentos"
5. **Esperado**: Lançamento ainda existe, mas produto pode mostrar "Desconhecido"

### Teste: Cliente com Caracteres Especiais

1. Crie cliente: "João Pereira & Cia"
2. Registre consumo
3. Gere fatura
4. Envie via WhatsApp
5. **Esperado**: Nomes especiais aparecem corretamente na fatura

### Teste: Consumo com Quantidade Decimal

1. Registre lançamento com quantidade 2.5
2. **Esperado**: Total = 2.5 x preço (funciona com decimais)

### Teste: Múltiplos Consumos no Mesmo Dia

1. Registre produto A (3x)
2. Registre produto B (2x)
3. Registre produto A novamente (1x)
4. Gere fatura
5. **Esperado**: 
   - Produto A: 4 unidades (soma de 3+1)
   - Produto B: 2 unidades

---

## 📊 Testes de Performance

### Teste: 100+ Produtos

1. Crie 100 produtos via script (opcional):
   ```bash
   # Modifique app/services/ProductService.ts para teste em lote
   ```
2. Abra aba "Produtos"
3. **Esperado**: Scroll funciona fluido, sem lag

### Teste: 1000+ Lançamentos

1. Registre muitos lançamentos
2. Vá para "Lançamentos"
3. **Esperado**: Mostra últimos 20, scroll é responsivo

---

## ✨ Checklists Finais

### Antes de Enviar para Produção

- [ ] App inicia sem erros no Android
- [ ] Produtos podem ser criados e deletados
- [ ] Clientes podem ser criados e deletados
- [ ] Lançamentos são registrados com data/hora corretas
- [ ] Faturas são geradas corretamente (soma)
- [ ] WhatsApp abre com mensagem pré-preenchida
- [ ] Sincronização funciona entre dois dispositivos
- [ ] Banco de dados persiste após fechar app
- [ ] Sem crashes ao navegar entre abas
- [ ] Números aparecem formatados (R$ XX.XX)

### Performance

- [ ] App abre em < 3 segundos
- [ ] Cada aba abre em < 1 segundo
- [ ] Scroll em listas é suave
- [ ] Sincronização < 5 segundos para 100 registros

### Segurança

- [ ] WhatsApp link usa +55 correto
- [ ] Dados não são salvos em cache inseguro
- [ ] IP de sincronização é validado (conexão ativa)

---

## 🎥 Registrando Bugs

Se encontrar um bug, capture:

1. **Screenshots**: Tela onde ocorreu
2. **Logs**: Abra DevTools (`j` no terminal Expo)
3. **Passos para Reproduzir**: Lista exata
4. **Dispositivo**: Emulador/Real, versão Android
5. **Dados**: Quantos produtos/clientes/lançamentos

---

## 📞 Comandos Úteis

```bash
# Reload app (após mudanças no código)
# No terminal Expo, pressione: r

# Abrir DevTools/debugger
# Pressione: j

# Limpar cache completo
npm cache clean --force
npm install

# Resetar Metro bundler
npx react-native start --reset-cache

# Matar processo se travar
# Ctrl+C no terminal Expo
# Ou: lsof -i :8081 | kill -9 (Mac/Linux)
```

---

**Pronto para testar! 🚀**

Se tiver dúvidas ou encontrar erros, consulte [README_APP.md](README_APP.md) ou levante um issue.
