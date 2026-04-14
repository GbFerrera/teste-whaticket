import { Request, Response } from "express";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import {
  enableCoexistence,
  checkAppStatus,
  syncCoexistence
} from "../services/WhatsappCoexistence/CoexistenceService";
import {
  updateRoutingStrategy,
  resolveMessageDestination,
  RoutingRule
} from "../services/WhatsappCoexistence/MessageRoutingService";

export const enable = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const {
    phoneNumberId,
    wabaId,
    permanentToken,
    routingMode,
    routingRules
  } = req.body;

  const whatsapp = await enableCoexistence({
    whatsappId,
    companyId,
    phoneNumberId,
    wabaId,
    permanentToken,
    routingMode,
    routingRules
  });

  return res.status(200).json(whatsapp);
};

export const status = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const result = await checkAppStatus({ whatsappId, companyId });

  return res.status(200).json(result);
};

export const sync = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { force = false } = req.body;

  const result = await syncCoexistence({ whatsappId, companyId, force });

  return res.status(200).json(result);
};

export const getRouting = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  return res.status(200).json({
    enabled: whatsapp.coexistenceEnabled,
    mode: whatsapp.messageRoutingMode,
    rules: whatsapp.routingRules || [],
    businessAppConnected: whatsapp.businessAppConnected,
    lastCoexistenceSync: whatsapp.lastCoexistenceSync
  });
};

export const updateRouting = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { mode, rules } = req.body as {
    mode: "automatic" | "manual" | "balanced";
    rules?: RoutingRule[];
  };

  const whatsapp = await updateRoutingStrategy({
    whatsappId,
    companyId,
    mode,
    rules: rules || null
  });

  return res.status(200).json({
    mode: whatsapp.messageRoutingMode,
    rules: whatsapp.routingRules || []
  });
};

export const simulateRouting = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { messageBody, metadata } = req.body;

  if (!messageBody) {
    return res.status(400).json({ error: "messageBody is required" });
  }

  const destination = await resolveMessageDestination(
    whatsappId,
    companyId,
    messageBody,
    metadata
  );

  return res.status(200).json({ destination });
};
