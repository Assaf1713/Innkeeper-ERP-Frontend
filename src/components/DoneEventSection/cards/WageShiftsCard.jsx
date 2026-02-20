/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import EditWageShiftModal from "../../forms/EditWageShiftModal";
import "../DoneEventSection.css";
import EntityComboboxWithModalCreate from "../../ComboBox/EntityComboboxWithModalCreate";
import { useAlert } from "../../../hooks/useAlert";

const ROLES = [
  { value: "manager", label: "מנהל" },
  { value: "bartender", label: "ברמן" },
  { value: "logistics", label: "לוגיסטיקה" },
];

export default function WageShiftsCard({
  eventId,
  employees = [],
  plannedShifts = [],
  wageShifts = [],
  onCreate,
  onDelete,
  onUpdate,
  onImportPlannedShifts,
  MarkAllAsPaid,
}) {
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₪0";
    return `₪${price.toLocaleString("he-IL")}`;
  };
  const { showSuccess } = useAlert();

  // Filter only active employees for the dropdown
  const employeesOptions = useMemo(
    () => employees?.filter((e) => e?.isActive !== false) ?? [],
    [employees],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  // Form state for creating shifts
  const [form, setForm] = useState({
    employeeId: "",
    role: "bartender",
    startTime: "",
    endTime: "",
    wage: "",
    tip: "",
    notes: "",
  });

  // Calculate total wage and tips
  const totals = useMemo(() => {
    const totalWage = wageShifts.reduce(
      (acc, s) => acc + (Number(s.wage) || 0),
      0,
    );
    const totalTip = wageShifts.reduce(
      (acc, s) => acc + (Number(s.tip) || 0),
      0,
    );
    return { totalWage, totalTip };
  }, [wageShifts]);

  // Validation for create forms
  const canSubmit =
    !!eventId &&
    !!form.employeeId &&
    !!form.startTime &&
    !!form.endTime &&
    !saving;

  const resetForm = () => {
    setForm({
      employeeId: "",
      role: "bartender",
      startTime: "",
      endTime: "",
      wage: "",
      tip: "",
      notes: "",
    });
  };

  // Submit new shift
  const submit = async () => {
    if (!onCreate || !canSubmit) return;
    setSaving(true);
    try {
      await onCreate(eventId, {
        employeeId: form.employeeId,
        role: form.role,
        startTime: form.startTime,
        endTime: form.endTime,
        wage: form.wage === "" ? undefined : Number(form.wage),
        tip: form.tip === "" ? undefined : Number(form.tip),
        notes: form.notes,
      });

      resetForm();
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (shift) => {
    setEditingShift(shift);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingShift(null);
  };

  // Submit edit
  const submitEdit = async (formData) => {
    if (!onUpdate || !editingShift) return;
    setSaving(true);
    try {
      await onUpdate(eventId, editingShift._id, formData);
      closeEditModal();
    } finally {
      setSaving(false);
    }
  };

  // Import planned shifts
  const doImport = async () => {
    if (!onImportPlannedShifts || !eventId) return;
    setImporting(true);
    try {
      await onImportPlannedShifts(eventId);
    } finally {
      setImporting(false);
    }
  };

  const handleMarkAllAsPaid = async () => {
    if (!MarkAllAsPaid || !eventId) return;
    setSaving(true);
    try {
      await MarkAllAsPaid(eventId);
    } finally {
      setSaving(false);
      showSuccess("כל המשמרות סומנו כמשולמות");
    }
  };

  // Calculate duration between start and end time in hours
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";
    let [startHour, startMinute] = startTime.split(":").map(Number);
    let [endHour, endMinute] = endTime.split(":").map(Number);
    // In case of end hour post midnight
    if (endHour < startHour) endHour += 24;
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = (endTotalMinutes - startTotalMinutes) / 60;
    if (durationMinutes < 0) return "-";
    return durationMinutes.toFixed(1);
  };

  const rows = Array.isArray(wageShifts) ? wageShifts : [];

  return (
    <div className="done-event__card">
      <div className="card__header card__header--split">
        <div>
          <h3>משמרות בפועל (שכר/טיפים)</h3>
          <div className="card__meta">
            סה"כ : {totals.totalWage + totals.totalTip} ש"ח
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="ui-btn"
            type="button"
            onClick={handleMarkAllAsPaid}
            title="סמן את כל המשמרות כמשולמות"
          >
            שלם הכל
          </button>
          <button
            className="ui-btn"
            type="button"
            onClick={doImport}
            disabled={
              importing || plannedShifts.length === 0 || rows.length > 0
            }
            title={
              plannedShifts.length === 0
                ? "לאירוע זה לא שוייך צוות מראש"
                : rows.length > 0
                  ? "כבר קיימות משמרות בפועל, לא ניתן לייבא"
                  : "ייבא את המשמרות המתוכננות כמשמרות שבוצעו"
            }
          >
            {importing ? "מייבא..." : "ייבוא מצוות מתוכנן"}
          </button>

          <button
            className="ui-btn ui-btn--primary"
            type="button"
            onClick={() => setIsOpen((p) => !p)}
          >
            {isOpen ? "סגור" : "➕ הוסף משמרת"}
          </button>
        </div>
      </div>

      {/* add shift form */}

      {isOpen && (
        <div className="panel">
          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label">עובד</label>
              <EntityComboboxWithModalCreate
                entityLabel="עובד"
                placeholder="בחר עובד..."
                valueId={form.employeeId}
                onChange={(value) =>
                  setForm((p) => ({ ...p, employeeId: value }))
                }
                items={employeesOptions}
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, wage: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, tip: e.target.value }))
                }
                placeholder="0"
              />
            </div>

            <div className="ui-row" style={{ flex: 2 }}>
              <label className="ui-label">הערות (אופציונלי)</label>
              <input
                className="ui-control"
                type="text"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="הערות נוספות..."
              />
            </div>
          </div>

          <div className="ui-footer">
            <button className="ui-btn" type="button" onClick={resetForm}>
              נקה
            </button>
            <button
              className="ui-btn ui-btn--primary"
              type="button"
              onClick={submit}
              disabled={!canSubmit}
            >
              {saving ? "מוסיף..." : "הוסף"}
            </button>
          </div>
        </div>
      )}

      {/* rendering the list of the shifts */}

      {rows.length === 0 ? (
        <div className="empty">עדיין לא הוזנו משמרות בפועל</div>
      ) : (
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>עובד</th>
                <th>תפקיד</th>
                <th>שעות</th>
                <th>משך בשעות</th>
                <th>שכר</th>
                <th>טיפ</th>
                <th>הערות</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s._id}>
                  <td>{s.employee?.name ?? "עובד"}</td>
                  <td>
                    {ROLES.find((r) => r.value === s.role)?.label ?? s.role}
                  </td>
                  <td>{`${s.startTime} - ${s.endTime}`}</td>
                  <td>{calculateDuration(s.startTime, s.endTime)}</td>
                  <td>{formatPrice(Number(s.wage) || 0)}</td>
                  <td>{formatPrice(Number(s.tip) || 0)}</td>
                  <td>{s.notes || ""}</td>
                  <td>
                    <div className="global-table__actions-spacer">
                      <button
                        className="ui-btn--edit_item"
                        type="button"
                        onClick={() => openEditModal(s)}
                        title="ערוך משמרת"
                      >
                        ערוך
                      </button>
                      <button
                        className="ui-btn--delete_item"
                        type="button"
                        onClick={() => onDelete?.(eventId, s._id)}
                        title="מחק משמרת"
                      >
                        מחק
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editingShift && (
        <EditWageShiftModal
          shift={editingShift}
          employees={employeesOptions}
          onClose={closeEditModal}
          onSave={submitEdit}
          saving={saving}
        />
      )}
    </div>
  );
}
