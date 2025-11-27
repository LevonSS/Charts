export const ThemeToggle = ({
  theme,
  onToggle,
}: {
  theme: string;
  onToggle: () => void;
}) => (
  <button onClick={onToggle} className="px-3 py-1 rounded bg-gray-200">
    {theme === "light" ? "🌙 Dark" : "☀️ Light"}
  </button>
);
