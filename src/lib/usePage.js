import { useEffect, useState } from "react";
import { PAGES } from "./data";

export function usePage() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const id = hash.replace(/^#\/?/, "") || "dashboard";
  return PAGES.find((p) => p.id === id) ?? PAGES[0];
}