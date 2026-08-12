export const CHANNEL = ["email"] as const;

export type Channel = (typeof CHANNEL)[number];

export type MessageRequest = {
  to: string;
  channel: Channel;
  subject: string;
  text: string;
  html?: string;
};
