import { useStore } from "../store/useStore";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const restoreWidget = useStore((s) => s.restoreWidget);
  const hideToast = useStore((s) => s.hideToast);
  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite" key={toast.nonce}>
      <span>{toast.message}</span>
      {toast.undoId && <button onClick={() => restoreWidget(toast.undoId)}>Undo</button>}
      <button className="toast-x" onClick={hideToast} aria-label="Dismiss">×</button>
    </div>
  );
}