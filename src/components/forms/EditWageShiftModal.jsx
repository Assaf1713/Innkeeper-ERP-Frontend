import { useState, useEffect } from "react";
import EntityComboboxWithModalCreate from "../ComboBox/EntityComboboxWithModalCreate";

const ROLES = [
  { value: "manager", label: "מנהל" },
  { value: "bartender", label: "ברמן" },
  { value: "logistics", label: "לוגיסטיקה" },
];

export default function EditWageShiftModal({
  shift,
  employees = [],
  onClose,
  onSave,
  saving = false,
}) {
  const [form, setForm] = useState({
    employeeId: "",
    role: "bartender",
    startTime: "",
    endTime: "",
    wage: "",
    tip: "",
    paid: false,
    notes: "",
  });

  // Populate form when shift changes
  useEffect(() => {
    if (shift) {
      setForm({
        employeeId: shift.employee?._id || "",
        role: shift.role || "bartender",
        startTime: shift.startTime || "",
        endTime: shift.endTime || "",
        wage: shift.wage !== undefined ? String(shift.wage) : "",
        tip: shift.tip !== undefined ? String(shift.tip) : "",
        paid: shift.paid || false,
        notes: shift.notes || "",
      });
    }
  }, [shift]);

  const canSubmit =
    !!form.employeeId && !!form.startTime && !!form.endTime && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await onSave({
      employeeId: form.employeeId,
      role: form.role,
      startTime: form.startTime,
      endTime: form.endTime,
      wage: form.wage === "" ? undefined : Number(form.wage),
      tip: form.tip === "" ? undefined : Number(form.tip),
      paid: form.paid,
      notes: form.notes,
    });
  };

  return (
    <div className="ui-modal-backdrop" >
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">ערוך משמרת</h2>
          <button
            type="button"
            className="ui-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="ui-form">
          <div className="ui-row">
            <label className="ui-label">עובד</label>
              <EntityComboboxWithModalCreate
                entityLabel="עובד"
                placeholder="בחר עובד..."
                valueId={form.employeeId}
                onChange={(value) =>
                  setForm((p) => ({ ...p, employeeId: value }))
                }
                items={employees}
                getItemId={(x) => x._id}
                getItemLabel={(x) => x.name}
                isItemActive={(x) => x?.isActive !== false}
                allowCreate={false}
              />
          </div>

          <div className="ui-row">
            <label className="ui-label">תפקיד</label>
            <select
              className="ui-control"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label">התחלה</label>
              <input
                className="ui-control"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startTime: e.target.value }))
                }
              />
            </div>

            <div className="ui-row">
              <label className="ui-label">סיום</label>
              <input
                className="ui-control"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label">שכר</label>
              <input
                className="ui-control"
                type="number"
                min="0"
                value={form.wage}
                onChange={(e) => setForm((p) => ({ ...p, wage: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div className="ui-row">
              <label className="ui-label">טיפ</label>
              <input
                className="ui-control"
                type="number"
                min="0"
                value={form.tip}
                onChange={(e) => setForm((p) => ({ ...p, tip: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="ui-row--checkbox">
            <input
              type="checkbox"
              id="shift-paid"
              checked={form.paid}
              onChange={(e) =>
                setForm((p) => ({ ...p, paid: e.target.checked }))
              }
            />
            <label htmlFor="shift-paid" className="ui-label">
              <span>שולם</span>
            </label>
          </div>

          <div className="ui-row">
            <label className="ui-label">הערות (אופציונלי)</label>
            <textarea
              className="ui-control"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="הערות נוספות..."
              rows="3"
            />
          </div>
        </div>

        <div className="ui-modal__actions">
          <button className="ui-btn" type="button" onClick={onClose}>
            ביטול
          </button>
          <button
            className="ui-btn ui-btn--primary"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {saving ? "שומר..." : "שמור שינויים"}
          </button>
        </div>
      </div>
    </div>
  );
}
