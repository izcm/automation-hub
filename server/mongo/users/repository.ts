import { WithId } from "mongodb";
import { makeReadRepo, makeTsWrite } from "@a2zb/mongo";

import { User } from "@/types/user";

import { UserPort } from "../../users/port";

import { users } from "../collections";
import { UserDoc } from "./user-doc";

// transform _id => id at repo layer
const toUser = ({ _id, ...doc }: WithId<UserDoc>) => ({
  ...doc,
});

// Read commons — keyed by our own `id` field (not Mongo's `_id`).
const baseRead = makeReadRepo<UserDoc, string, User>(
  users,
  (id) => ({ id }),
  toUser,
);

const write = makeTsWrite(users);

export const userRepo: UserPort = {
  // === read ===
  ...baseRead,

  // === write ===
  ensure: async function (email, id): Promise<{ id: string }> {
    const res = await write.updateOne(
      { email },
      { $setOnInsert: { id } },
      { upsert: true },
    );

    // inserted -> the id we assigned; matched -> its stored id
    const resolvedId = res.upsertedCount
      ? id
      : ((await users().findOne({ email }))?.id ?? "");

    return { id: resolvedId };
  },
};
