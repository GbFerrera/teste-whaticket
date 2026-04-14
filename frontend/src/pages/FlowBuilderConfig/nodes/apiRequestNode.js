import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Http,
  Code,
  PlayArrow,
  DataObject,
} from "@mui/icons-material";
import React, { memo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Handle } from "react-flow-renderer";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const [isHovered, setIsHovered] = useState(false);
  const [variables, setVariables] = useState([]);
  const [testing, setTesting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [detectedVariables, setDetectedVariables] = useState([]);
  const [showVariableSelector, setShowVariableSelector] = useState(false);

  // Extrair variáveis do fluxo
  useEffect(() => {
    try {
      const savedVariables = localStorage.getItem("variables");
      if (savedVariables) {
        const variablesArray = JSON.parse(savedVariables);
        const flowVariables = variablesArray.map(varName => ({
          name: varName.trim(),
          description: "Variável do fluxo"
        }));
        
        // Adicionar variáveis salvas neste nó API
        const savedApiVariables = data?.data?.savedVariables || [];
        const apiVariables = savedApiVariables.map(variable => ({
          name: variable.name,
          description: `API: ${variable.path}`
        }));
        
        // Combinar todas as variáveis
        const allVariables = [...flowVariables, ...apiVariables];
        
        // Remover duplicatas
        const uniqueVariables = allVariables.filter((variable, index, self) =>
          index === self.findIndex((v) => v.name === variable.name)
        );
        
        setVariables(uniqueVariables);
      }
    } catch (error) {
      console.log("Erro ao buscar variáveis:", error);
    }
  }, [data]);

  // Extrair variáveis salvas neste nó
  const savedApiVariables = data?.data?.savedVariables || [];

  // Função para extrair variáveis de um objeto JSON recursivamente
  const extractVariables = (obj, prefix = '') => {
    const vars = [];
    
    const traverse = (current, path) => {
      if (current === null || current === undefined) return;
      
      if (typeof current === 'object' && !Array.isArray(current)) {
        // Objeto: percorrer propriedades
        Object.keys(current).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          traverse(current[key], newPath);
        });
      } else if (Array.isArray(current)) {
        // Array: pegar primeiro item como exemplo
        if (current.length > 0) {
          traverse(current[0], `${path}[0]`);
        }
      } else {
        // Valor primitivo: adicionar à lista
        vars.push({
          path: path,
          name: path.replace(/\[0\]/g, '').replace(/\./g, '_'),
          value: current,
          type: typeof current,
          selected: false
        });
      }
    };
    
    traverse(obj, prefix);
    return vars;
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "#22c55e",
      POST: "#3b82f6",
      PUT: "#f59e0b",
      DELETE: "#ef4444",
      PATCH: "#8b5cf6",
    };
    return colors[method] || "#6b7280";
  };

  const method = data?.data?.method || data?.method || "GET";
  const url = data?.data?.url || data?.url || "";
  const headers = data?.data?.headers || {};
  const body = data?.data?.body || "";

  // Função para testar API
  const testApi = async () => {
    setTesting(true);
    setApiResponse(null);
    setDetectedVariables([]);
    
    try {
      // Validar URL
      if (!url || url.trim() === '') {
        toast.error('URL não pode estar vazia');
        return;
      }
      
      // Substituir variáveis na URL e body
      let processedUrl = url;
      let processedBody = body;
      
      variables.forEach(variable => {
        const placeholder = `{{${variable.name}}}`;
        const testValue = '[TESTE]';
        processedUrl = processedUrl.split(placeholder).join(testValue);
        processedBody = processedBody.split(placeholder).join(testValue);
      });

      console.log("Testando API:", processedUrl);
      
      // Fazer requisição real
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      
      // Adicionar body se não for GET
      if (method !== 'GET' && processedBody) {
        options.body = processedBody;
      }
      
      const response = await fetch(processedUrl, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Salvar resposta
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      // Detectar variáveis automaticamente
      const detected = extractVariables(responseData);
      setDetectedVariables(detected);
      
      // Mostrar modal de seleção
      if (detected.length > 0) {
        setShowVariableSelector(true);
        toast.success(`✅ API respondeu! ${detected.length} variáveis detectadas`);
      } else {
        toast.success(`✅ API respondeu com sucesso!`);
      }
      
    } catch (error) {
      console.error("Erro ao testar API:", error);
      toast.error(`❌ Erro: ${error.message}`);
      setApiResponse({
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  // Salvar variáveis selecionadas
  const saveSelectedVariables = () => {
    const selected = detectedVariables.filter(v => v.selected);
    
    if (selected.length === 0) {
      toast.warning('Selecione pelo menos uma variável');
      return;
    }
    
    // Atualizar dados do nó
    const updatedData = {
      ...data,
      data: {
        ...data.data,
        savedVariables: selected.map(v => ({
          name: v.name,
          path: v.path,
          type: v.type,
          example: v.value
        }))
      }
    };
    
    // Atualizar nó no storage
    if (storageItems.updateNodeData) {
      storageItems.updateNodeData(id, updatedData);
    }
    
    toast.success(`✅ ${selected.length} variável(is) salva(s)!`);
    setShowVariableSelector(false);
  };

  // Toggle seleção de variável
  const toggleVariableSelection = (index) => {
    setDetectedVariables(prev => 
      prev.map((v, i) => 
        i === index ? { ...v, selected: !v.selected } : v
      )
    );
  };

  // Selecionar todas as variáveis
  const selectAllVariables = () => {
    setDetectedVariables(prev => prev.map(v => ({ ...v, selected: true })));
  };

  // Desselecionar todas
  const deselectAllVariables = () => {
    setDetectedVariables(prev => prev.map(v => ({ ...v, selected: false })));
  };

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
          ? "0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(34, 197, 94, 0.1)"
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
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          width: "16px",
          height: "16px",
          top: "24px",
          left: "-10px",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
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
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
          }}
        >
          <Http
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
            Requisição API
          </div>
          <div 
            style={{ 
              color: "#6b7280", 
              fontSize: "12px", 
              fontWeight: "500",
            }}
          >
            Chamada HTTP externa
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #bbf7d0",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <span
            style={{
              backgroundColor: getMethodColor(method),
              color: "#ffffff",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              marginRight: "8px",
            }}
          >
            {method}
          </span>
          {isHovered && (
            <div
              onClick={testApi}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px",
                backgroundColor: "#22c55e",
                color: "white",
                borderRadius: "4px",
                fontSize: "10px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#22c55e";
              }}
            >
              <PlayArrow sx={{ width: "12px", height: "12px" }} />
              {testing ? "Testando..." : "Testar"}
            </div>
          )}
        </div>
        <div 
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "#166534",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "4px",
          }}
        >
          {url || "https://api.exemplo.com"}
        </div>
        {(Object.keys(headers).length > 0 || body) && (
          <div
            style={{
              fontSize: "11px",
              color: "#059669",
              opacity: 0.8,
            }}
          >
            {Object.keys(headers).length > 0 && `${Object.keys(headers).length} headers`}
            {Object.keys(headers).length > 0 && body && " • "}
            {body && "Body presente"}
          </div>
        )}
      </div>

      {/* Resposta da API */}
      {apiResponse && (
        <div
          style={{
            backgroundColor: apiResponse.error ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${apiResponse.error ? '#fecaca' : '#bbf7d0'}`,
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 600, color: apiResponse.error ? '#991b1b' : '#166534', marginBottom: '4px' }}>
            {apiResponse.error ? '❌ Erro na API' : `✅ Status: ${apiResponse.status}`}
          </div>
          {apiResponse.error ? (
            <div style={{ fontSize: '9px', color: '#dc2626' }}>
              {apiResponse.error}
            </div>
          ) : (
            <div style={{ fontSize: '9px', color: '#059669' }}>
              {detectedVariables.length} variáveis detectadas
            </div>
          )}
        </div>
      )}

      {/* Variáveis Salvas */}
      {savedApiVariables.length > 0 && (
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#0c4a6e", marginBottom: "4px" }}>
            <DataObject sx={{ width: "12px", height: "12px", marginRight: "2px", verticalAlign: "middle" }} />
            Variáveis salvas: {savedApiVariables.length}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
            {savedApiVariables.map((variable, index) => (
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
                {variable.path || variable.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variáveis Disponíveis */}
      {variables.length > 0 && (
        <div
          style={{
            backgroundColor: "#fafafa",
            border: "1px solid #e5e7eb",
            padding: "8px",
            borderRadius: "6px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "9px", fontWeight: 600, color: "#374151", marginBottom: "3px" }}>
            <Code sx={{ width: "10px", height: "10px", marginRight: "2px", verticalAlign: "middle" }} />
            Use variáveis: {`{{variavel}}`}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
            {variables.slice(0, 4).map((variable, index) => (
              <span
                key={index}
                style={{
                  fontSize: "7px",
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                  padding: "1px 3px",
                  borderRadius: "2px",
                  fontWeight: 500,
                }}
              >
                {`{{${variable.name}}}`}
              </span>
            ))}
            {variables.length > 4 && (
              <span style={{ fontSize: "7px", color: "#9ca3af" }}>
                +{variables.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

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
          <Http sx={{ width: "12px", height: "12px", marginRight: "4px" }} />
          Componente API
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          width: "16px",
          height: "16px",
          right: "-10px",
          top: "50%",
          cursor: 'pointer',
          border: "3px solid #ffffff",
          boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
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

      {/* Modal de Seleção de Variáveis */}
      {showVariableSelector && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowVariableSelector(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                🎯 Variáveis Detectadas
              </h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                Selecione as variáveis que deseja salvar para usar no fluxo
              </p>
            </div>

            {/* Botões de Ação Rápida */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={selectAllVariables}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✓ Selecionar Todas
              </button>
              <button
                onClick={deselectAllVariables}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✗ Limpar Seleção
              </button>
            </div>

            {/* Lista de Variáveis */}
            <div style={{ marginBottom: '20px', maxHeight: '400px', overflow: 'auto' }}>
              {detectedVariables.map((variable, index) => (
                <div
                  key={index}
                  onClick={() => toggleVariableSelection(index)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: variable.selected ? '#f0fdf4' : '#f9fafb',
                    border: `2px solid ${variable.selected ? '#22c55e' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <input
                      type="checkbox"
                      checked={variable.selected}
                      onChange={() => {}}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>
                      {`{{${variable.name}}}`}
                    </span>
                    <span
                      style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {variable.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginLeft: '24px' }}>
                    Caminho: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>{variable.path}</code>
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginLeft: '24px', marginTop: '4px' }}>
                    Exemplo: <strong>{String(variable.value).substring(0, 50)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowVariableSelector(false)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveSelectedVariables}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                💾 Salvar Selecionadas ({detectedVariables.filter(v => v.selected).length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
