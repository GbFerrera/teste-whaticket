import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  AccessTime,
  LocalOffer,
  ViewKanban,
  ListAlt,
} from "@mui/icons-material";
import React, { memo, useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);

  const formatDelay = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const getActionLabel = (action) => {
    if (!action) return "Ação não definida";
    switch (action.type) {
      case "sendMessageFlow":
        return "Enviar mensagem";
      case "addTag":
        return `Tags: ${action.payload?.tags?.length || 0} selecionada(s)`;
      case "addTagKanban":
        return `Kanban: ${action.payload?.kanbanTagId ? "1 etapa" : "..."}`;
      case "transferQueue":
        return `Fila: ${action.payload?.queueId ? "Selecionada" : "..."}`;
      case "closeTicket":
        return "Fechar ticket";
      case "transferFlow":
        return "Transferir fluxo";
      default:
        return action.type;
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "sendMessageFlow":
        return <AccessTime sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
      case "addTag":
        return <LocalOffer sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
      case "addTagKanban":
        return <ViewKanban sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
      case "transferQueue":
        return <ListAlt sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
      case "closeTicket":
        return <Delete sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
      case "transferFlow":
        return <ArrowForwardIos sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
      default:
        return <AccessTime sx={{ width: "14px", height: "14px", color: "#6b7280" }} />;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        maxWidth: "280px",
        minWidth: "280px",
        width: "280px",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        border: "2px solid #e5e7eb",
        boxShadow: isHovered
          ? "0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.1)"
          : "0 4px 16px rgba(0, 0, 0, 0.06)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0px)",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          width: "16px",
          height: "16px",
          top: "24px",
          left: "-10px",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffffff",
            width: "8px",
            height: "8px",
            marginLeft: "2.5px",
            marginBottom: "0.5px",
            pointerEvents: "none"
          }}
        />
      </Handle>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: "16px",
          top: "16px",
          cursor: "pointer",
          gap: "8px",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#e5e7eb";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#f3f4f6";
            e.target.style.transform = "scale(1)";
          }}
        >
          <ContentCopy
            sx={{
              width: "14px",
              height: "14px",
              color: "#6b7280"
            }}
          />
        </div>
        <div
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#fee2e2";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#fef2f2";
            e.target.style.transform = "scale(1)";
          }}
        >
          <Delete
            sx={{
              width: "14px",
              height: "14px",
              color: "#ef4444"
            }}
          />
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
          }}
        >
          <AccessTime
            sx={{
              width: "18px",
              height: "18px",
              color: "#ffffff",
            }}
          />
        </div>
        <div>
          <div
            style={{
              color: "#111827",
              fontSize: "16px",
              fontWeight: "700",
              lineHeight: "1.2",
              marginBottom: "2px",
            }}
          >
            Follow-up
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            Ação após delay
          </div>
        </div>
      </div>

      {/* Delay & Action Summary */}
      <div
        style={{
          color: "#374151",
          fontSize: "13px",
          lineHeight: "1.5",
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #f3f4f6",
          marginBottom: "16px",
          minHeight: "60px",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <strong>Delay:</strong> {data.delayMinutes ? formatDelay(data.delayMinutes) : "Não definido"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {data.action && getActionIcon(data.action.type)}
          <strong>Ação:</strong> {data.action ? getActionLabel(data.action) : "Não definida"}
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          paddingTop: "12px",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#9ca3af",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AccessTime sx={{ width: "12px", height: "12px", marginRight: "4px" }} />
          Componente Follow-up
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          width: "16px",
          height: "16px",
          right: "-10px",
          top: "50%",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffffff",
            width: "8px",
            height: "8px",
            marginLeft: "2px",
            marginBottom: "0.5px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});
