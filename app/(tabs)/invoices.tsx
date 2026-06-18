import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Linking,
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
import { Invoice, InvoiceService } from '../.services/InvoiceService'

export default function InvoicesScreen() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [pixKey, setPixKey] = useState('')
  const [invoiceText, setInvoiceText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const allClients = await ClientService.getAll()
      setClients(allClients)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar clientes')
      console.error(error)
    } finally {
      setLoadingClients(false)
    }
  }

  const handleGenerateInvoice = async () => {
    if (!selectedClient) {
      Alert.alert('Erro', 'Selecione um cliente')
      return
    }

    try {
      setLoading(true)
      const generatedInvoice = await InvoiceService.generateInvoice(
        selectedClient.id,
        selectedYear,
        selectedMonth
      )
      setInvoice(generatedInvoice)

      let text = `📋 Fatura de Consumo - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}\n\n`
      text += `Cliente: ${generatedInvoice.clientName}\n`
      text += `Data: ${generatedInvoice.invoiceDate.toLocaleDateString('pt-BR')}\n`
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      text += `💰 Total: R$ ${generatedInvoice.totalAmount.toFixed(2)}\n\n`
      if (pixKey) {
        text += `🏦 PIX: ${pixKey}\n\n`
      } else {
        text += `🏦 PIX: [Aguardando chave PIX]\n\n`
      }
      text += `Obrigado pela preferência! 🙏`
      setInvoiceText(text)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar fatura')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendWhatsApp = async () => {
    if (!invoice || !invoiceText) {
      Alert.alert('Erro', 'Gere uma fatura primeiro')
      return
    }

    try {
      const whatsappLink = InvoiceService.getWhatsAppLink(invoice.clientPhone, invoiceText)
      const canOpen = await Linking.canOpenURL(whatsappLink)

      if (canOpen) {
        await Linking.openURL(whatsappLink)
      } else {
        Alert.alert(
          'Erro',
          'WhatsApp não está instalado. Copie o número e envie manualmente.'
        )
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao abrir WhatsApp')
      console.error(error)
    }
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]

  if (loadingClients) {
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
        <ThemedText style={styles.title}>Gerar Faturas</ThemedText>

        <View style={styles.formContainer}>
          <ThemedText style={styles.label}>Cliente:</ThemedText>
          <TouchableOpacity
            style={styles.clientSelector}
            onPress={() => {
              Alert.alert(
                'Selecione um cliente',
                '',
                clients.map((client) => ({
                  text: client.name,
                  onPress: () => setSelectedClient(client),
                }))
              )
            }}
          >
            <ThemedText style={styles.clientSelectorText}>
              {selectedClient ? selectedClient.name : 'Selecione um cliente'}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <ThemedText style={styles.label}>Mês:</ThemedText>
              <TouchableOpacity
                style={styles.clientSelector}
                onPress={() => {
                  Alert.alert(
                    'Selecione o mês',
                    '',
                    monthNames.map((month, index) => ({
                      text: month,
                      onPress: () => setSelectedMonth(index + 1),
                    }))
                  )
                }}
              >
                <ThemedText style={styles.clientSelectorText}>
                  {monthNames[selectedMonth - 1]}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.dateColumn}>
              <ThemedText style={styles.label}>Ano:</ThemedText>
              <TouchableOpacity
                style={styles.clientSelector}
                onPress={() => {
                  const years = Array.from({ length: 5 }, (_, i) =>
                    new Date().getFullYear() - 2 + i
                  )
                  Alert.alert(
                    'Selecione o ano',
                    '',
                    years.map((year) => ({
                      text: year.toString(),
                      onPress: () => setSelectedYear(year),
                    }))
                  )
                }}
              >
                <ThemedText style={styles.clientSelectorText}>
                  {selectedYear}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGenerateInvoice}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Gerando...' : 'Gerar Fatura'}
            </Text>
          </TouchableOpacity>
        </View>

        {invoice && (
          <View style={styles.invoiceContainer}>
            <ThemedText style={styles.invoiceTitle}>💰 Total a Pagar</ThemedText>
            <View style={styles.totalContainer}>
              <ThemedText style={styles.totalAmount}>
                R$ {invoice.totalAmount.toFixed(2)}
              </ThemedText>
            </View>

            <ThemedText style={[styles.label, { marginTop: 20 }]}>
              Chave PIX:
            </ThemedText>
            <TextInput
              style={styles.pixInput}
              placeholder="Digite a chave PIX (CPF, email, telefone ou chave aleatória)"
              placeholderTextColor="#999"
              value={pixKey}
              onChangeText={setPixKey}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleGenerateInvoice}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                Atualizar Mensagem
              </Text>
            </TouchableOpacity>

            <View style={styles.messageContainer}>
              <ThemedText style={styles.messageTitle}>Mensagem para enviar:</ThemedText>
              <View style={styles.messageBox}>
                <ThemedText style={styles.messageText}>{invoiceText}</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.whatsappButton, loading && styles.buttonDisabled]}
              onPress={handleSendWhatsApp}
              disabled={loading}
            >
              <Text style={styles.whatsappButtonText}>
                💬 Enviar via WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {invoice && invoice.totalAmount === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Nenhum consumo registrado neste período
            </ThemedText>
          </View>
        )}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  clientSelector: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  clientSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateColumn: {
    flex: 1,
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
  invoiceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pixInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  messageContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
})
