export type NotifType = "info" | "success" | "warning" | "error";

export interface NotifEntry {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  read: boolean;
  createdAt: string;
}

export interface NewNotifPayload {
  title: string;
  message: string;
  type: NotifType;
}
