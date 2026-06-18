# Setup WatermelonDB (Android)

Siga estes passos para ejetar o projeto Expo e instalar o WatermelonDB (Android):

1. Ejetar / gerar projetos nativos (vamos focar em Android):

```bash
npx expo prebuild --platform android
```

2. Instalar dependências nativas necessárias:

```bash
yarn add @nozbe/watermelondb @nozbe/watermelondb/adapters/sqlite react-native-sqlite-storage react-native-zeroconf react-native-http-server
```

3. No Android, atualize `android/app/src/main/AndroidManifest.xml` se necessário para permissões de rede local (INTERNET).

4. Build do app Android (requer Android SDK configurado):

```bash
cd android
./gradlew assembleDebug
```

5. Observações e próximos passos:
- Após instalar, abra o Android Studio e sincronize o projeto.
- Teste o banco inicial usando o `database` exportado em `app/db/index.ts`.
- Implemente endpoints HTTP locais para sincronização e use mDNS (`react-native-zeroconf`) para descobrir pares na mesma rede.
