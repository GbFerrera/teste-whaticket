import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";

import SliderBannerModal from "../../components/SliderBannerModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import { getBackendUrl } from "../../config";
import {
  listSliderBanners,
  deleteSliderBanner,
} from "../../services/sliderHomeService";

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
  thumbnailImg: {
    width: 80,
    height: 45,
    objectFit: "cover",
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
}));

const SliderBannersPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const sidebarColor = theme.palette.primary.main || "#3b82f6";
  const isAuthorized = user && user.companyId === 1 && user.profile === "admin";

  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    if (isAuthorized) {
      fetchBanners();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredBanners(banners);
    } else {
      const term = search.toLowerCase();
      setFilteredBanners(banners.filter((b) => b.name?.toLowerCase().includes(term)));
    }
    setTablePage(0);
  }, [search, banners]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await listSliderBanners();
      setBanners(Array.isArray(data) ? data : data?.sliderBanners || []);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
      toast.error("Não foi possível carregar os banners");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    setSelectedBanner(banner);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBanner(null);
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    fetchBanners();
  };

  const handleDelete = (banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteSliderBanner(bannerToDelete.id);
      toast.success("Banner removido com sucesso!");
      fetchBanners();
    } catch (error) {
      console.error("Erro ao remover banner:", error);
      toast.error("Não foi possível remover o banner");
    } finally {
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const backendBaseUrl = getBackendUrl()?.replace(/\/$/, "");

  const getImageUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;

    const normalized = path.replace(/\\/g, "/");
    const publicIndex = normalized.indexOf("/public/");
    let relativePath = normalized;

    if (publicIndex >= 0) {
      relativePath = normalized.slice(publicIndex + 1);
    } else {
      relativePath = normalized.replace(/^\/+/, "");
      if (!relativePath.startsWith("public/")) {
        relativePath = `public/${relativePath}`;
      }
    }

    if (backendBaseUrl) {
      return `${backendBaseUrl}/${relativePath}`;
    }

    return `/${relativePath}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const paginatedBanners = filteredBanners.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(filteredBanners.length / rowsPerPage);

  if (!isAuthorized) {
    return (
      <Box className={classes.root}>
        <Box className={classes.emptyState}>
          <Typography variant="h5" gutterBottom>
            Acesso negado
          </Typography>
          <Typography variant="body1">
            Esta página é restrita ao administrador da empresa principal.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root} style={{ "--sidebar-color": sidebarColor }}>
      <SliderBannerModal
        open={modalOpen}
        onClose={handleCloseModal}
        banner={selectedBanner}
        onSuccess={handleModalSuccess}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remover Banner</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja remover definitivamente o banner "{bannerToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="secondary" variant="contained" onClick={confirmDelete}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Banners do Slider</Typography>
            <Typography className={classes.headerSubtitle}>
              {filteredBanners.length} banner(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <TextField
            placeholder="Buscar banner..."
            variant="outlined"
            size="small"
            className={classes.searchField}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            onClick={() => handleOpenModal()}
            className={classes.addButton}
          >
            Novo Banner
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Imagem</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Criado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading ? (
                <TableRowSkeleton columns={5} />
              ) : paginatedBanners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum banner encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBanners.map((banner) => (
                  <TableRow
                    key={banner.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenModal(banner)}
                  >
                    <TableCell>{banner.id}</TableCell>
                    <TableCell>
                      {banner.image ? (
                        <img
                          src={getImageUrl(banner.image)}
                          alt={banner.name}
                          className={classes.thumbnailImg}
                        />
                      ) : (
                        <Box
                          className={classes.thumbnailImg}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontSize: "0.7rem",
                          }}
                        >
                          Sem imagem
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                        {banner.name || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{formatDate(banner.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(banner);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(banner);
                            }}
                            style={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredBanners.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                Exibindo {tablePage * rowsPerPage + 1} a{" "}
                {Math.min((tablePage + 1) * rowsPerPage, filteredBanners.length)} de{" "}
                {filteredBanners.length} resultado(s)
              </Typography>
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <Button
                  size="small"
                  disabled={tablePage === 0}
                  onClick={() => setTablePage(tablePage - 1)}
                  className={classes.actionBtn}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="small"
                    variant={i === tablePage ? "contained" : "text"}
                    color={i === tablePage ? "primary" : "default"}
                    onClick={() => setTablePage(i)}
                    style={{
                      minWidth: 32,
                      borderRadius: 6,
                      fontWeight: i === tablePage ? 700 : 400,
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="small"
                  disabled={tablePage >= totalPages - 1}
                  onClick={() => setTablePage(tablePage + 1)}
                  className={classes.actionBtn}
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

export default SliderBannersPage;
