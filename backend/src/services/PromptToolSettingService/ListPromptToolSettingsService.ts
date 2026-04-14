import PromptToolSetting from "../../models/PromptToolSetting";

interface ListPromptToolSettingsRequest {
  companyId: number;
  promptId?: number | null;
}

const ListPromptToolSettingsService = async ({
  companyId,
  promptId
}: ListPromptToolSettingsRequest): Promise<string[] | null> => {
  const normalizedPromptId =
    typeof promptId === "number" && !Number.isNaN(promptId) ? promptId : null;

  const toolNames = await PromptToolSetting.findAll({
    where: {
      companyId,
      promptId: normalizedPromptId,
      enabled: true
    },
    order: [["toolName", "ASC"]]
  });

  if (toolNames.length > 0) {
    return toolNames.map(tool => tool.toolName);
  }

  if (normalizedPromptId !== null) {
    const fallbackTools = await PromptToolSetting.findAll({
      where: {
        companyId,
        promptId: null,
        enabled: true
      },
      order: [["toolName", "ASC"]]
    });

    if (fallbackTools.length > 0) {
      return fallbackTools.map(tool => tool.toolName);
    }
  }

  return null;
};

export default ListPromptToolSettingsService;
