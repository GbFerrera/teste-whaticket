import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, Grid, CircularProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import PagesIcon from "@material-ui/icons/Pages";
import { usePagePermissions } from "../../context/PagePermissionsContext";
import { PAGES_CONFIG } from "../../config/pagesConfig";

const PROFILE_DESCRIPTIONS = {
  admin: "Acesso completo a todos os módulos do sistema, incluindo Painel, Conversas, Usuários, Configurações e Automação.",
  manager: "Gerencia equipes e filas: painéis gerenciais, relatórios, contatos e acompanhamento dos atendimentos.",
  attendant: "Focado na operação diária: Conversas, Chamadas, Contatos e tarefas do dia a dia.",
  professional: "Permissões enxutas para agendas e compromissos pessoais, além dos contatos atribuídos."
};

const PROFILE_LABELS = {
  admin: "Administrador",
  manager: "Gerente",
  attendant: "Atendente",
  professional: "Profissional"
};

const PagePermissionsTab = ({ profile }) => {
  const { loading: pagesLoading } = usePagePermissions();

  if (pagesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  const profilePages = Object.values(PAGES_CONFIG).filter(page => page.defaultFor?.includes(profile));

  return (
    <Paper elevation={0} style={{ padding: 16 }}>
      <Typography variant="h6" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <PagesIcon fontSize="small" />
        Acesso a Páginas
      </Typography>

      <Alert severity="info" style={{ marginBottom: 16 }}>
        <Typography variant="body2">
          <strong>Modo Herdado do Perfil:</strong> O acesso deste usuário segue automaticamente o conjunto de páginas definido para o perfil selecionado.
        </Typography>
        <Typography variant="body2" style={{ marginTop: 8 }}>
          Para alterar o que ele pode acessar, ajuste o perfil do usuário ou crie um novo perfil com as permissões desejadas.
        </Typography>
      </Alert>

      <Box mt={2}>
        <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
          O que cada perfil pode fazer:
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(PROFILE_DESCRIPTIONS).map(([role, description]) => (
            <Grid item xs={12} key={role}>
              <Box p={1.5} bgcolor="#f5f5f5" borderRadius={4}>
                <Typography variant="body2">
                  <strong>{PROFILE_LABELS[role] || role}:</strong> {description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box mt={3}>
        <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
          Páginas disponíveis para o perfil "{profile}":
        </Typography>
        {profilePages.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            Nenhuma página padrão configurada para este perfil.
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {profilePages.map(page => (
              <Grid item xs={12} sm={6} md={4} key={page.path}>
                <Box display="flex" alignItems="center" p={1} bgcolor="#f8f9fa" borderRadius={4}>
                  <Typography variant="body2" color="textSecondary">
                    ✓ {page.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default PagePermissionsTab;
