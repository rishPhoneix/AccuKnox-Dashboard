import { Monitor, Moon, Sun } from "lucide-react";
import { useStore } from "../store/useStore";

const options = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
];

export default function ThemeSwitch() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  return (
    <div className="segmented" role="radiogroup" aria-label="Theme">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id} role="radio" aria-checked={theme === id}
          className={theme === id ? "on" : ""} onClick={() => setTheme(id)}
        >
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  );
}