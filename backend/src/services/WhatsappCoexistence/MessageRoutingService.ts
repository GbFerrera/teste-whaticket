import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { CoexistenceRoutingMode } from "./CoexistenceService";

export interface RoutingRule {
  id: string;
  description?: string;
  conditions: Record<string, any>;
  destination: "api" | "app";
}

interface UpdateRoutingParams {
  whatsappId: number | string;
  companyId: number;
  mode: CoexistenceRoutingMode;
  rules?: RoutingRule[] | null;
}

export const updateRoutingStrategy = async ({
  whatsappId,
  companyId,
  mode,
  rules = null
}: UpdateRoutingParams): Promise<Whatsapp> => {
  if (!["automatic", "manual", "balanced"].includes(mode)) {
    throw new AppError("ERR_INVALID_ROUTING_MODE", 400);
  }

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  await whatsapp.update({
    messageRoutingMode: mode,
    routingRules: rules || null
  });

  return whatsapp;
};

export const resolveMessageDestination = async (
  whatsappId: number | string,
  companyId: number,
  messageBody: string,
  metadata?: Record<string, any>
): Promise<"api" | "app"> => {
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  if (!whatsapp.coexistenceEnabled) {
    return "api";
  }

  switch (whatsapp.messageRoutingMode) {
    case "manual":
      return applyManualRules(
        (whatsapp.routingRules as RoutingRule[] | null) || null,
        messageBody,
        metadata
      );
    case "balanced":
      return applyBalancedStrategy(metadata);
    case "automatic":
    default:
      return applyAutomaticStrategy(messageBody, metadata);
  }
};

const applyManualRules = (
  rules: RoutingRule[] | null,
  messageBody: string,
  metadata?: Record<string, any>
): "api" | "app" => {
  if (!rules || rules.length === 0) return "api";

  for (const rule of rules) {
    if (matchConditions(rule.conditions, messageBody, metadata)) {
      return rule.destination;
    }
  }

  return "api";
};

const matchConditions = (
  conditions: Record<string, any>,
  messageBody: string,
  metadata?: Record<string, any>
): boolean => {
  if (conditions.keywords) {
    const keywords: string[] = Array.isArray(conditions.keywords)
      ? conditions.keywords
      : String(conditions.keywords).split(",");

    const normalizedBody = messageBody.toLowerCase();
    if (keywords.some(keyword => normalizedBody.includes(keyword.trim().toLowerCase()))) {
      return true;
    }
  }

  if (conditions.queueId && metadata?.queueId) {
    if (String(metadata.queueId) === String(conditions.queueId)) {
      return true;
    }
  }

  if (conditions.period && conditions.period.start && conditions.period.end) {
    const now = new Date();
    const start = parseTime(conditions.period.start);
    const end = parseTime(conditions.period.end);

    if (now >= start && now <= end) {
      return true;
    }
  }

  return false;
};

const applyBalancedStrategy = (metadata?: Record<string, any>): "api" | "app" => {
  if (metadata?.ticketLoad) {
    return metadata.ticketLoad > 0.5 ? "app" : "api";
  }

  const hour = new Date().getHours();
  return hour >= 8 && hour <= 18 ? "api" : "app";
};

const applyAutomaticStrategy = (
  messageBody: string,
  metadata?: Record<string, any>
): "api" | "app" => {
  const keywords = ["preço", "comprar", "assinar", "orçamento", "venda", "contratar"];
  const normalizedBody = messageBody.toLowerCase();

  if (keywords.some(keyword => normalizedBody.includes(keyword))) {
    return "api";
  }

  if (metadata?.sentiment === "negative") {
    return "app";
  }

  return "app";
};

const parseTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(":" ).map(Number);
  const now = new Date();
  now.setHours(hours, minutes || 0, 0, 0);
  return now;
};
