import { useEffect, useState } from "react";

export default function InventoryProductCreateForm({
  initialLabel = "",
  busy = false,
  error = "",
  onCancel,
  onSubmit,
}) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState(initialLabel);
  const [price, setPrice] = useState("");

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  // Basic validation
  const canSubmit = code.trim() && label.trim() && !busy;

  const submit = () => {
    if (!canSubmit) return;

    // Send values to the parent combobox which calls the API
    onSubmit?.({
      code: code.trim(),
      label: label.trim(),
      price: price === "" ? 0 : Number(price),
    });
  };

  return (
    <div>
      <div className="ui-row--inline">
        <div className="ui-row">
          <label className="ui-label">קוד</label>
          <input
            className="ui-control"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="למשל: VODKA_SMIRNOFF"
            disabled={busy}
          />
        </div>

        <div className="ui-row" style={{ flex: 2 }}>
          <label className="ui-label">שם מוצר</label>
          <input
            className="ui-control"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="למשל: סמירנוף"
            disabled={busy}
          />
        </div>
      </div>

      <div className="ui-row">
        <label className="ui-label">מחיר (אופציונלי)</label>
        <input
          className="ui-control"
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          disabled={busy}
        />
      </div>

      {error ? <div className="combo__error">{error}</div> : null}

      <div className="modal-footer">
        <button className="ui-btn" type="button" onClick={onCancel} disabled={busy}>
          ביטול
        </button>
        <button
          className="ui-btn ui-btn--primary"
          type="button"
          onClick={submit}
          disabled={!canSubmit}
        >
          {busy ? "שומר..." : "צור"}
        </button>
      </div>
    </div>
  );
}
