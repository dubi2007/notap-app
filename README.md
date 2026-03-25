# Notas App - Mobile Client

Aplicación móvil construida con Expo y React Native conectada al backend de Notas en Supabase.
Ofrece lectura de notas y autorización de sesiones web mediante código QR de manera segura.

## Requisitos
- Node.js >= 18
- npm o pnpm
- Cuenta en Expo (opcional para desarrollo local, requerida para builds de EAS)
- Expo Go instalado en tu dispositivo físico o un Emulador/Simulador.

## Correr el Proyecto Localmente

1. Clona el repositorio y navega hasta esta carpeta.
2. Asegúrate de tener las variables en `.env` (el archivo ya está creado con los valores necesarios listos, debes ingresar el ANON KEY de Supabase en caso que se haya borrado):
```
EXPO_PUBLIC_SUPABASE_URL=https://toijzwflmckhaoanigss.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```
3. Instala las dependencias:
```bash
npm install
```
4. Inicia el servidor de desarrollo de Expo:
```bash
npx expo start
```
5. Escanea el código QR que aparece en la terminal usando la aplicación **Expo Go** en Android (o la cámara nativa en iOS) o presiona `a` para abrir en el emulador de Android.

## Hacer el Build de Producción (APK/AAB) con EAS (Expo Application Services)

Para generar el `.apk` (para instalar en tu celular directamente) o `.aab` (para subir a Google Play) en la nube utilizando los servidores gratuitos de Expo:

1. Instala el CLI de EAS globalmente (si no lo tienes):
```bash
npm install -g eas-cli
```
2. Inicia sesión en tu cuenta de Expo:
```bash
eas login
```
3. Configura el proyecto en los servidores de EAS (esto enlazará el ID de tu proyecto):
```bash
eas build:configure
```
4. Para generar un archivo instalable localmente **APK** para Android:
```bash
eas build -p android --profile preview
```
*(Al finalizar, EAS te dará un enlace para descargar el .apk e instalarlo en tu dispositivo).*

5. Para compilar el archivo **AAB** de producción (Google Play Store):
```bash
eas build -p android --profile production
```

## Arquitectura

- **Framework**: React Native con Expo (SDK 52+), manejado con **Expo Router** para la navegación.
- **Estado**: Zustand para la sesión de `auth` y la gestión `notes`/`folders`.
- **Autenticación**: Email/Contraseña y Enlace Mágico (OTP) usando `supabase-js`, obteniendo el token OTP desde el API del servidor en Next.js.
- **Scanner**: Usa `expo-camera` para escanear la URL del código QR, extrayendo el `sessionId` y llamando al endpoint en Next.js con el Token nativo activo.
- **Estilos**: NativeWind (Tailwind CSS) + Tema oscuro idéntico a la web.
