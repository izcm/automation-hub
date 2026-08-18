export const channels = ["email"] as const;

export type Channel = (typeof channels)[number];

export type MessageRequest = {
  to: string;
  channel: Channel;
  subject: string;
  text: string;
  html?: string;
};
