import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { graphRequest, extractGraphError } from "./graphApiHelper";

export type CoexistenceRoutingMode = "automatic" | "manual" | "balanced";

interface BaseParams {
  whatsappId: number | string;
  companyId: number;
}

interface EnableCoexistenceParams extends BaseParams {
  phoneNumberId: string;
  wabaId: string;
  permanentToken: string;
  routingMode?: CoexistenceRoutingMode;
  routingRules?: Record<string, any> | null;
}

interface SyncCoexistenceParams extends BaseParams {
  force?: boolean;
}

export const enableCoexistence = async ({
  whatsappId,
  companyId,
  phoneNumberId,
  wabaId,
  permanentToken,
  routingMode = "automatic",
  routingRules = null
}: EnableCoexistenceParams): Promise<Whatsapp> => {
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  try {
    await graphRequest(permanentToken, "post", `${phoneNumberId}/enable_coexistence`, {
      waba_id: wabaId,
      coexistence: {
        mode: routingMode,
        enable_app: true,
        enable_api: true
      }
    });
  } catch (error) {
    throw new AppError(`ERR_COEXISTENCE_ENABLE: ${extractGraphError(error)}`);
  }

  await whatsapp.update({
    coexistenceEnabled: true,
    coexistencePhoneNumberId: phoneNumberId,
    coexistenceWabaId: wabaId,
    coexistencePermanentToken: permanentToken,
    messageRoutingMode: routingMode,
    routingRules: routingRules || null
  });

  return whatsapp;
};

export const checkAppStatus = async ({
  whatsappId,
  companyId
}: BaseParams): Promise<{ appConnected: boolean; apiConnected: boolean; lastSync?: string | null }> => {
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  if (!whatsapp.coexistencePhoneNumberId || !whatsapp.coexistencePermanentToken) {
    throw new AppError("ERR_COEXISTENCE_MISSING_CREDENTIALS", 400);
  }

  try {
    const status = await graphRequest<{ app_connected: boolean; api_connected: boolean; last_sync?: string }>(
      whatsapp.coexistencePermanentToken,
      "get",
      `${whatsapp.coexistencePhoneNumberId}/coexistence_status`
    );

    await whatsapp.update({
      businessAppConnected: status.app_connected,
      lastCoexistenceSync: status.last_sync ? new Date(status.last_sync) : whatsapp.lastCoexistenceSync
    });

    return {
      appConnected: status.app_connected,
      apiConnected: status.api_connected,
      lastSync: status.last_sync || whatsapp.lastCoexistenceSync?.toISOString() || null
    };
  } catch (error) {
    throw new AppError(`ERR_COEXISTENCE_STATUS: ${extractGraphError(error)}`);
  }
};

export const syncCoexistence = async ({
  whatsappId,
  companyId,
  force = false
}: SyncCoexistenceParams): Promise<{ synced: boolean; forced: boolean }> => {
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  if (!whatsapp.coexistencePhoneNumberId || !whatsapp.coexistencePermanentToken) {
    throw new AppError("ERR_COEXISTENCE_MISSING_CREDENTIALS", 400);
  }

  try {
    await graphRequest(
      whatsapp.coexistencePermanentToken,
      "post",
      `${whatsapp.coexistencePhoneNumberId}/coexistence_sync`,
      {
        waba_id: whatsapp.coexistenceWabaId,
        force
      }
    );

    await whatsapp.update({ lastCoexistenceSync: new Date() });

    return { synced: true, forced: force };
  } catch (error) {
    throw new AppError(`ERR_COEXISTENCE_SYNC: ${extractGraphError(error)}`);
  }
};
