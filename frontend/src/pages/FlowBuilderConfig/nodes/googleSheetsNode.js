import React, { memo, useState, useEffect } from "react";
import { Handle } from "react-flow-renderer";
import { ContentCopy, Delete } from "@mui/icons-material";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);

  const sheetsConfig = data?.sheetsConfig || {};
  const operation = data?.operation || "list";

  const formatPreview = (text, maxLength = 30) => {
    if (!text) return "—";
    const clean = text.replace(/<[^>]*>/g, "");
    return clean.length > maxLength ? clean.substring(0, maxLength) + "..." : clean;
  };

  const getOperationIcon = () => {
    switch (operation) {
      case "list": return "📋";
      case "add": return "➕";
      case "edit": return "✏️";
      case "delete": return "🗑️";
      case "search": return "🔍";
      default: return "📊";
    }
  };

  const getOperationText = () => {
    switch (operation) {
      case "list": return "Listar";
      case "add": return "Adicionar";
      case "edit": return "Editar";
      case "delete": return "Deletar";
      case "search": return "Buscar";
      default: return "Planilha";
    }
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
          ? "0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(34, 134, 58, 0.15)"
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
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          width: "14px",
          height: "14px",
          top: "20px",
          left: "-8px",
          cursor: "pointer",
          border: "3px solid #ffffff",
          boxShadow: "0 2px 6px rgba(34, 197, 94, 0.3)",
        }}
        isConnectable={isConnectable}
      />

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
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
            boxShadow: "0 3px 8px rgba(34, 197, 94, 0.25)",
            fontSize: "16px",
          }}
        >
          📊
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
            {data?.title || "Google Sheets"}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            {getOperationIcon()} {getOperationText()} - {sheetsConfig.spreadsheetName || "Configurar planilha"}
          </div>
        </div>
      </div>

      {/* Configuração da Planilha */}
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
          📊 Planilha
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
          {sheetsConfig.spreadsheetName || "Nenhuma planilha selecionada"}
        </div>
        {sheetsConfig.sheetName && (
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Aba: {sheetsConfig.sheetName}
          </div>
        )}
      </div>

      {/* Campos da Operação */}
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
            Operação
          </div>
          <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
            {getOperationIcon()} {getOperationText()}
          </div>
        </div>
        
        {(operation === "add" || operation === "edit") && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
              Dados
            </div>
            <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {formatPreview(JSON.stringify(data?.rowData || {}))}
            </div>
          </div>
        )}
        
        {(operation === "search" || operation === "delete") && data?.searchColumn && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
              Busca
            </div>
            <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
              {data.searchColumn}: {formatPreview(data.searchValue)}
            </div>
          </div>
        )}
        
        {operation === "list" && sheetsConfig.range && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
              Intervalo
            </div>
            <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
              {sheetsConfig.range}
            </div>
          </div>
        )}
        
        {data?.outputVariable && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
              Variável de Saída
            </div>
            <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
              {data.outputVariable}
            </div>
          </div>
        )}
      </div>

      {/* Variáveis Disponíveis */}
      {data?.variables && data.variables.length > 0 && (
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
            {data.variables.slice(0, 3).map((variable, index) => (
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
                {`{{${variable}}}`}
              </span>
            ))}
            {data.variables.length > 3 && (
              <span style={{ fontSize: "8px", color: "#64748b" }}>
                +{data.variables.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position="right"
        id="googleSheets"
        style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          width: "14px",
          height: "14px",
          right: "-8px",
          top: "50%",
          cursor: "pointer",
          border: "3px solid #ffffff",
          boxShadow: "0 2px 6px rgba(34, 197, 94, 0.3)",
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
});
