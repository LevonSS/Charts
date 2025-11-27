import {
  type ExperimentData,
  type NormalizedData,
  type NormalizedPoint,
} from "../types/types";

export function normalizeExperimentData(
  experiment: ExperimentData
): NormalizedData {
  const variationIds = experiment.variations.map((v) =>
    v.id ? String(v.id) : "0"
  );

  const points: NormalizedPoint[] = [];

  for (const day of experiment.data) {
    const keys = new Set<string>([
      ...Object.keys(day.visits || {}),
      ...Object.keys(day.conversions || {}),
    ]);

    for (const vid of keys) {
      const visits = Number(day.visits?.[vid] ?? 0);
      const conversions = Number(day.conversions?.[vid] ?? 0);

      points.push({
        date: day.date,
        variationId: vid,
        visits,
        conversions,
      });
    }
  }

  return { variationIds, points };
}
