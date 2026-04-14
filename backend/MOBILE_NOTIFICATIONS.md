# Backend - Sistema de Notificações Push e Auto-Login Mobile

## 📱 Funcionalidades Implementadas

### 1. Auto-Login para WebView
- **Endpoint**: `POST /auth/mobile-login`
- **Funcionalidade**: Permite que o token JWT do app seja validado para login automático na WebView
- **Controller**: `MobileAuthController.ts`

### 2. Sistema de Notificações Push
- **Endpoint**: `POST /notifications/register-device` - Registrar dispositivo móvel
- **Endpoint**: `POST /notifications/unregister-device` - Remover dispositivo móvel
- **Model**: `UserDevice.ts` - Modelo para armazenar dispositivos dos usuários
- **Controller**: `NotificationController.ts`

### 3. Integração com Mensagens
- **Notificação automática**: Quando nova mensagem é criada, notificação push é enviada
- **WebSocket**: Continua emitindo eventos para web
- **Cross-platform**: Suporte para iOS e Android

## 🗄️ Banco de Dados

### Tabela UserDevices
```sql
CREATE TABLE UserDevices (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES Users(id),
  deviceToken TEXT NOT NULL,
  platform VARCHAR(10) CHECK (platform IN ('ios', 'android')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configurações Necessárias

### 1. Firebase Cloud Messaging (FCM)
Para envio de notificações push, configurar:
- Chave do servidor FCM
- Configurar credenciais no arquivo `.env`

### 2. Variáveis de Ambiente
```env
FCM_SERVER_KEY=your_fcm_server_key
JWT_SECRET=your_jwt_secret
```

## 📲 Implementação Mobile (React Native)

### 1. Registro de Dispositivo
```typescript
// No app React Native
import { messaging } from '@react-native-firebase/messaging';

const registerDevice = async () => {
  const token = await messaging().getToken();
  
  await api.post('/notifications/register-device', {
    deviceToken: token,
    platform: Platform.OS
  });
};
```

### 2. Handler de Notificações
```typescript
import { messaging, Notification, AndroidNotification } from '@react-native-firebase/messaging';

// Foreground
messaging().onMessage(async remoteMessage => {
  console.log('Notification received:', remoteMessage);
});

// Background/Quit
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});
```

## 🔄 Fluxo de Funcionamento

### Auto-Login WebView
1. Usuário faz login no app mobile
2. Token JWT é armazenado
3. WebView é carregada com JavaScript injetado
4. Token é enviado para `/auth/mobile-login`
5. Backend valida token e cria sessão web
6. Página recarrega com usuário logado

### Notificações Push
1. Nova mensagem é criada no backend
2. `notifyNewMessage()` é chamado
3. Dispositivos do usuário são buscados
4. Notificação é enviada via FCM
5. App recebe notificação e pode exibir alerta

## 🚀 Próximos Passos

1. **Configurar FCM**: Adicionar credenciais do Firebase
2. **Implementar no app**: Adicionar suporte a notificações no React Native
3. **Testar integração**: Verificar fluxo completo
4. **Otimizar**: Adicionar tratamento de erros e retry

## 📝 Notas

- O sistema atualmente apenas loga as notificações no console
- É necessário configurar FCM para envio real
- A tabela UserDevices precisa ser criada no banco de dados
- O auto-login funciona injetando JavaScript na WebView
