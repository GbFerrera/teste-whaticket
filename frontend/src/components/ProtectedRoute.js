import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import { usePagePermissions } from "../context/PagePermissionsContext";
import BackdropLoading from "./BackdropLoading";

const ProtectedRoute = ({ 
  component: Component, 
  isPrivate = false, 
  isPublic = false, 
  requiredPermission = null,
  ...rest 
}) => {
  const { isAuth, loading: authLoading, user } = useContext(AuthContext);
  const { canAccessPage, loading: permissionsLoading } = usePagePermissions();

  // Rotas públicas (landing, login, cadastro, etc) - carrega instantaneamente sem loading
  if (isPublic) {
    // Se já está logado e tenta acessar landing/login/cadastro, redireciona para dashboard
    if (!authLoading && isAuth && (rest.path === "/" || rest.path === "/login" || rest.path === "/cadastro")) {
      return <Redirect to={{ pathname: "/atendimentos", state: { from: rest.location } }} />;
    }
    return <RouterRoute {...rest} component={Component} />;
  }

  // Mostra loading enquanto verifica autenticação ou permissões
  if (authLoading || permissionsLoading) {
    return <BackdropLoading />;
  }

  // Usuário não logado tentando acessar rota privada -> vai para login
  if (!isAuth && isPrivate) {
    return <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />;
  }

  // Usuário não logado em rota não marcada -> vai para login
  if (!isAuth && !isPrivate) {
    return <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />;
  }

  // Verifica permissões de página se não for admin
  if (isAuth && user?.profile !== "admin") {
    const pagePath = rest.path;
    
    // Se a página requer permissão específica e o usuário não tem acesso
    if (requiredPermission && !canAccessPage(requiredPermission)) {
      return <Redirect to={{ pathname: "/atendimentos", state: { from: rest.location } }} />;
    }
    
    // Verifica acesso à página atual
    if (!canAccessPage(pagePath)) {
      return <Redirect to={{ pathname: "/atendimentos", state: { from: rest.location } }} />;
    }
  }

  return <RouterRoute {...rest} component={Component} />;
};

export default ProtectedRoute;
