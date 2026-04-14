import { FlowBuilderModel } from "../../models/FlowBuilder";
import ListPromptToolSettingsService from "../PromptToolSettingService/ListPromptToolSettingsService";

type FlowNode = {
  data?: {
    typebotIntegration?: {
      iaId?: number | string;
      toolsEnabled?: string[] | null;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
};

const normalizePromptId = (value: any): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const collectPromptIds = (nodes: FlowNode[] = []): number[] => {
  const ids = nodes
    .map(node => normalizePromptId(node?.data?.typebotIntegration?.iaId))
    .filter((id): id is number => id !== null);

  return Array.from(new Set(ids));
};

const attachToolsToNodes = (
  nodes: FlowNode[] = [],
  toolsByPromptId: Map<number, string[] | null>
) => {
  nodes.forEach(node => {
    const iaId = normalizePromptId(node?.data?.typebotIntegration?.iaId);
    if (iaId === null) {
      return;
    }

    const toolsEnabled = toolsByPromptId.get(iaId) || [];

    if (!node.data) {
      node.data = {};
    }

    if (!node.data.typebotIntegration) {
      node.data.typebotIntegration = {};
    }

    node.data.typebotIntegration.toolsEnabled = toolsEnabled || [];
  });
};

const AttachToolsEnabledToFlow = async (
  flow: FlowBuilderModel,
  companyId: number
): Promise<void> => {
  if (!flow) {
    return;
  }

  const flowData = flow.get("flow") as { nodes?: FlowNode[] } | null;

  if (!flowData?.nodes || flowData.nodes.length === 0) {
    return;
  }

  const promptIds = collectPromptIds(flowData.nodes);

  if (promptIds.length === 0) {
    return;
  }

  const toolsByPromptId = new Map<number, string[] | null>();

  for (const promptId of promptIds) {
    const toolsEnabled = await ListPromptToolSettingsService({
      companyId,
      promptId
    });
    toolsByPromptId.set(promptId, toolsEnabled);
  }

  attachToolsToNodes(flowData.nodes, toolsByPromptId);

  flow.setDataValue("flow", flowData);
};

export default AttachToolsEnabledToFlow;
