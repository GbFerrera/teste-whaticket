import React, { memo, useState, useEffect } from "react";
import { Handle } from "react-flow-renderer";
import { MdSend, MdWhatsapp } from "react-icons/md";
import { ContentCopy, Delete } from "@mui/icons-material";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);

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
          ? "0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(34, 197, 94, 0.15)"
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
          }}
        >
          <MdWhatsapp size={18} color="#ffffff" />
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
            {data?.title || "Enviar WhatsApp"}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            {data?.data?.phoneNumber || "Configurar número"}
          </div>
        </div>
      </div>

      {/* Campos da Mensagem */}
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
            {data?.data?.phoneNumber || "—"}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
            Mensagem
          </div>
          <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data?.data?.message || "—"}
          </div>
        </div>
        
        {data?.data?.queueId && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>
              Fila
            </div>
            <div style={{ fontSize: "11px", color: "#111827", fontWeight: 500 }}>
              {data.data.queueId}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position="right"
        id="sendMessage"
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
