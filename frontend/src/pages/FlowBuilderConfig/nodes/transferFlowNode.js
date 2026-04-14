import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  AccountTree,
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
          ? "0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(139, 92, 246, 0.1)"
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
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          width: "16px",
          height: "16px",
          top: "24px",
          left: "-10px",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
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
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
          }}
        >
          <AccountTree
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
            Transferir Fluxo
          </div>
          <div 
            style={{ 
              color: "#6b7280", 
              fontSize: "12px", 
              fontWeight: "500",
            }}
          >
            Redirecionar para outro fluxo
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "#f5f3ff",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #ddd6fe",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px auto",
          }}
        >
          <AccountTree
            sx={{
              width: "24px",
              height: "24px",
              color: "#8b5cf6",
            }}
          />
        </div>
        <div 
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#6d28d9",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data?.data?.flowName || data?.flowName || "Selecione um fluxo"}
        </div>
        <div 
          style={{
            fontSize: "12px",
            color: "#7c3aed",
            fontWeight: "400",
          }}
        >
          Transferir atendimento
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
          <AccountTree sx={{ width: "12px", height: "12px", marginRight: "4px" }} />
          Componente Transferir Fluxo
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          width: "16px",
          height: "16px",
          right: "-10px",
          top: "50%",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
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
