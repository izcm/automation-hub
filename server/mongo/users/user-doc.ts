import { User } from "@/types/user";
import { WithTimestamps } from "@a2zb/mongo";

export type UserDoc = User & WithTimestamps;
