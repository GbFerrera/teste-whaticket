import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Prompt from "../../models/Prompt";
import ShowPromptService from "./ShowPromptService";
import SavePromptToolSettingsService from "../PromptToolSettingService/SavePromptToolSettingsService";

interface PromptData {
    id?: number;
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
    provider?: string;
    model?: string;
    toolsEnabled?: string[];
    knowledgeBase?: any[];
}

interface Request {
    promptData: PromptData;
    promptId: string | number;
    companyId: string | number;
}

const UpdatePromptService = async ({
    promptId,
    promptData,
    companyId
}: Request): Promise<Prompt | undefined> => {
    const promptTable = await ShowPromptService({ promptId: promptId, companyId });

    const promptSchema = Yup.object().shape({
        name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
        prompt: Yup.string().required("ERR_PROMPT_PROMPT_INVALID"),
        apiKey: Yup.string().required("ERR_PROMPT_APIKEY_INVALID"),
        queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
        maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID"),
        provider: Yup.string().oneOf(['openai', 'gemini']).required("ERR_PROMPT_PROVIDER_INVALID"),
        model: Yup.string().required("ERR_PROMPT_MODEL_INVALID")
    });

    const { name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, voice, voiceKey, voiceRegion, provider, model, toolsEnabled, knowledgeBase } = promptData;

    try {
        await promptSchema.validate({ name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, provider, model });
    } catch (err) {
        throw new AppError(`${JSON.stringify(err, undefined, 2)}`);
    }

    await promptTable.update({ name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, voice, voiceKey, voiceRegion, provider, model, knowledgeBase: knowledgeBase || [] });

    console.log("[UpdatePromptService] About to call SavePromptToolSettingsService with:", { companyId, promptId, toolsEnabled });
    
    try {
        await SavePromptToolSettingsService({
            companyId: Number(companyId),
            promptId: Number(promptId),
            toolsEnabled
        });
        console.log("[UpdatePromptService] SavePromptToolSettingsService completed successfully");
    } catch (err) {
        console.error("[UpdatePromptService] Error in SavePromptToolSettingsService:", err);
        throw err;
    }

    return ShowPromptService({ promptId, companyId });
};

export default UpdatePromptService;