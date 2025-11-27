import json from "../data/data.json";
import { type ExperimentData } from "../types/types";

export const experimentData = json as ExperimentData;

export const variationNames = Object.fromEntries(
  experimentData.variations.map((v) => [String(v.id), v.name])
);
