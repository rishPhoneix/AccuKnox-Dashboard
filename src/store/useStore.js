import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { applyTheme } from "../lib/theme";

const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors so the dashboard can still run.
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors so the dashboard can still run.
    }
  },
};

const newId = () =>
  `custom-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

let toastTimer;

export const useStore = create(
  persist(
    (set, get) => ({
      activeMap: {},
      custom: [],
      range: "2d",
      theme: "system",
      readNotifs: {},
      search: "",
      drawer: null,
      toast: null,

      setSearch: (search) => set({ search }),

      setRange: (range) => set({ range }),

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      openDrawer: (tab = "cspm", mode = "choose") =>
        set({
          drawer: {
            tab,
            mode,
            nonce: Date.now(),
          },
        }),

      closeDrawer: () => set({ drawer: null }),

      removeWidget: (id, name) => {
        set({
          activeMap: {
            ...get().activeMap,
            [id]: false,
          },
        });

        get().showToast(`"${name}" removed`, id);
      },

      restoreWidget: (id) => {
        set({
          activeMap: {
            ...get().activeMap,
            [id]: true,
          },
          toast: null,
        });
      },

      applySelection: (map) =>
        set({
          activeMap: {
            ...get().activeMap,
            ...map,
          },
        }),

      addCustomWidget: ({ categoryId, name, text }) => {
        const widget = {
          id: newId(),
          categoryId,
          name: name.trim(),
          text: text.trim(),
        };

        set({
          custom: [...get().custom, widget],
        });

        return widget;
      },

      deleteCustomWidget: (id) => {
        const { custom, activeMap } = get();
        const rest = { ...activeMap };
        delete rest[id];

        set({
          custom: custom.filter((widget) => widget.id !== id),
          activeMap: rest,
        });
      },

      markAllRead: (ids) =>
        set({
          readNotifs: Object.fromEntries(
            ids.map((id) => [id, true])
          ),
        }),

      resetDashboard: () =>
        set({
          activeMap: {},
          custom: [],
          search: "",
        }),

      showToast: (message, undoId = null) => {
        clearTimeout(toastTimer);

        set({
          toast: {
            message,
            undoId,
            nonce: Date.now(),
          },
        });

        toastTimer = setTimeout(() => {
          set({ toast: null });
        }, 5000);
      },

      hideToast: () => {
        clearTimeout(toastTimer);
        set({ toast: null });
      },
    }),
    {
      name: "cnapp-dashboard-state",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        activeMap: state.activeMap,
        custom: state.custom,
        range: state.range,
        theme: state.theme,
        readNotifs: state.readNotifs,
      }),
    }
  )
);