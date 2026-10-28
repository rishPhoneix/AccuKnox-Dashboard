import config from "../data/dashboard.json";

export const TITLE = config.title;
export const RANGES = config.ranges;
export const PAGES = config.pages;
export const NOTIFICATIONS = config.notifications;

export const fmt = (n) => Number(n).toLocaleString("en-US");
export const scale = (value, factor) => Math.round(value * factor);

export function buildCategories(activeMap, custom) {
  return config.categories.map((category) => ({
    ...category,
    widgets: [
      ...category.widgets.map((w) => ({
        ...w,
        active: activeMap[w.id] ?? w.active !== false,
      })),
      ...custom
        .filter((w) => w.categoryId === category.id)
        .map((w) => ({
          ...w,
          type: "text",
          custom: true,
          active: activeMap[w.id] ?? true,
        })),
    ],
  }));
}