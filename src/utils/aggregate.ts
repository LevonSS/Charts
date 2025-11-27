import { type NormalizedData, type ChartPoint } from "../types/types";

function getWeekNumber(dateStr: string) {
  const date = new Date(dateStr);

  const onejan = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date.getTime() - onejan.getTime()) / 86400000);
  const week = Math.ceil((diff + onejan.getDay() + 1) / 7);
  return week;
}

export function aggregateWeekly(data: NormalizedData): ChartPoint[] {
  const weekBuckets: Record<
    string,
    Record<string, { visits: number; conversions: number }>
  > = {};

  for (const p of data.points) {
    const weekNum = getWeekNumber(p.date);
    const year = new Date(p.date).getFullYear();
    const weekKey = `${year}-W${String(weekNum).padStart(2, "0")}`;

    if (!weekBuckets[weekKey]) weekBuckets[weekKey] = {};
    if (!weekBuckets[weekKey][p.variationId]) {
      weekBuckets[weekKey][p.variationId] = { visits: 0, conversions: 0 };
    }

    weekBuckets[weekKey][p.variationId].visits += p.visits;
    weekBuckets[weekKey][p.variationId].conversions += p.conversions;
  }

  const chartData: ChartPoint[] = [];

  for (const [weekKey, variations] of Object.entries(weekBuckets)) {
    const [yearStr, weekStr] = weekKey.split("-W");
    const year = Number(yearStr);
    const week = Number(weekStr);

    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const ISOweekStart = new Date(simple);

    if (dow <= 4) {
      ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    } else {
      ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    }

    const dateStr = ISOweekStart.toISOString().split("T")[0];

    const row: ChartPoint = { date: dateStr };

    for (const variationId of data.variationIds) {
      const record = variations[variationId];
      if (!record) continue;

      const rate =
        record.visits === 0 ? 0 : (record.conversions / record.visits) * 100;
      row[`conversionRate_${variationId}`] = Number(rate.toFixed(2));
    }

    chartData.push(row);
  }

  chartData.sort((a, b) => (a.date > b.date ? 1 : -1));

  return chartData;
}
