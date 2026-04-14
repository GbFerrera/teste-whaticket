# 📱 API de Webhook para Notificações Mobile

Esta API permite que aplicativos Android e iOS recebam notificações em tempo real de novas mensagens do Whaticket.

## 🔗 Endpoints Base

```
Base URL: https://seudominio.com/mobile-webhook
```

## 🔐 Autenticação

Todas as rotas requerem autenticação via JWT token no header:

```
Authorization: Bearer <seu_jwt_token>
```

## 📋 Endpoints Disponíveis

### 1. Registrar Webhook

**POST** `/mobile-webhook/register`

Registra um webhook para receber notificações de mensagens.

#### Request Body:
```json
{
  "webhookUrl": "https://seuapp.com/webhook/notifications",
  "deviceToken": "device_token_unico_do_app",
  "platform": "android" // ou "ios"
}
```

#### Response (201):
```json
{
  "message": "Webhook registrado com sucesso",
  "webhook": {
    "id": 1,
    "userId": 123,
    "companyId": 1,
    "webhookUrl": "https://seuapp.com/webhook/notifications",
    "deviceToken": "device_token_unico_do_app",
    "platform": "android",
    "isActive": true,
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

### 2. Remover Webhook

**DELETE** `/mobile-webhook/unregister`

Remove/desativa um webhook existente.

#### Request Body:
```json
{
  "deviceToken": "device_token_unico_do_app"
}
```

#### Response (200):
```json
{
  "message": "Webhook removido com sucesso"
}
```

### 3. Listar Webhooks

**GET** `/mobile-webhook/list`

Lista todos os webhooks ativos do usuário.

#### Response (200):
```json
{
  "webhooks": [
    {
      "id": 1,
      "userId": 123,
      "companyId": 1,
      "webhookUrl": "https://seuapp.com/webhook/notifications",
      "deviceToken": "device_token_unico_do_app",
      "platform": "android",
      "isActive": true,
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

### 4. Testar Webhook

**POST** `/mobile-webhook/test`

Envia uma notificação de teste para verificar se o webhook está funcionando.

#### Request Body:
```json
{
  "deviceToken": "device_token_unico_do_app"
}
```

#### Response (200):
```json
{
  "message": "Notificação de teste enviada com sucesso"
}
```

## 📨 Formato das Notificações Recebidas

Quando uma nova mensagem chegar, seu webhook receberá um POST com o seguinte formato:

### Notificação de Nova Mensagem:
```json
{
  "type": "new_message",
  "title": "Nova mensagem - João Silva",
  "message": "Olá, preciso de ajuda com meu pedido",
  "timestamp": "2024-12-01T10:30:00.000Z",
  "companyId": 1,
  "ticketId": 456,
  "contactId": 789,
  "contactName": "João Silva",
  "fromMe": false,
  "messageId": 12345,
  "queueId": 2
}
```

### Notificação de Teste:
```json
{
  "type": "test",
  "title": "Teste de Notificação",
  "message": "Este é um teste do sistema de notificações mobile",
  "timestamp": "2024-12-01T10:30:00.000Z",
  "userId": 123,
  "companyId": 1
}
```

## 🔒 Filtros de Segurança

### Por Empresa:
- Usuários só recebem notificações de mensagens da sua empresa
- `companyId` sempre corresponde à empresa do usuário autenticado

### Por Usuário:
- Se a mensagem tem um usuário responsável específico, apenas ele recebe a notificação
- Mensagens sem usuário específico são enviadas para todos os webhooks da empresa

### Por Tipo de Mensagem:
- Apenas mensagens **recebidas** (`fromMe: false`) geram notificações
- Mensagens enviadas pelo próprio usuário não geram notificações

## 🛠️ Implementação no App Mobile

### 1. Registrar Webhook ao Fazer Login:
```javascript
// Exemplo em React Native
const registerWebhook = async () => {
  try {
    const response = await fetch('https://seudominio.com/mobile-webhook/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        webhookUrl: 'https://seuapp.com/webhook/notifications',
        deviceToken: await getDeviceToken(), // Token único do dispositivo
        platform: Platform.OS // 'android' ou 'ios'
      })
    });
    
    const data = await response.json();
    console.log('Webhook registrado:', data);
  } catch (error) {
    console.error('Erro ao registrar webhook:', error);
  }
};
```

### 2. Endpoint no Seu App para Receber Notificações:
```javascript
// Exemplo de endpoint no seu servidor
app.post('/webhook/notifications', (req, res) => {
  const notification = req.body;
  
  // Processar notificação
  if (notification.type === 'new_message') {
    // Enviar push notification para o dispositivo
    sendPushNotification({
      title: notification.title,
      body: notification.message,
      data: {
        ticketId: notification.ticketId,
        contactId: notification.contactId,
        messageId: notification.messageId
      }
    });
  }
  
  res.status(200).json({ received: true });
});
```

### 3. Remover Webhook ao Fazer Logout:
```javascript
const unregisterWebhook = async () => {
  try {
    await fetch('https://seudominio.com/mobile-webhook/unregister', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        deviceToken: await getDeviceToken()
      })
    });
  } catch (error) {
    console.error('Erro ao remover webhook:', error);
  }
};
```

## ⚠️ Considerações Importantes

### Timeout:
- Webhooks têm timeout de 5 segundos
- Se o endpoint não responder em 5s, será considerado falha

### Falhas:
- Após 5 falhas consecutivas, o webhook é automaticamente desativado
- Você pode reativar registrando novamente

### Headers das Requisições:
```
Content-Type: application/json
User-Agent: Whaticket-Mobile-Webhook/1.0
```

### Códigos de Status Esperados:
- **200-299**: Sucesso
- **Outros**: Considerado falha

## 🔧 Exemplo Completo de Integração

```javascript
class WhatiketWebhook {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async register(webhookUrl, deviceToken, platform) {
    const response = await fetch(`${this.baseUrl}/mobile-webhook/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ webhookUrl, deviceToken, platform })
    });
    return response.json();
  }

  async unregister(deviceToken) {
    const response = await fetch(`${this.baseUrl}/mobile-webhook/unregister`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ deviceToken })
    });
    return response.json();
  }

  async test(deviceToken) {
    const response = await fetch(`${this.baseUrl}/mobile-webhook/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ deviceToken })
    });
    return response.json();
  }
}

// Uso:
const webhook = new WhatiketWebhook('https://seudominio.com', userToken);
await webhook.register('https://seuapp.com/notifications', 'device123', 'android');
```

## 🚀 Próximos Passos

1. **Implementar o endpoint** no seu app para receber notificações
2. **Registrar o webhook** quando o usuário fizer login
3. **Testar** com o endpoint de teste
4. **Implementar push notifications** no seu app
5. **Remover webhook** quando o usuário fizer logout

Agora você tem um sistema completo de notificações mobile integrado ao Whaticket! 🎉
