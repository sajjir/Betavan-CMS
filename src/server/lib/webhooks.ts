import { prisma } from "../db.js";

export async function fireWebhook(event: string, payload: object) {
  try {
    const configs = await prisma.webhookConfig.findMany({ where: { event, enabled: true } });
    if (configs.length === 0) return;

    for (const config of configs) {
      try {
        const res = await fetch(config.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, data: payload, sentAt: new Date().toISOString() }),
        });
        const responseText = await res.text();
        await prisma.webhookLog.create({
          data: { 
            event, 
            url: config.url, 
            statusCode: res.status, 
            success: res.ok,
            responseBody: responseText.slice(0, 500) 
          },
        });
      } catch (err) {
        await prisma.webhookLog.create({
          data: { 
            event, 
            url: config.url, 
            success: false, 
            responseBody: String(err).slice(0, 500) 
          },
        });
      }
    }
  } catch (globalErr) {
    console.error("Failed to fire webhook:", globalErr);
  }
}
