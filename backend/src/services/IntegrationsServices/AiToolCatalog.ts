import { SchemaType } from "@google/generative-ai";

export type AiToolProvider = "openai" | "gemini";

export type AiToolName =
  | "allow_product_resend"
  | "send_product"
  | "execute_tool"
  | "list_available_tools"
  | "like_message"
  | "send_contact_file"
  | "send_emoji"
  | "get_company_schedule"
  | "get_contact_schedules"
  | "list_professionals"
  | "create_contact_schedule"
  | "update_contact_schedule"
  | "get_contact_info"
  | "update_contact_info"
  | "get_company_groups"
  | "send_group_message"
  | "format_message"
  | "execute_command"
  | "execute_multiple_commands"
  | "call_prompt_agent"
  | "get_asaas_second_copy"
  | "call_flow_builder"
  | "pause_bot"
  | "send_location"
  | "jump_to_node"
  | "notify_user"
  | "validate_cpf"
  | "validate_email"
  | "validate_phone"
  | "schedule_message";

export type AiToolSpec = {
  name: AiToolName;
  providers: AiToolProvider[];
  sensitive: boolean;
  description: string;
  whenToUse: string;
  howToUse: string;
  openaiParameters?: any;
  geminiParameters?: any;
};

export const AI_TOOL_POLICY = {
  requiresFrontendPromptPermission: true,
  neverRevealExecutionToCustomer: true
} as const;

export const AI_TOOL_CATALOG: AiToolSpec[] = [
  {
    name: "allow_product_resend",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Libera o reenvio de um produto que já foi enviado anteriormente neste ticket.",
    whenToUse:
      "Use apenas quando o cliente pedir explicitamente para ver o mesmo produto novamente e isso estiver permitido nas instruções personalizadas.",
    howToUse: "Chame allow_product_resend com productId (ou resetAll=true).",
    openaiParameters: {
      type: "object",
      properties: {
        productId: {
          type: "number",
          description: "ID do produto a ser liberado para reenvio."
        },
        resetAll: {
          type: "boolean",
          description: "Se true, limpa o histórico de produtos enviados e libera todos novamente."
        }
      },
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: {
          type: SchemaType.NUMBER,
          description: "ID do produto que deve ser liberado."
        },
        resetAll: {
          type: SchemaType.BOOLEAN,
          description: "Se true, limpa o histórico de produtos enviados e libera todos novamente."
        }
      },
      required: []
    }
  },
  {
    name: "send_product",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Envia ao cliente as informações de um produto interno (nome, preço, descrição e imagens).",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para enviar produto OU quando o cliente pedir e o prompt permitir.",
    howToUse:
      "Chame send_product com productId. Evite reenviar o mesmo produto sem o cliente pedir novamente; se necessário, use allow_product_resend antes.",
    openaiParameters: {
      type: "object",
      properties: {
        productId: {
          type: "number",
          description: "ID do produto a ser enviado ao cliente."
        },
        quantity: {
          type: "number",
          description: "Quantidade do produto (opcional, apenas para contexto de conversa)."
        }
      },
      required: ["productId"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: {
          type: SchemaType.NUMBER,
          description: "ID do produto a ser enviado ao cliente."
        },
        quantity: {
          type: SchemaType.NUMBER,
          description: "Quantidade do produto (opcional, apenas para contexto de conversa)."
        }
      },
      required: ["productId"]
    }
  },
  {
    name: "list_available_tools",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Lista todas as ferramentas/APIs configuradas e ativas disponíveis para uso.",
    whenToUse:
      "Use antes de executar qualquer ferramenta para saber quais ferramentas estão disponíveis e quais placeholders cada uma requer.",
    howToUse:
      "Chame list_available_tools sem parâmetros. Retorna lista com nome, descrição e placeholders de cada ferramenta ativa.",
    openaiParameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: []
    }
  },
  {
    name: "execute_tool",
    providers: ["openai", "gemini"],
    sensitive: true,
    description:
      "Executa uma ferramenta/API pré-configurada. IMPORTANTE: Após receber a resposta da API, você DEVE interpretar o resultado e responder ao usuário de forma natural. NUNCA mostre JSON cru.",
    whenToUse:
      "Use list_available_tools primeiro para ver ferramentas disponíveis, depois execute_tool com os placeholders necessários. SEMPRE interprete a resposta antes de enviar ao usuário.",
    howToUse:
      "1) Liste ferramentas disponíveis 2) Execute com placeholders 3) INTERPRETE a resposta e responda naturalmente ao usuário",
    openaiParameters: {
      type: "object",
      properties: {
        ferramentaNome: {
          type: "string",
          description: "Nome exato da ferramenta (campo 'nome') a ser executada. Escolha apenas entre as ferramentas listadas em 'Ferramentas disponíveis' no contexto."
        },
        placeholders: {
          type: "object",
          description: "Valores para substituir os placeholders da URL/body, por exemplo { cep: '01001000' }. Somente use chaves listadas como placeholders da ferramenta.",
          additionalProperties: {
            type: ["string", "number", "boolean", "null"] as any
          }
        },
        bodyOverride: {
          type: "object",
          description: "(Opcional) Body adicional ou de override para a requisição. Será mesclado ao body padrão da ferramenta.",
          additionalProperties: true
        },
        queryOverride: {
          type: "object",
          description: "(Opcional) Query params adicionais ou de override. Será mesclado aos query_params padrão da ferramenta.",
          additionalProperties: true
        },
        headersOverride: {
          type: "object",
          description: "(Opcional) Headers adicionais ou de override. Será mesclado aos headers padrão da ferramenta.",
          additionalProperties: true
        }
      },
      required: ["ferramentaNome"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        ferramentaNome: {
          type: SchemaType.STRING,
          description: "Nome exato da ferramenta a ser executada."
        },
        placeholders: {
          type: SchemaType.OBJECT,
          description: "Valores para substituir os placeholders da URL/body. Ex: { \"CEP\": \"12345-678\" }.",
          properties: {}
        },
        bodyOverride: {
          type: SchemaType.OBJECT,
          description: "Body adicional ou de override para a requisição (JSON genérico).",
          properties: {}
        },
        queryOverride: {
          type: SchemaType.OBJECT,
          description: "Query params adicionais ou de override (chave/valor).",
          properties: {}
        },
        headersOverride: {
          type: SchemaType.OBJECT,
          description: "Headers adicionais ou de override (chave/valor).",
          properties: {}
        }
      },
      required: ["ferramentaNome"]
    }
  },
  {
    name: "like_message",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Envia uma reação/curtida para a última mensagem do cliente.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para reagir/curtir (por exemplo, em mensagens positivas).",
    howToUse:
      "Chame like_message com emoji (ex.: ❤️). Não envie o emoji como mensagem.",
    openaiParameters: {
      type: "object",
      properties: {
        emoji: {
          type: "string",
          description: "Emoji a ser usado na reação. Se não for informado, use um joinha padrão (👍)."
        }
      },
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        emoji: {
          type: SchemaType.STRING,
          description: "Emoji a ser usado na reação. Se não for informado, use um joinha padrão (👍)."
        }
      },
      required: []
    }
  },
  {
    name: "send_contact_file",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Envia para o cliente um arquivo anexado ao contato.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para enviar um arquivo do contato ou quando o cliente pedir e o prompt permitir.",
    howToUse:
      "Chame send_contact_file com filename (nome exato do arquivo salvo no contato).",
    openaiParameters: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Nome exato do arquivo salvo em contact.files.filename OU o originalName. Use somente nomes listados previamente em get_contact_info."
        }
      },
      required: ["filename"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        filename: {
          type: SchemaType.STRING,
          description: "Nome exato do arquivo salvo em contact.files."
        }
      },
      required: ["filename"]
    }
  },
  {
    name: "send_emoji",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Envia uma mensagem curta contendo apenas um emoji (ou poucos).",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem explicitamente para enviar emoji como mensagem.",
    howToUse: "Chame send_emoji com emoji.",
    openaiParameters: {
      type: "object",
      properties: {
        emoji: {
          type: "string",
          description: "Emoji (ou pequena combinação de emojis) a ser enviado ao cliente."
        }
      },
      required: ["emoji"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        emoji: {
          type: SchemaType.STRING,
          description: "Emoji (ou pequena combinação de emojis) a ser enviado ao cliente."
        }
      },
      required: ["emoji"]
    }
  },
  {
    name: "get_company_schedule",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Obtém o horário de funcionamento atual da empresa/conexão.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para verificar horário de funcionamento.",
    howToUse: "Chame get_company_schedule (opcionalmente com scope).",
    openaiParameters: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          description: "Escopo do horário: 'company' para horário geral da empresa ou 'connection' para horário da conexão atual (whatsapp). Se não informado, use 'company'."
        }
      },
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        scope: {
          type: SchemaType.STRING,
          description: "Escopo do horário: 'company' ou 'connection'."
        }
      },
      required: []
    }
  },
  {
    name: "get_contact_schedules",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Lista agendamentos do contato atual.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para consultar/listar agendamentos do contato.",
    howToUse: "Chame get_contact_schedules (opcionalmente com filtros).",
    openaiParameters: {
      type: "object",
      properties: {
        contact_id: {
          type: "number",
          description: "ID do contato. Se não informado, use o contato do ticket atual."
        },
        search: {
          type: "string",
          description: "Texto para filtrar agendamentos pelo corpo da mensagem ou nome do contato."
        },
        page: {
          type: "number",
          description: "Número da página para paginação (começando em 1)."
        }
      },
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        contact_id: {
          type: SchemaType.NUMBER,
          description: "ID do contato."
        },
        search: {
          type: SchemaType.STRING,
          description: "Texto para filtrar agendamentos."
        },
        page: {
          type: SchemaType.NUMBER,
          description: "Número da página para paginação."
        }
      },
      required: []
    }
  },
  {
    name: "list_professionals",
    providers: ["openai"],
    sensitive: false,
    description: "Lista profissionais da empresa atual, incluindo serviços e horários.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para listar profissionais/agendamentos por serviço.",
    howToUse: "Chame list_professionals (opcionalmente com filtros).",
    openaiParameters: {
      type: "object",
      properties: {
        service_name: {
          type: "string",
          description: "Filtro opcional pelo nome do serviço (por exemplo, 'corte', 'manicure')."
        },
        weekday: {
          type: "string",
          description: "Filtro opcional pelo dia da semana (ex.: 'segunda-feira')."
        },
        only_active: {
          type: "boolean",
          description: "Se true, retorna apenas profissionais ativos."
        },
        limit: {
          type: "number",
          description: "Quantidade máxima de profissionais a retornar (padrão 15, máximo 50)."
        }
      },
      required: [],
      additionalProperties: false
    }
  },
  {
    name: "create_contact_schedule",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Cria um novo agendamento para o contato atual.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para criar um agendamento.",
    howToUse: "Chame create_contact_schedule com datetime e message.",
    openaiParameters: {
      type: "object",
      properties: {
        datetime: {
          type: "string",
          description: "Data e hora exatas do agendamento em formato ISO (por exemplo, '2025-11-20T10:00:00-03:00') ou em formato 'AAAA-MM-DD HH:mm'."
        },
        message: {
          type: "string",
          description: "Texto da mensagem/descrição do agendamento que será enviada ao contato."
        }
      },
      required: ["datetime", "message"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        datetime: {
          type: SchemaType.STRING,
          description: "Data e hora do agendamento em formato ISO ou 'AAAA-MM-DD HH:mm'."
        },
        message: {
          type: SchemaType.STRING,
          description: "Texto da mensagem/descrição do agendamento."
        }
      },
      required: ["datetime", "message"]
    }
  },
  {
    name: "update_contact_schedule",
    providers: ["openai", "gemini"],
    sensitive: false,
    description: "Atualiza um agendamento existente do contato.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para alterar um agendamento existente.",
    howToUse:
      "Chame update_contact_schedule com schedule_id e os campos que deseja atualizar.",
    openaiParameters: {
      type: "object",
      properties: {
        schedule_id: {
          type: "number",
          description: "ID do agendamento que deve ser atualizado."
        },
        datetime: {
          type: "string",
          description: "Nova data/hora do agendamento em formato ISO ou 'AAAA-MM-DD HH:mm'. Se não informado, mantém a data/hora atual."
        },
        message: {
          type: "string",
          description: "Novo texto/mensagem do agendamento. Se não informado, mantém o texto atual."
        }
      },
      required: ["schedule_id"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        schedule_id: {
          type: SchemaType.NUMBER,
          description: "ID do agendamento que deve ser atualizado."
        },
        datetime: {
          type: SchemaType.STRING,
          description: "Nova data/hora do agendamento."
        },
        message: {
          type: SchemaType.STRING,
          description: "Novo texto/mensagem do agendamento."
        }
      },
      required: ["schedule_id"]
    }
  },
  {
    name: "get_contact_info",
    providers: ["openai", "gemini"],
    sensitive: true,
    description: "Obtém informações detalhadas do contato atual.",
    whenToUse:
      "Use apenas quando as instruções personalizadas permitirem buscar dados do contato, ou quando necessário para evitar perguntar dados já existentes.",
    howToUse: "Chame get_contact_info e use os dados no atendimento.",
    openaiParameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: []
    }
  },
  {
    name: "update_contact_info",
    providers: ["openai", "gemini"],
    sensitive: true,
    description: "Atualiza informações do contato atual.",
    whenToUse:
      "Use apenas quando o cliente pedir para registrar/alterar dados e quando as instruções personalizadas permitirem.",
    howToUse:
      "Chame update_contact_info com os campos informados pelo cliente.",
    openaiParameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Novo nome do contato."
        },
        email: {
          type: "string",
          description: "Novo email do contato."
        },
        number: {
          type: "string",
          description: "Novo número principal do contato (com DDD e país se aplicável)."
        },
        cpfCnpj: {
          type: "string",
          description: "CPF ou CNPJ do contato. Use apenas se o cliente informar explicitamente."
        },
        address: {
          type: "string",
          description: "Endereço do contato (rua, número, complemento, cidade/bairro)."
        },
        birthday: {
          type: "string",
          description: "Data de aniversário do contato em formato 'AAAA-MM-DD'."
        },
        anniversary: {
          type: "string",
          description: "Outra data comemorativa relevante em formato 'AAAA-MM-DD'."
        },
        info: {
          type: "string",
          description: "Observações livres sobre o contato."
        },
        extra_info: {
          type: "array",
          description: "Lista de campos extras a serem atualizados/adicionados, no formato [{ name: 'campo', value: 'valor' }].",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "string" }
            },
            required: ["name", "value"],
            additionalProperties: false
          }
        }
      },
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "Novo nome do contato."
        },
        email: {
          type: SchemaType.STRING,
          description: "Novo email do contato."
        },
        number: {
          type: SchemaType.STRING,
          description: "Novo número principal do contato."
        },
        cpfCnpj: {
          type: SchemaType.STRING,
          description: "CPF ou CNPJ do contato."
        },
        address: {
          type: SchemaType.STRING,
          description: "Endereço do contato."
        },
        birthday: {
          type: SchemaType.STRING,
          description: "Data de aniversário em formato 'AAAA-MM-DD'."
        },
        anniversary: {
          type: SchemaType.STRING,
          description: "Outra data comemorativa em formato 'AAAA-MM-DD'."
        },
        info: {
          type: SchemaType.STRING,
          description: "Observações livres sobre o contato."
        },
        extra_info: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              value: { type: SchemaType.STRING }
            },
            required: ["name", "value"]
          },
          description: "Lista de campos extras."
        }
      },
      required: []
    }
  },
  {
    name: "get_company_groups",
    providers: ["openai", "gemini"],
    sensitive: true,
    description: "Lista grupos disponíveis na conexão.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem para avisar a equipe em grupo.",
    howToUse:
      "Chame get_company_groups, selecione o group_id correto, depois use send_group_message.",
    openaiParameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: []
    }
  },
  {
    name: "send_group_message",
    providers: ["openai", "gemini"],
    sensitive: true,
    description: "Envia mensagem de texto para um grupo específico.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem explicitamente envio em grupo.",
    howToUse: "Chame send_group_message com group_id e message.",
    openaiParameters: {
      type: "object",
      properties: {
        group_id: {
          type: "string",
          description: "ID completo (remoteJid) do grupo de destino. Use o ID retornado por get_company_groups."
        },
        message: {
          type: "string",
          description: "Texto da mensagem a ser enviada no grupo."
        }
      },
      required: ["group_id", "message"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        group_id: {
          type: SchemaType.STRING,
          description: "ID completo (remoteJid) do grupo de destino."
        },
        message: {
          type: SchemaType.STRING,
          description: "Texto da mensagem a ser enviada no grupo."
        }
      },
      required: ["group_id", "message"]
    }
  },
  {
    name: "format_message",
    providers: ["openai"],
    sensitive: false,
    description: "Formata uma mensagem substituindo variáveis de template por valores reais.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem mensagem com variáveis (ex.: {{firstName}}, {{protocol}}).",
    howToUse: "Chame format_message com message e, se necessário, variables.",
    openaiParameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Mensagem contendo variáveis de template como {{ms}}, {{name}}, {{firstName}}, {{userName}}, {{date}}, {{ticket_id}}, {{queue}}, {{connection}}, {{protocol}}, {{hora}}"
        },
        variables: {
          type: "object",
          description: "Objeto com valores personalizados para substituir variáveis específicas (opcional)",
          additionalProperties: true
        }
      },
      required: ["message"],
      additionalProperties: false
    }
  },
  {
    name: "execute_command",
    providers: ["openai", "gemini"],
    sensitive: true,
    description:
      "Executa comandos administrativos no formato #{ } para alterar fila/usuário/tag/fechar atendimento.",
    whenToUse:
      "Use apenas quando as instruções personalizadas pedirem execução por IDs ou comandos administrativos.",
    howToUse:
      "Chame execute_command com command #{ \"queueId\":\"ID\", \"userId\":\"ID\", \"tagId\":\"ID\" } (ou parâmetros diretos se aplicável).",
    openaiParameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Comando no formato #{ } com as ações desejadas. Exemplos: #{ \"queueId\": \"1\" } para transferir fila, #{ \"queueId\":\"1\", \"userId\":\"1\" } para atribuir atendente, #{ \"tagId\": \"1\" } para adicionar tag, #{ \"closeTicket\":\"1\" } para finalizar"
        },
        queueId: {
          type: "string",
          description: "ID da fila para transferir (alternativa ao comando)"
        },
        userId: {
          type: "string",
          description: "ID do usuário/atendente para atribuir (opcional, usar com queueId)"
        },
        tagId: {
          type: "string",
          description: "ID da tag para adicionar (alternativa ao comando)"
        },
        closeTicket: {
          type: "boolean",
          description: "Se true, finaliza o atendimento (alternativa ao comando)"
        }
      },
      required: [],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        command: {
          type: SchemaType.STRING,
          description: "Comando no formato #{ } com as ações desejadas."
        },
        queueId: {
          type: SchemaType.STRING,
          description: "ID da fila para transferir."
        },
        userId: {
          type: SchemaType.STRING,
          description: "ID do usuário/atendente para atribuir."
        },
        tagId: {
          type: SchemaType.STRING,
          description: "ID da tag para adicionar."
        },
        closeTicket: {
          type: SchemaType.BOOLEAN,
          description: "Se true, finaliza o atendimento."
        }
      },
      required: []
    }
  },
  {
    name: "execute_multiple_commands",
    providers: ["openai", "gemini"],
    sensitive: true,
    description:
      "Executa múltiplos comandos administrativos em sequência para alterar fila/usuário/tag/fechar atendimento.",
    whenToUse:
      "Use quando precisar executar várias ações administrativas de uma vez (ex: transferir para fila E adicionar tag E atribuir usuário).",
    howToUse:
      "Chame execute_multiple_commands com commands: [ {command: '#{ \"queueId\":\"1\" }'}, {command: '#{ \"tagId\":\"2\" }'} ] ou array de comandos.",
    openaiParameters: {
      type: "object",
      properties: {
        commands: {
          type: "array",
          items: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "Comando no formato #{ } com as ações desejadas"
              },
              queueId: {
                type: "string",
                description: "ID da fila para transferir"
              },
              userId: {
                type: "string",
                description: "ID do usuário para atribuir"
              },
              tagId: {
                type: "string",
                description: "ID da tag para adicionar"
              },
              closeTicket: {
                type: "boolean",
                description: "Se true, finaliza o atendimento"
              }
            }
          },
          description: "Array de comandos para executar em sequência"
        }
      },
      required: ["commands"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        commands: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              command: {
                type: SchemaType.STRING,
                description: "Comando no formato #{ }"
              },
              queueId: {
                type: SchemaType.STRING,
                description: "ID da fila"
              },
              userId: {
                type: SchemaType.STRING,
                description: "ID do usuário"
              },
              tagId: {
                type: SchemaType.STRING,
                description: "ID da tag"
              },
              closeTicket: {
                type: SchemaType.BOOLEAN,
                description: "Finaliza atendimento"
              }
            }
          },
          description: "Array de comandos"
        }
      },
      required: ["commands"]
    }
  },
  {
    name: "call_prompt_agent",
    providers: ["openai"],
    sensitive: true,
    description:
      "Chama uma IA/Prompt especializado configurado no workflow de IAs.",
    whenToUse:
      "Use apenas quando as instruções personalizadas permitirem consultar outro prompt/agente interno.",
    howToUse:
      "Chame call_prompt_agent com o alias/nome conforme definido nas instruções.",
    openaiParameters: {
      type: "object",
      properties: {
        alias: {
          type: "string",
          description: "Alias do agente que deve ser chamado (por exemplo: 'vendas', 'suporte'). Deve ser um dos aliases permitidos no workflow da empresa."
        },
        pergunta: {
          type: "string",
          description: "Mensagem/pergunta que deve ser enviada para a IA agente selecionada."
        }
      },
      required: ["alias", "pergunta"],
      additionalProperties: false
    }
  },
  {
    name: "get_asaas_second_copy",
    providers: ["openai", "gemini"],
    sensitive: true,
    description:
      "Consulta a API do Asaas para recuperar a segunda via de um boleto (linha digitável, link e dados PIX) usando apenas o CPF.",
    whenToUse:
      "Use exclusivamente quando as instruções personalizadas do prompt orientarem a buscar a segunda via do boleto da Asaas para um CPF informado.",
    howToUse:
      "Chame get_asaas_second_copy com o CPF (apenas números ou com formatação). Se não houver CPF válido, não execute.",
    openaiParameters: {
      type: "object",
      properties: {
        cpf: {
          type: "string",
          description: "CPF do cliente (aceita números ou formato ###.###.###-##)"
        }
      },
      required: ["cpf"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        cpf: {
          type: SchemaType.STRING,
          description: "CPF do cliente (aceita números ou formato ###.###.###-##)"
        }
      },
      required: ["cpf"]
    }
  },
  {
    name: "call_flow_builder",
    providers: ["openai", "gemini"],
    sensitive: true,
    description:
      "Transfere o atendimento para um fluxo específico do Flow Builder, saindo do modo IA e iniciando um fluxo automatizado.",
    whenToUse:
      "Use quando precisar transferir o cliente para um fluxo automatizado específico (ex: pesquisa de satisfação, agendamento, vendas, suporte técnico) ou quando as instruções personalizadas determinarem a mudança para um fluxo.",
    howToUse:
      "Chame call_flow_builder com flowId (ID do fluxo) e uma mensagem de transição opcional para o cliente.",
    openaiParameters: {
      type: "object",
      properties: {
        flowId: {
          type: "number",
          description: "ID do fluxo do Flow Builder para transferir o atendimento."
        },
        transitionMessage: {
          type: "string",
          description: "Mensagem de transição para enviar ao cliente antes de iniciar o fluxo (opcional)."
        }
      },
      required: ["flowId"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        flowId: {
          type: SchemaType.NUMBER,
          description: "ID do fluxo do Flow Builder para transferir o atendimento."
        }
      },
      required: ["flowId"]
    }
  },
  {
    name: "pause_bot",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Pausa o bot/automação por um período determinado de minutos, permitindo que apenas atendentes humanos respondam.",
    whenToUse:
      "Use quando o cliente solicitar falar com humano ou quando a situação exigir intervenção manual.",
    howToUse:
      "Chame pause_bot com pauseBot (número de minutos). Padrão: 30 minutos.",
    openaiParameters: {
      type: "object",
      properties: {
        pauseBot: {
          type: "number",
          description: "Número de minutos para pausar o bot (padrão: 30)"
        }
      },
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        pauseBot: {
          type: SchemaType.NUMBER,
          description: "Número de minutos para pausar o bot"
        }
      },
      required: []
    }
  },
  {
    name: "send_location",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Envia uma localização geográfica (latitude, longitude e nome) para o cliente via WhatsApp.",
    whenToUse:
      "Use quando precisar enviar endereço, localização de loja, ponto de encontro ou qualquer coordenada geográfica.",
    howToUse:
      "Chame send_location com sendLocation no formato 'latitude,longitude,nome' (ex: '-23.550520,-46.633308,Av Paulista').",
    openaiParameters: {
      type: "object",
      properties: {
        sendLocation: {
          type: "string",
          description: "String no formato 'latitude,longitude,nome' (ex: '-23.5505,-46.6333,Loja Centro')"
        }
      },
      required: ["sendLocation"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        sendLocation: {
          type: SchemaType.STRING,
          description: "Formato: 'latitude,longitude,nome'"
        }
      },
      required: ["sendLocation"]
    }
  },
  {
    name: "jump_to_node",
    providers: ["openai", "gemini"],
    sensitive: true,
    description:
      "Redireciona o fluxo atual do FlowBuilder para um nó específico, permitindo pular etapas ou voltar a pontos anteriores.",
    whenToUse:
      "Use apenas dentro de fluxos FlowBuilder quando precisar mudar dinamicamente o caminho do fluxo baseado em condições.",
    howToUse:
      "Chame jump_to_node com jumpToNode (ID do nó de destino).",
    openaiParameters: {
      type: "object",
      properties: {
        jumpToNode: {
          type: "string",
          description: "ID do nó do FlowBuilder para onde o fluxo deve pular"
        }
      },
      required: ["jumpToNode"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        jumpToNode: {
          type: SchemaType.STRING,
          description: "ID do nó de destino"
        }
      },
      required: ["jumpToNode"]
    }
  },
  {
    name: "notify_user",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Envia uma notificação em tempo real para um atendente específico sobre o ticket atual.",
    whenToUse:
      "Use quando precisar alertar um atendente sobre situação urgente, cliente VIP ou qualquer evento que exija atenção imediata.",
    howToUse:
      "Chame notify_user com notifyUser (ID do usuário) e notifyMessage (mensagem da notificação).",
    openaiParameters: {
      type: "object",
      properties: {
        notifyUser: {
          type: "number",
          description: "ID do usuário/atendente que receberá a notificação"
        },
        notifyMessage: {
          type: "string",
          description: "Mensagem da notificação (ex: 'Cliente VIP aguardando')"
        }
      },
      required: ["notifyUser"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        notifyUser: {
          type: SchemaType.NUMBER,
          description: "ID do usuário"
        },
        notifyMessage: {
          type: SchemaType.STRING,
          description: "Mensagem da notificação"
        }
      },
      required: ["notifyUser"]
    }
  },
  {
    name: "validate_cpf",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Valida CPF ou CNPJ usando algoritmo oficial, retornando se é válido e a versão formatada.",
    whenToUse:
      "Use quando precisar validar documento do cliente antes de prosseguir com cadastro, compra ou qualquer operação que exija CPF/CNPJ válido.",
    howToUse:
      "Chame validate_cpf com validateCPF (CPF ou CNPJ com ou sem formatação).",
    openaiParameters: {
      type: "object",
      properties: {
        validateCPF: {
          type: "string",
          description: "CPF ou CNPJ para validar (aceita com ou sem formatação)"
        }
      },
      required: ["validateCPF"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        validateCPF: {
          type: SchemaType.STRING,
          description: "CPF ou CNPJ para validar"
        }
      },
      required: ["validateCPF"]
    }
  },
  {
    name: "validate_email",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Valida formato de email usando regex padrão, retornando se é válido.",
    whenToUse:
      "Use quando precisar validar email do cliente antes de cadastro, envio de documentos ou qualquer operação que exija email válido.",
    howToUse:
      "Chame validate_email com validateEmail (endereço de email).",
    openaiParameters: {
      type: "object",
      properties: {
        validateEmail: {
          type: "string",
          description: "Endereço de email para validar"
        }
      },
      required: ["validateEmail"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        validateEmail: {
          type: SchemaType.STRING,
          description: "Email para validar"
        }
      },
      required: ["validateEmail"]
    }
  },
  {
    name: "validate_phone",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Valida telefone brasileiro (DDD + número), retornando se é válido, versão formatada e DDD.",
    whenToUse:
      "Use quando precisar validar telefone do cliente antes de cadastro, contato ou qualquer operação que exija telefone válido.",
    howToUse:
      "Chame validate_phone com validatePhone (telefone com ou sem formatação).",
    openaiParameters: {
      type: "object",
      properties: {
        validatePhone: {
          type: "string",
          description: "Telefone brasileiro para validar (aceita com ou sem formatação)"
        }
      },
      required: ["validatePhone"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        validatePhone: {
          type: SchemaType.STRING,
          description: "Telefone para validar"
        }
      },
      required: ["validatePhone"]
    }
  },
  {
    name: "schedule_message",
    providers: ["openai", "gemini"],
    sensitive: false,
    description:
      "Agenda uma mensagem para ser enviada em data/hora futura específica (funcionalidade em desenvolvimento).",
    whenToUse:
      "Use quando cliente solicitar lembrete, follow-up ou mensagem agendada para momento futuro.",
    howToUse:
      "Chame schedule_message com scheduleMessage (data/hora ISO) e messageText (conteúdo da mensagem).",
    openaiParameters: {
      type: "object",
      properties: {
        scheduleMessage: {
          type: "string",
          description: "Data e hora para envio no formato ISO (ex: '2024-03-14T10:00:00')"
        },
        messageText: {
          type: "string",
          description: "Conteúdo da mensagem a ser enviada"
        }
      },
      required: ["scheduleMessage", "messageText"],
      additionalProperties: false
    },
    geminiParameters: {
      type: SchemaType.OBJECT,
      properties: {
        scheduleMessage: {
          type: SchemaType.STRING,
          description: "Data/hora ISO"
        },
        messageText: {
          type: SchemaType.STRING,
          description: "Mensagem a enviar"
        }
      },
      required: ["scheduleMessage", "messageText"]
    }
  }
];
