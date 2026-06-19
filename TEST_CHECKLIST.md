# Checklist - Teste de WiFi Sync Multi-Dispositivo

## Objetivo
Validar que a sincronização WiFi funciona corretamente entre dois dispositivos Android com Expo Go.

## Pré-requisitos
- [ ] 2 dispositivos Android com Expo Go instalado
- [ ] 1 computador com servidor Node.js rodando
- [ ] Todos conectados na mesma rede WiFi
- [ ] Anotar o IP do servidor (ex: 192.168.1.100)

## Fase 1: Configuração

### Servidor
- [ ] Executar `npm run sync-server` no computador
- [ ] Verificar mensagem de sucesso com IP exibido
- [ ] Anotar IP: _______________

### Dispositivo 1
- [ ] Abrir app BARômetro
- [ ] Ir para aba "Sincronizar"
- [ ] Clicar "Procurar na Rede"
- [ ] Servidor deve aparecer na lista
- [ ] Clicar "Testar" para validar conexão
- [ ] Conexão deve estar OK

### Dispositivo 2
- [ ] Repetir passos do Dispositivo 1
- [ ] Ambos devem conseguir descobrir o servidor

## Fase 2: Teste de Produtos

### Criar Produto no Dispositivo 1
- [ ] Ir para aba "Produtos"
- [ ] Adicionar novo produto:
  - Nome: "Cerveja Teste 600ml"
  - Preço Custo: 15.50
  - Preço Venda: 25.00
  - Quantidade: 100
- [ ] Salvar produto
- [ ] Verificar produto aparece na lista

### Sincronizar Dispositivo 1
- [ ] Voltar para aba "Sincronizar"
- [ ] Clicar "Sincronizar"
- [ ] Aguardar conclusão (deve durar ~5 segundos)
- [ ] Mensagem de sucesso deve aparecer

### Verificar Produto no Dispositivo 2
- [ ] Ir para aba "Produtos"
- [ ] Verificar se o novo produto aparece
- [ ] Dados devem estar corretos:
  - Nome: "Cerveja Teste 600ml"
  - Preço Custo: R$ 15,50
  - Preço Venda: R$ 25,00
  - Lucro: ~61%
  - Estoque: 100

## Fase 3: Teste de Clientes

### Criar Cliente no Dispositivo 2
- [ ] Ir para aba "Clientes"
- [ ] Adicionar novo cliente:
  - Nome: "Bar Teste"
  - Telefone: "11 99999-8888"
  - Notas: "Cliente teste"
- [ ] Salvar cliente
- [ ] Verificar cliente aparece na lista

### Sincronizar Dispositivo 2
- [ ] Voltar para aba "Sincronizar"
- [ ] Clicar "Sincronizar"
- [ ] Aguardar conclusão

### Verificar Cliente no Dispositivo 1
- [ ] Ir para aba "Clientes"
- [ ] Verificar se o novo cliente aparece
- [ ] Dados devem estar corretos:
  - Nome: "Bar Teste"
  - Telefone: "11 99999-8888"

## Fase 4: Teste de Consumos

### Registrar Consumo no Dispositivo 1
- [ ] Ir para aba "Lançamentos"
- [ ] Selecionar cliente: "Bar Teste"
- [ ] Selecionar produto: "Cerveja Teste 600ml"
- [ ] Quantidade: 12
- [ ] Registrar consumo
- [ ] Verificar consumo aparece na lista

### Sincronizar Dispositivo 1
- [ ] Voltar para aba "Sincronizar"
- [ ] Clicar "Sincronizar"
- [ ] Aguardar conclusão

### Verificar Consumo no Dispositivo 2
- [ ] Ir para aba "Lançamentos"
- [ ] Verificar se o novo consumo aparece
- [ ] Verificar estoque do produto foi decrementado:
  - Deve estar em 88 (100 - 12)
- [ ] Ir para aba "Produtos"
- [ ] Verificar quantidade do "Cerveja Teste 600ml" = 88

## Fase 5: Teste de Pagamentos

### Marcar como Pago no Dispositivo 1
- [ ] Ir para aba "Clientes"
- [ ] Clicar no cliente "Bar Teste"
- [ ] Clicar na tag de mês pendente (ex: "01/2024")
- [ ] Status deve mudar para "✓ Pago" (verde)

### Sincronizar Dispositivo 1
- [ ] Voltar para aba "Sincronizar"
- [ ] Clicar "Sincronizar"
- [ ] Aguardar conclusão

### Verificar Pagamento no Dispositivo 2
- [ ] Ir para aba "Clientes"
- [ ] Clicar no cliente "Bar Teste"
- [ ] Verificar tag de mês agora mostra "✓ Pago" (verde)

## Fase 6: Teste de Conflito (Last-Write-Wins)

### Editar Mesmo Produto em Ambos Simultaneamente
- [ ] Dispositivo 1: Ir para "Produtos"
- [ ] Dispositivo 1: Editar "Cerveja Teste 600ml"
  - Mudar Preço Venda para: 28.00
  - NÃO SINCRONIZAR AINDA
- [ ] Dispositivo 2: Ir para "Produtos"
- [ ] Dispositivo 2: Editar "Cerveja Teste 600ml"
  - Mudar Preço Venda para: 26.00
  - Salvar e sincronizar
- [ ] Dispositivo 1: Agora salvar e sincronizar
- [ ] Resultado esperado:
  - Preço deve ser 28.00 (última edição)
  - Dispositivo 2 sincroniza deve receber 28.00

## Fase 7: Teste de Sincronização Reversa

### Modificar Dados no Servidor
- [ ] Todos os dados devem estar no servidor
- [ ] Limpar dados de um dispositivo (se quiser testar download puro)
- [ ] Sincronizar dispositivo
- [ ] Todos os dados devem ser restaurados

## Fase 8: Teste de Desconexão

### Simular Conexão Perdida
- [ ] Desligar WiFi no Dispositivo 1
- [ ] Tentar sincronizar
- [ ] Mensagem de erro deve aparecer
- [ ] Voltar WiFi
- [ ] Sincronizar novamente
- [ ] Deve funcionar normalmente

## Fase 9: Teste de Múltiplas Operações

### Operações Simultâneas
- [ ] Dispositivo 1: Criar 3 novos produtos
- [ ] Dispositivo 2: Criar 2 novos clientes
- [ ] Dispositivo 1: Sincronizar
- [ ] Dispositivo 2: Sincronizar
- [ ] Ambos devem ter todos os 5 novos registros

## Resultado Final

### Se Tudo Passou ✅
- [ ] WiFi Sync funciona corretamente
- [ ] Sincronização bidirecional funciona
- [ ] Merge de conflitos funciona
- [ ] Sistema está pronto para uso em produção

### Se Algo Falhou ❌
- [ ] Anotar qual teste falhou
- [ ] Verificar logs do servidor
- [ ] Verificar conexão WiFi
- [ ] Consultar documentação em WIFI_SYNC.md

## Notas

______________________________________________________________

______________________________________________________________

______________________________________________________________

## Assinatura do Testador

Data: _____ / _____ / _______

Nome: ________________________________

Status: [ ] Aprovado   [ ] Pendente   [ ] Rejeitado
