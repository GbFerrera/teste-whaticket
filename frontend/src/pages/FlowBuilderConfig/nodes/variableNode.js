import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  DataObject,
} from "@mui/icons-material";
import React, { memo, useMemo, useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

const summarizeValue = (config = {}) => {
  switch (config.valueType) {
    case "empty":
      return "Limpar valor";
    case "append":
      return "Adicionar ao conteúdo atual";
    case "environment":
      return "Nome do ambiente";
    case "device":
      return "Tipo de dispositivo";
    case "transcript":
      return "Transcrição";
    case "resultId":
      return "ID da sessão";
    case "now":
      return "Data/Hora atual";
    case "custom":
    default: {
      if (!config.customValue) return "—";
      const text = config.customValue.trim();
      if (!text) return "—";
      return text.length > 50 ? `${text.slice(0, 47)}...` : text;
    }
  }
};

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);

  const variableConfig = data?.variableConfig || {};

  const valuePreview = useMemo(
    () => summarizeValue(variableConfig),
    [variableConfig]
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        width: "280px",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        border: "2px solid #e5e7eb",
        boxShadow: isHovered
          ? "0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.15)"
          : "0 4px 16px rgba(0, 0, 0, 0.06)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          width: "16px",
          height: "16px",
          top: "24px",
          left: "-10px",
          cursor: "pointer",
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
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
            pointerEvents: "none",
          }}
        />
      </Handle>

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
          }}
        >
          <ContentCopy
            sx={{ width: "14px", height: "14px", color: "#6b7280" }}
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
          }}
        >
          <Delete sx={{ width: "14px", height: "14px", color: "#ef4444" }} />
        </div>
      </div>

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
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
          }}
        >
          <DataObject sx={{ width: "18px", height: "18px", color: "#ffffff" }} />
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
            {data?.title || "Variável"}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {variableConfig.variableName || "Sem nome"}
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: "12px",
          padding: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#5b21b6",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Valor
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#312e81",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {valuePreview}
        </div>
      </div>

      <Handle
        type="source"
        position="right"
        id="variable"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          width: "16px",
          height: "16px",
          right: "-10px",
          top: "50%",
          cursor: "pointer",
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
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
            pointerEvents: "none",
          }}
        />
      </Handle>
    </div>
  );
});
