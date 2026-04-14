import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Prompt from "../../models/Prompt";
import ShowPromptService from "./ShowPromptService";
import SavePromptToolSettingsService from "../PromptToolSettingService/SavePromptToolSettingsService";

interface PromptData {
    name: string;
    apiKey: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    queueId?: number;
    maxMessages?: number;
    companyId: string | number;
    voice?: string;
    voiceKey?: string;
    voiceRegion?: string;
    toolsEnabled?: string[];
    knowledgeBase?: any[];
}

const CreatePromptService = async (promptData: PromptData): Promise<Prompt> => {
    console.log("[CreatePromptService] Starting with promptData:", JSON.stringify(promptData, null, 2));
    const { name, apiKey, prompt, queueId, maxMessages, companyId, toolsEnabled, knowledgeBase } = promptData;
    console.log("[CreatePromptService] toolsEnabled:", toolsEnabled);

    const promptSchema = Yup.object().shape({
        name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
        prompt: Yup.string().required("ERR_PROMPT_INTELLIGENCE_INVALID"),
        apiKey: Yup.string().required("ERR_PROMPT_APIKEY_INVALID"),
        queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
        maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID"),
        companyId: Yup.number().required("ERR_PROMPT_companyId_INVALID")
    });

    try {
        await promptSchema.validate({ name, apiKey, prompt, queueId,maxMessages,companyId });
        console.log("[CreatePromptService] Validation passed");
    } catch (err) {
        console.error("[CreatePromptService] Validation error:", err);
        throw new AppError(`${JSON.stringify(err, undefined, 2)}`);
    }

    let promptTable = await Prompt.create({
        ...promptData,
        knowledgeBase: knowledgeBase || []
    });
    console.log("[CreatePromptService] Prompt created with id:", promptTable.id);

    console.log("[CreatePromptService] About to call SavePromptToolSettingsService with:", { companyId, promptId: promptTable.id, toolsEnabled });
    try {
        await SavePromptToolSettingsService({
            companyId: Number(companyId),
            promptId: promptTable.id,
            toolsEnabled
        });
        console.log("[CreatePromptService] SavePromptToolSettingsService completed successfully");
    } catch (err) {
        console.error("[CreatePromptService] Error in SavePromptToolSettingsService:", err);
        throw err;
    }

    promptTable = await ShowPromptService({ promptId: promptTable.id, companyId });
    console.log("[CreatePromptService] Returning prompt with toolsEnabled:", (promptTable as any).toolsEnabled);

    return promptTable;
};

export default CreatePromptService;
