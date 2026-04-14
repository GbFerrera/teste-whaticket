import React, { useState, useEffect, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { green, blue, red, orange } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Slide } from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { isNil } from "lodash";
import { i18n } from "../../translate/i18n";
import moment from "moment";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  InputAdornment,
  Avatar,
  Popover,
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import UserStatusIcon from "../UserModal/statusIcon";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import EmojiPicker from 'emoji-picker-react';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import { getBackendUrl } from "../../config";

// Icons for fields
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import LabelIcon from '@mui/icons-material/Label';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TicketIcon from '@mui/icons-material/ConfirmationNumber';
import QueueIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Transition component
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: "8px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
    background: "#ffffff",
    minWidth: "500px",
    maxWidth: "800px",
  },
  dialogTitle: {
    backgroundColor: "#3f51b5",
    color: "white",
    padding: "16px 24px",
    borderRadius: "8px 8px 0 0",
    fontSize: "1.5rem",
    fontWeight: 600,
    cursor: "move",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // Alterado para alinhar à esquerda
    gap: theme.spacing(1),
  },
  dialogContent: {
    padding: "24px",
    background: "#f9fafc",
  },
  dialogActions: {
    padding: "16px 24px",
    background: "#f5f7fa",
    borderRadius: "0 0 8px 8px",
    display: "flex",
    justifyContent: "space-between",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#667eea",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#667eea",
        borderWidth: "1px",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#667eea",
    },
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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
    },
  },
  cancelButton: {
    backgroundColor: red[500],
    color: "white",
    "&:hover": {
      backgroundColor: red[700],
    },
    borderRadius: "8px",
    padding: "8px 16px",
    textTransform: "none",
    fontWeight: 500,
    boxShadow: "none",
  },
  saveButton: {
    backgroundColor: blue[500],
    color: "white",
    "&:hover": {
      backgroundColor: blue[700],
    },
    borderRadius: "8px",
    padding: "8px 16px",
    textTransform: "none",
    fontWeight: 500,
    boxShadow: "none",
  },
  attachButton: {
    backgroundColor: green[500],
    color: "white",
    "&:hover": {
      backgroundColor: green[700],
    },
    borderRadius: "8px",
    padding: "8px 16px",
    textTransform: "none",
    fontWeight: 500,
    boxShadow: "none",
  },
  restartButton: {
    backgroundColor: orange[500],
    color: "white",
    "&:hover": {
      backgroundColor: orange[700],
    },
    borderRadius: "8px",
    padding: "8px 16px",
    textTransform: "none",
    fontWeight: 500,
    boxShadow: "none",
  },
  tabs: {
    backgroundColor: "#667eea",
    color: "white",
    borderRadius: "8px 8px 0 0",
    "& .MuiTabs-indicator": {
      backgroundColor: "white",
      height: "3px",
    },
  },
  tab: {
    color: "white",
    fontWeight: 500,
    minWidth: "auto",
    padding: "12px 16px",
    "&.Mui-selected": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  emojiPickerContainer: {
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    backgroundColor: "#fff",
  },
  fieldIcon: {
    color: "#667eea",
    marginRight: theme.spacing(1),
  },
  avatar: {
    backgroundColor: "#667eea",
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  statusBadge: {
    backgroundColor: green[500],
    width: 12,
    height: 12,
    borderRadius: "50%",
    position: "absolute",
    bottom: 0,
    right: 0,
    border: "2px solid white",
  },
  messageField: {
    position: "relative",
    "& .MuiInputBase-root": {
      alignItems: "flex-start",
    },
  },
  emojiButton: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 1,
  },
  phonePreviewContainer: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  phoneFrame: {
    width: 260,
    height: 480,
    borderRadius: 32,
    padding: 12,
    background: "linear-gradient(145deg, #111827, #1f2937)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneScreen: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#020617",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  phoneHeader: {
    padding: "8px 10px",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 500,
  },
  phoneHeaderTitle: {
    display: "flex",
    flexDirection: "column",
  },
  phoneHeaderSubtitle: {
    fontSize: 10,
    opacity: 0.85,
  },
  phoneMessagesArea: {
    flex: 1,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#0a141a",
    backgroundImage: "url('/papeldeparedewhatsapp.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflowY: "auto",
    scrollbarWidth: "thin",
  },
  phoneMessageBubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    borderRadius: 14,
    borderTopRightRadius: 2,
    padding: "7px 9px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#ecfdf5",
    fontSize: 12,
    lineHeight: 1.35,
    boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  phoneMediaFileRow: {
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: 11,
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  phonePlaceholder: {
    alignSelf: "flex-start",
    maxWidth: "90%",
    borderRadius: 12,
    padding: "6px 8px",
    fontSize: 11,
    color: "#9ca3af",
    backgroundColor: "rgba(15,23,42,0.75)",
    border: "1px dashed rgba(148,163,184,0.5)",
  },
}));

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const DraggablePaper = (props) => {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

const backendUrl = getBackendUrl();

const CampaignModal = ({
  open,
  onClose,
  campaignId,
  initialValues,
  onSave,
  resetPagination,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const initialState = {
    name: "",
    message: "",
    status: "INATIVA",
    scheduledAt: "",
    contactListId: "",
    tagListId: "Nenhuma",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [whatsappId, setWhatsappId] = useState(false);
  const [contactLists, setContactLists] = useState([]);
  const [tagLists, setTagLists] = useState([]);
    const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);

  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const emojiButtonRef = useRef(null);

  const detectMediaType = (ext = "") => {
    const normalizedExt = (ext || "").toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(normalizedExt)) {
      return "image";
    }

    if (["mp4", "webm", "ogg", "mov", "mkv"].includes(normalizedExt)) {
      return "video";
    }

    if (["mp3", "wav", "ogg", "aac", "m4a"].includes(normalizedExt)) {
      return "audio";
    }

    if (["pdf", "doc", "docx", "txt"].includes(normalizedExt)) {
      return "document";
    }

    return "file";
  };

  const getAttachmentPreview = () => {
    const buildPreview = (ext, url) => ({
      type: detectMediaType(ext),
      url: detectMediaType(ext) === "file" ? null : url,
    });

    if (attachment) {
      const name = attachment.name ? attachment.name.toLowerCase() : "";
      const ext = name.includes(".") ? name.split(".").pop() : "";
      try {
        const url = URL.createObjectURL(attachment);
        return buildPreview(ext, url);
      } catch (e) {
        return { type: "file", url: null };
      }
    }

    if (campaign.mediaPath) {
      const nameSource = (campaign.mediaName || campaign.mediaPath || "").toLowerCase();
      const ext = nameSource.includes(".") ? nameSource.split(".").pop() : "";
      const url = campaign.mediaPath.startsWith("http")
        ? campaign.mediaPath
        : `${backendUrl}/public/company${companyId}/${campaign.mediaPath}`;
      return buildPreview(ext, url);
    }

    return { type: "none", url: null };
  };

  const handleEmojiClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const emojiOpen = Boolean(emojiAnchorEl);
  const emojiId = emojiOpen ? 'emoji-popover' : undefined;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  
  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      api
        .get(`/whatsapp`, { params: { companyId, session: 0 } })
        .then(({ data }) => {
          const mappedWhatsapps = data.map((whatsapp) => ({
            ...whatsapp,
            selected: false,
          }));
          setWhatsapps(mappedWhatsapps);
        });

      api
        .get(`/tags/list`, { params: { companyId, kanban: 0 } })
        .then(({ data }) => {
          const formattedTagLists = data
            .filter((tag) => tag.contactsCount > 0)
            .map((tag) => ({
              id: tag.id,
              name: `${tag.name} (${tag.contactsCount})`,
            }));
          setTagLists(formattedTagLists);
        })
        .catch((error) => {
          console.error("Error retrieving tags:", error);
        });

      // Carregar listas de contatos
      api
        .get(`/contact-lists/`, { params: { companyId } })
        .then(({ data }) => {
          const formattedContactLists = data.records ? data.records : data;
          setContactLists(formattedContactLists);
        })
        .catch((error) => {
          console.error("Error retrieving contact lists:", error);
        });

      if (!campaignId) return;

      api.get(`/campaigns/${campaignId}`).then(({ data }) => {
        if (data?.whatsappId) setWhatsappId(data.whatsappId);
        setCampaign((prev) => {
          let prevCampaignData = Object.assign({}, prev);
          Object.entries(data).forEach(([key, value]) => {
            if (key === "scheduledAt" && value !== "" && value !== null) {
              prevCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
            } else {
              prevCampaignData[key] = value === null ? "" : value;
            }
          });
          return prevCampaignData;
        });
      });
    }
  }, [campaignId, open, initialValues, companyId]);

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "INATIVA" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);
    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {
        ...values,
        whatsappId: whatsappId,
      };

      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  
  const renderMessageField = (identifier, values, setFieldValue) => {
    const handleEmojiSelect = (emojiObject) => {
      const emoji = emojiObject.emoji;
      const currentValue = values[identifier] || "";
      setFieldValue(identifier, currentValue + emoji);
      handleEmojiClose();
    };

    return (
      <div className={classes.messageField}>
        <Field
          as={TextField}
          id={identifier}
          name={identifier}
          fullWidth
          rows={5}
          label={i18n.t(`campaigns.dialog.form.${identifier}`)}
          placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
          multiline={true}
          variant="outlined"
          helperText="Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalizadas."
          disabled={!campaignEditable && campaign.status !== "CANCELADA"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MessageIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          ref={emojiButtonRef}
          onClick={handleEmojiClick}
          className={classes.emojiButton}
        >
          <InsertEmoticonIcon color="action" />
        </IconButton>
        <Popover
          id={emojiId}
          open={emojiOpen}
          anchorEl={emojiAnchorEl}
          onClose={handleEmojiClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className={classes.emojiPickerContainer}>
            <EmojiPicker 
              onEmojiClick={handleEmojiSelect}
              width={350}
              height={400}
            />
          </div>
        </Popover>
      </div>
    );
  };

  
  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filterOptions = createFilterOptions({
    trim: true,
  });

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        TransitionComponent={Transition}
        classes={{ paper: classes.dialogPaper }}
        PaperComponent={DraggablePaper}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle
          id="draggable-dialog-title"
          className={classes.dialogTitle}
        >
          <CampaignIcon fontSize="large" />
          {campaignEditable ? (
            <>
              {campaignId
                ? `${i18n.t("campaigns.dialog.update")}`
                : `${i18n.t("campaigns.dialog.new")}`}
            </>
          ) : (
            <>{`${i18n.t("campaigns.dialog.readonly")}`}</>
          )}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <Grid container spacing={2}>
                  {/* Coluna esquerda: formulário */}
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Field
                          as={TextField}
                          label={i18n.t("campaigns.dialog.form.name")}
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.textField}
                          disabled={!campaignEditable}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CampaignIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                        >
                          <InputLabel id="contactList-selection-label">
                            {i18n.t("campaigns.dialog.form.contactList")}
                          </InputLabel>
                          <Field
                            as={Select}
                            label={i18n.t(
                              "campaigns.dialog.form.contactList"
                            )}
                            placeholder={i18n.t(
                              "campaigns.dialog.form.contactList"
                            )}
                            labelId="contactList-selection-label"
                            id="contactListId"
                            name="contactListId"
                            error={
                              touched.contactListId &&
                              Boolean(errors.contactListId)
                            }
                            disabled={!campaignEditable}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ContactsIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            <MenuItem value="">Nenhuma</MenuItem>
                            {contactLists &&
                              contactLists.map((contactList) => (
                                <MenuItem
                                  key={contactList.id}
                                  value={contactList.id}
                                >
                                  {contactList.name}
                                </MenuItem>
                              ))}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                        >
                          <InputLabel id="tagList-selection-label">
                            {i18n.t("campaigns.dialog.form.tagList")}
                          </InputLabel>
                          <Field
                            as={Select}
                            label={i18n.t("campaigns.dialog.form.tagList")}
                            placeholder={i18n.t(
                              "campaigns.dialog.form.tagList"
                            )}
                            labelId="tagList-selection-label"
                            id="tagListId"
                            name="tagListId"
                            error={
                              touched.tagListId && Boolean(errors.tagListId)
                            }
                            disabled={!campaignEditable}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LabelIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            {Array.isArray(tagLists) &&
                              tagLists.map((tagList) => (
                                <MenuItem key={tagList.id} value={tagList.id}>
                                  {tagList.name}
                                </MenuItem>
                              ))}
                          </Field>
                        </FormControl>
                      </Grid>
                                            <Grid item xs={12} md={4}>
                        <FormControl
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                        >
                          <InputLabel id="whatsapp-selection-label">
                            {i18n.t("campaigns.dialog.form.whatsapp")}
                          </InputLabel>
                          <Field
                            as={Select}
                            label={i18n.t("campaigns.dialog.form.whatsapp")}
                            placeholder={i18n.t(
                              "campaigns.dialog.form.whatsapp"
                            )}
                            labelId="whatsapp-selection-label"
                            id="whatsappIds"
                            name="whatsappIds"
                            required
                            error={
                              touched.whatsappId && Boolean(errors.whatsappId)
                            }
                            disabled={!campaignEditable}
                            value={whatsappId}
                            onChange={(event) => {
                              setWhatsappId(event.target.value);
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <WhatsAppIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            {whatsapps &&
                              whatsapps.map((whatsapp) => (
                                <MenuItem key={whatsapp.id} value={whatsapp.id}>
                                  {whatsapp.name}
                                </MenuItem>
                              ))}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Field
                          as={TextField}
                          label={i18n.t("campaigns.dialog.form.scheduledAt")}
                          name="scheduledAt"
                          error={
                            touched.scheduledAt && Boolean(errors.scheduledAt)
                          }
                          helperText={
                            touched.scheduledAt && errors.scheduledAt
                          }
                          variant="outlined"
                          margin="dense"
                          type="datetime-local"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                          className={classes.textField}
                          disabled={!campaignEditable}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ScheduleIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Tabs
                          value={messageTab}
                          indicatorColor="primary"
                          onChange={(e, v) => setMessageTab(v)}
                          variant="fullWidth"
                          centered
                          className={classes.tabs}
                        >
                          <Tab label="Msg. 1" index={0} className={classes.tab} />
                          <Tab label="Msg. 2" index={1} className={classes.tab} />
                          <Tab label="Msg. 3" index={2} className={classes.tab} />
                          <Tab label="Msg. 4" index={3} className={classes.tab} />
                          <Tab label="Msg. 5" index={4} className={classes.tab} />
                        </Tabs>
                        <Box style={{ paddingTop: 20 }}>
                          {messageTab === 0 && renderMessageField("message1", values, setFieldValue)}
                          {messageTab === 1 && renderMessageField("message2", values, setFieldValue)}
                          {messageTab === 2 && renderMessageField("message3", values, setFieldValue)}
                          {messageTab === 3 && renderMessageField("message4", values, setFieldValue)}
                          {messageTab === 4 && renderMessageField("message5", values, setFieldValue)}
                        </Box>
                      </Grid>
                      {(campaign.mediaPath || attachment) && (
                        <Grid item xs={12}>
                          <Box display="flex" alignItems="center">
                            <AttachFileIcon
                              color="action"
                              style={{ marginRight: 8 }}
                            />
                            <span>
                              {attachment != null
                                ? attachment.name
                                : campaign.mediaName}
                            </span>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                  {/* Coluna direita: preview no celular */}
                  <Grid item xs={12} md={4}>
                    <div className={classes.phonePreviewContainer}>
                      <div className={classes.phoneFrame}>
                        <div className={classes.phoneScreen}>
                          <div className={classes.phoneHeader}>
                            <WhatsAppIcon fontSize="small" />
                            <div className={classes.phoneHeaderTitle}>
                              <span>
                                {campaign.name || "Campanha em massa"}
                              </span>
                              <span className={classes.phoneHeaderSubtitle}>
                                Pré-visualização da mensagem
                              </span>
                            </div>
                          </div>
                          <div className={classes.phoneMessagesArea}>
                            {/* Mídia primeiro */}
                            {(() => {
                              const preview = getAttachmentPreview();

                              if (preview.type === "image" && preview.url) {
                                return (
                                  <div className={classes.phoneMediaFileRow}>
                                    <img
                                      src={preview.url}
                                      alt={attachment?.name || campaign.mediaName || "mídia"}
                                      style={{ maxWidth: "100%", borderRadius: 12 }}
                                    />
                                  </div>
                                );
                              }

                              if (preview.type === "video" && preview.url) {
                                return (
                                  <div className={classes.phoneMediaFileRow}>
                                    <video
                                      src={preview.url}
                                      controls
                                      style={{ width: "100%", borderRadius: 12 }}
                                    />
                                  </div>
                                );
                              }

                              if (preview.type === "audio" && preview.url) {
                                return (
                                  <div className={classes.phoneMediaFileRow}>
                                    <audio
                                      src={preview.url}
                                      controls
                                      style={{ width: "100%" }}
                                    />
                                  </div>
                                );
                              }

                              if (preview.type === "document") {
                                const name = attachment?.name || campaign.mediaName;
                                const ext = name && name.includes(".")
                                  ? name.split(".").pop().toUpperCase()
                                  : "DOC";

                                return (
                                  <div className={classes.phoneMediaFileRow}>
                                    <AttachFileIcon fontSize="small" />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                      <span style={{ fontSize: 10, opacity: 0.8 }}>{ext} • arquivo</span>
                                      <span>{name}</span>
                                    </div>
                                  </div>
                                );
                              }

                              if (campaign.mediaPath || campaign.mediaName || attachment) {
                                return (
                                  <div className={classes.phoneMediaFileRow}>
                                    <AttachFileIcon fontSize="small" />
                                    <span>
                                      {attachment != null
                                        ? attachment.name
                                        : campaign.mediaName}
                                    </span>
                                  </div>
                                );
                              }

                              return null;
                            })()}

                            {/* Texto sempre abaixo da mídia */}
                            {values[`message${messageTab + 1}`] ? (
                              <div className={classes.phoneMessageBubble}>
                                {values[`message${messageTab + 1}`]}
                              </div>
                            ) : (
                              <div className={classes.phonePlaceholder}>
                                Comece a digitar a mensagem para ver aqui como ela
                                ficará no celular.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions className={classes.dialogActions}>
                <Box>
                  {campaign.status === "CANCELADA" && (
                    <Button
                      style={{
                        color: "white",
                        backgroundColor: "#1E90FF",
                        boxShadow: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                        marginRight: 8,
                      }}
                      startIcon={<RestartAltIcon />}
                      onClick={() => restartCampaign()}
                      variant="contained"
                    >
                      {i18n.t("campaigns.dialog.buttons.restart")}
                    </Button>
                  )}
                  {campaign.status === "EM_ANDAMENTO" && (
                    <Button
                      style={{
                        color: "white",
                        backgroundColor: "#db6565",
                        boxShadow: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                        marginRight: 8,
                      }}
                      startIcon={<CancelIcon />}
                      onClick={() => cancelCampaign()}
                      variant="contained"
                    >
                      {i18n.t("campaigns.dialog.buttons.cancel")}
                    </Button>
                  )}
                  {!attachment && !campaign.mediaPath && campaignEditable && (
                    <Button
                      style={{
                        color: "white",
                        backgroundColor: "#4ec24e",
                        boxShadow: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                      startIcon={<AttachFileIcon />}
                      onClick={() => attachmentFile.current.click()}
                      disabled={isSubmitting}
                      variant="contained"
                    >
                      {i18n.t("campaigns.dialog.buttons.attach")}
                    </Button>
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    style={{
                      color: "white",
                      backgroundColor: "#db6565",
                      boxShadow: "none",
                      borderRadius: "5px",
                      fontSize: "12px",
                      marginRight: 16,
                    }}
                    startIcon={<CancelIcon />}
                    onClick={handleClose}
                    disabled={isSubmitting}
                    variant="contained"
                  >
                    {i18n.t("campaigns.dialog.buttons.close")}
                  </Button>
                  {(campaignEditable || campaign.status === "CANCELADA") && (
                    <Button
                      style={{
                        color: "white",
                        backgroundColor: "#437db5",
                        boxShadow: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                      startIcon={<SaveIcon />}
                      type="submit"
                      disabled={isSubmitting}
                      variant="contained"
                    >
                      {campaignId
                        ? `${i18n.t("campaigns.dialog.buttons.edit")}`
                        : `${i18n.t("campaigns.dialog.buttons.add")}`}
                      {isSubmitting && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  )}
                </Box>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CampaignModal;