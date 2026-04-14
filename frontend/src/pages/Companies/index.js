import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
// import { SocketContext } from "../../context/Socket/SocketContext";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Chip from "@material-ui/core/Chip";
import Box from "@material-ui/core/Box";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";


import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";

import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import CompanyModal from "../../components/CompaniesModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import usePlans from "../../hooks/usePlans";
import moment from "moment";

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
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        overflowY: "auto",
        backgroundColor: "#f7f8fa",
        borderRadius: 12,
        ...theme.scrollbarStyles,
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2),
        flexWrap: "wrap",
    },
    searchField: {
        minWidth: 240,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    addButton: {
        borderRadius: 8,
        padding: theme.spacing(1, 2.5),
        textTransform: "none",
        fontWeight: 600,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        height: "100%",
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
        },
    },
    chipRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        gap: theme.spacing(1),
        flexWrap: "wrap",
    },
    statusChip: {
        fontWeight: 600,
    },
    infoRow: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginTop: theme.spacing(1),
    },
    infoLabel: {
        color: "#64748b",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    infoValue: {
        color: "#0f172a",
        fontWeight: 600,
    },
    emptyState: {
        textAlign: "center",
        padding: theme.spacing(6, 2),
        color: "#64748b",
    },
}));

const Companies = () => {
    const classes = useStyles();
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [deletingCompany, setDeletingCompany] = useState(null);
    const [companyModalOpen, setCompanyModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [companies, dispatch] = useReducer(reducer, []);
    const { dateToClient, datetimeToClient } = useDate();

    // const { getPlanCompany } = usePlans();
  //   const socketManager = useContext(SocketContext);
    const { user, socket } = useContext(AuthContext);


    useEffect(() => {
        async function fetchData() {
            if (!user.super) {
                toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
                setTimeout(() => {
                    history.push(`/`)
                }, 1000);
            }
        }
        fetchData();
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
                }
            };
            fetchCompanies();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

//     useEffect(() => {
//         const companyId = user.companyId;
//   //    const socket = socketManager.GetSocket();
//         // const socket = socketConnection();

//         return () => {
//             socket.disconnect();
//         };
//     }, []);

    const handleOpenCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(true);
    };

    const handleCloseCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditCompany = (company) => {
        console.log("✏️ ABRINDO MODAL DE EDIÇÃO...");
        console.log("   - Empresa selecionada:", company);
        console.log("   - ID da empresa:", company?.id);
        console.log("   - Nome da empresa:", company?.name);
        
        setSelectedCompany(company);
        setCompanyModalOpen(true);
        
        console.log("📋 Estados atualizados:");
        console.log("   - selectedCompany será:", company);
        console.log("   - companyModalOpen será:", true);
    };

    const handleDeleteCompany = async (companyId) => {
        console.log("🗑️ INICIANDO EXCLUSÃO DA EMPRESA:", companyId);
        
        let deletedFromDatabase = false;
        
        // Tenta múltiplas rotas de exclusão
        try {
            console.log("🚀 Tentativa 1: DELETE /companies/" + companyId);
            await api.delete(`/companies/${companyId}`);
            console.log("✅ Sucesso na exclusão do banco!");
            deletedFromDatabase = true;
        } catch (err) {
            console.log("❌ Falha na rota 1:", err.response?.status, err.message);
            
            // Tenta rota alternativa
            try {
                console.log("🔄 Tentativa 2: DELETE /company/" + companyId);
                await api.delete(`/company/${companyId}`);
                console.log("✅ Sucesso na rota alternativa!");
                deletedFromDatabase = true;
            } catch (err2) {
                console.log("❌ Falha na rota 2:", err2.response?.status, err2.message);
                
                // Tenta forçar com parâmetros
                try {
                    console.log("🔄 Tentativa 3: DELETE com force=true");
                    await api.delete(`/companies/${companyId}?force=true`);
                    console.log("✅ Sucesso com force!");
                    deletedFromDatabase = true;
                } catch (err3) {
                    console.log("❌ Todas as tentativas falharam");
                    console.log("   - Erro final:", err3.response?.status, err3.message);
                }
            }
        }
        
        // Mostra resultado
        if (deletedFromDatabase) {
            toast.success("Empresa excluída do banco de dados!");
        } else {
            toast.warning("Removida da interface (erro no banco)");
        }
        
        // SEMPRE remove da lista visual
        console.log("🎨 Removendo da interface...");
        dispatch({ type: "DELETE_COMPANIES", payload: companyId });
        
        setDeletingCompany(null);
        setSearchParam("");
        setPageNumber(1);
        
        console.log("✨ Exclusão finalizada!");
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

    const renderStatus = (isActive) => (isActive ? "Ativa" : "Inativa");

    const renderPlanValue = (row) => {
        return row.planId !== null ? row.plan?.amount ? Number(row.plan.amount).toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00,00' : "-";
    };

    const renderWhatsapp = (row) => {
        return row.useWhatsapp === false ? "Não" : "Sim";
    };

    const renderFacebook = (row) => {
        return row.useFacebook === false ? "Não" : "Sim";
    };

    const renderInstagram = (row) => {
        return row.useInstagram === false ? "Não" : "Sim";
    };

    const renderCampaigns = (row) => {
        return row.useCampaigns === false ? "Não" : "Sim";
    };

    const renderSchedules = (row) => {
        return row.useSchedules === false ? "Não" : "Sim";
    };

    const renderInternalChat = (row) => {
        return row.useInternalChat === false ? "Não" : "Sim";
    };

    const renderExternalApi = (row) => {
        return row.useExternalApi === false ? "Não" : "Sim";
    };

    const rowStyle = (record) => {
        if (moment(record.dueDate).isValid()) {
            const now = moment();
            const dueDate = moment(record.dueDate);
            const diff = dueDate.diff(now, "days");
            if (diff >= 1 && diff <= 5) {
                return { backgroundColor: "#fffead" };
            }
            if (diff <= 0) {
                return { backgroundColor: "#fa8c8c" };
            }
            // else {
            //   return { backgroundColor: "#affa8c" };
            // }
        }
        return {};
    };

    return (
        <MainContainer>
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
            <CompanyModal
                open={companyModalOpen}
                onClose={handleCloseCompanyModal}
                aria-labelledby="form-dialog-title"
                companyId={selectedCompany && selectedCompany.id}
            />
            <MainHeader>
                <Title>{i18n.t("compaies.title")} ({companies.length})</Title>
                <div className={classes.headerActions}>
                    <TextField
                        placeholder={i18n.t("contacts.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        variant="outlined"
                        size="small"
                        className={classes.searchField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "#94a3b8" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCompanyModal}
                        className={classes.addButton}
                    >
                        {i18n.t("compaies.buttons.add")}
                    </Button>
                </div>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Grid container spacing={3}>
                    {loading ? (
                        <Grid item xs={12}>
                            <Card className={classes.card}>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" align="center">
                                        Carregando...
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : companies.length === 0 ? (
                        <Grid item xs={12}>
                            <div className={classes.emptyState}>
                                <Typography variant="h6">Nenhuma empresa encontrada</Typography>
                                <Typography variant="body2">
                                    Utilize o botão acima para cadastrar uma nova empresa.
                                </Typography>
                            </div>
                        </Grid>
                    ) : (
                        companies
                            .filter(company => company.id !== 1)
                            .map((company) => (
                                <Grid item xs={12} sm={6} md={4} key={company.id}>
                                    <Card className={classes.card}>
                                        <CardContent>
                                            <div className={classes.chipRow}>
                                                <Chip
                                                    label={`ID #${company.id}`}
                                                    size="small"
                                                    color="default"
                                                />
                                                <Chip
                                                    label={renderStatus(company.status)}
                                                    color={company.status ? "primary" : "default"}
                                                    size="small"
                                                    className={classes.statusChip}
                                                />
                                            </div>
                                            <Typography variant="h6" color="textPrimary">
                                                {company.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {company.email}
                                            </Typography>
                                            <div className={classes.infoRow}>
                                                <span className={classes.infoLabel}>Responsável</span>
                                                <span className={classes.infoValue}>
                                                    {company?.users?.[0]?.name || "-"}
                                                </span>
                                            </div>
                                            <div className={classes.infoRow}>
                                                <span className={classes.infoLabel}>Plano</span>
                                                <span className={classes.infoValue}>{company?.plan?.name || "-"}</span>
                                            </div>
                                            <div className={classes.infoRow}>
                                                <span className={classes.infoLabel}>Valor</span>
                                                <span className={classes.infoValue}>R$ {renderPlanValue(company)}</span>
                                            </div>
                                            <div className={classes.infoRow}>
                                                <span className={classes.infoLabel}>Vencimento</span>
                                                <span className={classes.infoValue}>
                                                    {dateToClient(company.dueDate)} ({company.recurrence || "N/A"})
                                                </span>
                                            </div>
                                            <div className={classes.infoRow}>
                                                <span className={classes.infoLabel}>Último login</span>
                                                <span className={classes.infoValue}>
                                                    {datetimeToClient(company.lastLogin)}
                                                </span>
                                            </div>
                                            <div className={classes.infoRow}>
                                                <span className={classes.infoLabel}>Uso de armazenamento</span>
                                                <span className={classes.infoValue}>
                                                    {company.folderSize || "0"} • {company.numberFileFolder || 0} arquivos
                                                </span>
                                            </div>
                                        </CardContent>
                                        <CardActions style={{ justifyContent: "space-between", padding: "16px 24px" }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(company)}
                                                style={{
                                                    backgroundColor: company.status ? "#fbbf24" : "#10b981",
                                                    color: "#fff",
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <PowerSettingsNewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditCompany(company)}
                                                style={{
                                                    backgroundColor: "#3b82f6",
                                                    color: "#fff",
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setConfirmModalOpen(true);
                                                    setDeletingCompany(company);
                                                }}
                                                style={{
                                                    backgroundColor: "#f43f5e",
                                                    color: "#fff",
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))
                    )}
                </Grid>
            </Paper>
        </MainContainer>
    );
};

export default Companies;
