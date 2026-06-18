import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { ThemedText } from '../../components/themed-text'
import { ThemedView } from '../../components/themed-view'
import { DiscoveredDevice, NetworkDiscoveryService } from '../.services/NetworkDiscoveryService'
import { SyncService } from '../.services/SyncService'

export default function SyncScreen() {
  const router = useRouter()
  const [devices, setDevices] = useState<DiscoveredDevice[]>([])
  const [ipAddress, setIpAddress] = useState('')
  const [port, setPort] = useState('3000')
  const [autoSync, setAutoSync] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState('')

  useEffect(() => {
    // Atualizar lista de dispositivos
    const unsubscribe = NetworkDiscoveryService.subscribe(setDevices)
    return unsubscribe
  }, [])

  const handleAddDevice = () => {
    if (!ipAddress) {
      Alert.alert('Erro', 'Digite um endereço IP')
      return
    }

    const device = NetworkDiscoveryService.addDevice(ipAddress, parseInt(port))
    Alert.alert('Sucesso', `Dispositivo adicionado: ${device.name}`)
    setIpAddress('')
    setPort('3000')
  }

  const handleSyncWithDevice = async (device: DiscoveredDevice) => {
    try {
      setSyncing(true)
      setSyncStatus(`Sincronizando com ${device.ipAddress}...`)

      // Testar conexão
      const connected = await NetworkDiscoveryService.testConnection(device)
      if (!connected) {
        Alert.alert(
          'Erro',
          'Não foi possível conectar ao dispositivo. Verifique se está online.'
        )
        return
      }

      // Buscar dados do dispositivo remoto
      const response = await fetch(
        `http://${device.ipAddress}:${device.port}/api/sync/export`,
        { timeout: 10000 }
      )

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`)
      }

      const remoteData = await response.json()

      // Importar dados localmente
      await SyncService.importData(remoteData)

      setLastSyncTime(new Date())
      setSyncStatus(
        `Última sincronização: ${new Date().toLocaleTimeString('pt-BR')}`
      )
      Alert.alert(
        'Sucesso',
        `Dados sincronizados com ${device.ipAddress}\n\n` +
          `Produtos: ${remoteData.products.length}\n` +
          `Clientes: ${remoteData.clients.length}\n` +
          `Consumos: ${remoteData.consumptions.length}`
      )
    } catch (error) {
      Alert.alert('Erro', `Erro ao sincronizar: ${error}`)
      console.error('Erro ao sincronizar:', error)
    } finally {
      setSyncing(false)
      setSyncStatus('')
    }
  }

  const handleAutoSyncToggle = async (value: boolean) => {
    setAutoSync(value)
    if (value && devices.length > 0) {
      Alert.alert(
        'Info',
        'Auto-sincronização ativada. Será feita a cada 5 minutos com o primeiro dispositivo disponível.'
      )
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>← Voltar</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Sincronizar Dados</ThemedText>

        {/* Info sobre sincronização */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>ℹ️ Sincronização Local</ThemedText>
          <ThemedText style={styles.infoText}>
            Este aplicativo sincroniza dados entre dispositivos conectados na mesma rede WiFi.
            {'\n\n'}
            Digite o IP do outro dispositivo para sincronizar:
          </ThemedText>
        </View>

        {/* Adicionar dispositivo */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Adicionar Dispositivo</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Endereço IP (ex: 192.168.1.100)"
            placeholderTextColor="#999"
            value={ipAddress}
            onChangeText={setIpAddress}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Porta (padrão: 3000)"
            placeholderTextColor="#999"
            value={port}
            onChangeText={setPort}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.button, syncing && styles.buttonDisabled]}
            onPress={handleAddDevice}
            disabled={syncing}
          >
            <Text style={styles.buttonText}>Adicionar Dispositivo</Text>
          </TouchableOpacity>
        </View>

        {/* Auto-sincronização */}
        <View style={styles.autoSyncContainer}>
          <ThemedText style={styles.autoSyncLabel}>Auto-sincronização</ThemedText>
          <Switch
            value={autoSync}
            onValueChange={handleAutoSyncToggle}
            disabled={devices.length === 0}
          />
        </View>

        {/* Status */}
        {lastSyncTime && (
          <View style={styles.statusContainer}>
            <ThemedText style={styles.statusText}>
              ✓ Última sincronização: {lastSyncTime.toLocaleTimeString('pt-BR')}
            </ThemedText>
          </View>
        )}

        {syncStatus && (
          <View style={styles.syncingContainer}>
            <ActivityIndicator size="small" color="#0000ff" />
            <ThemedText style={styles.syncingText}>{syncStatus}</ThemedText>
          </View>
        )}

        {/* Lista de dispositivos */}
        <View style={styles.devicesContainer}>
          <ThemedText style={styles.formTitle}>
            Dispositivos Encontrados ({devices.length})
          </ThemedText>
          {devices.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Nenhum dispositivo adicionado. Digite o IP acima para sincronizar.
            </ThemedText>
          ) : (
            devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
                  <ThemedText style={styles.deviceAddress}>
                    {device.ipAddress}:{device.port}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[styles.syncButton, syncing && styles.buttonDisabled]}
                  onPress={() => handleSyncWithDevice(device)}
                  disabled={syncing}
                >
                  <Text style={styles.syncButtonText}>
                    {syncing ? 'Sincr.' : 'Sincr.'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Nota sobre servidor */}
        <View style={styles.noteContainer}>
          <ThemedText style={styles.noteTitle}>📝 Nota Importante</ThemedText>
          <ThemedText style={styles.noteText}>
            Para que a sincronização funcione, os dois dispositivos devem estar conectados na mesma rede WiFi e ambos com o aplicativo aberto.
            {'\n\n'}
            A sincronização é unidirecional (puxando dados do outro dispositivo). Recomenda-se fazer a sincronização regularmente para manter os dados atualizados.
          </ThemedText>
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
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
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
  autoSyncContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  autoSyncLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  syncingText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 10,
  },
  devicesContainer: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginVertical: 15,
  },
  deviceCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#E65100',
  },
  noteText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
})
