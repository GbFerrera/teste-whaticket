import { Request, Response } from "express";
import { getGoogleAuthUrl, getTokensFromCode } from "../helpers/googleCalendarClient";
import UpsertIntegrationService from "../services/GoogleCalendar/UpsertIntegrationService";
import GetIntegrationService from "../services/GoogleCalendar/GetIntegrationService";
import GoogleCalendarIntegration from "../models/GoogleCalendarIntegration";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "openid",
  "email",
  "profile"
];

export const getAuthUrl = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;

  const state = `${userId}-${companyId}`;
  const url = getGoogleAuthUrl(SCOPES, state);

  return res.status(200).json({ url });
};

export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;

    console.log("DEBUG Google OAuth Callback - code:", code ? "present" : "missing");
    console.log("DEBUG Google OAuth Callback - state:", state);

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing code" });
      return;
    }

    // Para compatibilidade com integrações antigas, verificar se state é apenas companyId
    let userIdFromState, companyIdFromState;
    
    if (state && !(state as string).includes("-")) {
      // Formato antigo: apenas companyId
      companyIdFromState = state;
      userIdFromState = null;
      console.log("DEBUG Google OAuth Callback - Usando formato antigo (apenas companyId)");
    } else {
      // Formato novo: userId-companyId
      [userIdFromState, companyIdFromState] = state ? (state as string).split("-") : [null, null];
      console.log("DEBUG Google OAuth Callback - Usando formato novo (userId-companyId)");
    }
    
    if (!companyIdFromState) {
      res.status(400).json({ error: "Missing companyId in state" });
      return;
    }

    const tokens = await getTokensFromCode(code);

    let googleUserId = "";
    let email = "";

    if (tokens.id_token) {
      try {
        const [, payload] = (tokens.id_token as string).split(".");
        const decoded: any = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
        googleUserId = decoded.sub || "";
        email = decoded.email || "";
      } catch (e) {
        console.error("Erro ao decodificar id_token do Google", e);
      }
    }

    const accessToken = tokens.access_token as string;
    const refreshToken = (tokens.refresh_token || "") as string;
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // Se não tiver userId, usar null para compatibilidade
    const integrationData: any = {
      companyId: Number(companyIdFromState),
      googleUserId,
      email,
      accessToken,
      refreshToken,
      expiryDate,
      calendarId: "primary"
    };
    
    if (userIdFromState) {
      integrationData.userId = Number(userIdFromState);
    }
    
    console.log("DEBUG Google OAuth Callback - integrationData:", integrationData);
    
    await UpsertIntegrationService(integrationData);

    const redirectUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/integrations/google-calendar/success`
      : "/";

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Erro no oauthCallback do Google Calendar", err);
    res.status(500).json({ error: "Erro ao integrar com Google Calendar" });
  }
};

export const getIntegration = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const integration = await GetIntegrationService(companyId);

  if (!integration) {
    return res.status(200).json(null);
  }

  return res.status(200).json({
    email: integration.email,
    calendarId: integration.calendarId
  });
};

export const getIntegrations = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const integrations = await (GoogleCalendarIntegration as any).findAll({
    where: { companyId },
    include: [
      {
        model: (require("../models/User")).default,
        attributes: ["id", "name", "email"]
      }
    ]
  });

  return res.status(200).json(integrations);
};

export const disconnectIntegration = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  await (GoogleCalendarIntegration as any).destroy({ where: { companyId } });

  return res.status(200).json({ success: true });
};
