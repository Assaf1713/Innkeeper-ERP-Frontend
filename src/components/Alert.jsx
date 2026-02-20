import { useEffect } from "react";

export default function Alert({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`custom-alert custom-alert--${type}`}>
      <div className="custom-alert__content">
        <span className="custom-alert__icon">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "warning" && "⚠"}
          {type === "info" && "ℹ"}
        </span>
        <span className="custom-alert__message">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="custom-alert__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
