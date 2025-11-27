import type { LineStyle } from "../../types/types";

export const LineStyleSelector = ({
  value,
  onChange,
}: {
  value: LineStyle;
  onChange: (v: LineStyle) => void;
}) => (
  <div className="flex gap-2">
    {(["line", "smooth", "area"] as LineStyle[]).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-3 py-1 rounded ${
          value === v ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {v}
      </button>
    ))}
  </div>
);
