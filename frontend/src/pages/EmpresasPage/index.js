import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import BusinessIcon from "@material-ui/icons/Business";
import PersonIcon from "@material-ui/icons/Person";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import PhoneIcon from "@material-ui/icons/Phone";
import DescriptionIcon from "@material-ui/icons/Description";

import Paper from "@material-ui/core/Paper";
import Slide from "@material-ui/core/Slide";
import Draggable from "react-draggable";

import api, { openApi } from "../../services/api";
import { i18n } from "../../translate/i18n";
import usePlans from "../../hooks/usePlans";
import { CompanyForm } from "../../components/CompaniesManager";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import useCompanies from "../../hooks/useCompanies";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import moment from "moment";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DraggablePaper(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const formatDocument = (value) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const isValidCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
};

const isValidCNPJ = (cnpj) => {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let rest = sum % 11;
  if (parseInt(digits[12]) !== (rest < 2 ? 0 : 11 - rest)) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  rest = sum % 11;
  return parseInt(digits[13]) === (rest < 2 ? 0 : 11 - rest);
};

const SignUpSchema = Yup.object().shape({
  companyName: Yup.string().min(2, "Muito curto!").max(50, "Muito extenso!").required("Nome da empresa é obrigatório"),
  name: Yup.string().min(2, "Muito curto!").max(50, "Muito extenso!").required("Nome do responsável é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  password: Yup.string().min(5, "Muito curto!").max(50, "Muito extenso!").required("Senha é obrigatória"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "As senhas não são iguais.").required("Confirme a senha"),
  phone: Yup.string().required("Telefone é obrigatório"),
  document: Yup.string()
    .required("CPF/CNPJ é obrigatório")
    .test("valid-document", "CPF ou CNPJ inválido", (value) => {
      if (!value) return false;
      const digits = value.replace(/\D/g, "");
      if (digits.length === 11) return isValidCPF(digits);
      if (digits.length === 14) return isValidCNPJ(digits);
      return false;
    }),
  planId: Yup.string().required("Selecione um plano"),
});

const reducer = (state, action) => {
  if (action.type === "LOAD_COMPANIES") {
    const companies = action.payload;
    const newCompanies = [];
    companies.forEach((company) => {
      const companyIndex = state.findIndex((u) => u.id === company.id);
      if (companyIndex !== -1) {
        state[companyIndex] = company;
      } else {
        newCompanies.push(company);
      }
    });
    return [...state, ...newCompanies];
  }
  if (action.type === "UPDATE_COMPANIES") {
    const company = action.payload;
    const companyIndex = state.findIndex((u) => u.id === company.id);
    if (companyIndex !== -1) {
      state[companyIndex] = company;
      return [...state];
    } else {
      return [company, ...state];
    }
  }
  if (action.type === "DELETE_COMPANIES") {
    const companyId = action.payload;
    const companyIndex = state.findIndex((u) => u.id === companyId);
    if (companyIndex !== -1) {
      state.splice(companyIndex, 1);
    }
    return [...state];
  }
  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 220,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  filterSelect: {
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": { borderRadius: 8 },
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  content: {
    padding: "0 24px 16px",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  tableHead: {
    backgroundColor: "var(--sidebar-color, #1e293b)",
    "& th": {
      color: "#cbd5e1",
      fontWeight: 600,
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "none",
      padding: "14px 16px",
    },
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
    },
    "& tr:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  actionBtn: {
    minWidth: "auto",
    padding: "4px 8px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "none",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    borderRadius: "0 0 12px 12px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
  },
}));

const EmpresasPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { dateToClient, datetimeToClient } = useDate();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companies, dispatch] = useReducer(reducer, []);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState([]);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const { save, update, remove } = useCompanies();
  const { getPlanList } = usePlans();

  useEffect(() => {
    if (!user.super) {
      toast.error("Sem permissão para acessar esta página.");
      setTimeout(() => history.push("/"), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchCompanies = async () => {
        try {
          const { data } = await api.get("/companiesPlan/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_COMPANIES", payload: data.companies });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchCompanies();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchTrigger]);

  useEffect(() => {
    const fetchPlans = async () => {
      const planList = await getPlanList();
      setPlans(planList || []);
    };
    fetchPlans();
  }, []);

  const handleOpenSignupModal = () => {
    setSignupModalOpen(true);
  };

  const handleCloseSignupModal = () => {
    setSignupModalOpen(false);
    setSignupLoading(false);
    setShowPassword(false);
  };

  const handleSignUp = async (values) => {
    setSignupLoading(true);
    const dueDate = moment().add(7, "day").format();
    const cleanDoc = values.document ? values.document.replace(/\D/g, "") : "";
    const payload = {
      ...values,
      document: cleanDoc,
      type: cleanDoc.length <= 11 ? "pf" : "pj",
      recurrence: "MENSAL",
      dueDate,
      status: "t",
      campaignsEnabled: true,
    };
    try {
      await openApi.post("/auth/signup", payload);
      toast.success("Empresa cadastrada com sucesso!");
      handleCloseSignupModal();
      dispatch({ type: "RESET" });
      setPageNumber(1);
      setFetchTrigger((prev) => prev + 1);
    } catch (err) {
      toastError(err);
    }
    setSignupLoading(false);
  };

  const handleCloseCompanyModal = () => {
    setSelectedCompany(null);
    setEditRecord({});
    setCompanyModalOpen(false);
  };

  const handleEditCompany = (company) => {
    setEditRecord({
      id: company.id,
      name: company.name || "",
      phone: company.phone || "",
      email: company.email || "",
      planId: company.planId || company.plan?.id || "",
      status: company.status === false ? false : true,
      dueDate: company.dueDate || "",
      recurrence: company.recurrence || "",
      password: "",
      document: company.document || "",
      paymentMethod: company.paymentMethod || "",
    });
    setSelectedCompany(company);
    setCompanyModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      toast.success("Operação realizada com sucesso!");
      handleCloseCompanyModal();
      dispatch({ type: "RESET" });
      setPageNumber(1);
    } catch (e) {
      toast.error("Não foi possível realizar a operação.");
    }
    setModalLoading(false);
  };

  const handleModalDelete = (record) => {
    setDeletingCompany(record);
    setConfirmModalOpen(true);
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await api.delete(`/companies/${companyId}`);
      toast.success("Empresa excluída com sucesso!");
    } catch (err) {
      try {
        await api.delete(`/company/${companyId}`);
        toast.success("Empresa excluída com sucesso!");
      } catch (err2) {
        toast.warning("Removida da interface (erro no banco)");
      }
    }
    dispatch({ type: "DELETE_COMPANIES", payload: companyId });
    setDeletingCompany(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleToggleStatus = async (company) => {
    const payload = {
      name: company.name,
      email: company.email,
      status: !company.status,
      planId: company.plan?.id,
      phone: company.phone,
      dueDate: company.dueDate,
      recurrence: company.recurrence,
      document: company.document,
      paymentMethod: company.paymentMethod,
    };
    try {
      const { data } = await api.put(`/companies/${company.id}`, payload);
      toast.success(`Empresa ${payload.status ? "ativada" : "desativada"}!`);
      dispatch({ type: "UPDATE_COMPANIES", payload: data });
    } catch (err) {
      toastError(err);
    }
  };

  const getVencimentoStatus = (company) => {
    if (!moment(company.dueDate).isValid()) return { text: "-", color: "default", days: 0 };
    const diff = moment(company.dueDate).diff(moment(), "days");
    if (!company.status) return { text: "Inativa", color: "inactive", days: diff };
    if (diff < 0) return { text: "Vencido", color: "overdue", days: Math.abs(diff) };
    if (diff <= 5) return { text: "Próximo", color: "warning", days: diff };
    return { text: "Ativa", color: "active", days: diff };
  };

  const getStatusChip = (status) => {
    switch (status.color) {
      case "active":
        return <Chip label={status.text} size="small" className={classes.statusChip} style={{ backgroundColor: "#dcfce7", color: "#166534" }} />;
      case "overdue":
        return <Chip label={`${status.text} (${status.days}d)`} size="small" className={classes.statusChip} style={{ backgroundColor: "#fef2f2", color: "#dc2626" }} />;
      case "warning":
        return <Chip label={`${status.text} (${status.days}d)`} size="small" className={classes.statusChip} style={{ backgroundColor: "#fff7ed", color: "#c2410c" }} />;
      case "inactive":
        return <Chip label={status.text} size="small" className={classes.statusChip} style={{ backgroundColor: "#f1f5f9", color: "#64748b" }} />;
      default:
        return <Chip label="-" size="small" className={classes.statusChip} />;
    }
  };

  const getFilteredCompanies = () => {
    let list = companies.filter((c) => c.id !== 1);

    if (searchParam) {
      const term = searchParam.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term) ||
          String(c.id).includes(term) ||
          (c.phone || "").includes(term)
      );
    }

    if (statusFilter === "active") return list.filter((c) => c.status === true);
    if (statusFilter === "inactive") return list.filter((c) => c.status === false);
    if (statusFilter === "overdue") {
      return list.filter((c) => {
        const diff = moment(c.dueDate).diff(moment(), "days");
        return c.status && diff < 0;
      });
    }
    return list;
  };

  const filteredCompanies = getFilteredCompanies();
  const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    tablePage * rowsPerPage,
    (tablePage + 1) * rowsPerPage
  );

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <ConfirmationModal
        title={
          deletingCompany &&
          `${i18n.t("compaies.confirmationModal.deleteTitle")} ${deletingCompany.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCompany(deletingCompany.id)}
      >
        {i18n.t("compaies.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={companyModalOpen}
        onClose={handleCloseCompanyModal}
        maxWidth="md"
        fullWidth
        PaperComponent={DraggablePaper}
        TransitionComponent={Transition}
      >
        <DialogTitle id="draggable-dialog-title" style={{ backgroundColor: "#3f51b5", color: "#fff", cursor: "move" }}>
          {editRecord.id ? "Editar Empresa" : "Nova Empresa"}
        </DialogTitle>
        <DialogContent style={{ padding: 24 }}>
          <CompanyForm
            initialValue={editRecord}
            onSubmit={handleModalSubmit}
            onDelete={handleModalDelete}
            onCancel={handleCloseCompanyModal}
            loading={modalLoading}
          />
        </DialogContent>
        <DialogActions style={{ padding: "8px 24px" }}>
          <Button
            onClick={handleCloseCompanyModal}
            style={{ backgroundColor: "#e3a3a3", color: "white", borderRadius: 5 }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Cadastro de Nova Empresa */}
      <Dialog
        open={signupModalOpen}
        onClose={handleCloseSignupModal}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle style={{ backgroundColor: "#3f51b5", color: "#fff" }}>
          Cadastrar Nova Empresa
        </DialogTitle>
        <DialogContent style={{ padding: 24 }}>
          <Formik
            initialValues={{
              companyName: "",
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
              phone: "",
              document: "",
              planId: "",
            }}
            validationSchema={SignUpSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSignUp(values);
              setSubmitting(false);
            }}
          >
            {({ touched, errors, isSubmitting, setFieldValue, values }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="companyName"
                      label="Nome da Empresa"
                      error={touched.companyName && Boolean(errors.companyName)}
                      helperText={touched.companyName && errors.companyName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="name"
                      label="Nome do Responsável"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="email"
                      label="Email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="password"
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="confirmPassword"
                      label="Confirmar Senha"
                      type={showPassword ? "text" : "password"}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="phone"
                      label="Telefone"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      size="small"
                      name="document"
                      label="CPF / CNPJ"
                      value={values.document || ""}
                      onChange={(e) => {
                        const formatted = formatDocument(e.target.value);
                        setFieldValue("document", formatted);
                      }}
                      inputProps={{ maxLength: 18 }}
                      error={touched.document && Boolean(errors.document)}
                      helperText={touched.document && errors.document}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon style={{ color: "#3f51b5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth size="small">
                      <InputLabel>Plano</InputLabel>
                      <Field
                        as={Select}
                        name="planId"
                        label="Plano"
                        error={touched.planId && Boolean(errors.planId)}
                      >
                        {plans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name} — {plan.users} usuários, {plan.connections} conexões — R$ {plan.amount}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                    <Button
                      onClick={handleCloseSignupModal}
                      style={{ backgroundColor: "#e3a3a3", color: "white", borderRadius: 5 }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || signupLoading}
                      style={{ borderRadius: 5 }}
                    >
                      {signupLoading ? <CircularProgress size={20} style={{ color: "#fff" }} /> : "Cadastrar"}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Empresas</Typography>
            <Typography className={classes.headerSubtitle}>
              {filteredCompanies.length} empresa(s) cadastrada(s)
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <FormControl variant="outlined" size="small" className={classes.filterSelect}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTablePage(0);
              }}
              label="Status"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="active">Ativas</MenuItem>
              <MenuItem value="inactive">Inativas</MenuItem>
              <MenuItem value="overdue">Vencidas</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="Buscar empresa..."
            variant="outlined"
            size="small"
            value={searchParam}
            onChange={(e) => {
              setSearchParam(e.target.value.toLowerCase());
              setTablePage(0);
            }}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenSignupModal}
            className={classes.addButton}
          >
            Nova Empresa
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell align="center">Vencimento</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {paginatedCompanies.map((company) => {
                const status = getVencimentoStatus(company);
                return (
                  <TableRow key={company.id} style={{ cursor: "pointer" }} onClick={() => handleEditCompany(company)}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell style={{ fontWeight: 500, color: "#3b82f6" }}>
                      {company.name}
                    </TableCell>
                    <TableCell>{company.email || "-"}</TableCell>
                    <TableCell>{company.plan?.name || "-"}</TableCell>
                    <TableCell align="center">
                      {moment(company.dueDate).isValid()
                        ? moment(company.dueDate).format("DD/MM/YYYY")
                        : "-"}
                    </TableCell>
                    <TableCell align="center">{getStatusChip(status)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(company); }}
                          style={{
                            color: company.status ? "#f59e0b" : "#10b981",
                          }}
                          title={company.status ? "Desativar" : "Ativar"}
                        >
                          <PowerSettingsNewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleEditCompany(company); }}
                          style={{ color: "#3b82f6" }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModalOpen(true);
                            setDeletingCompany(company);
                          }}
                          style={{ color: "#ef4444" }}
                          title="Excluir"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && <TableRowSkeleton columns={7} />}
            </TableBody>
          </Table>

          {filteredCompanies.length === 0 && !loading && (
            <Box className={classes.emptyState}>
              <Typography variant="h6" color="textSecondary">
                Nenhuma empresa encontrada
              </Typography>
            </Box>
          )}

          {filteredCompanies.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" color="textSecondary">
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filteredCompanies.length)} de{" "}
                {filteredCompanies.length} resultado(s)
              </Typography>
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <Button
                  size="small"
                  disabled={tablePage === 0}
                  onClick={() => setTablePage((prev) => prev - 1)}
                  style={{ textTransform: "none", fontWeight: 600 }}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="small"
                    onClick={() => setTablePage(i)}
                    style={{
                      minWidth: 32,
                      fontWeight: 600,
                      backgroundColor: tablePage === i ? sidebarColor : "transparent",
                      color: tablePage === i ? "#fff" : "#64748b",
                      borderRadius: 6,
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="small"
                  disabled={tablePage >= totalPages - 1}
                  onClick={() => setTablePage((prev) => prev + 1)}
                  style={{ textTransform: "none", fontWeight: 600 }}
                >
                  Próximo
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EmpresasPage;
