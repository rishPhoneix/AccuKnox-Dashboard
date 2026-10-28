import {
  Activity,
  LayoutDashboard,
  RotateCcw,
  ScanSearch,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { PAGES } from "../lib/data";
import { usePopover } from "../lib/usePopover";
import { useStore } from "../store/useStore";
import ThemeSwitch from "./ThemeSwitch";

const icons = {
  layout: LayoutDashboard,
  shield: ShieldCheck,
  activity: Activity,
  scan: ScanSearch,
};

export default function Sidebar({ page }) {
  const [settingsOpen, setSettingsOpen, toggleSettings, settingsRef] =
    usePopover();

  const resetDashboard = useStore((s) => s.resetDashboard);
  const showToast = useStore((s) => s.showToast);

  const reset = () => {
    setSettingsOpen(false);

    if (
      window.confirm(
        "Reset widgets to the original dashboard? Widgets you created will be deleted."
      )
    ) {
      resetDashboard();
      showToast("Dashboard reset");
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={25} />
        </div>
        <div>
          <strong>AccuKnox</strong>
          <small>SECURITY CLOUD</small>
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>

      <nav aria-label="Main">
        {PAGES.map((p) => {
          const Icon = icons[p.icon];
          const active = p.id === page.id;

          return (
            <a
              key={p.id}
              href={`#/${p.id}`}
              aria-current={active ? "page" : undefined}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon size={18} /> {p.label}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-bottom" ref={settingsRef}>
        <div className="avatar">R</div>

        <div className="user-info">
          <strong>Dashboard User</strong>
          <small>Local workspace</small>
        </div>

        <button
          className="side-icon"
          onClick={toggleSettings}
          aria-label="Settings"
          aria-expanded={settingsOpen}
        >
          <Settings size={17} />
        </button>

        {settingsOpen && (
          <div
            className="popover popover-up"
            role="dialog"
            aria-label="Settings"
          >
            <div className="popover-title">Appearance</div>

            <ThemeSwitch />

            <div className="popover-sep" />

            <button className="menu-item" onClick={reset}>
              <RotateCcw size={15} /> Reset dashboard
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}