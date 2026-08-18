import { WithTimestamps } from "../types";

export type EmployeeRow = {
  id: string;
  email: string;
} & WithTimestamps;
