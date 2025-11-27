import React from "react";
import { LineStyleSelector } from "./LineStyleSelector";
import styles from "./ChartControls.module.scss";
import type { LineStyle, ViewMode } from "../../types/types";

interface Props {
  variationIds: string[];
  selected: string[];
  onToggle: (id: string) => void;
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  lineStyle: LineStyle;
  onLineStyleChange: (v: LineStyle) => void;
}

export const ChartControls: React.FC<Props> = ({
  variationIds,
  selected,
  onToggle,
  mode,
  onModeChange,
  lineStyle,
  onLineStyleChange,
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.variations}>
        {variationIds.map((id) => (
          <label key={id}>
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => onToggle(id)}
            />
            <span style={{ fontSize: 13, color: "black" }}>Variation {id}</span>
          </label>
        ))}
      </div>

      <div className={styles.buttons}>
        <button disabled={mode === "day"} onClick={() => onModeChange("day")}>
          Day
        </button>
        <button disabled={mode === "week"} onClick={() => onModeChange("week")}>
          Week
        </button>
      </div>
      <LineStyleSelector value={lineStyle} onChange={onLineStyleChange} />
    </div>
  );
};
