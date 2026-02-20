import { useMemo, useState, useEffect } from "react";
import { useAlert } from "../hooks/useAlert";
import "../styles/ClosedEventSection.css";
import EditableCell from "./EditableCell";
import EntityComboboxWithModalCreate from "./ComboBox/EntityComboboxWithModalCreate";
import { apiFetch } from "../utils/apiFetch";
const ROLES = [
  { value: "manager", label: "מנהל" },
  { value: "bartender", label: "ברמן" },
  { value: "logistics", label: "לוגיסטיקה" },
];

export default function ClosedEventSection({
  event,
  statusCode,
  employees = [],
  plannedShifts = [],
  onCreateShift,
  onDeleteShift,
  onUpdateShift,
  settings,
}) {
  const eventId = event._id;
  const { showError, showSuccess } = useAlert();
  const [AddShiftFormOpen, setAddShiftFormOpen] = useState(false);

  const [shiftForm, setShiftForm] = useState({
    employeeId: "",
    role: "bartender",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);

  const employeesOptions = useMemo(
    () => employees.filter((e) => e?.isActive !== false),
    [employees],
  );

  const canCreate = shiftForm.employeeId && !creating;

  const handleCreate = async () => {
    if (!onCreateShift) return;

    setCreating(true);
    try {
      await onCreateShift(eventId, {
        employeeId: shiftForm.employeeId,
        role: shiftForm.role,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        notes: shiftForm.notes,
      });

      setShiftForm({
        employeeId: "",
        role: "bartender",
        startTime: "",
        endTime: "",
        notes: "",
      });
    } finally {
      setCreating(false);
      setAddShiftFormOpen(false);
    }
  };

  const [form, setForm] = useState({
    warehouseArrivalTime: "", // שעת הגעה למחסן
    promisedStaffCount: "", // כמות צוות
    cocktailMenu: "", // תפריט קוקטיילים
  });
  const [showTimeSuggestions, setShowTimeSuggestions] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Prefill מה-event (אם קיים)
  useEffect(() => {
    if (!event) return;

    setForm({
      warehouseArrivalTime: event.warehouseArrivalTime ?? "",
      promisedStaffCount: event.promisedStaffCount ?? "",
      cocktailMenu: event.cocktailMenu ?? "",
    });
  }, [event]);

  const preEventTimes = useMemo(() => {
    let WarehouseWorkTime = 0;
    let PreEventSetUpTime = 0;
    let drivingTime = settings?.defaultDrivingTimePerEvent || 1;

    if (event.travelDuration) {
      const safetyMargin = settings?.drivingTimeSafetyMargin || 1800; // 30 minutes

      // 1. Calculate raw hours (including safety margin)
      const totalSeconds = event.travelDuration + safetyMargin;
      const rawHours = totalSeconds / 3600;

      // 2. Define tolerance (10 minutes in decimal hours = ~0.166)
      const tolerance = 10 / 60;

      // 3. Apply logic: Subtract tolerance, then round UP (Ceil) to nearest 0.5
      // We multiply by 2, Ceil, then divide by 2 to get 0.5 steps
      const calculatedWithTolerance = Math.ceil((rawHours - tolerance) * 2) / 2;

      // 4. Set final time (Minimum 1 hour)
      drivingTime = Math.max(1, calculatedWithTolerance);
    }
    if (event.eventType.code === "WEDDING_FULL_BAR") {
      WarehouseWorkTime = settings?.defaultWarehouseWorkTimeForFullBar || 1.5;
      PreEventSetUpTime = settings?.defaultSetupTimeForFullBar || 4;
    } else if (
      event.eventType.code === "PRIVATE_FULL_BAR" ||
      event.eventType.code === "CORP_PARTY"
    ) {
      WarehouseWorkTime = settings?.defaultWarehouseWorkTimeForFullBar || 1.5;
      PreEventSetUpTime = settings?.defaultSetupTimeForFullBar || 3;
    } else {
      WarehouseWorkTime = settings?.defaultWarehouseWorkTime || 1;
      PreEventSetUpTime = settings?.defaultSetupTime || 2;
    }

    return {
      warehousWorkTime: WarehouseWorkTime,
      preEventSetUpTime: PreEventSetUpTime,
      drivingTime: drivingTime,
      totalPreEventTime: WarehouseWorkTime + PreEventSetUpTime + drivingTime,
    };
  }, [event.eventType.code, event.travelDuration, settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/events/${eventId}/close-details`, {
        method: "POST",
        body: JSON.stringify({
          warehouseArrivalTime: form.warehouseArrivalTime,
          promisedStaffCount:
            form.promisedStaffCount === ""
              ? undefined
              : Number(form.promisedStaffCount),
          cocktailMenu: form.cocktailMenu,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Save close details failed:", errText);
        showError("שמירת פרטי סגירה נכשלה");
        return;
      }
      showSuccess("פרטי סגירה נשמרו בהצלחה");
    } catch (err) {
      console.error(err);
      showError("שמירת פרטי סגירה נכשלה");
    } finally {
      setSubmitting(false);
    }
  };

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
    return durationMinutes.toFixed(2);
  };

  const disabled = submitting;
  const formatHours = (value) => Number(value || 0).toFixed(1);

  return (
    <section className="closed-event">
      <div className="closed-event__header">
        <div className="closed-event__title">
          סקשן סגירה ({statusCode === "done" ? "בוצע" : "נסגר"})
        </div>
        <div className="closed-event__subtitle">
          ניהול דרישות סגירה וצוות שנסגר לאירוע
        </div>
      </div>

      {/* דרישות סגירה */}
      <div className="closed-event__card">
        <div className="card__header">
          <h3>פרטי אירוע סגור</h3>
          <button
            type="button"
            className="ui-btn closed-event__time-toggle"
            onClick={() => setShowTimeSuggestions((prev) => !prev)}
            aria-expanded={showTimeSuggestions}
            aria-controls="pre-event-time-suggestions"
          >
            {showTimeSuggestions ? "הסתר המלצת זמנים" : "הצג המלצת זמנים"}
          </button>
        </div>

        {showTimeSuggestions && (
          <>
            <div
              id="pre-event-time-suggestions"
              className="closed-event__time-cards"
              aria-label="זמני היערכות לפני האירוע"
            >
              <div className="closed-event__time-card">
                <div className="closed-event__time-label">זמן עבודה במחסן</div>
                <div className="closed-event__time-value">
                  {formatHours(preEventTimes.warehousWorkTime)} שעות
                </div>
              </div>

              <div className="closed-event__time-card">
                <div className="closed-event__time-label">זמן נסיעה</div>
                <div className="closed-event__time-value">
                  {formatHours(preEventTimes.drivingTime)} שעות
                </div>
              </div>

              <div className="closed-event__time-card">
                <div className="closed-event__time-label">
                  זמן הכנה לפני האירוע
                </div>
                <div className="closed-event__time-value">
                  {formatHours(preEventTimes.preEventSetUpTime)} שעות
                </div>
              </div>

              <div className="closed-event__time-card closed-event__time-card--total">
                <div className="closed-event__time-label">
                  סך הכל זמן לפני האירוע
                </div>
                <div className="closed-event__time-value">
                  {formatHours(preEventTimes.totalPreEventTime)} שעות
                </div>
              </div>
            </div>
            <div className="card__hint">
              הזמנים המוצגים הם המלצה בלבד לצורך היערכות מוקדמת.
            </div>
          </>
        )}

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label">שעת הגעה למחסן</label>
              <input
                className="ui-control"
                name="warehouseArrivalTime"
                type="time"
                value={form.warehouseArrivalTime}
                onChange={handleChange}
                placeholder="TBD"
              />
            </div>

            <div className="ui-row">
              <label className="ui-label">כמות צוות שהתחייבנו</label>
              <input
                className="ui-control"
                name="promisedStaffCount"
                type="number"
                min="0"
                value={form.promisedStaffCount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ui-row">
            <label className="ui-label">תפריט קוקטיילים</label>
            <textarea
              className="ui-control"
              name="cocktailMenu"
              value={form.cocktailMenu}
              onChange={handleChange}
              placeholder="בהמה מאמא | באזיל | זפירו | סירנה"
              rows={2}
            />
          </div>

          <div className="ui-footer">
            <button
              type="submit"
              className="ui-btn ui-btn--primary"
              disabled={disabled}
            >
              {disabled ? "שומר..." : "שמור"}
            </button>
          </div>
        </form>
      </div>

      {/* Planned Shifts */}
      <div className="closed-event__card">
        <div className="card__header">
          <h3>צוות שנסגר לאירוע</h3>
          <span className="card__meta">
            {" "}
            {plannedShifts.length} עובדים סגורים מתוך {form.promisedStaffCount}{" "}
            עובדים שהתחייבנו
          </span>
        </div>
        <div className="actions-bar">
          <button
            className="ui-btn ui-btn--primary closed-event__add-shift-btn"
            type="button"
            onClick={() => setAddShiftFormOpen((p) => !p)}
          >
            {AddShiftFormOpen ? "בטל" : "+"}
          </button>
        </div>

        {/* טופס הוספת משמרת */}

        {AddShiftFormOpen && (
          <div className="planned-shift-form">
            <div className="ui-row">
              <label className="ui-label">עובד</label>
              <EntityComboboxWithModalCreate
                entityLabel="עובד"
                placeholder="בחר עובד..."
                valueId={shiftForm.employeeId}
                onChange={(value) =>
                  setShiftForm((p) => ({ ...p, employeeId: value }))
                }
                items={employeesOptions}
                getItemId={(x) => x._id}
                getItemLabel={(x) => x.name}
                isItemActive={(x) => x?.isActive !== false}
                allowCreate={false}
              />
            </div>

            <div className="ui-row--inline">
              <div className="ui-row">
                <label className="ui-label">תפקיד</label>
                <select
                  className="ui-control"
                  value={shiftForm.role}
                  onChange={(e) =>
                    setShiftForm((p) => ({ ...p, role: e.target.value }))
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
                  value={shiftForm.startTime}
                  onChange={(e) =>
                    setShiftForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                />
              </div>

              <div className="ui-row">
                <label className="ui-label">סיום</label>
                <input
                  className="ui-control"
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) =>
                    setShiftForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="ui-row">
              <label className="ui-label">הערות</label>
              <input
                className="ui-control"
                type="string"
                value={shiftForm.notes}
                onChange={(e) =>
                  setShiftForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>

            <div className="planned-shift-form__actions">
              <button
                className="ui-btn ui-btn--primary"
                onClick={handleCreate}
                disabled={!canCreate}
                type="button"
              >
                {creating ? "מוסיף..." : "הוסף משמרת"}
              </button>
            </div>
          </div>
        )}

        {/* רשימה */}
        {plannedShifts.length === 0 ? (
          <div className="planned-shifts-list__empty">
            עדיין לא נסגר אף איש צוות לאירוע
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="global-table">
              <thead>
                <tr>
                  <th>עובד</th>
                  <th>תפקיד</th>
                  <th>שעות</th>
                  <th>משך כולל</th>
                  <th>הערות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {plannedShifts.map((s) => (
                  <tr key={s._id}>
                    <td>{s.employee?.name}</td>
                    <td>{ROLES.find((r) => r.value === s.role)?.label}</td>
                    <td>
                      {s.startTime} - {s.endTime}
                    </td>
                    <td>{calculateDuration(s.startTime, s.endTime)}</td>
                    <td>
                      <EditableCell
                        value={s.notes || ""}
                        onSave={(newNotes) =>
                          onUpdateShift(s._id, { notes: newNotes })
                        }
                      />
                    </td>
                    <td>
                      {onDeleteShift && (
                        <button
                          className="ui-btn--delete_item"
                          onClick={() => onDeleteShift(s._id)}
                          type="button"
                        >
                          מחק
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ height: "200px" }} />
    </section>
  );
}
