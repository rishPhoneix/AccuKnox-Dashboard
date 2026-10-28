import { Bell, Moon, Search, Sun, X } from "lucide-react";
import { NOTIFICATIONS } from "../lib/data";
import { resolveTheme } from "../lib/theme";
import { usePopover } from "../lib/usePopover";
import { useStore } from "../store/useStore";

export default function Topbar({ page }) {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const readNotifs = useStore((s) => s.readNotifs);
  const markAllRead = useStore((s) => s.markAllRead);

  const [bellOpen, , toggleBell, bellRef] = usePopover();

  const unread = NOTIFICATIONS.filter(
    (notification) => !readNotifs[notification.id]
  ).length;

  const isDark = resolveTheme(theme) === "dark";

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Home <span>/</span> <strong>{page.label}</strong>
      </div>

      <div className="top-actions">
        <div className="search-box">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search widgets..."
            aria-label="Search widgets"
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          className="icon-button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={
            isDark ? "Switch to light theme" : "Switch to dark theme"
          }
          title={isDark ? "Light theme" : "Dark theme"}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            className="icon-button"
            onClick={toggleBell}
            aria-label={`Notifications, ${unread} unread`}
            aria-expanded={bellOpen}
          >
            <Bell size={19} />
            {unread > 0 && <span className="badge">{unread}</span>}
          </button>

          {bellOpen && (
            <div
              className="popover popover-notifs"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="popover-head">
                <span className="popover-title">Notifications</span>

                <button
                  className="link-button"
                  disabled={unread === 0}
                  onClick={() =>
                    markAllRead(
                      NOTIFICATIONS.map((notification) => notification.id)
                    )
                  }
                >
                  Mark all as read
                </button>
              </div>

              <ul className="notif-list">
                {NOTIFICATIONS.map((notification) => (
                  <li
                    key={notification.id}
                    className={
                      readNotifs[notification.id] ? "read" : ""
                    }
                  >
                    <i className={`sev sev-${notification.severity}`} />

                    <div>
                      <p>{notification.title}</p>
                      <small>{notification.time}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="avatar">R</div>
      </div>
    </header>
  );
}