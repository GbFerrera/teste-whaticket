import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import ExtensionIcon from "@material-ui/icons/Extension";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import ScheduleIcon from "@material-ui/icons/Schedule";
import EventNoteIcon from "@material-ui/icons/EventNote";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import EventBusyIcon from "@material-ui/icons/EventBusy";
import EditIcon from "@material-ui/icons/Edit";
import InfoIcon from "@material-ui/icons/Info";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import ForumIcon from "@material-ui/icons/Forum";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import CodeIcon from "@material-ui/icons/Code";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import BusinessIcon from "@material-ui/icons/Business";
import AssignmentIcon from "@material-ui/icons/Assignment";
import { MdSmartToy } from "react-icons/md";

export const TOOL_ICONS = {
  send_product: ShoppingCartIcon,
  execute_tool: ExtensionIcon,
  like_message: FavoriteBorderIcon,
  send_contact_file: AttachFileIcon,
  send_emoji: InsertEmoticonIcon,
  get_company_schedule: ScheduleIcon,
  get_contact_schedules: EventNoteIcon,
  create_contact_schedule: EventAvailableIcon,
  update_contact_schedule: EventBusyIcon,
  get_contact_info: InfoIcon,
  update_contact_info: EditIcon,
  get_company_groups: GroupWorkIcon,
  send_group_message: ForumIcon,
  format_message: FormatQuoteIcon,
  execute_command: CodeIcon,
  call_prompt_agent: CallSplitIcon,
  list_professionals: PeopleOutlineIcon,
  get_asaas_second_copy: LocalOfferIcon,
  create_company: BusinessIcon,
  list_plans: AssignmentIcon,
  auto_variables: TextFieldsIcon,
};

export const TOOL_INSTRUCTIONS = {
  send_product: 'Diga: "Use send_product com o código PROD-123".',
  execute_tool: 'Instrua: "Chame execute_tool usando o conector cobrança".',
  like_message: 'Comando simples: "like_message".',
  send_contact_file: 'Peça: "Use send_contact_file enviando o contrato".',
  send_emoji: 'Diga: "send_emoji 😀".',
  get_company_schedule: 'Pergunte: "get_company_schedule".',
  get_contact_schedules: 'Use: "get_contact_schedules".',
  create_contact_schedule: 'Exemplo: "create_contact_schedule dia 10 às 15h".',
  update_contact_schedule: 'Exemplo: "update_contact_schedule reagende para amanhã".',
  get_contact_info: 'Instrua: "get_contact_info".',
  update_contact_info: 'Instrua: "update_contact_info campo=telefone valor=55999999999".',
  get_company_groups: 'Comando: "get_company_groups".',
  send_group_message: 'Diga: "send_group_message para grupo ClientesVIP".',
  format_message: 'Use: "format_message "{{ms}}, {{name}}!"".',
  execute_command: 'Sempre use JSON: #{ "queueId":"5", "userId":"1", "tagId":"14" }.',
  call_prompt_agent: 'Fale: "call_prompt_agent vendedor_pro".',
  list_professionals: 'Comando: "list_professionals".',
  get_asaas_second_copy: 'Instrua: "Use get_asaas_second_copy com o CPF informado pelo cliente".',
  create_company: 'Somente matriz: "create_company" com os dados exigidos.',
  list_plans: 'Apenas matriz: "list_plans".',
  auto_variables: 'Use variáveis diretamente: "{{ms}} {{firstName}}!" - IMPORTANTE: deixe espaço antes da pontuação (correto: "{{queue}} ," / errado: "{{queue}},")'
};
