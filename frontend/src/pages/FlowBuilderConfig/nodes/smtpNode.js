import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Email,
  MailOutline,
} from "@mui/icons-material";
import React, { memo, useState, useEffect } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);
  const [variables, setVariables] = useState([]);

  const smtpConfig = data?.smtpConfig || {};
  const emailConfig = data?.emailConfig || {};

  // Extrair variáveis do fluxo
  useEffect(() => {
    // Variáveis padrão do sistema
    const systemVariables = [
      { name: "nome", description: "Nome do contato" },
      { name: "email", description: "Email do contato" },
      { name: "telefone", description: "Telefone do contato" },
      { name: "empresa", description: "Nome da empresa" },
      { name: "data", description: "Data atual" },
      { name: "hora", description: "Hora atual" },
    ];

    // Buscar variáveis dos nós de pergunta salvas no localStorage
    const flowVariables = [];
    
    try {
      // Obter variáveis salvas pelo FlowBuilder
      const savedVariables = localStorage.getItem("variables");
      if (savedVariables) {
        const variablesArray = JSON.parse(savedVariables);
        
        // Adicionar variáveis do fluxo com descrições melhoradas
        variablesArray.forEach(varName => {
          if (varName && varName.trim()) {
            flowVariables.push({
              name: varName.trim(),
              description: `Variável coletada no fluxo`
            });
          }
        });
      }
    } catch (error) {
      console.log("Erro ao buscar variáveis do localStorage:", error);
    }

    // Combinar variáveis do sistema com variáveis do fluxo
    const allVariables = [...systemVariables, ...flowVariables];
    
    // Remover duplicatas (priorizar variáveis do fluxo)
    const uniqueVariables = allVariables.filter((variable, index, self) =>
      index === self.findIndex((v) => v.name === variable.name)
    );

    console.log("Variáveis disponíveis no nó SMTP:", uniqueVariables);
    setVariables(uniqueVariables);
  }, []); // Removido [data] para não recarregar toda hora

  const formatPreview = (text, maxLength = 30) => {
    if (!text) return "—";
    const clean = text.replace(/<[^>]*>/g, ""); // Remove HTML
    return clean.length > maxLength ? clean.substring(0, maxLength) + "..." : clean;
  };

  const showVariableHelper = (field) => {
    return (
      <div style={{ 
        fontSize: "10px", 
        color: "#6b7280", 
        marginTop: "2px",
        fontStyle: "italic"
      }}>
        Use: {variables.slice(0, 3).map(v => `{{${v.name}}}`).join(", ")}...
      </div>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        padding: "16px",
        borderRadius: "12px",
        maxWidth: "300px",
        minWidth: "300px",
        width: "300px",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        border: "2px solid #e5e7eb",
        boxShadow: isHovered
          ? "0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.15)"
          : "0 2px 8px rgba(0, 0, 0, 0.06)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          width: "14px",
          height: "14px",
          top: "20px",
          left: "-8px",
          cursor: "pointer",
          border: "3px solid #ffffff",
          boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)",
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffffff",
            width: "6px",
            height: "6px",
            marginLeft: "2px",
            marginBottom: "0.5px",
            pointerEvents: "none",
          }}
        />
      </Handle>

      <div
        style={{
          display: "flex",
          position: "absolute",
          right: "12px",
          top: "12px",
          cursor: "pointer",
          gap: "6px",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      >
        <div
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ContentCopy sx={{ width: "12px", height: "12px", color: "#6b7280" }} />
        </div>
        <div
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            backgroundColor: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Delete sx={{ width: "12px", height: "12px", color: "#ef4444" }} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
            boxShadow: "0 3px 8px rgba(59, 130, 246, 0.25)",
          }}
        >
          <Email sx={{ width: "16px", height: "16px", color: "#ffffff" }} />
        </div>
        <div>
          <div
            style={{
              color: "#111827",
              fontSize: "14px",
              fontWeight: "700",
              lineHeight: "1.2",
              marginBottom: "1px",
            }}
          >
            {data?.title || "Envio SMTP"}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            {smtpConfig.fromEmail || "Configurar SMTP"}
          </div>
        </div>
      </div>

      {/* Configuração SMTP */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "11px",
            color: "#475569",
            marginBottom: "4px",
            fontWeight: 600,
          }}
        >
          <MailOutline sx={{ width: "14px", height: "14px", marginRight: "4px" }} />
          Configuração SMTP
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {smtpConfig.host || "Servidor não configurado"}
        </div>
      </div>

      {/* Campos do Email */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
            Para
          </div>
          <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
            {formatPreview(emailConfig.to)}
          </div>
          {emailConfig.to && showVariableHelper("to")}
        </div>
        
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
            Assunto
          </div>
          <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
            {formatPreview(emailConfig.subject)}
          </div>
          {emailConfig.subject && showVariableHelper("subject")}
        </div>
        
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
            Conteúdo
          </div>
          <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
            {formatPreview(emailConfig.body || emailConfig.content)}
          </div>
          {(emailConfig.body || emailConfig.content) && showVariableHelper("body")}
        </div>
      </div>

      {/* Variáveis Disponíveis */}
      {variables.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            padding: "6px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "6px",
          }}
        >
          <div style={{ fontSize: "9px", fontWeight: 600, color: "#0c4a6e", marginBottom: "3px" }}>
            Variáveis disponíveis:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
            {variables.map((variable, index) => (
              <span
                key={index}
                style={{
                  fontSize: "8px",
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  padding: "1px 4px",
                  borderRadius: "3px",
                  fontWeight: 500,
                }}
              >
                {`{{${variable.name}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position="right"
        id="smtp"
        style={{
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          width: "14px",
          height: "14px",
          right: "-8px",
          top: "50%",
          cursor: "pointer",
          border: "3px solid #ffffff",
          boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)",
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffffff",
            width: "6px",
            height: "6px",
            marginLeft: "2px",
            marginBottom: "0.5px",
            pointerEvents: "none",
          }}
        />
      </Handle>
    </div>
  );
});
