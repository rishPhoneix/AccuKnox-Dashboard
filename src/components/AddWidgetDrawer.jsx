import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { buildCategories } from "../lib/data";
import { useStore } from "../store/useStore";

export default function AddWidgetDrawer() {
  const drawer = useStore((s) => s.drawer);

  return drawer ? (
    <Drawer
      key={drawer.nonce}
      initialTab={drawer.tab}
      initialMode={drawer.mode}
    />
  ) : null;
}

function Drawer({ initialTab, initialMode }) {
  const activeMap = useStore((s) => s.activeMap);
  const custom = useStore((s) => s.custom);
  const closeDrawer = useStore((s) => s.closeDrawer);
  const applySelection = useStore((s) => s.applySelection);
  const addCustomWidget = useStore((s) => s.addCustomWidget);
  const deleteCustomWidget = useStore((s) => s.deleteCustomWidget);
  const showToast = useStore((s) => s.showToast);

  const categories = useMemo(
    () => buildCategories(activeMap, custom),
    [activeMap, custom]
  );

  const allWidgets = useMemo(
    () =>
      categories.flatMap((category) =>
        category.widgets.map((widget) => ({
          ...widget,
          tab: category.tab,
          categoryId: category.id,
        }))
      ),
    [categories]
  );

  const [mode, setMode] = useState(initialMode);
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");

  const [draft, setDraft] = useState(() =>
    Object.fromEntries(allWidgets.map((widget) => [widget.id, widget.active]))
  );

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [newCategory, setNewCategory] = useState(initialTab);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  const q = query.trim().toLowerCase();

  const list = q
    ? allWidgets.filter((widget) =>
        `${widget.name} ${widget.text}`.toLowerCase().includes(q)
      )
    : allWidgets.filter((widget) => widget.categoryId === tab);

  const changes = allWidgets.filter(
    (widget) =>
      widget.id in draft && draft[widget.id] !== widget.active
  ).length;

  const confirm = () => {
    applySelection(draft);
    closeDrawer();
    showToast("Dashboard updated");
  };

  const create = (event) => {
    event.preventDefault();

    if (!name.trim() || !text.trim()) {
      return;
    }

    addCustomWidget({
      categoryId: newCategory,
      name: name.trim(),
      text: text.trim(),
    });

    const category = categories.find(
      (item) => item.id === newCategory
    );

    closeDrawer();
    showToast(`"${name.trim()}" added to ${category?.tab ?? newCategory}`);
  };

  const removeCustomWidget = (widgetId) => {
    deleteCustomWidget(widgetId);

    setDraft((currentDraft) => {
      const nextDraft = { ...currentDraft };
      delete nextDraft[widgetId];
      return nextDraft;
    });
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeDrawer();
        }
      }}
    >
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="modal-header">
          <div>
            <small>PERSONALIZE DASHBOARD</small>
            <h2 id="drawer-title">Add Widget</h2>
          </div>

          <button
            className="icon-button"
            onClick={closeDrawer}
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        <div className="mode-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === "choose"}
            className={mode === "choose" ? "on" : ""}
            onClick={() => setMode("choose")}
          >
            Choose widgets
          </button>

          <button
            role="tab"
            aria-selected={mode === "create"}
            className={mode === "create" ? "on" : ""}
            onClick={() => setMode("create")}
          >
            Create new
          </button>
        </div>

        {mode === "choose" ? (
          <div className="drawer-body">
            <p className="modal-description">
              Tick the widgets you want on your dashboard, then press Confirm.
            </p>

            <div
              className="cat-tabs"
              role="tablist"
              aria-label="Categories"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  role="tab"
                  aria-selected={!q && tab === category.id}
                  className={
                    !q && tab === category.id ? "on" : ""
                  }
                  onClick={() => {
                    setTab(category.id);
                    setQuery("");
                  }}
                >
                  {category.tab}
                </button>
              ))}
            </div>

            <div className="drawer-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search all widgets..."
                aria-label="Search all widgets"
              />
            </div>

            <ul className="check-list">
              {list.map((widget) => (
                <li key={widget.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!draft[widget.id]}
                      onChange={() =>
                        setDraft((currentDraft) => ({
                          ...currentDraft,
                          [widget.id]: !currentDraft[widget.id],
                        }))
                      }
                    />

                    <span className="check-name">{widget.name}</span>

                    {widget.custom && (
                      <em className="chip">Custom</em>
                    )}

                    {q && <em className="chip">{widget.tab}</em>}
                  </label>

                  {widget.custom && (
                    <button
                      className="mini-delete"
                      aria-label={`Delete ${widget.name}`}
                      title="Delete widget"
                      onClick={() => removeCustomWidget(widget.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}

              {list.length === 0 && (
                <li className="none">No widgets found</li>
              )}
            </ul>
          </div>
        ) : (
          <form
            className="drawer-body create-form"
            onSubmit={create}
          >
            <p className="modal-description">
              Create a widget and choose which category should show it.
            </p>

            <label htmlFor="new-category">Category</label>
            <select
              id="new-category"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label htmlFor="new-name">Widget name</label>
            <input
              id="new-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. API Security Status"
              maxLength={70}
              required
              autoFocus
            />

            <label htmlFor="new-text">Widget text</label>
            <textarea
              id="new-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Enter a summary or sample data..."
              rows={4}
              maxLength={300}
              required
            />

            <div className="char-count">{text.length}/300</div>
          </form>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={closeDrawer}
          >
            Cancel
          </button>

          {mode === "choose" ? (
            <button
              type="button"
              className="primary-button"
              onClick={confirm}
              disabled={changes === 0}
            >
              {changes === 0 ? "Confirm" : `Confirm (${changes})`}
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={create}
              disabled={!name.trim() || !text.trim()}
            >
              <Plus size={16} /> Add widget
            </button>
          )}
        </div>
      </section>
    </div>
  );
}