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
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import Compressor from "compressorjs";
import DescriptionIcon from "@material-ui/icons/Description";
import { Box } from "@material-ui/core";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack } from "@mui/material";

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
  documentPreview: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "20px",
    width: "552px",
    height: "200px",
  },
}));

const FlowBuilderAddImgModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState();

  const [oldImage, setOldImage] = useState();

  const [isDocument, setIsDocument] = useState(false);

  const [labels, setLabels] = useState({
    title: "Adicionar arquivo ao fluxo",
    btn: "Adicionar",
  });

  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar arquivo",
        btn: "Salvar",
      });
      setOldImage(data.data.url);
      setPreview(
        process.env.REACT_APP_BACKEND_URL + "/public/" + data.data.url
      );

      // Verificar se é um documento pelo tipo
      if (
        data.data.url &&
        (data.data.url.endsWith(".pdf") ||
          data.data.url.endsWith(".docx") ||
          data.data.url.endsWith(".xlsx") ||
          data.data.url.endsWith(".doc") ||
          data.data.url.endsWith(".xls"))
      ) {
        setIsDocument(true);
      } else {
        setIsDocument(false);
      }

      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar arquivo ao fluxo",
        btn: "Adicionar",
      });
      setIsDocument(false);
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = async () => {
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { url: "" },
      });
      return;
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();
      formData.append("fromMe", true);

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
              console.error("Erro ao comprimir imagem:", err.message);
            },
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        console.log(formData);
        await api.post("/flowbuilder/img", formData).then((res) => {
          handleClose();
          onSave({
            url: res.data.name,
          });
          toast.success("Arquivo adicionado com sucesso!");
          setLoading(false);
          setMedias([]);
          setPreview();
        });
      }, 1000);
    }
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 5000000) {
      toast.error("Arquivo é muito grande! 5MB máximo");
      return;
    }

    const selectedFile = e.target.files[0];
    const selectedMedias = Array.from(e.target.files);

    // Verificar se é um documento
    const fileType = selectedFile.type;
    if (
      fileType === "application/pdf" ||
      fileType.includes("spreadsheetml") ||
      fileType.includes("wordprocessingml") ||
      fileType.includes("application/vnd.ms-excel") ||
      fileType.includes("application/msword")
    ) {
      setIsDocument(true);
    } else {
      setIsDocument(false);
    }

    setPreview(URL.createObjectURL(e.target.files[0]));
    setMedias(selectedMedias);
  };

  // Renderiza uma prévia adequada com base no tipo de arquivo
  const renderPreview = () => {
    if (!preview) return null;

    if (isDocument) {
      return (
        <Box className={classes.documentPreview}>
          <DescriptionIcon
            style={{ fontSize: 60, color: "#3f51b5", marginBottom: 10 }}
          />
          <Typography variant="body1">
            {preview.split("/").pop().split("-").pop()}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Documento pronto para envio
          </Typography>
        </Box>
      );
    } else {
      return <img src={preview} style={{ width: "552px" }} />;
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">{labels.title}</DialogTitle>
        <Stack>
          <DialogContent dividers>
            <Stack gap={"16px"}>
              {preview && renderPreview()}
              {!loading && open !== "edit" && (
                <Button variant="contained" component="label">
                  Enviar arquivo
                  <input
                    type="file"
                    accept="image/png, image/jpg, image/jpeg, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.ms-excel"
                    disabled={loading}
                    hidden
                    onChange={handleChangeMedias}
                  />
                </Button>
              )}
              {loading && (
                <>
                  <Stack justifyContent={"center"} alignSelf={"center"}>
                    <CircularProgress />
                  </Stack>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            {!loading && (
              <>
                <Button
                  onClick={() => {
                    handleClose();
                    setMedias([]);
                    setPreview();
                  }}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                {open !== "edit" && (
                  <Button
                    type="submit"
                    disabled={loading}
                    color="primary"
                    variant="contained"
                    className={classes.btnWrapper}
                    onClick={() => handleSaveContact()}
                  >
                    {`${labels.btn}`}
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderAddImgModal;
