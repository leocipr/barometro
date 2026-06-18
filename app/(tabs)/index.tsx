import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { BarometroLogoWithText } from '../../components/barometro-logo'
import { ThemedText } from '../../components/themed-text'
import { ThemedView } from '../../components/themed-view'
import { useColorScheme } from '../use-color-scheme'

export default function HomeScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()

  const features = [
    {
      icon: '📦',
      name: 'Produtos',
      desc: 'Gerencie produtos com preços e margem',
      route: 'products',
    },
    {
      icon: '👥',
      name: 'Clientes',
      desc: 'Cadastre clientes e telefones WhatsApp',
      route: 'clients',
    },
    {
      icon: '🛒',
      name: 'Lançamentos',
      desc: 'Registre consumos em tempo real',
      route: 'consumptions',
    },
    {
      icon: '📄',
      name: 'Faturas',
      desc: 'Gere e envie faturas via WhatsApp',
      route: 'invoices',
    },
    {
      icon: '🔄',
      name: 'Sincronizar',
      desc: 'Sincronize entre dispositivos na rede WiFi',
      route: 'sync',
    },
  ]

  const handleFeaturePress = (route: string) => {
    router.push(`/(tabs)/${route}`)
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Logo Principal */}
        <View style={styles.logoContainer}>
          <BarometroLogoWithText size="large" />
        </View>

        {/* Status/Descrição */}
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.welcomeTitle}>Bem-vindo ao BARômetro!</ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            Seu gerenciador de bar inteligente para operações em alto mar
          </ThemedText>
        </View>

        {/* Resumo de Funcionalidades */}
        <View style={styles.featuresContainer}>
          <ThemedText style={styles.featuresTitle}>🎯 Funcionalidades</ThemedText>

          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureItem}
              onPress={() => handleFeaturePress(feature.route)}
              activeOpacity={0.7}>
              <ThemedText style={styles.featureIcon}>{feature.icon}</ThemedText>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureName}>{feature.name}</ThemedText>
                <ThemedText style={styles.featureDesc}>{feature.desc}</ThemedText>
              </View>
              <ThemedText style={styles.arrowIcon}>→</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dicas de Uso */}
        <View style={styles.tipsContainer}>
          <ThemedText style={styles.tipsTitle}>💡 Comece Agora</ThemedText>
          <ThemedText style={styles.tipText}>1. Cadastre os produtos do seu bar</ThemedText>
          <ThemedText style={styles.tipText}>2. Adicione clientes com telefone WhatsApp</ThemedText>
          <ThemedText style={styles.tipText}>3. Registre os consumos em tempo real</ThemedText>
          <ThemedText style={styles.tipText}>4. Gere faturas mensais automáticas</ThemedText>
          <ThemedText style={styles.tipText}>5. Sincronize com outro dispositivo via WiFi</ThemedText>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoVersion}>Versão 1.0.0</ThemedText>
          <ThemedText style={styles.infoText}>
            Desenvolvido para gerenciar seu bar em qualquer lugar, com ou sem internet
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingTop: 32,
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 71, 42, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(26, 71, 42, 0.15)',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
    minWidth: 32,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: 18,
    marginLeft: 8,
    opacity: 0.5,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 0,
    marginBottom: 24,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 20,
    opacity: 0.85,
  },
  bold: {
    fontWeight: '700',
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  infoVersion: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
  },
  infoText: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
})

