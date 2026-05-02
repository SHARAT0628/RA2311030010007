import { v4 as generateId } from "uuid";
import { NotifEntry, NewNotifPayload } from "../domain/notification";

const notifStore = new Map<string, NotifEntry>();

export const NotifRepo = {
  create(inputData: NewNotifPayload): NotifEntry {
    const freshEntry: NotifEntry = {
      id: generateId(),
      title: inputData.title,
      message: inputData.message,
      type: inputData.type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifStore.set(freshEntry.id, freshEntry);
    return freshEntry;
  },

  fetchAll(): NotifEntry[] {
    return Array.from(notifStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  fetchOne(notifId: string): NotifEntry | undefined {
    return notifStore.get(notifId);
  },

  setRead(notifId: string): NotifEntry | undefined {
    const target = notifStore.get(notifId);
    if (!target) return undefined;
    target.read = true;
    notifStore.set(notifId, target);
    return target;
  },

  remove(notifId: string): boolean {
    return notifStore.delete(notifId);
  },
};
