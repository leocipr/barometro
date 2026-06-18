import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { ThemedText } from '../../components/themed-text'
import { ThemedView } from '../../components/themed-view'
import Client from '../.db/models/Client'
import { ClientService } from '../.services/ClientService'
import { ConsumptionService } from '../.services/ConsumptionService'

export default function ClientsScreen() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [invoicesByClient, setInvoicesByClient] = useState<{ [key: string]: any[] }>({})

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const allClients = await ClientService.getAll()
      setClients(allClients)

      // Load invoices for each client
      const invoices: { [key: string]: any[] } = {}
      for (const client of allClients) {
        const clientInvoices = await ConsumptionService.getLastTwoMonthsInvoices(client.id)
        invoices[client.id] = clientInvoices
      }
      setInvoicesByClient(invoices)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar clientes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async () => {
    if (!name || !phone) {
      Alert.alert('Erro', 'Preencha nome e telefone')
      return
    }

    try {
      setIsCreating(true)
      await ClientService.create(name, phone, notes)
      setName('')
      setPhone('')
      setNotes('')
      await loadClients()
      Alert.alert('Sucesso', 'Cliente criado com sucesso')
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar cliente')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClient = (id: string) => {
    Alert.alert('Confirmar', 'Deseja deletar este cliente?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            await ClientService.delete(id)
            await loadClients()
            Alert.alert('Sucesso', 'Cliente deletado com sucesso')
          } catch (error) {
            Alert.alert('Erro', 'Erro ao deletar cliente')
            console.error(error)
          }
        },
      },
    ])
  }

  const handleTogglePaymentStatus = async (clientId: string, month: number, year: number) => {
    try {
      const newStatus = await ConsumptionService.togglePaymentStatus(clientId, month, year)
      await loadClients()
      Alert.alert('Sucesso', `Conta ${newStatus ? 'marcada como paga' : 'marcada como pendente'}`)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar status de pagamento')
      console.error(error)
    }
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]

  if (loading && clients.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>← Voltar</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Gerenciar Clientes</ThemedText>

        {/* Formulário de criação */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Novo Cliente</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Nome do cliente"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone WhatsApp (ex: +5511999999999)"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notas (opcional)"
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <TouchableOpacity
            style={[styles.button, isCreating && styles.buttonDisabled]}
            onPress={handleCreateClient}
            disabled={isCreating}
          >
            <Text style={styles.buttonText}>
              {isCreating ? 'Criando...' : 'Adicionar Cliente'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de clientes */}
        <View style={styles.listContainer}>
          <ThemedText style={styles.formTitle}>Clientes Cadastrados</ThemedText>
          {clients.length === 0 ? (
            <ThemedText style={styles.emptyText}>Nenhum cliente cadastrado</ThemedText>
          ) : (
            clients.map((client) => (
              <View key={client.id} style={styles.clientCard}>
                <View style={styles.clientInfo}>
                  <ThemedText style={styles.clientName}>{client.name}</ThemedText>
                  <ThemedText style={styles.clientPhone}>{client.phone}</ThemedText>
                  {client.notes && (
                    <ThemedText style={styles.clientNotes}>{client.notes}</ThemedText>
                  )}
                  
                  {/* Invoices links */}
                  {invoicesByClient[client.id] ? (
                    invoicesByClient[client.id].length > 0 ? (
                      <View style={styles.invoicesContainer}>
                        <ThemedText style={styles.invoicesTitle}>Últimas Contas:</ThemedText>
                        {invoicesByClient[client.id].map((invoice, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.invoiceLink,
                              invoice.isPaid ? styles.invoicePaid : styles.invoicePending,
                            ]}
                            onPress={() =>
                              handleTogglePaymentStatus(client.id, invoice.month, invoice.year)
                            }
                          >
                            <ThemedText
                              style={[
                                styles.invoiceLinkText,
                                invoice.isPaid && styles.invoiceLinkTextPaid,
                              ]}
                            >
                              {monthNames[invoice.month - 1]} {invoice.year} - R${' '}
                              {invoice.total.toFixed(2)} {invoice.isPaid ? '✓ Pago' : '⏳ Pendente'}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <ThemedText style={styles.noInvoicesText}>Sem contas registradas</ThemedText>
                    )
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteClient(client.id)}
                >
                  <Text style={styles.deleteButtonText}>Deletar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginVertical: 20,
  },
  clientCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clientNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  invoicesContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  invoicesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  noInvoicesText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  invoiceLink: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
    borderWidth: 1,
  },
  invoicePending: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  invoicePaid: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  invoiceLinkText: {
    fontSize: 12,
    color: '#333',
  },
  invoiceLinkTextPaid: {
    color: '#155724',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
