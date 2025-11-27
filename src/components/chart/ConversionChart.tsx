import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Area,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { toPng } from "html-to-image";
import { type ChartPoint, type NormalizedData } from "../../types/types";
import { aggregateWeekly } from "../../utils/aggregate";
import { experimentData, variationNames } from "../../utils/loadData";
import { normalizeExperimentData } from "../../utils/normalize";
import styles from "./Chart.module.scss";
import { ChartControls } from "./ChartControls";
import { ThemeToggle } from "./ThemeToggle";

const normalized: NormalizedData = normalizeExperimentData(experimentData);

function buildDailyChartPoints(norm: NormalizedData): ChartPoint[] {
  const dates = Array.from(new Set(norm.points.map((p) => p.date))).sort();
  const byDate: Record<
    string,
    Record<string, { visits: number; conversions: number }>
  > = {};

  for (const p of norm.points) {
    if (!byDate[p.date]) byDate[p.date] = {};
    if (!byDate[p.date][p.variationId])
      byDate[p.date][p.variationId] = { visits: 0, conversions: 0 };

    byDate[p.date][p.variationId].visits += p.visits;
    byDate[p.date][p.variationId].conversions += p.conversions;
  }

  const rows: ChartPoint[] = [];

  for (const date of dates) {
    const row: ChartPoint = { date };
    for (const vid of norm.variationIds) {
      const rec = byDate[date]?.[vid];
      if (!rec) continue;
      const rate = rec.visits === 0 ? 0 : (rec.conversions / rec.visits) * 100;
      row[`conversionRate_${vid}`] = Number(rate.toFixed(2));
    }
    rows.push(row);
  }

  return rows;
}

export const ConversionChart: React.FC = () => {
  const [brushIndexes, setBrushIndexes] = useState<[number, number] | null>(
    null
  );
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lineStyle, setLineStyle] = useState<"line" | "smooth" | "area">(
    "smooth"
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const variationIds = normalized.variationIds;
  const [selected, setSelected] = useState<string[]>(variationIds.slice());
  const [mode, setMode] = useState<"day" | "week">("day");
  useEffect(() => {
    if (!activeData.length) return;
    setBrushIndexes([0, activeData.length - 1]);
  }, [mode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  const dailyPoints = useMemo(
    () => buildDailyChartPoints(normalized),
    [normalized]
  );
  const weeklyPoints = useMemo(() => aggregateWeekly(normalized), [normalized]);

  const activeData = mode === "day" ? dailyPoints : weeklyPoints;

  const handleToggle = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);
  const resetZoom = () => {
    if (!activeData.length) return;
    setBrushIndexes([0, activeData.length - 1]);
  };
  const yDomain = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const row of activeData) {
      for (const vid of selected) {
        const val = row[`conversionRate_${vid}`] as number | undefined;
        if (typeof val === "number") {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }

    if (!isFinite(min) || !isFinite(max)) {
      return [0, 1];
    }

    const pad = (max - min) * 0.12 || 1;
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  }, [activeData, selected]);

  const tooltipFormatter = (value: number | string) => {
    if (typeof value === "number") {
      return `${value.toFixed(2)}%`;
    }
    return value;
  };

  const saveAsPng = async () => {
    if (!chartRef.current) return;
    const dataUrl = await toPng(chartRef.current);
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  };

  const COLORS: Record<string, string> = {
    "0": "#1f78b4",
    "10001": "#33a02c",
    "10002": "#ff7f00",
    "10003": "#6a3d9a",
  };

  return (
    <div
      ref={chartRef}
      className={`${theme === "dark" ? styles.dark : styles.light} ${
        styles.chartWrapper
      }`}
    >
      <ThemeToggle onToggle={toggleTheme} theme={theme} />
      <ChartControls
        variationIds={variationIds}
        selected={selected}
        onToggle={handleToggle}
        mode={mode}
        onModeChange={setMode}
        lineStyle={lineStyle}
        onLineStyleChange={setLineStyle}
      />

      <button onClick={resetZoom} className={styles.resetBtn}>
        Reset Zoom
      </button>

      <button onClick={saveAsPng} className="px-3 py-1 bg-gray-200 rounded">
        Export PNG
      </button>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={activeData}
          margin={{ top: 10, right: 24, left: 8, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-color)", fontSize: 12 }}
          />
          <YAxis
            domain={yDomain as [number, number]}
            tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
            allowDataOverflow
          />

          <Tooltip
            contentStyle={{ background: "var(--tooltip-bg)" }}
            formatter={tooltipFormatter}
            labelFormatter={(l) => `Date: ${l}`}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Legend
            formatter={(value) => {
              const id = value.replace("conversionRate_", "");
              return variationNames[id] || value;
            }}
          />
          {selected.map((id) =>
            lineStyle === "area" ? (
              <Area
                key={id}
                type="monotone"
                dataKey={`conversionRate_${id}`}
                stroke={COLORS[id]}
                fill={COLORS[id] + "33"}
              />
            ) : (
              <Line
                key={id}
                type={lineStyle === "smooth" ? "monotone" : "linear"}
                dataKey={`conversionRate_${id}`}
                stroke={COLORS[id]}
                strokeWidth={2}
              />
            )
          )}
          {/* {selected.map((id) => {
            <LineStyleSelector />;
          })} */}

          <Brush
            dataKey="date"
            height={30}
            startIndex={brushIndexes?.[0] ?? 0}
            endIndex={brushIndexes?.[1] ?? activeData.length - 1}
            onChange={(range) =>
              setBrushIndexes([range.startIndex, range.endIndex])
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversionChart;
