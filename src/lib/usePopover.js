import { useCallback, useEffect, useState } from "react";

export function usePopover() {
  const [open, setOpen] = useState(false);
  const [element, setElement] = useState(null);

  const toggle = useCallback(() => {
    setOpen((previous) => !previous);
  }, []);

  const ref = useCallback((node) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!open || !element) return undefined;

    const handleOutsideClick = (event) => {
      if (!element.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, element]);

  return [open, setOpen, toggle, ref];
}