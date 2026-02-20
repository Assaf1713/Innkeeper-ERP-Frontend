
export default function SoftDeleteButton({
  isActive,
  onToggle,
  entityLabel = "פריט",
  loading = false,
  className = "",
}) {


  return (
    <button
      type="button"
      className={`soft-delete-btn ${isActive ? "soft-delete-btn--active" : "soft-delete-btn--inactive"} ${className}`}
      onClick={onToggle}
      disabled={loading}
    >
      {loading ? (
        "...טוען"
      ) : isActive ? (
        <>
          <span className="soft-delete-btn__icon">🔒</span>
          השבתת {entityLabel}
        </>
      ) : (
        <>
          <span className="soft-delete-btn__icon">✓</span>
          הפעלת {entityLabel}
        </>
      )}
    </button>
  );
}

