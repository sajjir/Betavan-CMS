import { Request, Response } from "express";
import { prisma } from "../db.js";

// GET /api/webhooks (admin) — list configs
export async function getConfigs(req: Request, res: Response) {
  try {
    const configs = await prisma.webhookConfig.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json(configs);
  } catch (error: any) {
    console.error("Get webhook configs error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/webhooks (admin) — create config
export async function createConfig(req: Request, res: Response) {
  try {
    const { event, url, enabled } = req.body;

    if (!event || !url) {
      return res.status(400).json({ error: "Event and URL are required" });
    }

    const allowedEvents = ["order.paid", "post.published"];
    if (!allowedEvents.includes(event)) {
      return res.status(400).json({ error: "Invalid webhook event type" });
    }

    const config = await prisma.webhookConfig.create({
      data: {
        event,
        url,
        enabled: enabled !== undefined ? !!enabled : true
      }
    });

    return res.status(201).json(config);
  } catch (error: any) {
    console.error("Create webhook config error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /api/webhooks/:id (admin) — update (toggle enabled, change URL)
export async function updateConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { url, enabled } = req.body;

    const existing = await prisma.webhookConfig.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Webhook config not found" });
    }

    const updateData: any = {};
    if (url !== undefined) updateData.url = url;
    if (enabled !== undefined) updateData.enabled = !!enabled;

    const updated = await prisma.webhookConfig.update({
      where: { id },
      data: updateData
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("Update webhook config error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /api/webhooks/:id (admin) — delete config
export async function deleteConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.webhookConfig.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Webhook config not found" });
    }

    await prisma.webhookConfig.delete({
      where: { id }
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete webhook config error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/webhooks/logs (admin) — last N logs, newest first
export async function getLogs(req: Request, res: Response) {
  try {
    const { limit = "50" } = req.query;
    const limitNum = parseInt(String(limit)) || 50;

    const logs = await prisma.webhookLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limitNum
    });

    return res.json(logs);
  } catch (error: any) {
    console.error("Get webhook logs error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
