import { useMemo } from "react";
import {
  Check,
  ChevronDown,
  Cloud,
  LayoutDashboard,
  Plus,
  RotateCcw,
  ScanSearch,
  Search,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Widget from "./components/Widget";
import AddWidgetDrawer from "./components/AddWidgetDrawer";
import Toast from "./components/Toast";
import { RANGES, TITLE, buildCategories } from "./lib/data";
import { usePage } from "./lib/usePage";
import { usePopover } from "./lib/usePopover";
import { useStore } from "./store/useStore";

const categoryIcons = {
  shield: ShieldCheck,
  cloud: Cloud,
  scan: ScanSearch,
  ticket: Ticket,
};

export default function App() {
  const page = usePage();

  const activeMap = useStore((s) => s.activeMap);
  const custom = useStore((s) => s.custom);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const range = useStore((s) => s.range);
  const setRange = useStore((s) => s.setRange);
  const openDrawer = useStore((s) => s.openDrawer);
  const removeWidget = useStore((s) => s.removeWidget);
  const resetDashboard = useStore((s) => s.resetDashboard);
  const showToast = useStore((s) => s.showToast);

  const [rangeOpen, setRangeOpen, toggleRange, rangeRef] = usePopover();

  const factor = RANGES[range].factor;
  const q = search.trim().toLowerCase();

  const categories = useMemo(() => {
    return buildCategories(activeMap, custom)
      .filter((category) =>
        !page.categories || page.categories.includes(category.id)
      )
      .map((category) => {
        const shown = category.widgets.filter((widget) => widget.active);

        if (!q) {
          return { ...category, widgets: shown };
        }

        const categoryMatch = category.name.toLowerCase().includes(q);

        return {
          ...category,
          widgets: categoryMatch
            ? shown
            : shown.filter((widget) =>
                `${widget.name} ${widget.text}`.toLowerCase().includes(q)
              ),
        };
      })
      .filter((category) => !q || category.widgets.length > 0);
  }, [activeMap, custom, page, q]);

  const onReset = () => {
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
    <div className="app-shell">
      <Sidebar page={page} />

      <main className="main-content">
        <Topbar page={page} />

        <section className="page-heading">
          <div>
            <div className="eyebrow">SECURITY OVERVIEW</div>
            <h1>{page.id === "dashboard" ? TITLE : page.label}</h1>
            <p>Monitor your cloud security posture from one place.</p>
          </div>

          <div className="heading-actions">
            <button className="secondary-button" onClick={onReset}>
              <RotateCcw size={16} /> Reset
            </button>

            <button
              className="primary-button"
              onClick={() => openDrawer(categories[0]?.id ?? "cspm", "choose")}
            >
              <Plus size={17} /> Add Widget
            </button>

            <div className="relative" ref={rangeRef}>
              <button
                className="secondary-button date-button"
                onClick={toggleRange}
                aria-haspopup="listbox"
                aria-expanded={rangeOpen}
              >
                {RANGES[range].label} <ChevronDown size={15} />
              </button>

              {rangeOpen && (
                <ul
                  className="popover popover-range"
                  role="listbox"
                  aria-label="Date range"
                >
                  {Object.entries(RANGES).map(([id, item]) => (
                    <li key={id}>
                      <button
                        role="option"
                        aria-selected={id === range}
                        className="menu-item"
                        onClick={() => {
                          setRange(id);
                          setRangeOpen(false);
                        }}
                      >
                        {item.label}
                        {id === range && <Check size={15} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {q && categories.length === 0 && (
          <div className="no-results">
            <Search size={30} />
            <h3>No widgets found</h3>
            <p>
              Nothing matches "{search}". Try a different search or add a new
              widget.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                setSearch("");
                openDrawer("cspm", "create");
              }}
            >
              <Plus size={16} /> Add Widget
            </button>
          </div>
        )}

        <div className="dashboard-sections">
          {categories.map((category) => {
            const Icon = categoryIcons[category.icon] || LayoutDashboard;

            return (
              <section
                className="dashboard-section"
                key={category.id}
                aria-labelledby={`h-${category.id}`}
              >
                <div className="section-heading">
                  <div className="section-title">
                    <div className="section-icon">
                      <Icon size={18} />
                    </div>
                    <h2 id={`h-${category.id}`}>{category.name}</h2>
                    <span className="count">{category.widgets.length}</span>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => openDrawer(category.id, "choose")}
                  >
                    <Plus size={15} /> Add widget
                  </button>
                </div>

                <div className="widget-grid">
                  {category.widgets.map((widget) => (
                    <Widget
                      key={widget.id}
                      widget={widget}
                      range={range}
                      factor={factor}
                      onRemove={(item) => removeWidget(item.id, item.name)}
                    />
                  ))}

                  {!q && (
                    <button
                      className="add-card"
                      onClick={() => openDrawer(category.id, "choose")}
                    >
                      <span>
                        <Plus size={17} /> Add Widget
                      </span>
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <footer>
          AccuKnox Dashboard UI · Assignment Demo
          <span>
            Charts use sample data · changes save automatically in this browser
          </span>
        </footer>
      </main>

      <AddWidgetDrawer />
      <Toast />
    </div>
  );
}