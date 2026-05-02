import { Request, Response } from "express";
import { NotifService } from "../service/notification.service";
import { Log } from "../middleware/logger";

export const NotifController = {
  async create(req: Request, res: Response): Promise<void> {
    await Log("backend", "info", "handler", "POST /api/notifications received");
    const { title, message, type } = req.body;

    if (!title || !message || !type) {
      await Log("backend", "warn", "handler", "Missing required fields in create notification");
      res.status(400).json({ error: "title, message, and type are required" });
      return;
    }

    try {
      const newEntry = await NotifService.create({ title, message, type });
      res.status(201).json(newEntry);
    } catch (err) {
      await Log("backend", "error", "handler", `Failed to create notification: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    await Log("backend", "info", "handler", "GET /api/notifications received");
    try {
      const allEntries = await NotifService.getAll();
      res.status(200).json(allEntries);
    } catch (err) {
      await Log("backend", "error", "handler", `Failed to fetch notifications: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getOne(req: Request, res: Response): Promise<void> {
    await Log("backend", "info", "handler", `GET /api/notifications/${req.params.notifId} received`);
    try {
      const foundEntry = await NotifService.getOne(req.params.notifId);
      if (!foundEntry) {
        await Log("backend", "warn", "handler", `Notification not found: ${req.params.notifId}`);
        res.status(404).json({ error: "Notification not found" });
        return;
      }
      res.status(200).json(foundEntry);
    } catch (err) {
      await Log("backend", "error", "handler", `Failed to fetch notification: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async markRead(req: Request, res: Response): Promise<void> {
    await Log("backend", "info", "handler", `PATCH /api/notifications/${req.params.notifId} received`);
    try {
      const updatedEntry = await NotifService.markRead(req.params.notifId);
      if (!updatedEntry) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }
      res.status(200).json(updatedEntry);
    } catch (err) {
      await Log("backend", "error", "handler", `Failed to mark notification as read: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async remove(req: Request, res: Response): Promise<void> {
    await Log("backend", "info", "handler", `DELETE /api/notifications/${req.params.notifId} received`);
    try {
      const wasRemoved = await NotifService.destroy(req.params.notifId);
      if (!wasRemoved) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }
      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
      await Log("backend", "error", "handler", `Failed to delete notification: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
