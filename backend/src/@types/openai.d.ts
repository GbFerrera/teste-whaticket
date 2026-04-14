export interface IKnowledgeBaseItem {
  id?: string;
  type?: "pdf" | "image" | "link" | string;
  title?: string;
  description?: string;
  url?: string;
  path?: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOpenAi {
  name: string;
  prompt: string;
  voice: string;
  voiceKey: string;
  voiceRegion: string;
  maxTokens: number | string;
  temperature: number | string;
  apiKey: string;
  queueId: number | string | null;
  maxMessages: number | string;
  provider?: string;
  model?: string;
  promptId?: number | null;
  toolsEnabled?: string[] | null;
  knowledgeBase?: IKnowledgeBaseItem[];
}