// Configurações do EmailJS
// Para configurar:
// 1. Acesse https://www.emailjs.com/
// 2. Crie uma conta gratuita
// 3. Configure um serviço de email (Gmail, Outlook, etc.)
// 4. Crie um template de email
// 5. Substitua os valores abaixo

export const EMAILJS_CONFIG = {
  // Sua chave pública do EmailJS
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY_HERE',
  
  // ID do serviço de email configurado
  SERVICE_ID: 'YOUR_SERVICE_ID_HERE',
  
  // ID do template de email criado
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID_HERE',
  
  // Email de destino (onde receberá as solicitações)
  TO_EMAIL: 'rafaeloficialpaixao@gmail.com'
};

// Template sugerido para o EmailJS:
/*
Assunto: {{subject}}

Nova solicitação de CRM personalizado:

Nome: {{from_name}}
Email: {{from_email}}
Telefone: {{phone}}
Empresa: {{company}}
Segmento: {{segment}}

Mensagem:
{{message}}

---
Enviado via formulário do dashboard
*/
