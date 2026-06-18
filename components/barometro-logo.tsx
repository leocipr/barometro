import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { ThemedText } from './themed-text'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
}

export function BarometroLogo({ size = 'medium' }: LogoProps) {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 200,
  }

  const logoSize = sizeMap[size]

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/barometro-logo-full.png')}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
    </View>
  )
}

export function BarometroLogoWithText({ size = 'medium' }: LogoProps) {
  const sizeMap = {
    small: 60,
    medium: 100,
    large: 150,
  }

  const logoSize = sizeMap[size]

  return (
    <View style={styles.containerWithText}>
      <Image
        source={require('@/assets/images/barometro-logo-full.png')}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      <ThemedText style={styles.subtitle}>Bar de Bordo</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerWithText: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  logo: {
    aspectRatio: 1,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
  },
})
