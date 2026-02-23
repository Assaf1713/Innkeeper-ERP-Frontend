import { useMemo, useState } from "react";
import ExpenseTypeCombobox from "../../ComboBox/ExpenseTypeCombobox";
import "../DoneEventSection.css";

export default function GeneralExpensesCard({
  eventId,
  expenseTypes = [],
  generalExpenses = [],
  onCreate,
  onDelete,
  onCreateExpenseType,
  onUpdateIceExpenses,
  onUpdateCarType,
  iceExpenses = 0,
  carType = "transporter",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  

  const [form, setForm] = useState({
    expenseTypeId: "",
    amount: "",
    notes: "",
  });

  const [iceAmount, setIceAmount] = useState(iceExpenses);
  const [selectedCarType, setSelectedCarType] = useState(carType || "transporter");
  

  const total = useMemo(() => {
    return (Array.isArray(generalExpenses) ? generalExpenses : []).reduce(
      (acc, e) => acc + (Number(e.amount) || 0),
      0
    );
  }, [generalExpenses]);

  const canSubmit =
    !!eventId &&
    !!form.expenseTypeId &&
    form.amount !== "" &&
    Number(form.amount) >= 0 &&
    !saving;

  const resetForm = () => {
    setForm({ expenseTypeId: "", amount: "", notes: "" });
  };

  const submit = async () => {
    if (!onCreate || !canSubmit) return;

    setSaving(true);
    try {
      await onCreate(eventId, {
        expenseTypeId: form.expenseTypeId,
        amount: Number(form.amount),
        notes: form.notes ?? "",
      });
      resetForm();
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  
  const handleSetIceExpenses = async () => {
    if (!onUpdateIceExpenses) return;
    try {
      await onUpdateIceExpenses(eventId, Number(iceAmount));
    } catch (error) {
      console.error("Failed to update ice expenses:", error);
    }
  };

  const handleSetCarType = async () => {
    if (!onUpdateCarType) return;
    try {
      await onUpdateCarType(eventId, selectedCarType);
    } catch (error) {
      console.error("Failed to update car type:", error);
    }
  };
      
      
  

  const rows = Array.isArray(generalExpenses) ? generalExpenses : [];

  const getExpenseTypeLabel = (e) => {
    // השרת עושה populate("expenseType", "code label") לפי הקוד ששלחת
    if (e?.expenseType?.label) return e.expenseType.label;

    // fallback ל-snapshot אם השדה קיים אצלך
    if (e?.expenseTypeLabelSnapshot) return e.expenseTypeLabelSnapshot;
    if (e?.expenseTypeSnapshot?.label) return e.expenseTypeSnapshot.label;

    return "ללא קטגוריה";
  };

  return (
    <>
    <div className="done-event__top-cards">
      <div className="done-event__card done-event__card--top">
        <div className="card__header">
          <h3>הוצאות קרח</h3>
        </div>

        <div className="ice-section">
          <div className="ice-expenses-input">
            <input
              className="ui-control"
              type="text"
              value={iceAmount}
              onChange={(e) => setIceAmount(e.target.value)}
              placeholder="0"
            />
            <button
              className="ui-btn ui-btn--primary"
              type="button"
              onClick={handleSetIceExpenses}
            >
              עדכן
            </button>
          </div>
        </div>
      </div>

      <div className="done-event__card done-event__card--top">
        <div className="card__header">
          <h3> איזה רכב יצא לאירוע </h3>
        </div>

        <div className="ice-section">
          <div className="ice-expenses-input">
            <select
              className="ui-control"
              value={selectedCarType}
              onChange={(e) => setSelectedCarType(e.target.value)}
            >
              <option value="transporter">טרנספורטר</option>
              <option value="mazda">מאזדה</option>
              <option value="both">שניהם</option>
            </select>
            <button
              className="ui-btn ui-btn--primary"
              type="button"
              onClick={handleSetCarType}
            >
              עדכן רכב
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="done-event__card">



      <div className="card__header card__header--split">
        <div>
          <h3>הוצאות כלליות</h3>
          <div className="card__meta">סה״כ : {total} ₪</div>
        </div>

        <button
          className="ui-btn ui-btn--primary"
          type="button"
          onClick={() => setIsOpen((p) => !p)}
        >
          {isOpen ? "סגור" : "➕ הוסף הוצאה"}
        </button>
      </div>

      {isOpen && (
        <div className="panel">
          <div className="ui-row">
            <label className="ui-label">קטגוריה</label>
            <ExpenseTypeCombobox
              items={expenseTypes}
              valueId={form.expenseTypeId}
              onChange={(newId) =>
                setForm((p) => ({ ...p, expenseTypeId: newId }))
              }
              onCreateNew={onCreateExpenseType}
              placeholder="בחר קטגוריה..."
            />
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label">סכום</label>
              <input
                className="ui-control"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
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
                placeholder="למשל: חניה, טיפים לנהג, וכו׳"
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

      {rows.length === 0 ? (
        <div className="empty">עדיין לא הוזנו הוצאות כלליות</div>
      ) : (
        <div className="table-wrapper">
          <table className="global-table">
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>קטגוריה</th>
                <th>סכום</th>
                <th>הערות</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e._id}>
                  <td>{getExpenseTypeLabel(e)}</td>
                  <td>{Number(e.amount) || 0} ₪</td>
                  <td>{e.notes || ""}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="ui-btn--delete_item"
                      type="button"
                      onClick={() => onDelete?.(eventId, e._id)}
                      title="מחק הוצאה"
                    >
                      מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
    
