import { ObjectId, WithId } from "mongodb";
import { makeReadRepo, makeTsWrite } from "@a2zb/mongo";

import { User } from "@/types/user";

import { UserPort } from "../../users/port";

import { users } from "../collections";
import { UserDoc } from "./user-doc";

// transform _id => id at repo layer
const toUser = ({ _id, ...doc }: WithId<UserDoc>) => ({
  ...doc,
  id: _id.toString(),
});

// Read commons — keyed by id (_id).
const baseRead = makeReadRepo<UserDoc, string, User>(
  users,
  (id) => ({ _id: new ObjectId(id) }),
  toUser,
);

const write = makeTsWrite(users);

export const userRepo: UserPort = {
  // === read ===
  ...baseRead,

  // === write ===
  ensure: async function (email): Promise<{ id: string }> {
    const res = await write.updateOne(
      { email },
      { $setOnInsert: {} },
      { upsert: true },
    );

    const id =
      res.upsertedId?.toString() ??
      (await users().findOne({ email }))?._id?.toString() ??
      "";

    return { id };
  },
};
