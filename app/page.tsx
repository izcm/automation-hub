import { DashboardView } from "@/features/dashboards/ui/DashboardView";

export default async function Page() {
  // TODO: fetch per-module dashboard data server-side here, same pattern
  // as app/eu-inspections/page.tsx
  const dashboardData = {};

  return <DashboardView dashboardData={dashboardData} />;
}
