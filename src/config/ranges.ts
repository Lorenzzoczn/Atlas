export type DateRangeKey = "hoje" | "7d" | "30d" | "90d";

export const rangeLabels: Record<DateRangeKey, string> = {
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

export const rangeDays: Record<DateRangeKey, number> = {
  hoje: 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};
