import { NotifRepo } from "../repository/notification.repository";
import { NewNotifPayload, NotifEntry } from "../domain/notification";
import { Log } from "../middleware/logger";

export const NotifService = {
  async create(inputPayload: NewNotifPayload): Promise<NotifEntry> {
    await Log("backend", "info", "service", `Creating notification: ${inputPayload.title}`);
    const createdEntry = NotifRepo.create(inputPayload);
    await Log("backend", "info", "service", `Notification created with id: ${createdEntry.id}`);
    return createdEntry;
  },

  async getAll(): Promise<NotifEntry[]> {
    await Log("backend", "debug", "service", "Fetching all notifications");
    return NotifRepo.fetchAll();
  },

  async getOne(notifId: string): Promise<NotifEntry | undefined> {
    await Log("backend", "debug", "service", `Fetching notification by id: ${notifId}`);
    return NotifRepo.fetchOne(notifId);
  },

  async markRead(notifId: string): Promise<NotifEntry | undefined> {
    await Log("backend", "info", "service", `Marking notification as read: ${notifId}`);
    return NotifRepo.setRead(notifId);
  },

  async destroy(notifId: string): Promise<boolean> {
    await Log("backend", "info", "service", `Deleting notification: ${notifId}`);
    return NotifRepo.remove(notifId);
  },
};
