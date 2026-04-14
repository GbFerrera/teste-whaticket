export const TOOL_CATALOG = [
  {
    value: "send_product",
    title: "Enviar produto",
    description: "Envia cards de produtos cadastrados."
  },
  {
    value: "execute_tool",
    title: "Executar integração externa",
    description: "Acessa ferramentas conectadas por APIs externas."
  },
  {
    value: "like_message",
    title: "Curtir mensagem",
    description: "Reage à mensagem do cliente com um emoji."
  },
  {
    value: "send_contact_file",
    title: "Enviar arquivo do contato",
    description: "Compartilha arquivos armazenados no contato."
  },
  {
    value: "send_emoji",
    title: "Enviar emoji",
    description: "Responde rapidamente com emojis pré-definidos."
  },
  {
    value: "get_company_schedule",
    title: "Horário da empresa",
    description: "Consulta o horário de funcionamento cadastrado."
  },
  {
    value: "get_contact_schedules",
    title: "Listar agendamentos",
    description: "Mostra compromissos já criados para o contato."
  },
  {
    value: "create_contact_schedule",
    title: "Criar agendamento",
    description: "Agenda um novo compromisso para o cliente."
  },
  {
    value: "update_contact_schedule",
    title: "Atualizar agendamento",
    description: "Edita um agendamento existente."
  },
  {
    value: "get_contact_info",
    title: "Ver dados do contato",
    description: "Retorna informações armazenadas do cliente."
  },
  {
    value: "update_contact_info",
    title: "Atualizar contato",
    description: "Edita campos do cadastro do contato."
  },
  {
    value: "format_message",
    title: "Formatar mensagem",
    description: "Aplica variáveis e formatação avançada."
  },
  {
    value: "execute_command",
    title: "Executar comando (Typebot)",
    description: "Executa transferências, tags e encerramentos via JSON (# { \"queueId\":\"5\" })."
  },
  {
    value: "call_prompt_agent",
    title: "Chamar outro prompt",
    description: "Encadeia prompts diferentes como sub-agentes."
  },
  {
    value: "list_professionals",
    title: "Listar profissionais",
    description: "Consulta os profissionais e horários disponíveis."
  },
  {
    value: "get_asaas_second_copy",
    title: "Segunda via Asaas",
    description: "Consulta boleto/PIX direto no Asaas usando apenas o CPF informado."
  },
  {
    value: "auto_variables",
    title: "Variáveis automáticas",
    description: "Substitui automaticamente variáveis como {{ms}}, {{name}}, {{firstName}}, {{userName}}, {{date}}, {{ticket_id}}, {{queue}}, {{connection}}, {{protocol}}, {{hora}} nas respostas da IA."
  }
];

export const DEFAULT_SENSITIVE_TOOLS = ["create_company", "execute_tool", "get_asaas_second_copy"];
