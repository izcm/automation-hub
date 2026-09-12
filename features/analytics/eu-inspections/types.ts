// re-exported so files under features/analytics/eu-inspections only ever
// import from within their own subtree ("../../types"), never reaching
// directly into @/features/eu-inspections themselves.
export type { EuInspectionRow } from "@/features/eu-inspections";
