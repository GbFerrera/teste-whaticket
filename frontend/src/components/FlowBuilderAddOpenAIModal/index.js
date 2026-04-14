import React, { useState, useEffect, useRef, useMemo } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import { MenuItem, FormControl, InputLabel, Select, Typography, Box, Chip, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import TextField from "@material-ui/core/TextField";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Grid } from "@material-ui/core";
import { TOOL_CATALOG, DEFAULT_SENSITIVE_TOOLS } from "../../constants/aiTools";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    padding: "20px",
  },
  customButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "15px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    "&:hover": {
      backgroundColor: "#45a049",
    },
  },
  dialogTitle: {
    backgroundColor: "#3f51b5",
    color: "white",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#f44336",
    color: "white",
    "&:hover": {
      backgroundColor: "#d32f2f",
    },
  },
  popupButtonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    padding: "20px",
  },
}));

const DialogflowSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const FlowBuilderOpenAIModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const handleToggleApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const initialState = {
    name: "",
    iaMode: "system",
    iaId: "default",
  };

  const [showApiKey, setShowApiKey] = useState(false); // mantido apenas para compat, não usado
  const [selectedVoice, setSelectedVoice] = useState("texto"); // mantido para compat, não usado
  const [activeModal, setActiveModal] = useState(false);
  const [integration, setIntegration] = useState(initialState);
  const [labels, setLabels] = useState({
    title: "Adicionar Agente IA ao fluxo",
    btn: "Adicionar",
  });
  const [popupOpen, setPopupOpen] = useState(false);
  const [prompts, setPrompts] = useState([]);

  const toolMap = useMemo(() => {
    const map = {};
    TOOL_CATALOG.forEach(tool => {
      map[tool.value] = tool;
    });
    return map;
  }, []);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar Agente IA do fluxo",
        btn: "Salvar",
      });
      const current = data?.data?.typebotIntegration || {};
      setIntegration({
        name: current.name || "",
        iaMode: current.iaMode || "system",
        iaId: current.iaId || "default",
      });
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar Agente IA ao fluxo",
        btn: "Salvar",
      });
      setIntegration(initialState);
      setActiveModal(true);
    }

    if (open === "edit" || open === "create") {
      api
        .get("/prompt")
        .then(({ data }) => {
          const list = Array.isArray(data?.prompts) ? data.prompts : [];
          setPrompts(list);

          if (open === "create" && list.length > 0) {
            setIntegration(prev => ({
              ...prev,
              iaId: list[0].id,
            }));
          }
        })
        .catch(toastError);
    }

    return () => {
      isMounted.current = false;
    };
  }, [open]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleChangeVoice = (e) => {
    setSelectedVoice(e.target.value);
  };

  const handleSavePrompt = (values) => {
    const promptMeta = prompts.find(
      prompt => String(prompt.id) === String(values.iaId)
    );

    const payload = {
      name: values.name,
      iaMode: "system",
      iaId: values.iaId,
      promptName: promptMeta?.name || "",
      toolsEnabled: promptMeta?.toolsEnabled || []
    };

    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { typebotIntegration: payload },
      });
    } else if (open === "create") {
      handleClose();
      onSave({
        typebotIntegration: payload,
      });
    }
  };

  const buttons = [
    "Clínica Médica", "Salão", "Lojas de Roupa", "Advocacia",
    "Assistência Técnica", "Lojas de Eletrônicos", "Loja de Presentes",
    "Entrega de Gás", "Contabilidade", "Doceria",
    "Cursos"
  ];

  const handlePopupOpen = () => {
    setPopupOpen(true);
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  const handleButtonClick = (button, setFieldValue) => {
    let prompt = "";

    switch (button) {
      case "Clínica Médica":
        prompt = `
[Saudação automática conforme horário]
"Bom dia! Seja bem-vindo à Clínica KMENU, especializada em saúde do homem. Para começarmos, poderia me informar seu nome completo e idade, por favor? Assim, posso te oferecer um atendimento personalizado."

[Após coleta do nome e idade]
"Obrigado, [Nome]! Em que posso ajudar hoje? Você gostaria de agendar uma consulta ou tem alguma dúvida sobre nossos serviços?"

[Se o paciente perguntar sobre os médicos]
"Claro! Aqui estão os profissionais disponíveis atualmente na Clínica KMENU:

Dr. Marcos - Cardiologista

Dr. Carlos - Clínico Geral

Dra. Márcia - Psicóloga

Você gostaria de saber mais sobre alguma especialidade ou valores das consultas?"

[Se o paciente perguntar sobre valores]
"Com prazer! Os valores das consultas são:

Cardiologista: R$600,00

Clínico Geral: R$400,00

Psicóloga: R$350,00

Qual especialidade você deseja agendar?"

[Após escolha da especialidade e profissional]
"Entendido, [Nome]! Vou verificar a disponibilidade para você. Qual dia e horário você prefere dentro do nosso horário de funcionamento (segunda a sexta, das 08:30 às 19:30)?"

[Após escolha do dia e horário]
"Fico feliz em ajudar! Sua consulta com o(a) [Especialidade/Profissional] foi agendada para [data] às [horário]. Nosso endereço é Rua Macaira, 400, Bairro Aquário, Vinhedo/SP. Recomendo chegar com 10 minutos de antecedência."

[Encerramento cordial]
"Obrigado por escolher a Clínica KMENU. Estamos à disposição para cuidar da sua saúde. Qualquer dúvida, estamos à disposição! Nos vemos na sua consulta, [Nome]! Cuide-se bem!"
        `;
        break;

      case "Salão":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) ao Salão Beleza Total. Como posso ajudar você hoje? Gostaria de agendar um horário para corte, coloração ou outro serviço?"

[Se o cliente perguntar sobre serviços]
"Claro! Oferecemos os seguintes serviços:

- Corte de cabelo: R$50,00
- Coloração: R$120,00
- Manicure e pedicure: R$40,00
- Tratamentos capilares: R$80,00

Qual serviço você deseja agendar?"

[Após escolha do serviço]
"Perfeito! Para qual dia e horário você gostaria de agendar? Nosso horário de funcionamento é de terça a sábado, das 09:00 às 18:00."

[Após escolha do dia e horário]
"Seu horário foi agendado com sucesso! Aguardamos você no dia [data] às [horário]. Nosso endereço é Rua das Flores, 123, Centro. Qualquer dúvida, estamos à disposição!"
        `;
        break;

      case "Lojas de Roupa":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à Loja Fashion Style. Temos uma grande variedade de roupas, calçados e acessórios. Como posso ajudar você hoje?"

[Se o cliente perguntar sobre promoções]
"Temos várias promoções incríveis esta semana:

- Camisetas a partir de R$29,90
- Calças jeans com 30% de desconto
- Tênis com até 50% off

Você gostaria de saber mais sobre algum produto?"

[Se o cliente perguntar sobre tamanhos]
"Temos todos os tamanhos disponíveis, do P ao GG. Posso te ajudar a encontrar o tamanho ideal?"

[Encerramento cordial]
"Obrigado por escolher a Fashion Style! Esperamos que você encontre o que procura. Qualquer dúvida, estamos à disposição!"
        `;
        break;

      case "Advocacia":
        prompt = `
[Saudação automática conforme horário]
"Bom dia! Bem-vindo(a) ao Escritório de Advocacia Justiça & Direito. Como posso ajudar você hoje? Gostaria de agendar uma consulta ou tem alguma dúvida jurídica?"

[Se o cliente perguntar sobre áreas de atuação]
"Atuamos nas seguintes áreas:

- Direito Civil
- Direito Trabalhista
- Direito Familiar
- Direito Empresarial

Qual área você precisa de assistência?"

[Se o cliente perguntar sobre valores]
"Os valores variam conforme o tipo de serviço. Para consultas iniciais, cobramos R$300,00. Posso agendar um horário para você?"

[Após escolha do dia e horário]
"Sua consulta foi agendada para [data] às [horário]. Nosso endereço é Avenida Principal, 456, Sala 101. Aguardamos você!"
        `;
        break;

      case "Assistência Técnica":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à Assistência Técnica EletroPlus. Como posso ajudar você hoje? Precisa de reparo para algum aparelho eletrônico?"

[Se o cliente perguntar sobre serviços]
"Oferecemos assistência para:

- Celulares e tablets
- Computadores e notebooks
- Eletrodomésticos
- TVs e monitores

Qual aparelho precisa de reparo?"

[Se o cliente perguntar sobre prazos]
"O prazo de reparo varia conforme o problema, mas geralmente é de 3 a 7 dias úteis. Posso agendar uma avaliação para você?"

[Após escolha do dia e horário]
"Perfeito! Sua avaliação foi agendada para [data] às [horário]. Nosso endereço é Rua da Tecnologia, 789. Aguardamos você!"
        `;
        break;

      case "Lojas de Eletrônicos":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à EletroTech. Temos os melhores produtos eletrônicos com os melhores preços. Como posso ajudar você hoje?"

[Se o cliente perguntar sobre produtos]
"Temos uma grande variedade de produtos, incluindo:

- Smartphones
- Notebooks
- TVs e monitores
- Acessórios

Você gostaria de saber mais sobre algum produto específico?"

[Se o cliente perguntar sobre garantia]
"Todos os nossos produtos têm garantia de 1 ano. Posso te ajudar com mais alguma coisa?"

[Encerramento cordial]
"Obrigado por escolher a EletroTech! Esperamos que você encontre o que procura. Qualquer dúvida, estamos à disposição!"
        `;
        break;

      case "Loja de Presentes":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à Loja Presentes Especiais. Temos uma variedade de presentes para todas as ocasiões. Como posso ajudar você hoje?"

[Se o cliente perguntar sobre produtos]
"Temos presentes para:

- Aniversários
- Casamentos
- Datas comemorativas
- Presentes corporativos

Você gostaria de saber mais sobre algum produto?"

[Se o cliente perguntar sobre entrega]
"Oferecemos entrega em domicílio com prazo de 1 a 3 dias úteis. Posso te ajudar com mais alguma coisa?"

[Encerramento cordial]
"Obrigado por escolher a Presentes Especiais! Esperamos que você encontre o presente perfeito. Qualquer dúvida, estamos à disposição!"
        `;
        break;

      case "Entrega de Gás":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à Gás Express. Como posso ajudar você hoje? Precisa de entrega de gás ou tem alguma dúvida?"

[Se o cliente perguntar sobre preços]
"O valor do botijão de 13kg é R$80,00, e o de 45kg é R$200,00. A entrega é gratuita para pedidos acima de R$100,00."

[Se o cliente perguntar sobre prazos]
"Entregamos em até 2 horas na região central. Para outras regiões, o prazo pode variar. Posso anotar seu pedido?"

[Após confirmação do pedido]
"Seu pedido foi registrado! Entregaremos o gás no endereço [endereço] em até [prazo]. Obrigado por escolher a Gás Express!"
        `;
        break;

      case "Contabilidade":
        prompt = `
[Saudação automática conforme horário]
"Bom dia! Bem-vindo(a) ao Escritório de Contabilidade Contabilize. Como posso ajudar você hoje? Precisa de serviços contábeis ou tem alguma dúvida?"

[Se o cliente perguntar sobre serviços]
"Oferecemos os seguintes serviços:

- Abertura de empresas
- Declaração de imposto de renda
- Consultoria financeira
- Folha de pagamento

Qual serviço você precisa?"

[Se o cliente perguntar sobre valores]
"Os valores variam conforme o serviço. Para abertura de empresas, cobramos R$500,00. Posso agendar uma consulta para você?"

[Após escolha do dia e horário]
"Sua consulta foi agendada para [data] às [horário]. Nosso endereço é Rua dos Contadores, 101. Aguardamos você!"
        `;
        break;

      case "Doceria":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à Doceria Doce Sabor. Temos uma variedade de doces caseiros e sobremesas. Como posso ajudar você hoje?"

[Se o cliente perguntar sobre produtos]
"Temos:

- Bolos personalizados
- Docinhos para festas
- Tortas e sobremesas
- Doces diet e sem açúcar

Você gostaria de encomendar algo?"

[Se o cliente perguntar sobre prazos]
"Para encomendas, o prazo mínimo é de 2 dias. Posso anotar seu pedido?"

[Após confirmação do pedido]
"Seu pedido foi registrado! Entregaremos no endereço [endereço] no dia [data]. Obrigado por escolher a Doce Sabor!"
        `;
        break;

      case "Cursos":
        prompt = `
[Saudação automática conforme horário]
"Olá! Bem-vindo(a) à Escola de Cursos Profissionalizantes. Como posso ajudar você hoje? Gostaria de se inscrever em algum curso ou tem alguma dúvida?"

[Se o cliente perguntar sobre cursos]
"Oferecemos cursos nas seguintes áreas:

- Tecnologia da Informação
- Marketing Digital
- Design Gráfico
- Administração

Qual curso você tem interesse?"

[Se o cliente perguntar sobre valores]
"Os valores variam conforme o curso. Para mais informações, posso agendar uma visita ou ligação?"

[Após escolha do dia e horário]
"Perfeito! Sua visita foi agendada para [data] às [horário]. Nosso endereço é Rua do Conhecimento, 202. Aguardamos você!"
        `;
        break;

      default:
        prompt = "";
    }

    setFieldValue("prompt", prompt.trim());
    handlePopupClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle className={classes.dialogTitle}>
          {labels.title}
        </DialogTitle>
        <Formik
          initialValues={integration}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSavePrompt(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ isSubmitting, values }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                <Field
                  as={TextField}
                  label="Nome do bloco"
                  name="name"
                  margin="dense"
                  fullWidth
                />

                <Field
                  as={TextField}
                  select
                  label="IA utilizada"
                  name="iaId"
                  margin="dense"
                  fullWidth
                  helperText="Selecione qual IA (Prompt) será usada neste bloco."
                >
                  {prompts.map(prompt => (
                    <MenuItem key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </MenuItem>
                  ))}
                </Field>

                <Box mt={1.5}>
                  <Typography variant="body2" color="textSecondary">
                    Ferramentas habilitadas:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" mt={0.5} gap={8}>
                    {(() => {
                      const selectedPrompt = prompts.find(
                        prompt => String(prompt.id) === String(values.iaId)
                      );
                      if (!selectedPrompt) {
                        return (
                          <Typography variant="caption" color="textSecondary">
                            Selecione um prompt para visualizar as ferramentas permitidas.
                          </Typography>
                        );
                      }
                      const tools = selectedPrompt.toolsEnabled || [];
                      if (!tools.length) {
                        return (
                          <Typography variant="caption" color="textSecondary">
                            Nenhuma ferramenta habilitada para este prompt.
                          </Typography>
                        );
                      }
                      return tools.map(toolName => {
                        const meta = toolMap[toolName];
                        const isSensitive = DEFAULT_SENSITIVE_TOOLS.includes(toolName);
                        return (
                          <Tooltip
                            key={`${selectedPrompt.id}-${toolName}`}
                            title={meta?.description || toolName}
                            arrow
                          >
                            <Chip
                              size="small"
                              label={meta?.title || toolName}
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                backgroundColor: isSensitive ? "#fee2e2" : "#e0f2fe",
                                color: isSensitive ? "#b91c1c" : "#075985"
                              }}
                            />
                          </Tooltip>
                        );
                      });
                    })()}
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  startIcon={<CancelIcon />}
                >
                  {i18n.t("promptModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  className={classes.btnWrapper}
                  disabled={isSubmitting}
                >
                  {open === "create" ? "Adicionar" : "Editar"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default FlowBuilderOpenAIModal;