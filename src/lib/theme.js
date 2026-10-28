const query = () => window.matchMedia("(prefers-color-scheme: dark)");

export function resolveTheme(theme) {
  if (theme === "system") return query().matches ? "dark" : "light";
  return theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function initTheme(getTheme) {
  applyTheme(getTheme());
  query().addEventListener("change", () => {
    if (getTheme() === "system") applyTheme("system");
  });
}