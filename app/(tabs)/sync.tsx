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
import { DiscoveredDevice, NetworkDiscoveryService } from '../.services/NetworkDiscoveryService'
import { SyncClientService, SyncStatus } from '../.services/SyncClientService'

export default function SyncScreen() {
  const router = useRouter()
  const [devices, setDevices] = useState<DiscoveredDevice[]>([])
  const [discovering, setDiscovering] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    message: 'Pronto para sincronizar',
  })
  const [manualIp, setManualIp] = useState('')

  useEffect(() => {
    const unsubscribe = NetworkDiscoveryService.subscribe(setDevices)
    return unsubscribe
  }, [])

  const handleDiscoverDevices = async () => {
    try {
      setDiscovering(true)
      setSyncStatus({ status: 'syncing', message: 'Procurando dispositivos...' })

      const discoveredDevices = await NetworkDiscoveryService.discoverDevices(8000)
      setDevices(discoveredDevices)

      if (discoveredDevices.length === 0) {
        setSyncStatus({ status: 'idle', message: 'Nenhum dispositivo encontrado' })
      } else {
        setSyncStatus({
          status: 'success',
          message: `${discoveredDevices.length} dispositivo(s) encontrado(s)`,
        })
      }
    } catch (error) {
      setSyncStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro na descoberta',
      })
    } finally {
      setDiscovering(false)
    }
  }

  const handleAddManualDevice = () => {
    if (!manualIp) {
      Alert.alert('Erro', 'Digite um endereço IP ou URL')
      return
    }

    const device = NetworkDiscoveryService.addDevice(manualIp, 3000)
    Alert.alert('Sucesso', `Dispositivo adicionado: ${device.name}`)
    setManualIp('')
  }

  const handleSyncDevice = async (device: DiscoveredDevice) => {
    try {
      setSyncing(true)
      const serverUrl = `${device.ipAddress}:${device.port}`

      const result = await SyncClientService.bidirectionalSync(serverUrl)
      setSyncStatus(result)

      if (result.status === 'success') {
        Alert.alert('Sucesso', 'Sincronização concluída com sucesso!')
      } else if (result.status === 'error') {
        Alert.alert('Erro', result.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sincronizar'
      setSyncStatus({ status: 'error', message })
      Alert.alert('Erro', message)
    } finally {
      setSyncing(false)
    }
  }

  const handleTestConnection = async (device: DiscoveredDevice) => {
    try {
      const connected = await NetworkDiscoveryService.testConnection(device)
      if (connected) {
        Alert.alert('Sucesso', `Conexão OK com ${device.ipAddress}`)
      } else {
        Alert.alert('Erro', `Não conseguiu conectar em ${device.ipAddress}`)
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao testar conexão')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#28a745'
      case 'error':
        return '#dc3545'
      case 'syncing':
        return '#007bff'
      default:
        return '#999'
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
        <ThemedText style={styles.title}>WiFi Sync</ThemedText>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(syncStatus.status) },
            ]}
          />
          <ThemedText style={styles.statusText}>{syncStatus.message}</ThemedText>
          {syncStatus.lastSync && (
            <ThemedText style={styles.lastSyncText}>
              Última: {new Date(syncStatus.lastSync).toLocaleTimeString('pt-BR')}
            </ThemedText>
          )}
        </View>

        {/* Descoberta de Dispositivos */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔍 Descobrir Dispositivos</ThemedText>
          <TouchableOpacity
            style={[styles.button, discovering && styles.buttonDisabled]}
            onPress={handleDiscoverDevices}
            disabled={discovering || syncing}
          >
            {discovering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Procurar na Rede</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Adicionar Manualmente */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📱 Adicionar Manualmente</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="IP do servidor (ex: 192.168.1.100)"
            placeholderTextColor="#999"
            value={manualIp}
            onChangeText={setManualIp}
          />
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, syncing && styles.buttonDisabled]}
            onPress={handleAddManualDevice}
            disabled={syncing}
          >
            <Text style={styles.buttonSecondaryText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Dispositivos */}
        {devices.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>🖥️ Dispositivos Disponíveis</ThemedText>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
                  <ThemedText style={styles.deviceIp}>
                    {device.ipAddress}:{device.port}
                  </ThemedText>
                </View>
                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionTest]}
                    onPress={() => handleTestConnection(device)}
                    disabled={syncing}
                  >
                    <Text style={styles.actionButtonText}>Testar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.actionSync,
                      syncing && styles.buttonDisabled,
                    ]}
                    onPress={() => handleSyncDevice(device)}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Sincronizar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Informações */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ℹ️ Instruções</ThemedText>
          <ThemedText style={styles.instructionText}>
            1. Inicie o servidor de sincronização:{'\n'}
            <Text style={styles.codeText}>npm run sync-server</Text>
            {'\n\n'}
            2. Clique em "Procurar na Rede" para descobrir dispositivos{'\n'}
            {'\n'}
            3. Ou adicione manualmente o IP do servidor{'\n'}
            {'\n'}
            4. Clique em "Sincronizar" para fazer upload/download dos dados
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#999',
    marginRight: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
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
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#666',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceIp: {
    fontSize: 12,
    color: '#666',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  actionTest: {
    backgroundColor: '#6c757d',
  },
  actionSync: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
})
