import axios from "axios";
import { createHmac } from "crypto";
import logger from "../../utils/logger";

interface TriggerWebhookParams {
  url: string | null;
  secret: string | null;
  event: string;
  data: any;
}

const triggerExternalWebhook = async ({
  url,
  secret,
  event,
  data
}: TriggerWebhookParams): Promise<void> => {
  if (!url) {
    return;
  }

  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (secret) {
      const signature = createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      headers["X-Webhook-Signature"] = signature;
    }

    await axios.post(url, payload, {
      headers,
      timeout: 5000
    });
  } catch (error) {
    logger.error({ error }, "Erro ao disparar webhook externo");
  }
};

export default triggerExternalWebhook;
