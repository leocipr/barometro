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
import Consumption from '../.db/models/Consumption'
import Product from '../.db/models/Product'
import { ClientService } from '../.services/ClientService'
import { ConsumptionService } from '../.services/ConsumptionService'
import { ProductService } from '../.services/ProductService'

export default function ConsumptionsScreen() {
  const router = useRouter()
  const [consumptions, setConsumptions] = useState<Consumption[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showClientList, setShowClientList] = useState(false)
  const [showProductList, setShowProductList] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allConsumptions, allClients, allProducts] = await Promise.all([
        ConsumptionService.getAll(),
        ClientService.getAll(),
        ProductService.getAll(),
      ])
      setConsumptions(allConsumptions)
      setClients(allClients)
      setProducts(allProducts)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConsumption = async () => {
    if (!selectedClient || !selectedProduct || !quantity) {
      Alert.alert('Erro', 'Selecione cliente, produto e quantidade')
      return
    }

    try {
      setIsCreating(true)
      if (!selectedProduct.salePrice) throw new Error('Produto sem preço')

      await ConsumptionService.create(
        selectedClient.id,
        selectedProduct.id,
        parseFloat(quantity),
        selectedProduct.salePrice
      )

      setSelectedClient(null)
      setSelectedProduct(null)
      setClientSearch('')
      setProductSearch('')
      setQuantity('')
      setShowClientList(false)
      setShowProductList(false)
      await loadData()
      Alert.alert('Sucesso', 'Lançamento registrado com sucesso')
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar lançamento')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredClients = clientSearch.trim().length > 0
    ? clients.filter((client) =>
        client.name.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : []

  const filteredProducts = productSearch.trim().length > 0
    ? products.filter((product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    : []

  const handleDeleteConsumption = (id: string) => {
    Alert.alert('Confirmar', 'Deseja deletar este lançamento?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            await ConsumptionService.delete(id)
            await loadData()
            Alert.alert('Sucesso', 'Lançamento deletado com sucesso')
          } catch (error) {
            Alert.alert('Erro', 'Erro ao deletar lançamento')
            console.error(error)
          }
        },
      },
    ])
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'Desconhecido'
  }

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Desconhecido'
  }

  const getProductPrice = (productId: string) => {
    return products.find((p) => p.id === productId)?.salePrice || 0
  }

  if (loading && consumptions.length === 0) {
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
        <ThemedText style={styles.title}>Registrar Consumo</ThemedText>

        {/* Formulário de criação */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Novo Lançamento</ThemedText>

          <ThemedText style={styles.label}>Cliente:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Digite nome ou telefone do cliente"
            placeholderTextColor="#999"
            value={clientSearch}
            onChangeText={(text) => {
              setClientSearch(text)
              setShowClientList(text.length > 0)
            }}
            allowFontScaling={true}
          />
          {selectedClient && (
            <View style={styles.selectedTag}>
              <ThemedText style={styles.selectedTagText}>✓ {selectedClient.name}</ThemedText>
              <TouchableOpacity onPress={() => {
                setSelectedClient(null)
                setClientSearch('')
              }}>
                <ThemedText style={styles.selectedTagClose}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {showClientList && filteredClients.length > 0 && (
            <View style={styles.dropdownList}>
              {filteredClients.slice(0, 5).map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedClient(client)
                    setClientSearch(client.name)
                    setShowClientList(false)
                  }}
                >
                  <ThemedText style={styles.dropdownItemText}>
                    {client.name} {client.phone ? `(${client.phone})` : ''}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {showClientList && clientSearch && filteredClients.length === 0 && (
            <ThemedText style={styles.emptySearchText}>Nenhum cliente encontrado</ThemedText>
          )}

          <ThemedText style={styles.label}>Produto:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Digite nome do produto"
            placeholderTextColor="#999"
            value={productSearch}
            onChangeText={(text) => {
              setProductSearch(text)
              setShowProductList(text.length > 0)
            }}
            allowFontScaling={true}
          />
          {selectedProduct && (
            <View style={styles.selectedTag}>
              <ThemedText style={styles.selectedTagText}>
                ✓ {selectedProduct.name} - R$ {(selectedProduct.salePrice ?? 0).toFixed(2)}
              </ThemedText>
              <TouchableOpacity onPress={() => {
                setSelectedProduct(null)
                setProductSearch('')
              }}>
                <ThemedText style={styles.selectedTagClose}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {showProductList && filteredProducts.length > 0 && (
            <View style={styles.dropdownList}>
              {filteredProducts.slice(0, 5).map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedProduct(product)
                    setProductSearch(product.name)
                    setShowProductList(false)
                  }}
                >
                  <ThemedText style={styles.dropdownItemText}>
                    {product.name} - R$ {(product.salePrice ?? 0).toFixed(2)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {showProductList && productSearch && filteredProducts.length === 0 && (
            <ThemedText style={styles.emptySearchText}>Nenhum produto encontrado</ThemedText>
          )}

          <ThemedText style={styles.label}>Quantidade:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            placeholderTextColor="#999"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={[styles.button, isCreating && styles.buttonDisabled]}
            onPress={handleCreateConsumption}
            disabled={isCreating}
          >
            <Text style={styles.buttonText}>
              {isCreating ? 'Registrando...' : 'Registrar Lançamento'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de lançamentos */}
        <View style={styles.listContainer}>
          <ThemedText style={styles.formTitle}>Últimos Lançamentos</ThemedText>
          {consumptions.length === 0 ? (
            <ThemedText style={styles.emptyText}>Nenhum lançamento registrado</ThemedText>
          ) : (
            consumptions
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 20)
              .map((consumption) => (
                <View key={consumption.id} style={styles.consumptionCard}>
                  <View style={styles.consumptionInfo}>
                    <ThemedText style={styles.consumptionTitle}>
                      {getClientName(consumption.clientId)}
                    </ThemedText>
                    <ThemedText style={styles.consumptionDetails}>
                      {getProductName(consumption.productId)} x {consumption.quantity}
                    </ThemedText>
                    <ThemedText style={styles.consumptionAmount}>
                      R$ {(consumption.quantity * (consumption.price || 0)).toFixed(2)}
                    </ThemedText>
                    <ThemedText style={styles.consumptionDate}>
                      {new Date(consumption.timestamp).toLocaleDateString('pt-BR')}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteConsumption(consumption.id)}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  picker: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
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
  consumptionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consumptionInfo: {
    flex: 1,
  },
  consumptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  consumptionDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  consumptionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d9d28',
    marginBottom: 4,
  },
  consumptionDate: {
    fontSize: 12,
    color: '#999',
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
  selectedTag: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    flex: 1,
  },
  selectedTagClose: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: -10,
    marginBottom: 10,
    marginHorizontal: 0,
    zIndex: 10,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  emptySearchText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
})
