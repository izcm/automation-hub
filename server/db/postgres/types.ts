import { QueryResult, QueryResultRow } from "pg";

export type WithTimestamps = {
  created_at: number;
  updated_at: number;
};

export type SqlValue =
  | string
  | number
  | boolean
  | Date
  | null
  | string[]
  | number[];

export type QueryFn = <T extends QueryResultRow>(
  text: string,
  params?: SqlValue[],
) => Promise<QueryResult<T>>;
