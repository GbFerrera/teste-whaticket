import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Grid,
  Chip,
  InputBase,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  FileCopy,
  Delete,
  Add,
  Link as LinkIcon,
  Visibility,
  PersonAdd,
  CheckCircle,
  Schedule,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  linkCard: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    "&:hover": {
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      borderColor: theme.palette.primary.light,
    },
  },
  linkCodeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
    marginBottom: theme.spacing(1.5),
  },
  urlContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "#f5f7fa",
    borderRadius: 8,
    padding: "4px 4px 4px 14px",
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  urlText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: "0.85rem",
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    borderRadius: 6,
    padding: "8px 20px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  statsGrid: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 8,
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "#f0f4f8",
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  statIcon: {
    fontSize: "1rem",
    color: theme.palette.primary.main,
  },
  statValue: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginRight: 4,
  },
  deleteBtn: {
    color: theme.palette.error.main,
    opacity: 0.6,
    "&:hover": {
      opacity: 1,
      backgroundColor: "rgba(244,67,54,0.08)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
  },
  emptyIcon: {
    fontSize: 64,
    color: theme.palette.text.disabled,
    marginBottom: theme.spacing(2),
  },
  generateBtn: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    padding: "8px 20px",
  },
  linkFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
}));

const AffiliateLinks = ({ affiliateId, onRefresh }) => {
  const classes = useStyles();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadLinks();
  }, [affiliateId]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/affiliate/my-links");
      setLinks(response.data || []);
    } catch (error) {
      console.error("Error loading links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url, linkId) => {
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateLink = async () => {
    try {
      setGenerating(true);
      await api.post("/affiliate/generate-link");
      toast.success("Link gerado com sucesso!");
      loadLinks();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error generating link:", error);
      toast.error(error.response?.data?.error || "Erro ao gerar link");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await api.delete(`/affiliate/links/${linkId}`);
      toast.success("Link excluído!");
      loadLinks();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Erro ao excluir link");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <div>
      <div className={classes.header}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          Links de Indicação ({links.length})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <Add />}
          onClick={handleGenerateLink}
          disabled={generating}
          className={classes.generateBtn}
        >
          {generating ? "Gerando..." : "Gerar Novo Link"}
        </Button>
      </div>

      {links.length === 0 ? (
        <div className={classes.emptyState}>
          <LinkIcon className={classes.emptyIcon} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum link de indicação
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Gere seu primeiro link para começar a indicar e ganhar comissões!
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Add />}
            onClick={handleGenerateLink}
            disabled={generating}
            className={classes.generateBtn}
          >
            Gerar Primeiro Link
          </Button>
        </div>
      ) : (
        links.map((link) => (
          <div key={link.id} className={classes.linkCard}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <div className={classes.linkCodeBadge}>
                <LinkIcon style={{ fontSize: 14 }} />
                {link.code}
              </div>
              <Tooltip title="Excluir link">
                <IconButton size="small" className={classes.deleteBtn} onClick={() => handleDeleteLink(link.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <div className={classes.urlContainer}>
              <span className={classes.urlText}>{link.url}</span>
              <Button
                className={classes.copyButton}
                startIcon={copiedId === link.id ? <CheckCircle /> : <FileCopy />}
                onClick={() => handleCopyLink(link.url, link.id)}
                size="small"
              >
                {copiedId === link.id ? "Copiado!" : "Copiar"}
              </Button>
            </div>

            <div className={classes.linkFooter}>
              <div className={classes.statsGrid}>
                <div className={classes.statItem}>
                  <Visibility className={classes.statIcon} />
                  <span className={classes.statValue}>{link.clicks}</span> cliques
                </div>
                <div className={classes.statItem}>
                  <PersonAdd className={classes.statIcon} />
                  <span className={classes.statValue}>{link.signups}</span> cadastros
                </div>
                <div className={classes.statItem}>
                  <CheckCircle className={classes.statIcon} />
                  <span className={classes.statValue}>{link.conversions}</span> conversões
                </div>
              </div>
              <span className={classes.dateText}>
                <Schedule style={{ fontSize: 14 }} />
                {formatDate(link.createdAt)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AffiliateLinks;
