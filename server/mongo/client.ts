import { MongoClient } from "mongodb";

// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
declare global {
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME ?? "miniapp_db";

if (!uri) throw new Error("Missing MONGODB_URI");

// IMPORTANT
// The Node.js driver automatically calls MongoClient.connect() the first time
// you use the client for a CRUD operation — so we don't need to call connect()
// ourselves. Call it explicitly only if you want to verify the connection up front.
// https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/
const createClient = () => {
  console.log("🤵 NEW MongoClient CREATED");
  return new MongoClient(uri);
};

const client =
  process.env.NODE_ENV === "development"
    ? (globalThis._mongoClient ??= createClient())
    : createClient();

export const db = client.db(dbName);
