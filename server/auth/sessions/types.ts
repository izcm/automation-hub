export type AuthSession<TPrincipalId = string> = {
  id: string;
  subject: TPrincipalId;
  expiresAt: Date;
};

export type AuthSessionPort<TPrincipalId = string> = {
  save(session: AuthSession<TPrincipalId>): Promise<void>;
  get(id: string): Promise<AuthSession<TPrincipalId> | null>;
  delete(id: string): Promise<void>;
};
