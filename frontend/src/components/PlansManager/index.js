import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  TextField,
  Card,
  Typography,
  CardContent,
  CardActions,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
const useStyles = makeStyles(theme => ({
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    width: "100%",
  },
  modalContent: {
    padding: theme.spacing(2),
    backgroundColor: "#f9fafb",
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  smallButton: {
    borderRadius: 10,
    minWidth: 110,
    padding: theme.spacing(1, 2.5),
    fontSize: "0.85rem",
  },
  sectionPaper: {
    borderRadius: 16,
    padding: theme.spacing(3),
    background:
      "linear-gradient(135deg, rgba(243,246,255,0.9), rgba(255,255,255,0.95))",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  helperText: {
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  fullWidth: {
    width: "100%",
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
  },
  planCard: {
    position: "relative",
    borderRadius: 18,
    backgroundColor: "#fff",
    boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
    overflow: "hidden",
  },
  planCardHeader: {
    width: "100%",
    height: 6,
    background:
      "linear-gradient(90deg, rgba(63,131,248,1) 0%, rgba(14,116,144,1) 100%)",
  },
  planCardContent: {
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
  amountTag: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  statText: {
    color: "#475467",
    fontSize: "0.95rem",
  },
  chip: {
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
}));

const RECURRENCE_OPTIONS = [
  { value: "MENSAL", label: "Mensal" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
];

const defaultPlanValues = {
    name: '',
    users: 0,
    connections: 0,
    queues: 0,
    amount: 0,
    useWhatsapp: true,
    useFacebook: true,
    useInstagram: true,
    useCampaigns: true,
    useSchedules: true,
    useInternalChat: true,
    useExternalApi: true,
    useKanban: true,
    useOpenAi: true,
    useIntegrations: true,
    recurrence: "MENSAL",
    isPublic: true
};

export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles()

    const [record, setRecord] = useState(defaultPlanValues);

    useEffect(() => {
        setRecord(prev => ({
            ...prev,
            ...defaultPlanValues,
            ...(initialValue || {})
        }));
    }, [initialValue]);

    const handleSubmit = async (data) => {
        onSubmit(data)
    }

    return (
        <Formik
            enableReinitialize
            className={classes.fullWidth}
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => {
                    handleSubmit(values)
                    resetForm()
                }, 500)
            }
        >
            {() => (
                <Form className={classes.fullWidth}>
                    <Box className={classes.formSection}>
                      <Box display="flex" alignItems="baseline" justifyContent="space-between">
                        <div>
                          <Typography variant="h6">Informações principais</Typography>
                          <Typography className={classes.helperText}>
                            Defina limites, valores e recorrência do plano.
                          </Typography>
                        </div>
                      </Box>
                      <div className={classes.fieldGrid}>
  {/* Nome */}
  <Box>
    <Field
      as={TextField}
      label={i18n.t("Nome do Plano")}
      name="name"
      variant="outlined"
      size="small"
      fullWidth
      InputLabelProps={{ style: { fontWeight: "bold" } }}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    />
  </Box>

  {/* Público */}
  <Box>
    <FormControl
      variant="outlined"
      size="small"
      fullWidth
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    >
      <InputLabel
        htmlFor="status-selection"
        style={{ fontWeight: "bold" }}
      >
        {i18n.t("plans.form.public")}
      </InputLabel>
      <Field as={Select} id="status-selection" name="isPublic" margin="dense">
        <MenuItem value={true}>Sim</MenuItem>
        <MenuItem value={false}>Não</MenuItem>
      </Field>
    </FormControl>
  </Box>

  {/* Usuários */}
  <Box>
    <Field
      as={TextField}
      label={i18n.t("plans.form.users")}
      name="users"
      variant="outlined"
      size="small"
      type="number"
      fullWidth
      InputLabelProps={{ style: { fontWeight: "bold" } }}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    />
  </Box>

  {/* Conexões */}
  <Box>
    <Field
      as={TextField}
      label={i18n.t("plans.form.connections")}
      name="connections"
      variant="outlined"
      size="small"
      type="number"
      fullWidth
      InputLabelProps={{ style: { fontWeight: "bold" } }}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    />
  </Box>

  {/* Filas */}
  <Box>
    <Field
      as={TextField}
      label="Filas"
      name="queues"
      variant="outlined"
      size="small"
      type="number"
      fullWidth
      InputLabelProps={{ style: { fontWeight: "bold" } }}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    />
  </Box>

  {/* Valor */}
  <Box>
    <Field
      as={TextField}
      label="Valor"
      name="amount"
      variant="outlined"
      size="small"
      type="text"
      fullWidth
      InputLabelProps={{ style: { fontWeight: "bold" } }}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        fontWeight: "bold",
      }}
    />
  </Box>

  {/* Recorrência */}
  <Box>
    <FormControl
      variant="outlined"
      size="small"
      fullWidth
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    >
      <InputLabel htmlFor="recurrence-selection" style={{ fontWeight: "bold" }}>
        Recorrência
      </InputLabel>
      <Field as={Select} id="recurrence-selection" name="recurrence" label="Recorrência">
        {RECURRENCE_OPTIONS.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field>
    </FormControl>
  </Box>

  {/* Facebook */}
  <Box>
    <FormControl
      variant="outlined"
      size="small"
      fullWidth
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    >
      <InputLabel
        htmlFor="facebook-selection"
        style={{ fontWeight: "bold" }}
      >
        Facebook
      </InputLabel>
      <Field as={Select} id="facebook-selection" name="useFacebook" margin="dense">
        <MenuItem value={true}>Sim</MenuItem>
        <MenuItem value={false}>Não</MenuItem>
      </Field>
    </FormControl>
  </Box>

  {/* Instagram */}
  <Box>
    <FormControl
      variant="outlined"
      size="small"
      fullWidth
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    >
      <InputLabel
        htmlFor="instagram-selection"
        style={{ fontWeight: "bold" }}
      >
        Instagram
      </InputLabel>
      <Field as={Select} id="instagram-selection" name="useInstagram" margin="dense">
        <MenuItem value={true}>Sim</MenuItem>
        <MenuItem value={false}>Não</MenuItem>
      </Field>
    </FormControl>
  </Box>
</div>

<Divider />

<Box className={classes.actionBar}>
  <ButtonWithSpinner
    startIcon={<CancelIcon />}
    className={classes.smallButton}
    loading={loading}
    onClick={() => onCancel()}
    variant="contained"
    style={{
      color: "#4c1d95",
      backgroundColor: "#ede9fe",
      boxShadow: "none",
    }}
  >
    {i18n.t("plans.form.clear")}
  </ButtonWithSpinner>

  {record.id !== undefined && (
    <ButtonWithSpinner
      startIcon={<DeleteIcon />}
      className={classes.smallButton}
      loading={loading}
      onClick={() => onDelete(record)}
      variant="contained"
      style={{
        color: "#b91c1c",
        backgroundColor: "#fee2e2",
        boxShadow: "none",
      }}
    >
      {i18n.t("plans.form.delete")}
    </ButtonWithSpinner>
  )}

  <ButtonWithSpinner
    startIcon={<SaveIcon />}
    className={classes.smallButton}
    loading={loading}
    type="submit"
    variant="contained"
    style={{
      color: "#0f172a",
      backgroundColor: "#bae6fd",
      boxShadow: "none",
    }}
  >
    {i18n.t("plans.form.save")}
  </ButtonWithSpinner>
</Box>
</Box>
                </Form>
            )}
        </Formik>
    )
}

export function PlansManagerGrid(props) {
    const { records, onSelect } = props
    const classes = useStyles()

    const renderWhatsapp = (row) => {
        return row.useWhatsapp === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderFacebook = (row) => {
        return row.useFacebook === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderInstagram = (row) => {
        return row.useInstagram === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderCampaigns = (row) => {
        return row.useCampaigns === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderSchedules = (row) => {
        return row.useSchedules === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderInternalChat = (row) => {
        return row.useInternalChat === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderExternalApi = (row) => {
        return row.useExternalApi === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderKanban = (row) => {
        return row.useKanban === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderOpenAi = (row) => {
        return row.useOpenAi === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderIntegrations = (row) => {
        return row.useIntegrations === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    return (
<Grid container spacing={3}>
    {records.map((row) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={row.id}>
            <Card
                style={{
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "10px",
                    padding: "20px",
                    margin: "10px",
                    transition: "transform 0.2s ease-in-out",
                    cursor: "pointer",
                       }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                <CardContent style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Typography
                        variant="subtitle2"
                        style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}
                    >
                        {row.recurrence || "—"}
                    </Typography>
                    <Typography
                        variant="h5"
                        style={{ fontWeight: "bold", color: "#0f172a" }}
                    >
                        {row.name || "-"}
                    </Typography>
                    <Typography
                        variant="h4"
                        style={{ fontWeight: "bold", color: "#0ea5e9" }}
                    >
                        {row.amount ? row.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : "00,00"}
                    </Typography>
                    <Divider />
                    <Typography variant="body2" color="textSecondary">
                        {i18n.t("plans.form.users")}: <strong>{row.users || "-"}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {i18n.t("plans.form.public")}: <strong>{row.isPublic ? "Sim" : "Não"}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {i18n.t("plans.form.connections")}: <strong>{row.connections || "-"}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Filas: <strong>{row.queues || "-"}</strong>
                    </Typography>
                </CardContent>
                <CardActions style={{ padding: "8px 16px", justifyContent: "flex-end" }}>
                    <IconButton
                        onClick={() => onSelect(row)}
                        aria-label="edit"
                        style={{
                        backgroundColor: "#3DB8FF",
                        borderRadius: "10px",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "0.3s",
                       }}
                    >
                        <EditIcon style={{ color: "#fff" }}/>
                    </IconButton>
                </CardActions>
            </Card>
        </Grid>
    ))}
</Grid>
   )
}

export default function PlansManager() {
    const classes = useStyles()
    const { list, save, update, remove } = usePlans()

    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        amount: 0,
        useWhatsapp: true,
        useFacebook: true,
        useInstagram: true,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
        recurrence: "MENSAL",
        isPublic: true
    })

    useEffect(() => {
        async function fetchData() {
            await loadPlans()
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record])

    const loadPlans = async () => {
        setLoading(true)
        try {
            const planList = await list()
            setRecords(planList)
        } catch (e) {
            toast.error('Não foi possível carregar a lista de registros')
        }
        setLoading(false)
    }

    const handleSubmit = async (data) => {
        setLoading(true)
        console.log(data)
        try {
            if (data.id !== undefined) {
                await update(data)
            } else {
                await save(data)
            }
            await loadPlans()
            handleCancel()
            setIsModalOpen(false)
            toast.success('Operação realizada com sucesso!')
        } catch (e) {
            toast.error('Não foi possível realizar a operação. Verifique se já existe uma plano com o mesmo nome ou se os campos foram preenchidos corretamente')
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await remove(record.id)
            await loadPlans()
            handleCancel()
            toast.success('Operação realizada com sucesso!')
        } catch (e) {
            toast.error('Não foi possível realizar a operação')
        }
        setLoading(false)
    }

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true)
    }

    const handleCancel = () => {
        setRecord({
            id: undefined,
            name: '',
            users: 0,
            connections: 0,
            queues: 0,
            amount: 0,
            useWhatsapp: true,
            useFacebook: true,
            useInstagram: true,
            useCampaigns: true,
            useSchedules: true,
            useInternalChat: true,
            useExternalApi: true,
            useKanban: true,
            useOpenAi: true,
            useIntegrations: true,
            recurrence: "MENSAL",
            isPublic: true
        })
    }

    const handleSelect = (data) => {

        let useWhatsapp = data.useWhatsapp === false ? false : true
        let useFacebook = data.useFacebook === false ? false : true
        let useInstagram = data.useInstagram === false ? false : true
        let useCampaigns = data.useCampaigns === false ? false : true
        let useSchedules = data.useSchedules === false ? false : true
        let useInternalChat = data.useInternalChat === false ? false : true
        let useExternalApi = data.useExternalApi === false ? false : true
        let useKanban = data.useKanban === false ? false : true
        let useOpenAi = data.useOpenAi === false ? false : true
        let useIntegrations = data.useIntegrations === false ? false : true

        setRecord({
            id: data.id,
            name: data.name || '',
            users: data.users || 0,
            connections: data.connections || 0,
            queues: data.queues || 0,
            amount: data.amount?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || 0,
            useWhatsapp,
            useFacebook,
            useInstagram,
            useCampaigns,
            useSchedules,
            useInternalChat,
            useExternalApi,
            useKanban,
            useOpenAi,
            useIntegrations,
            recurrence: data.recurrence || "MENSAL",
            isPublic: data.isPublic
        })
        setIsModalOpen(true)
    }

    const handleCreateNew = () => {
        handleCancel()
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        handleCancel()
    }

    return (
        <div className={classes.pageWrapper}>
            <Paper className={classes.sectionPaper} elevation={0}>
              <div className={classes.sectionHeader}>
                <div>
                  <Typography variant="h5">Planos</Typography>
                  <Typography className={classes.helperText}>
                    Gerencie os planos disponíveis no sistema.
                  </Typography>
                </div>
                <Button color="primary" variant="contained" onClick={handleCreateNew}>
                  Novo plano
                </Button>
              </div>
              <PlansManagerGrid
                records={records}
                onSelect={handleSelect}
              />
            </Paper>

            <Dialog
              open={isModalOpen}
              onClose={handleCloseModal}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                {record.id ? "Editar plano" : "Novo plano"}
              </DialogTitle>
              <DialogContent dividers>
                <PlanManagerForm
                  initialValue={record}
                  onDelete={handleOpenDeleteDialog}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={loading}
                />
              </DialogContent>
            </Dialog>

            <ConfirmationModal
                title="Exclusão de Registro"
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={() => handleDelete()}
            >
                Deseja realmente excluir esse registro?
            </ConfirmationModal>
        </div>
    )
}