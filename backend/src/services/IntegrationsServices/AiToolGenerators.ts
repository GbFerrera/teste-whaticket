import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { AI_TOOL_CATALOG, AiToolName } from "./AiToolCatalog";

export type OpenAiToolDeclaration = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: any;
  };
};

export const buildOpenAiToolDeclarationsFromCatalog = (): OpenAiToolDeclaration[] => {
  return AI_TOOL_CATALOG.filter(tool => tool.providers.includes("openai")).map(tool => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.openaiParameters || {
        type: "object",
        properties: {},
        additionalProperties: true
      }
    }
  }));
};

export const buildGeminiToolDeclarationsFromCatalog = (): FunctionDeclaration[] => {
  return AI_TOOL_CATALOG.filter(tool => tool.providers.includes("gemini")).map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.geminiParameters || {
      type: SchemaType.OBJECT,
      properties: {},
      required: []
    }
  }));
};

export const listCatalogToolNames = (): AiToolName[] => AI_TOOL_CATALOG.map(tool => tool.name);
