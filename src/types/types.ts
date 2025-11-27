export interface Variation {
  id: number;
  name: string;
}

export interface DayData {
  date: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
}

export interface ExperimentData {
  variations: Variation[];
  data: DayData[];
}

export interface NormalizedData {
  variationIds: string[];
  points: NormalizedPoint[];
}

export interface NormalizedPoint {
  date: string;
  variationId: string;
  visits: number;
  conversions: number;
}

export type ChartPoint = {
  date: string;
} & {
  [key: string]: number | string;
};

export type ViewMode = "day" | "week";
export type LineStyle = "line" | "smooth" | "area";
