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
import Product from '../.db/models/Product'
import { ProductService } from '../.services/ProductService'

export default function ProductsScreen() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editQuantity, setEditQuantity] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await ProductService.getAll()
      setProducts(allProducts)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar produtos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    if (!name || !costPrice || !salePrice) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }

    try {
      setIsCreating(true)
      // Converter ponto para vírgula e depois para ponto para cálculo
      const cost = parseFloat(costPrice.replace(',', '.'))
      const sale = parseFloat(salePrice.replace(',', '.'))
      const qty = quantity ? parseFloat(quantity.replace(',', '.')) : 0
      await ProductService.create(name, cost, sale, qty)
      setName('')
      setCostPrice('')
      setSalePrice('')
      setQuantity('')
      await loadProducts()
      Alert.alert('Sucesso', 'Produto criado com sucesso')
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar produto')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setEditPrice((product.salePrice ?? 0).toString())
    setEditQuantity((product.quantity ?? 0).toString())
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    Alert.alert('Confirmar', 'Deseja salvar as alterações?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Salvar',
        onPress: async () => {
          try {
            const newPrice = parseFloat(editPrice.replace(',', '.'))
            const newQty = parseFloat(editQuantity.replace(',', '.'))
            
            if (isNaN(newPrice) || isNaN(newQty)) {
              Alert.alert('Erro', 'Digite valores válidos')
              return
            }

            await ProductService.update(editingProduct.id, undefined, undefined, newPrice, newQty)
            setEditingProduct(null)
            await loadProducts()
            Alert.alert('Sucesso', 'Produto atualizado com sucesso')
          } catch (error) {
            Alert.alert('Erro', 'Erro ao atualizar produto')
            console.error(error)
          }
        },
      },
    ])
  }

  const handleDeleteProduct = (id: string) => {
    Alert.alert('Confirmar', 'Deseja deletar este produto?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            await ProductService.delete(id)
            await loadProducts()
            Alert.alert('Sucesso', 'Produto deletado com sucesso')
          } catch (error) {
            Alert.alert('Erro', 'Erro ao deletar produto')
            console.error(error)
          }
        },
      },
    ])
  }

  const getCardBackgroundColor = (product: Product): string => {
    const currentQty = product.quantity ?? 0
    const initialQty = product.initialQuantity ?? 0

    if (currentQty === 0) {
      return '#ffebee' // Vermelho claro - sem estoque
    }

    if (initialQty === 0) {
      return '#f5f5f5' // Cinza claro - produto sem quantidade inicial
    }

    const stockPercentage = (currentQty / initialQty) * 100

    if (stockPercentage < 20) {
      return '#ffcdd2' // Vermelho claro - menos de 20%
    }

    return '#e8f5e9' // Verde claro - acima de 20%
  }

  if (loading && products.length === 0) {
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
        <ThemedText style={styles.title}>Gerenciar Produtos</ThemedText>

        {/* Formulário de criação */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Novo Produto</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Nome do produto"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            allowFontScaling={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Preço de custo (ex: 10.5 ou 10,5)"
            placeholderTextColor="#999"
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="decimal-pad"
            allowFontScaling={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Preço de venda (ex: 15.9 ou 15,9)"
            placeholderTextColor="#999"
            value={salePrice}
            onChangeText={setSalePrice}
            keyboardType="decimal-pad"
            allowFontScaling={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade inicial (opcional)"
            placeholderTextColor="#999"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            allowFontScaling={true}
          />
          <TouchableOpacity
            style={[styles.button, isCreating && styles.buttonDisabled]}
            onPress={handleCreateProduct}
            disabled={isCreating}
          >
            <Text style={styles.buttonText}>
              {isCreating ? 'Criando...' : 'Adicionar Produto'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de produtos */}
        <View style={styles.listContainer}>
          <ThemedText style={styles.formTitle}>Produtos Cadastrados</ThemedText>
          {products.length === 0 ? (
            <ThemedText style={styles.emptyText}>Nenhum produto cadastrado</ThemedText>
          ) : (
            products.map((product) => (
              <View key={product.id} style={[styles.productCard, { backgroundColor: getCardBackgroundColor(product) }]}>
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName}>{product.name}</ThemedText>
                  <ThemedText style={styles.productPrice}>
                    Custo: R$ {(product.costPrice ?? 0).toFixed(2).replace('.', ',')} | Venda: R${' '}
                    {(product.salePrice ?? 0).toFixed(2).replace('.', ',')}
                  </ThemedText>
                  <ThemedText style={styles.productProfit}>
                    Lucro: {(product.profitPercent ?? 0).toFixed(2)}%
                  </ThemedText>
                  <ThemedText style={styles.productQuantity}>
                    Estoque: {(product.quantity ?? 0).toFixed(0)} un
                  </ThemedText>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleOpenEdit(product)}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProduct(product.id)}
                  >
                    <Text style={styles.deleteButtonText}>Deletar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de Edição */}
      {editingProduct && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Editar {editingProduct.name}</ThemedText>

            <ThemedText style={styles.modalLabel}>Preço de Venda:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Preço (ex: 15.9 ou 15,9)"
              placeholderTextColor="#999"
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="decimal-pad"
              allowFontScaling={true}
            />

            <ThemedText style={styles.modalLabel}>Quantidade em Estoque:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#999"
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="decimal-pad"
              allowFontScaling={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setEditingProduct(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  productCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productProfit: {
    fontSize: 14,
    color: '#2d9d28',
    fontWeight: '500',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'column',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSave: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
