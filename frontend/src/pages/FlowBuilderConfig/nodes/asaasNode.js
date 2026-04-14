import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Receipt,
} from "@mui/icons-material";
import React, { memo, useState } from "react";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Handle } from "react-flow-renderer";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        minWidth: "280px",
        maxWidth: "280px",
        width: "280px",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        border: "2px solid #e5e7eb",
        boxShadow: isHovered 
          ? "0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.1)"
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
          onClick={() => storageItems.setNodesStorage(id)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#f3f4f6",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
        >
          <ContentCopy sx={{ color: "#6b7280", fontSize: "14px" }} />
        </div>
        <div
          onClick={() => storageItems.setRemoveNodes(id)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
        >
          <Delete sx={{ color: "#ef4444", fontSize: "14px" }} />
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
          }}
        >
          <Receipt sx={{ color: "#ffffff", fontSize: "20px" }} />
        </div>
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#111827",
              letterSpacing: "-0.01em",
            }}
          >
            2ª Via Boleto
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              marginTop: "2px",
            }}
          >
            Asaas
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          borderRadius: "10px",
          padding: "14px",
          border: "1px solid #bbf7d0",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#166534",
            fontWeight: "500",
            marginBottom: "4px",
          }}
        >
          Solicita CPF do cliente
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#15803d",
          }}
        >
          {data?.data?.message || "Informe seu CPF para buscar o boleto"}
        </div>
      </div>

      {/* Source Handle - Sucesso */}
      <Handle
        type="source"
        position="right"
        id="success"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          width: "16px",
          height: "16px",
          top: "40%",
          right: "-10px",
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
            marginLeft: "2.5px",
            marginBottom: "0.5px",
            pointerEvents: "none"
          }}
        />
      </Handle>

      {/* Label Sucesso */}
      <div
        style={{
          position: "absolute",
          right: "12px",
          top: "calc(40% - 18px)",
          fontSize: "9px",
          color: "#10b981",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        Sucesso
      </div>

      {/* Source Handle - Erro */}
      <Handle
        type="source"
        position="right"
        id="error"
        style={{
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          width: "16px",
          height: "16px",
          top: "70%",
          right: "-10px",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
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

      {/* Label Erro */}
      <div
        style={{
          position: "absolute",
          right: "12px",
          top: "calc(70% - 18px)",
          fontSize: "9px",
          color: "#ef4444",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        Erro
      </div>
    </div>
  );
});
