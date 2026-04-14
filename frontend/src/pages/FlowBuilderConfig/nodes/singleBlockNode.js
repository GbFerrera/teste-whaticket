import {
  AccessTime,
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Image,
  LibraryBooks,
  Message,
  MicNone,
  Videocam,
  Description,
} from "@mui/icons-material";
import React, { memo, useState } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Typography } from "@mui/material";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);

  const getContentIcon = (itemType) => {
    if (itemType.includes("message")) return Message;
    if (itemType.includes("interval")) return AccessTime;
    if (itemType.includes("img")) return Image;
    if (itemType.includes("file")) return Description;
    if (itemType.includes("audio")) return MicNone;
    if (itemType.includes("video")) return Videocam;
    return Message;
  };

  const getContentColor = (itemType) => {
    if (itemType.includes("message")) return "#3b82f6";
    if (itemType.includes("interval")) return "#f59e0b";
    if (itemType.includes("img")) return "#8b5cf6";
    if (itemType.includes("file")) return "#6366f1";
    if (itemType.includes("audio")) return "#10b981";
    if (itemType.includes("video")) return "#ef4444";
    return "#6b7280";
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        minWidth: "300px",
        maxWidth: "300px",
        width: "300px",
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
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          width: "16px",
          height: "16px",
          top: "24px",
          left: "-10px",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
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
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
          }}
        >
          <LibraryBooks
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
            Conteúdo
          </div>
          <div 
            style={{ 
              color: "#6b7280", 
              fontSize: "12px", 
              fontWeight: "500",
            }}
          >
            {data.seq.length} itens na sequência
          </div>
        </div>
      </div>

      {/* Content Sequence */}
      <div
        style={{
          marginBottom: "16px",
          maxHeight: "200px",
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {data.seq.map((item, index) => {
          const IconComponent = getContentIcon(item);
          const iconColor = getContentColor(item);
          
          return (
            <div
              key={`${item}-${index}`}
              style={{
                backgroundColor: "#f9fafb",
                marginBottom: "8px",
                borderRadius: "10px",
                padding: "12px",
                border: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.transform = "translateX(0px)";
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: iconColor + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconComponent
                  sx={{
                    width: "14px",
                    height: "14px",
                    color: iconColor,
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {item.includes("message") && (
                  <Typography
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.elements.find((itemLoc) => itemLoc.number === item)?.value || "Mensagem"}
                  </Typography>
                )}
                {item.includes("interval") && (
                  <Typography
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    {data.elements.find((itemLoc) => itemLoc.number === item)?.value || "0"} segundos
                  </Typography>
                )}
                {item.includes("img") && (
                  <Typography
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.elements.find((itemLoc) => itemLoc.number === item)?.original || "Imagem"}
                  </Typography>
                )}
                {item.includes("file") && (
                  <Typography
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.elements
                      .find((itemLoc) => itemLoc.number === item)
                      ?.original.replace(/(\.xlsx|\.docx|\.pdf|\.doc|\.xls).*/, "$1") || "Arquivo"}
                  </Typography>
                )}
                {item.includes("audio") && (
                  <Typography
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.elements.find((itemLoc) => itemLoc.number === item)?.original || "Áudio"}
                  </Typography>
                )}
                {item.includes("video") && (
                  <Typography
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.elements.find((itemLoc) => itemLoc.number === item)?.original || "Vídeo"}
                  </Typography>
                )}
              </div>
            </div>
          );
        })}
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
          <LibraryBooks sx={{ width: "12px", height: "12px", marginRight: "4px" }} />
          Componente Conteúdo
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          width: "16px",
          height: "16px",
          right: "-10px",
          top: "50%",
          cursor: 'pointer',
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
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});