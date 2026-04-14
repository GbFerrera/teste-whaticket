// Exemplo de como testar o webhook de notificações mobile
// Execute: node examples/test-mobile-webhook.js
//
// VARIÁVEIS DE AMBIENTE SUPORTADAS:
// - BACKEND_URL ou API_URL: URL base da API (ex: https://api.petritecnologia.com.br)
// - Se não definidas, usa http://localhost:8080

const axios = require('axios');
require('dotenv').config();

// Configurações - ALTERE APENAS OS DADOS DE TESTE
const CONFIG = {
  baseUrl: process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:8080', // Puxado do .env
  userEmail: 'admin@empresa.com',   // Email do usuário
  userPassword: '123456',           // Senha do usuário
  webhookUrl: 'https://webhook.site/unique-id', // Use webhook.site para testar
  deviceToken: 'test-device-123',   // Token único do dispositivo
  platform: 'android'              // android ou ios
};

class MobileWebhookTester {
  constructor(config) {
    this.config = config;
    this.token = null;
  }

  async login() {
    try {
      console.log('🔐 Fazendo login...');
      const response = await axios.post(`${this.config.baseUrl}/auth/login`, {
        email: this.config.userEmail,
        password: this.config.userPassword
      });

      this.token = response.data.token;
      console.log('✅ Login realizado com sucesso!');
      console.log(`Token: ${this.token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('❌ Erro no login:', error.response?.data || error.message);
      return false;
    }
  }

  async registerWebhook() {
    try {
      console.log('\n📱 Registrando webhook...');
      const response = await axios.post(
        `${this.config.baseUrl}/mobile-webhook/register`,
        {
          webhookUrl: this.config.webhookUrl,
          deviceToken: this.config.deviceToken,
          platform: this.config.platform
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Webhook registrado com sucesso!');
      console.log('Dados do webhook:', JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar webhook:', error.response?.data || error.message);
      return false;
    }
  }

  async listWebhooks() {
    try {
      console.log('\n📋 Listando webhooks...');
      const response = await axios.get(
        `${this.config.baseUrl}/mobile-webhook/list`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      console.log('✅ Webhooks encontrados:');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Erro ao listar webhooks:', error.response?.data || error.message);
      return false;
    }
  }

  async testWebhook() {
    try {
      console.log('\n🧪 Testando webhook...');
      const response = await axios.post(
        `${this.config.baseUrl}/mobile-webhook/test`,
        {
          deviceToken: this.config.deviceToken
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Teste enviado com sucesso!');
      console.log('Resposta:', JSON.stringify(response.data, null, 2));
      console.log(`\n🌐 Verifique seu webhook em: ${this.config.webhookUrl}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao testar webhook:', error.response?.data || error.message);
      return false;
    }
  }

  async unregisterWebhook() {
    try {
      console.log('\n🗑️ Removendo webhook...');
      const response = await axios.delete(
        `${this.config.baseUrl}/mobile-webhook/unregister`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            deviceToken: this.config.deviceToken
          }
        }
      );

      console.log('✅ Webhook removido com sucesso!');
      console.log('Resposta:', JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover webhook:', error.response?.data || error.message);
      return false;
    }
  }

  async runFullTest() {
    console.log('🚀 Iniciando teste completo do Mobile Webhook\n');
    console.log('Configurações:');
    console.log(`- Base URL: ${this.config.baseUrl} ${process.env.BACKEND_URL || process.env.API_URL ? '(do .env)' : '(padrão)'}`);
    console.log(`- Webhook URL: ${this.config.webhookUrl}`);
    console.log(`- Device Token: ${this.config.deviceToken}`);
    console.log(`- Platform: ${this.config.platform}\n`);

    // 1. Login
    const loginSuccess = await this.login();
    if (!loginSuccess) return;

    // 2. Registrar webhook
    const registerSuccess = await this.registerWebhook();
    if (!registerSuccess) return;

    // 3. Listar webhooks
    await this.listWebhooks();

    // 4. Testar webhook
    await this.testWebhook();

    // 5. Aguardar um pouco
    console.log('\n⏳ Aguardando 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. Remover webhook (opcional)
    const shouldRemove = process.argv.includes('--remove');
    if (shouldRemove) {
      await this.unregisterWebhook();
    } else {
      console.log('\n💡 Para remover o webhook, execute: node test-mobile-webhook.js --remove');
    }

    console.log('\n🎉 Teste concluído!');
  }
}

// Executar teste
const tester = new MobileWebhookTester(CONFIG);
tester.runFullTest().catch(console.error);

// Exemplo de uso:
// node examples/test-mobile-webhook.js           # Registra e testa
// node examples/test-mobile-webhook.js --remove  # Remove o webhook também
