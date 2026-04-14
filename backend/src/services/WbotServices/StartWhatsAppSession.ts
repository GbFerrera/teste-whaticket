import { initWASocket } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";

let useVoiceCallsBaileys: any = null;
try {
  useVoiceCallsBaileys = require("voice-calls-baileys").default || require("voice-calls-baileys").useVoiceCallsBaileys;
} catch (e) {
  logger.warn("[WAVoIP] voice-calls-baileys não encontrado, chamadas de voz desabilitadas");
}

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  try {
    const wbot = await initWASocket(whatsapp);
   
    if (wbot.id) {
      wbotMessageListener(wbot, companyId);
      wbotMonitor(wbot, whatsapp, companyId);

      // Integrar WAVoIP Voice Calls se token configurado
      if (useVoiceCallsBaileys && whatsapp.wavoip) {
        try {
          await useVoiceCallsBaileys(
            whatsapp.wavoip,
            wbot,
            "atendzappy",
            "open",
            true
          );
          logger.info(`[WAVoIP] Voice calls ativado para WhatsApp ${whatsapp.name} (company ${companyId})`);
        } catch (voipErr) {
          logger.error(`[WAVoIP] Erro ao iniciar voice calls: ${voipErr.message}`);
        }
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};
