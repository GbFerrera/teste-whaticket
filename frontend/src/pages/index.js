import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  useRef,
} from "react";
import { MdSmartToy } from "react-icons/md";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import directOpenaiNode from "./nodes/directOpenaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import fileNode from "./nodes/fileNode";
import transferFlowNode from "./nodes/transferFlowNode";
import apiRequestNode from "./nodes/apiRequestNode";
import addTagNode from "./nodes/addTagNode";
import addTagKanbanNode from "./nodes/addTagKanbanNode";
import conditionNode from "./nodes/conditionNode";
import asaasNode from "./nodes/asaasNode";
import smtpNode from "./nodes/smtpNode";
import variableNode from "./nodes/variableNode";
import closeTicketNode from "./nodes/closeTicketNode";
import sendMessageNode from "./nodes/sendMessageNode";

import api from "../../services/api";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { Box, CircularProgress } from "@material-ui/core";
import BallotIcon from "@mui/icons-material/Ballot";
import ShoppingBag from "@mui/icons-material/ShoppingBag";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  onElementsRemove,
  useReactFlow,
  Controls,
} from "react-flow-renderer";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  Image,
  ImportExport,
  LibraryBooks,
  Message,
  MicNone,
  RocketLaunch,
  Videocam,
  Search,
  AccountTree,
  Http,
  LocalOffer,
  ViewKanban,
  Rule,
  Receipt,
  Email,
  DataObject,
  CheckCircle,
  Send,
} from "@mui/icons-material";
import DescriptionIcon from "@mui/icons-material/Description";
import RemoveEdge from "./nodes/removeEdge";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import FlowBuilderAddFileModal from "../../components/FlowBuilderAddFileModal";

import { useNodeStorage } from "../../stores/useNodeStorage";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import singleBlockNode from "./nodes/singleBlockNode";
import { colorPrimary } from "../../styles/styles";
import ticketNode from "./nodes/ticketNode";
import { ConfirmationNumber } from "@material-ui/icons";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddDirectOpenAIModal from "../../components/FlowBuilderAddDirectOpenAIModal";
import { TOOL_CATALOG, DEFAULT_SENSITIVE_TOOLS } from "../../constants/aiTools.js";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";
import FlowBuilderTransferFlowModal from "../../components/FlowBuilderTransferFlowModal";
import FlowBuilderApiRequestModal from "../../components/FlowBuilderApiRequestModal";
import FlowBuilderAddTagModal from "../../components/FlowBuilderAddTagModal";
import FlowBuilderAddTagKanbanModal from "../../components/FlowBuilderAddTagKanbanModal";
import FlowBuilderAsaasModal from "../../components/FlowBuilderAsaasModal";
import FlowBuilderAddSmtpModal from "../../components/FlowBuilderAddSmtpModal";
import FlowBuilderAddVariableModal from "../../components/FlowBuilderAddVariableModal";
import FlowBuilderCloseTicketModal from "../../components/FlowBuilderCloseTicketModal";
import FlowBuilderSendMessageModal from "../../components/FlowBuilderSendMessageModal";
import FlowBuilderProductListModal from "../../components/FlowBuilderProductListModal";
import productListNode from "./nodes/productListNode";
import withNodeTitle from "../../components/FlowBuilderNodeWrapper";
import FlowBuilderNodeRenameModal from "../../components/FlowBuilderNodeRenameModal";
import SaveIcon from "@mui/icons-material/Save";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: 0,
    position: "relative",
    backgroundColor: "#fafbfc",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  },
  sidebar: {
    width: "236px",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1111,
    padding: "14px 14px 90px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(6px)",
    borderRight: "1px solid rgba(148, 163, 184, 0.25)",
    boxShadow: "12px 0 35px rgba(15, 23, 42, 0.08)",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflowY: "auto",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  lockIcon: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  buttonGroup: {
    width: "100%",
    marginBottom: "10px",
    padding: "8px 6px",
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.02)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
  },
  groupLabel: {
    fontSize: "2.8px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.25em",
    marginBottom: "6px",
    paddingLeft: "2px",
    lineHeight: 1,
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "6px",
    width: "100%",
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.65)",
    color: "#0f172a",
    minWidth: "auto",
    width: "100%",
    height: "32px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "0 10px",
    fontSize: "10.5px",
    fontWeight: 600,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    textTransform: "none",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
    gap: "8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "& .MuiButton-label": {
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    "&:hover": {
      backgroundColor: "rgba(59,130,246,0.08)",
      borderColor: "rgba(59,130,246,0.25)",
      boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
      transform: "translateY(-1px)",
    },
  },
  buttonFullWidth: {
    gridColumn: "1 / -1",
  },
  buttonIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    flexShrink: 0,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "none",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
    border: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
      boxShadow: "0 6px 16px rgba(59, 130, 246, 0.35)",
    },
    "&:active": {
      transform: "translateY(0px)",
      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
    },
  },
  backButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "500",
    textTransform: "none",
    border: "1px solid #e5e7eb",
    marginBottom: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#e5e7eb",
      borderColor: "#d1d5db",
    },
  },
  headerNotice: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    color: "#1e40af",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    position: "relative",
    zIndex: 10,
  },
  flowContainer: {
    width: "100%",
    height: "90%",
    position: "relative",
    display: "flex",
    borderRadius: "0 12px 12px 0",
    overflow: "hidden",
  },
  animatedEdge: {
    animation: "$dash 1.5s linear infinite",
  },
  "@keyframes dash": {
    from: {
      strokeDashoffset: 24,
    },
    to: {
      strokeDashoffset: 0,
    },
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "70vh",
    gap: "16px",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
}));

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const GROUP_COLORS = [
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#6366f1",
];

const NODE_TITLES = {
  message: "Mensagem",
  start: "Início do Fluxo",
  menu: "Menu",
  interval: "Intervalo",
  img: "Imagem",
  audio: "Áudio",
  randomizer: "Randomizador",
  video: "Vídeo",
  singleBlock: "Conteúdo",
  ticket: "Ticket",
  typebot: "Typebot",
  openai: "Agente IA",
  question: "Pergunta",
  file: "Arquivo",
  transferFlow: "Transferir Fluxo",
  apiRequest: "API Request",
  addTag: "Adicionar Tag",
  addTagKanban: "Tag Kanban",
  condition: "Condição",
  asaas: "2ª via Boleto",
  typebotNode: "Typebot",
  intervalNode: "Intervalo",
  smtp: "Envio SMTP",
  variable: "Variável",
  closeTicket: "Encerrar Ticket",
  sendMessage: "Enviar Mensagem",
  productList: "Lista de Produtos",
};

const DEFAULT_SMTP_CONFIG = {
  connectionName: "",
  fromEmail: "",
  host: "",
  port: "587",
  username: "",
  password: "",
  useTLS: true,
};

const DEFAULT_EMAIL_CONFIG = {
  to: "",
  replyTo: "",
  cc: "",
  bcc: "",
  subject: "",
  customContent: false,
  contentMode: "text",
  content: "",
  attachmentsVariable: "",
  saveVariables: [],
};

const DEFAULT_VARIABLE_CONFIG = {
  variableName: "",
  valueType: "custom",
  editorMode: "text",
  customValue: "",
};

const getDefaultTitle = (type) => NODE_TITLES[type] || "Bloco";

const withTitleData = (type, data = {}) => {
  const nextTitle = data?.title || getDefaultTitle(type);
  return { ...data, title: nextTitle };
};

const ensureNodeTitle = (node) => ({
  ...node,
  data: withTitleData(node.type, node.data || {}),
});

const applyTitlesToNodes = (nodes = []) => nodes.map(ensureNodeTitle);

const nodeTypes = {
  message: withNodeTitle(messageNode, NODE_TITLES.message),
  start: withNodeTitle(startNode, NODE_TITLES.start),
  menu: withNodeTitle(menuNode, NODE_TITLES.menu),
  interval: withNodeTitle(intervalNode, NODE_TITLES.interval),
  img: withNodeTitle(imgNode, NODE_TITLES.img),
  audio: withNodeTitle(audioNode, NODE_TITLES.audio),
  randomizer: withNodeTitle(randomizerNode, NODE_TITLES.randomizer),
  video: withNodeTitle(videoNode, NODE_TITLES.video),
  singleBlock: withNodeTitle(singleBlockNode, NODE_TITLES.singleBlock),
  ticket: withNodeTitle(ticketNode, NODE_TITLES.ticket),
  typebot: withNodeTitle(typebotNode, NODE_TITLES.typebot),
  openai: withNodeTitle(openaiNode, NODE_TITLES.openai),
  directOpenai: withNodeTitle(directOpenaiNode, NODE_TITLES.openai),
  question: withNodeTitle(questionNode, NODE_TITLES.question),
  file: withNodeTitle(fileNode, NODE_TITLES.file),
  transferFlow: withNodeTitle(transferFlowNode, NODE_TITLES.transferFlow),
  apiRequest: withNodeTitle(apiRequestNode, NODE_TITLES.apiRequest),
  addTag: withNodeTitle(addTagNode, NODE_TITLES.addTag),
  addTagKanban: withNodeTitle(addTagKanbanNode, NODE_TITLES.addTagKanban),
  condition: withNodeTitle(conditionNode, NODE_TITLES.condition),
  asaas: withNodeTitle(asaasNode, NODE_TITLES.asaas),
  sendMessage: withNodeTitle(sendMessageNode, NODE_TITLES.sendMessage),
  productList: withNodeTitle(productListNode, NODE_TITLES.productList),
};

const edgeTypes = {
  buttonedge: RemoveEdge,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: withTitleData("start", { label: "Inicio do fluxo" }),
    type: "start",
  },
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const storageItems = useNodeStorage();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [contentModalType, setContentModalType] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddDirectOpenAI, setModalAddDirectOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);
  const [modalAddFile, setModalAddFile] = useState(null);
  const [modalTransferFlow, setModalTransferFlow] = useState(null);
  const [modalApiRequest, setModalApiRequest] = useState(null);
  const [modalAddTag, setModalAddTag] = useState(null);
  const [modalAddTagKanban, setModalAddTagKanban] = useState(null);
  const [modalCondition, setModalCondition] = useState(null);
  const [modalAsaas, setModalAsaas] = useState(null);
  const [modalAddSmtp, setModalAddSmtp] = useState(null);
  const [modalAddVariable, setModalAddVariable] = useState(null);
  const [modalCloseTicket, setModalCloseTicket] = useState(null);
  const [modalSendMessage, setModalSendMessage] = useState(null);
  const [modalProductList, setModalProductList] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [nodeRenaming, setNodeRenaming] = useState(null);
  const [flowLocked, setFlowLocked] = useState(false);
  const [, setPageNumber] = useState(1);

  const connectionLineStyle = { 
    stroke: "#6366f1", 
    strokeWidth: "3px",
    strokeDasharray: "5,5"
  };

  // [TODA A LÓGICA DE ADIÇÃO DE NODES MANTIDA IGUAL]
  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;

    if (type === "file") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("file", {
              label: data.label || "Enviar Arquivo",
              url: data.url,
            }),
            type: "file",
          },
        ];
      });
    }

    if (type === "start") {
      return setNodes((old) => {
        return [
          {
            id: "1",
            position: { x: posX, y: posY },
            data: withTitleData("start", { label: "Inicio do fluxo" }),
            type: "start",
          },
        ];
      });
    }
    if (type === "text") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("message", { label: data.text }),
            type: "message",
          },
        ];
      });
    }
    if (type === "interval") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("interval", {
              label: `Intervalo ${data.sec} seg.`,
              sec: data.sec,
            }),
            type: "interval",
          },
        ];
      });
    }
    if (type === "condition") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("condition", {
              key: data.key,
              condition: data.condition,
              value: data.value,
            }),
            type: "condition",
          },
        ];
      });
    }
    if (type === "menu") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("menu", {
              message: data.message,
              arrayOption: data.arrayOption,
            }),
            type: "menu",
          },
        ];
      });
    }
    if (type === "img") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("img", { url: data.url }),
            type: "img",
          },
        ];
      });
    }
    if (type === "audio") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("audio", { url: data.url, record: data.record }),
            type: "audio",
          },
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("randomizer", { percent: data.percent }),
            type: "randomizer",
          },
        ];
      });
    }
    if (type === "video") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("video", { url: data.url }),
            type: "video",
          },
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("singleBlock", { ...data }),
            type: "singleBlock",
          },
        ];
      });
    }
    if (type === "ticket") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("ticket", { ...data }),
            type: "ticket",
          },
        ];
      });
    }
    if (type === "typebot") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("typebot", { ...data }),
            type: "typebot",
          },
        ];
      });
    }
    if (type === "openai") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("openai", { ...data }),
            type: "openai",
          },
        ];
      });
    }
    if (type === "question") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("question", { ...data }),
            type: "question",
          },
        ];
      });
    }
    if (type === "transferFlow") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("transferFlow", { ...data }),
            type: "transferFlow",
          },
        ];
      });
    }
    if (type === "apiRequest") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("apiRequest", { ...data }),
            type: "apiRequest",
          },
        ];
      });
    }
    if (type === "smtp") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("smtp", {
              smtpConfig: { ...DEFAULT_SMTP_CONFIG, ...(data?.smtpConfig || {}) },
              emailConfig: { ...DEFAULT_EMAIL_CONFIG, ...(data?.emailConfig || {}) },
            }),
            type: "smtp",
          },
        ];
      });
    }
    if (type === "addTag") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("addTag", { ...data }),
            type: "addTag",
          },
        ];
      });
    }
    if (type === "addTagKanban") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("addTagKanban", { ...data }),
            type: "addTagKanban",
          },
        ];
      });
    }
    if (type === "asaas") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: withTitleData("asaas", { ...data }),
            type: "asaas",
          },
        ];
      });
    }
    if (type === "variable") {
      return setNodes((old) => [
        ...old,
        {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: withTitleData("variable", {
            variableConfig: {
              ...DEFAULT_VARIABLE_CONFIG,
              ...(data?.variableConfig || {}),
            },
          }),
          type: "variable",
        },
      ]);
    }
    if (type === "closeTicket") {
      return setNodes((old) => [
        ...old,
        {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: withTitleData("closeTicket", {
            message: data?.message || "",
          }),
          type: "closeTicket",
        },
      ]);
    }
    if (type === "sendMessage") {
      return setNodes((old) => [
        ...old,
        {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: withTitleData("sendMessage", { ...data }),
          type: "sendMessage",
        },
      ]);
    }
    if (type === "productList") {
      setNodes((old) => [
        ...old,
        {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: withTitleData("productList", { 
            title: data?.title || "🛍️ Nossos Produtos e Serviços",
            listType: data?.listType || "all",
            selectedItems: data?.selectedItems || []
          }),
          type: "productList",
        },
      ]);
      // Fechar modal após adicionar
      setModalProductList(null);
    }
  };

  // [TODAS AS FUNÇÕES DE ADIÇÃO MANTIDAS IGUAIS]
  const textAdd = (data) => { addNode("text", data); };
  const intervalAdd = (data) => { addNode("interval", data); };
  const conditionAdd = (data) => { addNode("condition", data); };
  const menuAdd = (data) => { addNode("menu", data); };
  const imgAdd = (data) => { addNode("img", data); };
  const audioAdd = (data) => { addNode("audio", data); };
  const randomizerAdd = (data) => { addNode("randomizer", data); };
  const videoAdd = (data) => { addNode("video", data); };
  const singleBlockAdd = (data) => { addNode("singleBlock", data); };
  const ticketAdd = (data) => { addNode("ticket", data); };
  const typebotAdd = (data) => { addNode("typebot", data); };
  const openaiAdd = (data) => { addNode("openai", data); };
  const questionAdd = (data) => { addNode("question", data); };
  const fileAdd = (data) => { addNode("file", data); };
  const transferFlowAdd = (data) => { addNode("transferFlow", data); };
  const apiRequestAdd = (data) => { addNode("apiRequest", data); };
  const addTagAdd = (data) => { addNode("addTag", data); };
  const addTagKanbanAdd = (data) => { addNode("addTagKanban", data); };
  const asaasAdd = (data) => { addNode("asaas", data); };
  const smtpAdd = (data) => { addNode("smtp", data); };
  const variableAdd = (data) => { addNode("variable", data); };
  const closeTicketAdd = (data) => { addNode("closeTicket", data); };
  const sendMessageAdd = (data) => { addNode("sendMessage", data); };
  const productListAdd = (data) => { addNode("productList", data); };

  // [TODOS OS useEffect MANTIDOS IGUAIS]
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);

          if (data.flow.flow !== null) {
            const flowNodes = data.flow.flow.nodes;
            setNodes(applyTitlesToNodes(flowNodes));
            setEdges(data.flow.flow.connections);
            // Extrair variáveis dos nós question
            const questionNodes = flowNodes.filter(
              (nd) => nd.type === "question"
            );
            const questionVariables = questionNodes.map(
              (variable) => variable.data.typebotIntegration.answerKey
            );
            
            // Extrair variáveis dos nós apiRequest
            const apiNodes = flowNodes.filter(
              (nd) => nd.type === "apiRequest"
            );
            const apiVariables = apiNodes.flatMap(
              (node) => node.data?.data?.savedVariables?.map(variable => variable.name) || []
            );
            
            // Combinar todas as variáveis
            const allVariables = [...questionVariables, ...apiVariables];
            
            // Remover duplicatas e valores vazios
            const uniqueVariables = [...new Set(allVariables.filter(v => v && v.trim()))];
            
            localStorage.setItem("variables", JSON.stringify(uniqueVariables));
          }
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map((node) => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY,
        },
        selected: false,
        style: { backgroundColor: "#555555", padding: 0, borderRadius: 8 },
      };
      setNodes((old) => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "rename") {
      const nodeToRename = nodes.find((item) => item.id === storageItems.node);
      if (nodeToRename) {
        setNodeRenaming(nodeToRename);
        setRenameModalOpen(true);
      }
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [groupSelectionActive, setGroupSelectionActive] = useState(false);
  const [groupSelectionIds, setGroupSelectionIds] = useState([]);
  const selectionActiveRef = useRef(false);
  const groupSelectionIdsRef = useRef([]);
  const groupColorIndexRef = useRef(0);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const pickGroupColor = useCallback(() => {
    const color = GROUP_COLORS[groupColorIndexRef.current % GROUP_COLORS.length];
    groupColorIndexRef.current += 1;
    return color;
  }, []);

  const clearGroupPreview = useCallback(() => {
    setNodes((old) =>
      old.map((node) =>
        node.data?.groupPreview
          ? {
            ...node,
            data: { ...node.data, groupPreview: false },
          }
          : node
      )
    );
  }, [setNodes]);

  const resetGroupSelection = useCallback(() => {
    groupSelectionIdsRef.current = [];
    setGroupSelectionIds([]);
    clearGroupPreview();
  }, [clearGroupPreview]);

  const stopGroupSelection = useCallback(() => {
    if (!selectionActiveRef.current) return;
    selectionActiveRef.current = false;
    setGroupSelectionActive(false);
    window.removeEventListener("mouseup", stopGroupSelection);
    const ids = groupSelectionIdsRef.current || [];
    if (ids.length > 0) {
      const rawTitle = window.prompt("Digite um título para este grupo:");
      const title = rawTitle ? rawTitle.trim() : "";
      if (title) {
        const color = pickGroupColor();
        setNodes((old) =>
          old.map((node) =>
            ids.includes(node.id)
              ? {
                ...node,
                data: {
                  ...node.data,
                  groupLabel: title,
                  groupColor: color,
                  groupPreview: false,
                },
              }
              : node
          )
        );
      }
    }
    resetGroupSelection();
  }, [pickGroupColor, resetGroupSelection, setNodes]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mouseup", stopGroupSelection);
    };
  }, [stopGroupSelection]);

  const startGroupSelection = useCallback(() => {
    if (flowLocked) return;
    if (selectionActiveRef.current) return;
    selectionActiveRef.current = true;
    setGroupSelectionActive(true);
    groupSelectionIdsRef.current = [];
    setGroupSelectionIds([]);
    clearGroupPreview();
    window.addEventListener("mouseup", stopGroupSelection);
  }, [clearGroupPreview, flowLocked, stopGroupSelection]);

  const addNodeToSelection = useCallback(
    (nodeId) => {
      setGroupSelectionIds((prev) => {
        if (prev.includes(nodeId)) return prev;
        const updated = [...prev, nodeId];
        groupSelectionIdsRef.current = updated;
        setNodes((old) =>
          old.map((item) =>
            item.id === nodeId
              ? {
                ...item,
                data: { ...item.data, groupPreview: true },
              }
              : item
          )
        );
        return updated;
      });
    },
    [setNodes]
  );

  const handlePaneMouseDown = useCallback(
    (event) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
        startGroupSelection();
      }
    },
    [startGroupSelection]
  );

  const handleNodeMouseDown = useCallback(
    (event, node) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
        startGroupSelection();
        addNodeToSelection(node.id);
      }
    },
    [addNodeToSelection, startGroupSelection]
  );

  const handleNodeMouseEnter = useCallback(
    (event, node) => {
      if (!selectionActiveRef.current) return;
      event.preventDefault();
      addNodeToSelection(node.id);
    },
    [addNodeToSelection]
  );

  const saveFlow = async () => {
    const nodesWithTitles = applyTitlesToNodes(nodes);
    setNodes(nodesWithTitles);
    await api
      .post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodesWithTitles,
        connections: edges,
      })
      .then((res) => {
        toast.success("Fluxo salvo com sucesso");
      });
  };

  // [TODAS AS FUNÇÕES DE EVENTOS MANTIDAS IGUAIS]
  const doubleClick = (event, node) => {
    console.log("NODE", node);
    setDataNode(node);
    if (node.type === "message") { setModalAddText("edit"); }
    if (node.type === "interval") { setModalAddInterval("edit"); }
    if (node.type === "menu") { setModalAddMenu("edit"); }
    if (node.type === "img") { setModalAddImg("edit"); }
    if (node.type === "audio") { setModalAddAudio("edit"); }
    if (node.type === "randomizer") { setModalAddRandomizer("edit"); }
    if (node.type === "singleBlock") { setModalAddSingleBlock("edit"); }
    if (node.type === "ticket") { setModalAddTicket("edit"); }
    if (node.type === "typebot") { setModalAddTypebot("edit"); }
    if (node.type === "openai") { setModalAddOpenAI("edit"); }
    if (node.type === "directOpenai") { setModalAddDirectOpenAI("edit"); }
    if (node.type === "question") { setModalAddQuestion("edit"); }
    if (node.type === "file") { setModalAddFile("edit"); }
    if (node.type === "transferFlow") { setModalTransferFlow("edit"); }
    if (node.type === "apiRequest") { setModalApiRequest("edit"); }
    if (node.type === "addTag") { setModalAddTag("edit"); }
    if (node.type === "addTagKanban") { setModalAddTagKanban("edit"); }
    if (node.type === "condition") { setModalCondition("edit"); }
    if (node.type === "asaas") { setModalAsaas("edit"); }
    if (node.type === "smtp") { setModalAddSmtp("edit"); }
    if (node.type === "variable") { setModalAddVariable("edit"); }
    if (node.type === "closeTicket") { setModalCloseTicket("edit"); }
    if (node.type === "sendMessage") { setModalSendMessage("edit"); }
    if (node.type === "productList") { setModalProductList("edit"); }
  };

  const clickNode = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            style: { 
              backgroundColor: "#3b82f6", 
              padding: 1, 
              borderRadius: 8,
              pointerEvents: "auto" // Garante interatividade
            },
          };
        }
        return {
          ...item,
          style: { 
            backgroundColor: "#ffffff", 
            padding: 0, 
            borderRadius: 8,
            pointerEvents: "auto" // Garante interatividade
          },
        };
      })
    );
  };

  const clickEdge = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          style: { 
            backgroundColor: "#ffffff", 
            padding: 0, 
            borderRadius: 8,
            pointerEvents: "auto" // Garante interatividade
          },
        };
      })
    );
  };

  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return ensureNodeTitle(dataAlter);
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
    setModalAddFile(null);
    setModalAddSmtp(null);
    setModalAddVariable(null);
    setModalCloseTicket(null);
    setModalProductList(null);
  };

  const closeRenameModal = () => {
    setRenameModalOpen(false);
    setNodeRenaming(null);
  };

  const handleRenameSave = (newTitle) => {
    if (!nodeRenaming) {
      closeRenameModal();
      return;
    }
    const sanitizedTitle =
      (newTitle && newTitle.length ? newTitle : getDefaultTitle(nodeRenaming.type));
    setNodes((old) =>
      old.map((item) => {
        if (item.id === nodeRenaming.id) {
          return {
            ...item,
            data: {
              ...item.data,
              title: sanitizedTitle,
            },
          };
        }
        return item;
      })
    );
    closeRenameModal();
  };

  // Grupos reorganizados no estilo Typebot
  const actionGroups = [
    {
      label: "Bubbles",
      actions: [
        { icon: <Message sx={{ color: "#3b82f6", fontSize: 14 }} />, name: "Texto", type: "content-text" },
        { icon: <Image sx={{ color: "#f59e0b", fontSize: 14 }} />, name: "Imagem", type: "content-image" },
        { icon: <Videocam sx={{ color: "#ef4444", fontSize: 14 }} />, name: "Vídeo", type: "content-video" },
        { icon: <MicNone sx={{ color: "#8b5cf6", fontSize: 14 }} />, name: "Áudio", type: "content-audio" },
        { icon: <DescriptionIcon sx={{ color: "#6366f1", fontSize: 14 }} />, name: "Arquivo", type: "content-file" },
      ],
    },
    {
      label: "Inputs",
      actions: [
        { icon: <BallotIcon sx={{ color: "#f59e0b", fontSize: 14 }} />, name: "Pergunta", type: "question" },
        { icon: <DynamicFeed sx={{ color: "#8b5cf6", fontSize: 14 }} />, name: "Menu", type: "menu" },
      ],
    },
    {
      label: "Lógica",
      actions: [
        { icon: <RocketLaunch sx={{ color: "#10b981", fontSize: 14 }} />, name: "Início", type: "start" },
        { icon: <AccessTime sx={{ color: "#22c55e", fontSize: 14 }} />, name: "Intervalo", type: "interval" },
        { icon: <CallSplit sx={{ color: "#06b6d4", fontSize: 14 }} />, name: "Randomizar", type: "random" },
        { icon: <Rule sx={{ color: "#ec4899", fontSize: 14 }} />, name: "Condição", type: "condition" },
        { icon: <AccountTree sx={{ color: "#8b5cf6", fontSize: 14 }} />, name: "Transf. Fluxo", type: "transferFlow" },
        { icon: <ConfirmationNumber sx={{ color: "#ef4444", fontSize: 14 }} />, name: "Ticket", type: "ticket" },
        { icon: <DataObject sx={{ color: "#6366f1", fontSize: 14 }} />, name: "Variável", type: "variable" },
      ],
    },
    {
      label: "Ações",
      actions: [
        { icon: <LocalOffer sx={{ color: "#f59e0b", fontSize: 14 }} />, name: "Add Tag", type: "addTag" },
        { icon: <ViewKanban sx={{ color: "#06b6d4", fontSize: 14 }} />, name: "Tag Kanban", type: "addTagKanban" },
        { icon: <CheckCircle sx={{ color: "#22c55e", fontSize: 14 }} />, name: "Encerrar Ticket", type: "closeTicket" },
        { icon: <ShoppingBag sx={{ color: "#3b82f6", fontSize: 14 }} />, name: "Lista de Produtos", type: "productList" },
      ],
    },
    {
      label: "Integrações",
      actions: [
        { icon: <Http sx={{ color: "#22c55e", fontSize: 14 }} />, name: "API Request", type: "apiRequest" },
        { 
          icon: <Box component="img" sx={{ width: 14, height: 14 }} src={typebotIcon} alt="typebot" />, 
          name: "TypeBot", 
          type: "typebot" 
        },
        { icon: <MdSmartToy size={14} color="#3b82f6" />, name: "Agente de IA", type: "directOpenai" },
        { icon: <Receipt sx={{ color: "#10b981", fontSize: 14 }} />, name: "2ª Via Boleto", type: "asaas" },
        { icon: <Email sx={{ color: "#2563eb", fontSize: 14 }} />, name: "Enviar SMTP", type: "smtp" },
        { icon: <Send sx={{ color: "#22c55e", fontSize: 14 }} />, name: "Enviar Mensagem", type: "sendMessage" },
      ],
    },
  ];

  const clickActions = (type) => {
    switch (type) {
      case "smtp":
        setModalAddSmtp("create");
        break;
      case "variable":
        setModalAddVariable("create");
        break;
      case "closeTicket":
        setModalCloseTicket("create");
        break;
      case "start": addNode("start"); break;
      case "menu": setModalAddMenu("create"); break;
      case "content":
        setContentModalType(null); // permite todos os tipos
        setModalAddSingleBlock("create");
        break;
      case "content-text":
        setContentModalType("message");
        setModalAddSingleBlock("create");
        break;
      case "content-interval":
        setContentModalType("interval");
        setModalAddSingleBlock("create");
        break;
      case "content-image":
        setContentModalType("img");
        setModalAddSingleBlock("create");
        break;
      case "content-file":
        setContentModalType("file");
        setModalAddSingleBlock("create");
        break;
      case "content-audio":
        setContentModalType("audio");
        setModalAddSingleBlock("create");
        break;
      case "content-video":
        setContentModalType("video");
        setModalAddSingleBlock("create");
        break;
      case "random": setModalAddRandomizer("create"); break;
      case "interval": setModalAddInterval("create"); break;
      case "ticket": setModalAddTicket("create"); break;
      case "typebot": setModalAddTypebot("create"); break;
      case "directOpenai": setModalAddDirectOpenAI("create"); break;
      case "question": setModalAddQuestion("create"); break;
      case "file": setModalAddFile("create"); break;
      case "transferFlow": setModalTransferFlow("create"); break;
      case "apiRequest": setModalApiRequest("create"); break;
      case "addTag": setModalAddTag("create"); break;
      case "addTagKanban": setModalAddTagKanban("create"); break;
      case "condition": setModalCondition("create"); break;
      case "asaas": setModalAsaas("create"); break;
      case "sendMessage": setModalSendMessage("create"); break;
      case "productList": setModalProductList("create"); break;
      default: break;
    }
  };

  return (
    <Stack sx={{ height: "100vh", backgroundColor: "#f9fafb" }}>
      {/* TODOS OS MODAIS MANTIDOS IGUAIS */}
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddText(null)}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddInterval(null)}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddMenu(null)}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddImg(null)}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddAudio(null)}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddRandomizer(null)}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddVideo(null)}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        contentType={contentModalType}
        close={() => setModalAddSingleBlock(null)}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddTicket(null)}
      />
      <FlowBuilderOpenAIModal
        open={modalAddOpenAI}
        onSave={openaiAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddOpenAI(null)}
      />
      <FlowBuilderTypebotModal
        open={modalAddTypebot}
        onSave={typebotAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddTypebot(null)}
      />
      <FlowBuilderAddQuestionModal
        open={modalAddQuestion}
        onSave={questionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddQuestion(null)}
      />
      <FlowBuilderAddFileModal
        open={modalAddFile}
        onSave={fileAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddFile(null)}
      />
      <FlowBuilderTransferFlowModal
        open={modalTransferFlow}
        onSave={transferFlowAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalTransferFlow(null)}
      />
      <FlowBuilderApiRequestModal
        open={modalApiRequest}
        onSave={apiRequestAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalApiRequest(null)}
      />
      <FlowBuilderAddTagModal
        open={modalAddTag}
        onSave={addTagAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddTag(null)}
      />
      <FlowBuilderAddTagKanbanModal
        open={modalAddTagKanban}
        onSave={addTagKanbanAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddTagKanban(null)}
      />
      <FlowBuilderConditionModal
        open={modalCondition}
        onSave={conditionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalCondition(null)}
      />
      <FlowBuilderAsaasModal
        open={modalAsaas}
        onSave={asaasAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAsaas(null)}
      />
      <FlowBuilderAddSmtpModal
        open={modalAddSmtp}
        onSave={smtpAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddSmtp(null)}
      />
      <FlowBuilderAddVariableModal
        open={modalAddVariable}
        onSave={variableAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddVariable(null)}
      />
      <FlowBuilderCloseTicketModal
        open={modalCloseTicket}
        onSave={closeTicketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalCloseTicket(null)}
      />
      <FlowBuilderSendMessageModal
        open={modalSendMessage}
        onSave={sendMessageAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalSendMessage(null)}
      />
      <FlowBuilderProductListModal
        open={modalProductList}
        onSave={productListAdd}
        data={dataNode}
        onUpdate={updateNode}
        onClose={() => setModalProductList(null)}
      />
      <FlowBuilderNodeRenameModal
        open={renameModalOpen}
        node={nodeRenaming}
        defaultTitle={nodeRenaming ? getDefaultTitle(nodeRenaming.type) : "Bloco"}
        onClose={closeRenameModal}
        onSave={handleRenameSave}
      />

      {!loading && (
        <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
          {/* Sidebar Estilo Typebot */}
          <Stack className={classes.sidebar}>
            {/* Back Button */}
            <Button
              className={classes.backButton}
              startIcon={<ArrowBackIcon />}
              onClick={() => history.push("/flowbuilders")}
            >
              Voltar
            </Button>
            
            {actionGroups.map((group) => (
              <div key={group.label} className={classes.buttonGroup}>
                <Typography className={classes.groupLabel}>
                  {group.label}
                </Typography>
                <div className={classes.buttonGrid}>
                  {group.actions.map((action) => (
                    <Button
                      key={action.name}
                      className={classes.button}
                      onClick={() => clickActions(action.type)}
                    >
                      <Box className={classes.buttonIcon}>{action.icon}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "13px" }}>
                        {action.name}
                      </Typography>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </Stack>

          {/* Save Button - Fixed bottom right */}
          <Button
            color="primary"
            variant="contained"
            className={classes.saveButton}
            startIcon={<SaveIcon />}
            onClick={() => saveFlow()}
          >
            Salvar Fluxo
          </Button>

          
          {/* Flow Container */}
          <Stack className={classes.flowContainer} sx={{ paddingLeft: "260px" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDoubleClick={doubleClick}
              onNodeClick={clickNode}
              onEdgeClick={clickEdge}
              onPaneMouseDown={handlePaneMouseDown}
              onNodeMouseDown={handleNodeMouseDown}
              onNodeMouseEnter={handleNodeMouseEnter}
              onPaneContextMenu={(event) => event.preventDefault()}
              onNodeContextMenu={(event) => event.preventDefault()}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              connectionLineStyle={connectionLineStyle}
              style={{
                backgroundColor: "#fafbfc",
              }}
              defaultEdgeOptions={{
                style: { 
                  stroke: "#6366f1", 
                  strokeWidth: "3px"
                },
                animated: true,
                className: classes.animatedEdge,
              }}
              nodesDraggable={!flowLocked}
              nodesConnectable={!flowLocked}
              elementsSelectable={!flowLocked}
              selectNodesOnDrag={false}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnDoubleClick={false}
              onlyRenderVisibleElements={false}
            >
              <Controls 
                showZoom={true}
                showFitView={true}
                showInteractive={true}
                position="bottom-left"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                              </Controls>
              <Background 
                variant="dots" 
                gap={16} 
                size={1.5} 
                color="#d4d4d8"
                style={{ backgroundColor: "#fafafa" }}
              />
            </ReactFlow>
          </Stack>
        </Paper>
      )}

      {loading && (
        <Stack className={classes.loadingContainer}>
          <CircularProgress size={48} style={{ color: "#3b82f6" }} />
          <Typography className={classes.loadingText}>
            Carregando construtor de fluxo...
          </Typography>
        </Stack>
      )}
      
      <FlowBuilderAddDirectOpenAIModal
        open={modalAddDirectOpenAI}
        data={dataNode}
        close={() => setModalAddDirectOpenAI(null)}
        onSave={(config) => {
          if (modalAddDirectOpenAI === "edit") {
            // Update existing node
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === dataNode.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      ...config
                    }
                  };
                }
                return node;
              })
            );
          } else {
            // Add new node
            const newNode = {
              id: `directOpenai-${Date.now()}`,
              type: "directOpenai",
              position: { x: 100, y: 100 },
              data: config
            };
            setNodes((nds) => [...nds, newNode]);
          }
          setModalAddDirectOpenAI(null);
        }}
      />
    </Stack>
  );
};