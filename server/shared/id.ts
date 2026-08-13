export type GenerateId = () => string;

export const generateId: GenerateId = () => crypto.randomUUID();
