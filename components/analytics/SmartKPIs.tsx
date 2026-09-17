import { KPI, type KPIProps } from "./KPI";

type SmartKPIProps = {
  kpis: (KPIProps & {
    key: string;
  })[];
  relevantKeys?: string[];
};

export function SmartKPIs({ kpis, relevantKeys = [] }: SmartKPIProps) {
  const isRelevant = (key: string) =>
    relevantKeys.length === 0 || relevantKeys.includes(key);

  return (
    <>
      {kpis.map((kpi) => (
        <KPI
          {...kpi}
          key={kpi.key}
          color={isRelevant(kpi.key) ? kpi.color : "empty"}
          value={isRelevant(kpi.key) ? kpi.value : "–"}
        />
      ))}
    </>
  );
}
