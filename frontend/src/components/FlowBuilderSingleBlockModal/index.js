import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import Compressor from "compressorjs";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import imgvar from "../FlowBuilderSingleBlockModal/imgvar.png";
import DescriptionIcon from "@mui/icons-material/Description";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  AddCircle,
  Delete,
  Image,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Message,
  MicNone,
  Videocam,
} from "@mui/icons-material";
import { capitalize } from "../../utils/capitalize";
import { Box, Divider } from "@material-ui/core";

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
}));

const FlowBuilderSingleBlockModal = ({
  open,
  onSave,
  onUpdate,
  data,
  close,
  contentType = null,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);

  const [rule, setRule] = useState();

  const [medias, setMedias] = useState([]);

  const [textDig, setTextDig] = useState();

  const [elements, setElements] = useState([]);

  const [elementsSeq, setElementsSeq] = useState([]);

  const [elementsSeqEdit, setElementsSeqEdit] = useState([]);

  const [elementsEdit, setElementsEdit] = useState([]);

  const [numberMessages, setNumberMessages] = useState(0);

  const [numberMessagesLast, setNumberMessagesLast] = useState(0);

  const [numberInterval, setNumberInterval] = useState(0);

  const [numberIntervalLast, setNumberIntervalLast] = useState(0);

  const [numberAudio, setNumberAudio] = useState(0);

  const [numberAudioLast, setNumberAudioLast] = useState(0);

  const [numberVideo, setNumberVideo] = useState(0);

  const [numberVideoLast, setNumberVideoLast] = useState(0);

  const [numberImg, setNumberImg] = useState(0);

  const [numberImgLast, setNumberImgLast] = useState(0);

  const [numberFile, setNumberFile] = useState(0);

  const [numberFileLast, setNumberFileLast] = useState(0);

  const [loading, setLoading] = useState(false);

  const [previewImg, setPreviewImg] = useState([]);

  const [previewFiles, setPreviewFiles] = useState([]);

  const [previewAudios, setPreviewAudios] = useState([]);

  const [previewVideos, setPreviewVideos] = useState([]);

  const [arrayOption, setArrayOption] = useState([]);

  const [variables, setVariables] = useState([]);

  const [labels, setLabels] = useState({
    title: "Adicionar conteúdo ao fluxo",
    btn: "Adicionar",
  });

  const handleElements = (newNameFiles) => {
    let elementsSequence = [];

    const newArrMessage = elementsSeq.filter((item) =>
      item.includes("message")
    );
    const newArrInterval = elementsSeq.filter((item) =>
      item.includes("interval")
    );
    const newArrImg = elementsSeq.filter((item) => item.includes("img"));
    const newArrFile = elementsSeq.filter((item) => item.includes("file"));
    const newArrAudio = elementsSeq.filter((item) => item.includes("audio"));
    const newArrVideo = elementsSeq.filter((item) => item.includes("video"));

    //Todas as mensagens
    for (let i = 0; i < numberMessages; i++) {
      const value = document
        .querySelector(`.${newArrMessage[i]}`)
        .querySelector(".MuiInputBase-input").value;
      if (!value) {
        toast.error("Campos de mensagem vazio!");
        setLoading(false);
        throw "";
      }
      elementsSequence.push({
        type: "message",
        value: value,
        number: newArrMessage[i],
      });
      console.log("text");
    }
    //Todos os intervalos
    for (let i = 0; i < numberInterval; i++) {
      const value = document
        .querySelector(`.${newArrInterval[i]}`)
        .querySelector(".MuiInputBase-input").value;
      if (parseInt(value) === 0 || parseInt(value) > 120) {
        toast.error("Intervalo não pode ser 0 ou maior que 120!");
        setLoading(false);
        throw "";
      }
      elementsSequence.push({
        type: "interval",
        value: value,
        number: newArrInterval[i],
      });
      console.log("int");
    }

    //Todas as imagens
    for (let i = 0; i < numberImg; i++) {
      const onlyImg =
        newNameFiles !== null &&
        newNameFiles.filter(
          (file) =>
            file.includes("png") ||
            file.includes("jpg") ||
            file.includes("jpeg")
        );
      const onlyImgNameOriginal = medias.filter(
        (file) =>
          file.name.includes("png") ||
          file.name.includes("jpg") ||
          file.name.includes("jpeg")
      );
      if (elementsSeqEdit.includes(newArrImg[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          (item) => item.number === newArrImg[i]
        )[0];
        elementsSequence.push({
          type: "img",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number,
        });
      } else {
        let indexElem = 0;
        if (elementsSeqEdit.filter((item) => item.includes("img")).length > 0) {
          indexElem =
            elementsSeqEdit.filter((item) => item.includes("img")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "img",
          value: onlyImg[indexElem],
          original: onlyImgNameOriginal[indexElem].name,
          number: newArrImg[i],
        });
      }
    }

    //Todos os documentos (arquivo)
    for (let i = 0; i < numberFile; i++) {
      const onlyFiles =
        newNameFiles !== null &&
        newNameFiles.filter(
          (file) =>
            file.includes("pdf") ||
            file.includes("doc") ||
            file.includes("docx") ||
            file.includes("xls") ||
            file.includes("xlsx")
        );
      const onlyFilesNameOriginal = medias.filter(
        (file) =>
          file.name.includes("pdf") ||
          file.name.includes("doc") ||
          file.name.includes("docx") ||
          file.name.includes("xls") ||
          file.name.includes("xlsx")
      );
      if (elementsSeqEdit.includes(newArrFile[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          (item) => item.number === newArrFile[i]
        )[0];
        elementsSequence.push({
          type: "file",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number,
        });
      } else {
        let indexElem = 0;
        if (
          elementsSeqEdit.filter((item) => item.includes("file")).length > 0
        ) {
          indexElem =
            elementsSeqEdit.filter((item) => item.includes("file")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "file",
          value: onlyFiles[indexElem],
          original: onlyFilesNameOriginal[indexElem].name,
          number: newArrFile[i],
        });
      }
    }

    //Todos os audios
    for (let i = 0; i < numberAudio; i++) {
      const onlyAudio =
        newNameFiles !== null &&
        newNameFiles.filter(
          (file) =>
            file.includes("mp3") ||
            file.includes("ogg") ||
            file.includes("mpeg") ||
            file.includes("opus")
        );
      const onlyAudioNameOriginal = medias.filter(
        (file) =>
          file.name.includes("mp3") ||
          file.name.includes("ogg") ||
          file.name.includes("mpeg") ||
          file.name.includes("opus")
      );

      if (elementsSeqEdit.includes(newArrAudio[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          (item) => item.number === newArrAudio[i]
        )[0];
        elementsSequence.push({
          type: "audio",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number,
          record: document
            .querySelector(`.check${newArrAudio[i]}`)
            .querySelector(".PrivateSwitchBase-input").checked,
        });
      } else {
        let indexElem = 0;
        if (
          elementsSeqEdit.filter((item) => item.includes("audio")).length > 0
        ) {
          indexElem =
            elementsSeqEdit.filter((item) => item.includes("audio")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "audio",
          value: onlyAudio[indexElem],
          original: onlyAudioNameOriginal[indexElem].name,
          number: newArrAudio[i],
          record: document
            .querySelector(`.check${newArrAudio[i]}`)
            .querySelector(".PrivateSwitchBase-input").checked,
        });
      }
    }
    //Todos os videos
    for (let i = 0; i < numberVideo; i++) {
      const onlyVideo =
        newNameFiles !== null &&
        newNameFiles.filter(
          (file) => file.includes("mp4") || file.includes("avi")
        );
      const onlyVideoNameOriginal = medias.filter(
        (file) => file.name.includes("mp4") || file.name.includes("avi")
      );
      if (elementsSeqEdit.includes(newArrVideo[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          (item) => item.number === newArrVideo[i]
        )[0];
        elementsSequence.push({
          type: "video",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number,
        });
      } else {
        let indexElem = 0;
        if (
          elementsSeqEdit.filter((item) => item.includes("video")).length > 0
        ) {
          indexElem =
            elementsSeqEdit.filter((item) => item.includes("video")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "video",
          value: onlyVideo[indexElem],
          original: onlyVideoNameOriginal[indexElem].name,
          number: newArrVideo[i],
        });
      }
    }

    console.log(elementsSequence);

    return elementsSequence;
  };

  const handleChangeFiles = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 5000000) {
      toast.error("Arquivo é muito grande! 5MB máximo");
      return;
    }

    const file = e.target.files[0];

    // Criar a visualização do documento
    const fileContainer = document.querySelector(`.file${number}`);
    if (fileContainer) {
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.style.justifyContent = "center";
      container.style.border = "1px solid #ccc";
      container.style.borderRadius = "4px";
      container.style.padding = "20px";
      container.style.width = "200px";
      container.style.height = "100px";

      const iconContainer = document.createElement("div");
      iconContainer.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#3f51b5" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';

      const fileName = document.createElement("span");
      fileName.textContent = file.name;
      fileName.style.marginTop = "8px";
      fileName.style.fontSize = "12px";
      fileName.style.textAlign = "center";

      container.appendChild(iconContainer);
      container.appendChild(fileName);

      fileContainer.appendChild(container);
    }

    setPreviewFiles((old) => [
      ...old,
      {
        number: number,
        name: file.name,
      },
    ]);

    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);

    // Removemos o botão após o upload
    document.querySelector(`.btnFile${number}`).remove();
  };

  const deleteElementsTypeOne = (id, type) => {
    if (type === "message") {
      setNumberMessages((old) => old - 1);
      setElementsSeq((old) => old.filter((item) => item !== `message${id}`));
      setElementsSeqEdit((old) =>
        old.filter((item) => item !== `message${id}`)
      );
      document.querySelector(`.stackMessage${id}`).remove();
    }
    if (type === "interval") {
      setNumberInterval((old) => old - 1);
      setElementsSeq((old) => old.filter((item) => item !== `interval${id}`));
      setElementsSeqEdit((old) =>
        old.filter((item) => item !== `interval${id}`)
      );
      document.querySelector(`.stackInterval${id}`).remove();
    }
    if (type === "img") {
      setNumberImg((old) => old - 1);
      setPreviewImg((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter(
              (mediaItem) =>
                mediaItem.name !==
                old.filter((item) => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `img${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `img${id}`));
      document.querySelector(`.stackImg${id}`).remove();
    }
    if (type === "file") {
      setNumberFile((old) => old - 1);
      setPreviewFiles((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter(
              (mediaItem) =>
                mediaItem.name !==
                old.filter((item) => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `file${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `file${id}`));
      document.querySelector(`.stackFile${id}`).remove();
    }
    if (type === "audio") {
      setNumberAudio((old) => old - 1);
      setPreviewAudios((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter(
              (mediaItem) =>
                mediaItem.name !==
                old.filter((item) => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `audio${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `audio${id}`));
      document.querySelector(`.stackAudio${id}`).remove();
    }
    if (type === "video") {
      setNumberVideo((old) => old - 1);
      setPreviewVideos((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter(
              (mediaItem) =>
                mediaItem.name !==
                old.filter((item) => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `video${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `video${id}`));
      document.querySelector(`.stackVideo${id}`).remove();
    }
  };

  const moveElementDown = (id) => {
    setElementsSeq((old) => {
      const array = old;
      const index = array.indexOf(id);
      moveItemParaFrente(index);
      console.log("id", id);
      if (index !== -1 && index < array.length - 1) {
        // Verifica se o elemento foi encontrado no array e não está na última posição
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(index, 1)[0];
        novoArray.splice(index + 1, 0, elementoMovido);
        return novoArray;
      }
      return array;
    });
  };

  const moveElementUp = (id) => {
    setElementsSeq((old) => {
      const array = old;
      const index = array.indexOf(id);
      moveItemParaTras(index);

      if (index !== -1 && index > 0) {
        // Verifica se o elemento foi encontrado no array e não está na primeira posição
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(index, 1)[0];
        novoArray.splice(index - 1, 0, elementoMovido);
        return novoArray;
      }
      return array;
    });
  };

  function moveItemParaFrente(posicao) {
    setElements((old) => {
      const array = old;

      if (posicao >= 0 && posicao < array.length - 1) {
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(posicao, 1)[0];
        novoArray.splice(posicao + 1, 0, elementoMovido);
        return novoArray;
      }

      return array; // Retorna o array original se a movimentação não for possível
    });
  }

  function moveItemParaTras(posicao) {
    setElements((old) => {
      const array = old;
      if (posicao > 0 && posicao < array.length) {
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(posicao, 1)[0];
        novoArray.splice(posicao - 1, 0, elementoMovido);
        return novoArray;
      }

      return array; // Retorna o array original se a movimentação não for possível
    });
  }

  const handleChangeMediasImg = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 5000000) {
      toast.error("Arquivo é muito grande! 5MB máximo");
      return;
    }

    const file = e.target.files[0];
    const fileType = file.type;
    const isDocument =
      fileType === "application/pdf" ||
      fileType.includes("spreadsheetml") ||
      fileType.includes("wordprocessingml") ||
      fileType.includes("application/msword") ||
      fileType.includes("application/vnd.ms-excel");

    if (isDocument) {
      // Para documentos, criamos uma visualização especial
      const documentPreview = document.querySelector(`.img${number}`);
      if (documentPreview) {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.border = "1px solid #ccc";
        container.style.borderRadius = "4px";
        container.style.padding = "20px";
        container.style.width = "200px";
        container.style.height = "100px";

        const iconContainer = document.createElement("div");
        iconContainer.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#3f51b5" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';

        const fileName = document.createElement("span");
        fileName.textContent = file.name;
        fileName.style.marginTop = "8px";
        fileName.style.fontSize = "12px";
        fileName.style.textAlign = "center";

        container.appendChild(iconContainer);
        container.appendChild(fileName);

        documentPreview.parentNode.replaceChild(container, documentPreview);
      }
    } else {
      // Para imagens, mantemos o comportamento original
      const imgBlob = URL.createObjectURL(file);
      setPreviewImg((old) => [
        ...old,
        {
          number: number,
          url: imgBlob,
          name: file.name,
        },
      ]);

      document.querySelector(`.img${number}`).src = imgBlob;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);

    // Removemos o botão após o upload
    document.querySelector(`.btnImg${number}`).remove();
  };

  const handleChangeAudios = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 5000000) {
      toast.error("Arquivo é muito grande! 5MB máximo");
      return;
    }

    const audioBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewAudios((old) => [
      ...old,
      {
        number: number,
        url: audioBlob,
        name: e.target.files[0].name,
      },
    ]);

    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);

    document.querySelector(
      `.audio${number}`
    ).innerHTML = `<audio controls="controls">
    <source src="${audioBlob}" type="audio/mp3" />
    seu navegador não suporta HTML5
  </audio>`;
    document.querySelector(`.btnAudio${number}`).remove();
  };

  const handleChangeVideos = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 104857600) {
      toast.error("Arquivo é muito grande! 100MB máximo");
      return;
    }
    const videoBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewVideos((old) => [
      ...old,
      {
        number: number,
        url: videoBlob,
        name: e.target.files[0].name,
      },
    ]);

    var divConteudo = document.createElement("div");

    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);

    divConteudo.innerHTML = `<video controls="controls" style="width: 200px;">
    <source src="${videoBlob}" type="video/mp4" />
    seu navegador não suporta HTML5
  </video>`;

    document.querySelector(`.video${number}`).appendChild(divConteudo);
    document.querySelector(`.btnVideo${number}`).remove();
  };

  const imgLayout = (number, valueDefault = "") => {
    const isDocument =
      valueDefault &&
      (valueDefault.includes(".pdf") ||
        valueDefault.includes(".docx") ||
        valueDefault.includes(".xlsx") ||
        valueDefault.includes(".doc") ||
        valueDefault.includes(".xls"));

    return (
      <Stack
        sx={{
          border: "1px solid #0000FF",
          borderRadius: "7px",
          padding: "6px",
          position: "relative",
        }}
        className={`stackImg${number}`}
        key={`stackImg${number}`}
      >
        <Stack sx={{ position: "absolute", right: 6 }}>
          <Delete onClick={() => deleteElementsTypeOne(number, "img")} />
        </Stack>
        <Typography textAlign={"center"}>
          {isDocument ? "Documento" : "Imagem"}
        </Typography>
        <Stack direction={"row"} justifyContent={"center"}>
          {isDocument ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #ccc",
                padding: "20px",
                width: "200px",
                height: "100px",
                borderRadius: "4px",
              }}
            >
              <DescriptionIcon
                style={{ fontSize: 40, color: "#3f51b5", marginBottom: 8 }}
              />
              <Typography variant="body2">
                {valueDefault.split("/").pop()}
              </Typography>
            </Box>
          ) : (
            <img
              src={
                valueDefault.length > 0
                  ? process.env.REACT_APP_BACKEND_URL +
                    "/public/" +
                    valueDefault
                  : ""
              }
              className={`img${number}`}
              style={{ width: "200px" }}
            />
          )}
        </Stack>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnImg${number}`}
          >
            Enviar arquivo
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.ms-excel"
              hidden
              onChange={(e) => handleChangeMediasImg(e, number)}
            />
          </Button>
        )}
      </Stack>
    );
  };

  const audioLayout = (number, valueDefault = "", valueRecordDefault = "") => {
    return (
      <Stack
        sx={{
          border: "1px solid #0000FF",
          borderRadius: "7px",
          padding: "6px",
          position: "relative",
        }}
        className={`stackAudio${number}`}
        key={`stackAudio${number}`}
      >
        <Stack
          sx={{ position: "absolute", right: 6 }}
          direction={"row"}
          gap={1}
        >
          {/* <KeyboardArrowUp
            onClick={() => moveElementUp(`audio${number}`)}
            sx={{ cursor: "pointer" }}
          />
          <KeyboardArrowDown
            onClick={() => moveElementDown(`audio${number}`)}
            sx={{ cursor: "pointer" }}
          /> */}
          <Delete
            sx={{ cursor: "pointer" }}
            onClick={() => deleteElementsTypeOne(number, "audio")}
          />
        </Stack>
        <Typography textAlign={"center"}>Audio</Typography>
        <div
          className={`audio${number}`}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {valueDefault.length > 0 && (
            <audio controls="controls">
              <source
                src={
                  process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault
                }
                type="audio/mp3"
              />
              seu navegador não suporta HTML5
            </audio>
          )}
        </div>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnAudio${number}`}
          >
            Enviar audio
            <input
              type="file"
              accept="audio/ogg, audio/mp3, audio/opus"
              hidden
              onChange={(e) => handleChangeAudios(e, number)}
            />
          </Button>
        )}
        <Stack direction={"row"} justifyContent={"center"}>
          <Checkbox
            className={`checkaudio${number}`}
            defaultChecked={valueRecordDefault === "ok" ? false : true}
          />
          <Stack justifyContent={"center"}>
            <Typography>Enviar como audio gravado na hora</Typography>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const videoLayout = (number, valueDefault = "") => {
    return (
      <Stack
        sx={{
          border: "1px solid #0000FF",
          borderRadius: "7px",
          padding: "6px",
          position: "relative",
        }}
        className={`stackVideo${number}`}
        key={`stackVideo${number}`}
      >
        <Stack sx={{ position: "absolute", right: 6 }}>
          <Delete onClick={() => deleteElementsTypeOne(number, "video")} />
        </Stack>
        <Typography textAlign={"center"}>Video</Typography>
        <div
          className={`video${number}`}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {valueDefault.length > 0 && (
            <video controls="controls" style={{ width: "200px" }}>
              <source
                src={
                  process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault
                }
                type="video/mp4"
              />
              seu navegador não suporta HTML5
            </video>
          )}
        </div>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnVideo${number}`}
          >
            Enviar video
            <input
              type="file"
              accept="video/mp4"
              hidden
              onChange={(e) => handleChangeVideos(e, number)}
            />
          </Button>
        )}
      </Stack>
    );
  };

  const messageLayout = (number, valueDefault = "") => {
    return (
      <Stack
        sx={{
          border: "1px solid #0000FF",
          borderRadius: "7px",
          padding: "6px",
          position: "relative",
        }}
        className={`stackMessage${number}`}
        key={`stackMessage${number}`}
      >
        <Stack sx={{ position: "absolute", right: 6 }}>
          <Delete onClick={() => deleteElementsTypeOne(number, "message")} />
        </Stack>
        <Typography textAlign={"center"}>Texto</Typography>
        <TextField
          label={"Mensagem"}
          defaultValue={valueDefault}
          multiline
          rows={7}
          className={`message${number}`}
          name="text"
          variant="outlined"
          margin="dense"
          style={{ width: "100%" }}
        />
      </Stack>
    );
  };

  const intervalLayout = (number, valueDefault = 0) => {
    return (
      <Stack
        sx={{
          border: "1px solid #0000FF",
          borderRadius: "7px",
          padding: "6px",
          position: "relative",
        }}
        className={`stackInterval${number}`}
        key={`stackInterval${number}`}
      >
        <Stack sx={{ position: "absolute", right: 6 }}>
          <Delete onClick={() => deleteElementsTypeOne(number, "interval")} />
        </Stack>
        <Typography textAlign={"center"}>Intervalo</Typography>
        <TextField
          label={"Tempo em segundos"}
          className={`interval${number}`}
          defaultValue={valueDefault}
          type="number"
          InputProps={{ inputProps: { min: 0, max: 120 } }}
          variant="outlined"
          margin="dense"
          style={{ width: "100%" }}
        />
      </Stack>
    );
  };

  const fileLayout = (number, valueDefault = "") => {
    return (
      <Stack
        sx={{
          border: "1px solid #3f51b5",
          borderRadius: "7px",
          padding: "6px",
          position: "relative",
        }}
        className={`stackFile${number}`}
        key={`stackFile${number}`}
      >
        <Stack sx={{ position: "absolute", right: 6 }}>
          <Delete onClick={() => deleteElementsTypeOne(number, "file")} />
        </Stack>
        <Typography textAlign={"center"}>Documento</Typography>
        <Stack direction={"row"} justifyContent={"center"}>
          {valueDefault.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #ccc",
                padding: "20px",
                width: "200px",
                height: "100px",
                borderRadius: "4px",
              }}
            >
              <DescriptionIcon
                style={{ fontSize: 40, color: "#3f51b5", marginBottom: 8 }}
              />
              <Typography variant="body2">
                {valueDefault
                  .split("/")
                  .pop()
                  .replace(
                    /\.vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet)/,
                    (match) => {
                      if (match.includes("wordprocessingml.document"))
                        return ".docx";
                      if (match.includes("spreadsheetml.sheet")) return ".xlsx";
                      return match;
                    }
                  )}
              </Typography>
            </Box>
          ) : (
            <Box
              className={`file${number}`}
              sx={{ width: "200px", height: "100px" }}
            ></Box>
          )}
        </Stack>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnFile${number}`}
          >
            Enviar documento
            <input
              type="file"
              accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.ms-excel"
              hidden
              onChange={(e) => handleChangeFiles(e, number)}
            />
          </Button>
        )}
      </Stack>
    );
  };

  const verifyButtonsUpload = () => {
    const newArrImg = elementsSeq.filter((item) => item.includes("img"));
    const newArrFile = elementsSeq.filter((item) => item.includes("file"));
    const newArrAudio = elementsSeq.filter((item) => item.includes("audio"));
    const newArrVideo = elementsSeq.filter((item) => item.includes("video"));

    for (let i = 0; i < numberImg; i++) {
      const imgVerify = document.querySelector(
        `.btn${capitalize(newArrImg[i])}`
      );
      if (imgVerify) {
        return true;
      }
    }
    for (let i = 0; i < numberFile; i++) {
      const fileVerify = document.querySelector(
        `.btn${capitalize(newArrFile[i])}`
      );
      if (fileVerify) {
        return true;
      }
    }
    for (let i = 0; i < numberAudio; i++) {
      const audioVerify = document.querySelector(
        `.btn${capitalize(newArrAudio[i])}`
      );
      if (audioVerify) {
        return true;
      }
    }
    for (let i = 0; i < numberVideo; i++) {
      const videoVerify = document.querySelector(
        `.btn${capitalize(newArrVideo[i])}`
      );
      if (videoVerify) {
        return true;
      }
    }
  };

  useEffect(() => {
    const localVariables = localStorage.getItem("variables");
    if (localVariables) {
      setVariables(JSON.parse(localVariables));
    }

    if (open === "edit") {
      setLabels({
        title: "Editar conteúdo",
        btn: "Salvar",
      });

      setElementsSeq(data.data.seq);

      setElementsSeqEdit(data.data.seq);
      setElementsEdit(data.data.elements);
      if (data) {
        const elementsEditLoc = data.data.elements;
        const sequence = data.data.seq;

        sequence.map((item) => {
          const itemNode = elementsEditLoc.filter(
            (inode) => inode.number === item
          )[0];
          if (itemNode.type === "message") {
            const numberLoc = parseInt(item.replace("message", ""));
            setElements((elm) => [
              ...elm,
              messageLayout(numberLoc, itemNode.value),
            ]);
            setNumberMessages((old) => {
              const arsOnly = sequence.filter((item) =>
                item.includes("message")
              );
              const arrNumberMax = arsOnly.map((item) =>
                parseInt(item.replace("message", ""))
              );
              setNumberMessagesLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "interval") {
            const numberLoc = parseInt(item.replace("interval", ""));
            setElements((elm) => [
              ...elm,
              intervalLayout(numberLoc, itemNode.value),
            ]);
            setNumberInterval((old) => {
              const arsOnly = sequence.filter((item) =>
                item.includes("interval")
              );
              const arrNumberMax = arsOnly.map((item) =>
                parseInt(item.replace("interval", ""))
              );
              setNumberIntervalLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "audio") {
            const numberLoc = parseInt(item.replace("audio", ""));
            setElements((elm) => [
              ...elm,
              audioLayout(
                numberLoc,
                itemNode.value,
                itemNode.record ? "" : "ok"
              ),
            ]);
            setNumberAudio((old) => {
              const arsOnly = sequence.filter((item) => item.includes("audio"));
              const arrNumberMax = arsOnly.map((item) =>
                parseInt(item.replace("audio", ""))
              );
              setNumberAudioLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "img") {
            const numberLoc = parseInt(item.replace("img", ""));
            setElements((elm) => [
              ...elm,
              imgLayout(numberLoc, itemNode.value),
            ]);
            setNumberImg((old) => {
              const arsOnly = sequence.filter((item) => item.includes("img"));
              const arrNumberMax = arsOnly.map((item) =>
                parseInt(item.replace("img", ""))
              );
              setNumberImgLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "file") {
            const numberLoc = parseInt(item.replace("file", ""));
            setElements((elm) => [
              ...elm,
              fileLayout(numberLoc, itemNode.value),
            ]);
            setNumberFile((old) => {
              const arsOnly = sequence.filter((item) => item.includes("file"));
              const arrNumberMax = arsOnly.map((item) =>
                parseInt(item.replace("file", ""))
              );
              setNumberFileLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "video") {
            const numberLoc = parseInt(item.replace("video", ""));
            setElements((elm) => [
              ...elm,
              videoLayout(numberLoc, itemNode.value),
            ]);
            setNumberVideo((old) => {
              const arsOnly = sequence.filter((item) => item.includes("video"));
              const arrNumberMax = arsOnly.map((item) =>
                parseInt(item.replace("video", ""))
              );
              setNumberVideoLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
        });
      }
      setActiveModal(true);
    }
    if (open === "create") {
      setLabels({
        title: "Adicionar menu ao fluxo",
        btn: "Adicionar",
      });
      setTextDig();
      setArrayOption([]);
      setActiveModal(true);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = async () => {
    close(null);
    setActiveModal(false);
    setTimeout(() => {
      setMedias([]);
      setPreviewImg([]);
      setPreviewFiles([]);
      setPreviewAudios([]);
      setPreviewVideos([]);
      setArrayOption([]);
      setElements([]);
      setElementsSeq([]);
      setElementsEdit([]);
      setElementsSeqEdit([]);
      setNumberMessages(0);
      setNumberMessagesLast(0);
      setNumberInterval(0);
      setNumberIntervalLast(0);
      setNumberAudio(0);
      setNumberAudioLast(0);
      setNumberVideo(0);
      setNumberVideoLast(0);
      setNumberImg(0);
      setNumberImgLast(0);
      setNumberFile(0);
      setNumberFileLast(0);
    }, 500);
  };

  const handleSaveNode = async () => {
    if (open === "edit") {
      setLoading(true);
      const formData = new FormData();

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,

            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              console.error("Erro ao comprimir mídia:", err.message);
            },
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        if (
          (numberAudio === 0 &&
            numberVideo === 0 &&
            numberImg === 0 &&
            numberFile === 0) ||
          medias.length === 0
        ) {
          try {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(null),
            };
            console.log("QUI", mountData);
            onUpdate({
              ...data,
              data: mountData,
            });
            toast.success("Conteúdo adicionado com sucesso!");
            handleClose();
            setLoading(false);

            return;
          } catch (e) {
            console.log(e);
            setLoading(false);
          }
          return;
        }
        const verify = verifyButtonsUpload();
        if (verify) {
          setLoading(false);
          return toast.error(
            "Delete os cards vazios (Imagem, Arquivo, Audio e Video)"
          );
        }
        await api
          .post("/flowbuilder/content", formData)
          .then(async (res) => {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(res.data),
            };
            onUpdate({
              ...data,
              data: mountData,
            });
            toast.success("Conteúdo adicionado com sucesso!");
            await handleClose();
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }, 1500);
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,

            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              console.error("Erro ao comprimir mídia:", err.message);
            },
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        if (
          numberAudio === 0 &&
          numberVideo === 0 &&
          numberImg === 0 &&
          numberFile === 0
        ) {
          try {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(null),
            };
            onSave({
              ...mountData,
            });
            toast.success("Conteúdo adicionado com sucesso!");
            handleClose();
            setLoading(false);

            return;
          } catch (e) {
            setLoading(false);
          }
        }
        const verify = verifyButtonsUpload();
        if (verify) {
          setLoading(false);
          return toast.error(
            "Delete os cards vazios (Imagem, Arquivo, Audio e Video)"
          );
        }
        await api
          .post("/flowbuilder/content", formData)
          .then((res) => {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(res.data),
            };
            onSave({
              ...mountData,
            });
            toast.success("Conteúdo adicionado com sucesso!");
            handleClose();
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }, 1500);
    }
  };

  const scrollToBottom = (className) => {
    const element = document.querySelector(className);
    element.scrollTop = element.scrollHeight;
  };

  const variableFormatter = (item) => {
    return "{{" + item + "}}";
  };
  return (
    <div>
      <Dialog open={activeModal} fullWidth="md" scroll="paper">
        {!loading && (
          <DialogTitle id="form-dialog-title">
            Adicionar conteúdo ao fluxo
          </DialogTitle>
        )}
        <Stack>
          <Stack
            className="body-card"
            style={{
              gap: "8px",
              padding: "16px",
              overflow: "auto",
              height: "70vh",
              scrollBehavior: "smooth",
              display: loading && "none",
            }}
          >
            {elements.map((item) => (
              <>{item}</>
            ))}
            <Stack direction={"column"} gap={1.5}>
              {(contentType === null || contentType === "message") && (
                <Button
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#437db5",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    setElements((old) => [
                      ...old,
                      messageLayout(numberMessagesLast),
                    ]);
                    setNumberMessages((old) => {
                      setElementsSeq((oldEleme) => [
                        ...oldEleme,
                        `message${numberMessagesLast}`,
                      ]);
                      return old + 1;
                    });
                    setNumberMessagesLast((old) => old + 1);
                    setTimeout(() => {
                      scrollToBottom(".body-card");
                    }, 100);
                  }}
                >
                  <Message
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Texto
                </Button>
              )}

              {(contentType === null || contentType === "interval") && (
                <Button
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#4ec24e",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    setElements((old) => [
                      ...old,
                      intervalLayout(numberIntervalLast),
                    ]);
                    setNumberInterval((old) => {
                      setElementsSeq((oldEleme) => [
                        ...oldEleme,
                        `interval${numberIntervalLast}`,
                      ]);
                      return old + 1;
                    });
                    setNumberIntervalLast((old) => old + 1);
                    setTimeout(() => {
                      scrollToBottom(".body-card");
                    }, 100);
                  }}
                >
                  <AccessTime
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Intervalo
                </Button>
              )}

              {(contentType === null || contentType === "img") && (
                <Button
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#FFA500",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    setElements((old) => [...old, imgLayout(numberImgLast)]);
                    setNumberImg((old) => {
                      setElementsSeq((oldEleme) => [
                        ...oldEleme,
                        `img${numberImgLast}`,
                      ]);
                      return old + 1;
                    });
                    setNumberImgLast((old) => old + 1);
                    setTimeout(() => {
                      scrollToBottom(".body-card");
                    }, 100);
                  }}
                >
                  <Image
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Imagem
                </Button>
              )}

              {(contentType === null || contentType === "file") && (
                <Button
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#3f51b5",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    setElements((old) => [...old, fileLayout(numberFileLast)]);
                    setNumberFile((old) => {
                      setElementsSeq((oldEleme) => [
                        ...oldEleme,
                        `file${numberFileLast}`,
                      ]);
                      return old + 1;
                    });
                    setNumberFileLast((old) => old + 1);
                    setTimeout(() => {
                      scrollToBottom(".body-card");
                    }, 100);
                  }}
                >
                  <DescriptionIcon
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Arquivo
                </Button>
              )}

              {(contentType === null || contentType === "audio") && (
                <Button
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#8A2BE2",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    setElements((old) => [...old, audioLayout(numberAudioLast)]);
                    setNumberAudio((old) => {
                      setElementsSeq((oldEleme) => [
                        ...oldEleme,
                        `audio${numberAudioLast}`,
                      ]);
                      return old + 1;
                    });
                    setNumberAudioLast((old) => old + 1);
                    setTimeout(() => {
                      scrollToBottom(".body-card");
                    }, 100);
                  }}
                >
                  <MicNone
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Audio
                </Button>
              )}

              {(contentType === null || contentType === "video") && (
                <Button
                  variant="contained"
                  style={{
                    color: "white",
                    backgroundColor: "#db6565",
                    boxShadow: "none",
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    setElements((old) => [...old, videoLayout(numberVideoLast)]);
                    setNumberVideo((old) => {
                      setElementsSeq((oldEleme) => [
                        ...oldEleme,
                        `video${numberVideoLast}`,
                      ]);
                      return old + 1;
                    });
                    setNumberVideoLast((old) => old + 1);
                    setTimeout(() => {
                      scrollToBottom(".body-card");
                    }, 100);
                  }}
                >
                  <Videocam
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Video
                </Button>
              )}
            </Stack>
            <Divider />
            <Box style={{ width: "100%", textAlign: "center" }}>
              <Typography
                component="div"
                className={classes.elementMargin}
                style={{ fontSize: "0.875rem", textAlign: "left" }} // Reduz o tamanho do texto e alinha à margem esquerda
              >
                <p>Variáveis</p>
                <p>
                  <strong>{"{{firstName}}"}</strong>: Retorna o primeiro nome do
                  contato relacionado ao ticket. Se não houver contato, retorna
                  uma string vazia.
                </p>
                <p>
                  <strong>{"{{name}}"}</strong>: O nome completo do contato (ou
                  uma string vazia se não houver contato).
                </p>
                <p>
                  <strong>{"{{userName}}"}</strong>: O nome do usuário associado
                  ao ticket. Se não houver usuário, retorna uma string vazia.
                </p>
                <p>
                  <strong>{"{{ms}}"}</strong>: Retorna uma saudação com base no
                  horário atual (Exemplo: "Bom Dia", "Boa Tarde").
                </p>
                <p>
                  <strong>{"{{protocol}}"}</strong>: Combinação de control() e o
                  ID do ticket, criando um protocolo único.
                </p>
                <p>
                  <strong>{"{{date}}"}</strong>: Retorna a data atual no formato
                  dd-mm-yyyy.
                </p>
                <p>
                  <strong>{"{{hour}}"}</strong>: Retorna a hora atual no formato
                  hh:mm:ss.
                </p>
                <p>
                  <strong>{"{{ticket_id}}"}</strong>: O ID do ticket, se
                  existir. Caso contrário, retorna uma string vazia.
                </p>
                <p>
                  <strong>{"{{queue}}"}</strong>: Retorna o nome da fila à qual
                  o ticket está associado (caso exista).
                </p>
                <p>
                  <strong>{"{{connection}}"}</strong>: Retorna o nome da conexão
                  de WhatsApp associada ao ticket.
                </p>
              </Typography>

              {variables && (
                <>
                  {variables.map((item) => (
                    <>
                      <Typography>{variableFormatter(item)}</Typography>
                    </>
                  ))}
                </>
              )}
            </Box>
          </Stack>

          <DialogActions>
            <Button
              startIcon={<CancelIcon />}
              onClick={handleClose}
              style={{
                color: "white",
                backgroundColor: "#db6565",
                boxShadow: "none",
                borderRadius: 0,
                fontSize: "12px",
              }}
              variant="outlined"
            >
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              startIcon={<SaveIcon />}
              type="submit"
              style={{
                color: "white",
                backgroundColor: "#437db5",
                boxShadow: "none",
                borderRadius: 0,
                fontSize: "12px",
              }}
              variant="contained"
              onClick={() => handleSaveNode()}
            >
              {`${labels.btn}`}
            </Button>
          </DialogActions>
        </Stack>
        {loading && (
          <Stack
            style={{
              gap: "8px",
              padding: "16px",
              height: "70vh",
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            <Stack>
              <Typography>
                Subindo os arquivos e criando o conteúdo...
              </Typography>
              <Stack style={{ alignSelf: "center", marginTop: "12px" }}>
                <CircularProgress />
              </Stack>
            </Stack>
          </Stack>
        )}
      </Dialog>
    </div>
  );
};

export default FlowBuilderSingleBlockModal;
