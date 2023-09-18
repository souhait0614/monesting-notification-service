export interface Frequency {
  year: number;
  month: number;
  day: number;
}

export interface Notification {
  id: string;
  label: string;
  price: number;
  currency: string;
  start: string;
  frequency: Frequency;
  send: number;
}

export interface NotificationData {
  formatVersion: 1;
  enabled: boolean;
  notifications: Notification[];
}
