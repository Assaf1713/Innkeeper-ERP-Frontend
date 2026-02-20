/* eslint-disable no-unused-vars */
export default function EventEditForm({
  lookups,
  onSave,
  setForm,
  form,
  saving,
  VAT
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₪0";
    return price.toLocaleString("he-IL");
  };

  return (
    <div>
      <form
        className="ui-form"
        onSubmit={onSave}
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label">שם לקוח</label>
            <input
              className="ui-control"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="ui-row">
            <label className="ui-label">תאריך אירוע</label>
            <input
              className="ui-control"
              name="eventDate"
              type="date"
              value={form.eventDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ui-row">
            <label className="ui-label">מספר אורחים</label>
            <input
              className="ui-control"
              name="guestCount"
              type="number"
              min="0"
              value={form.guestCount}
              onChange={handleChange}
            />
          </div>
          <div className="ui-row">
            <label className="ui-label">סוג אירוע</label>
            <select
              className="ui-control"
              name="eventTypeCode"
              value={form.eventTypeCode}
              onChange={handleChange}
            >
              <option value="">בחר</option>
              {lookups.eventTypes.map((x) => (
                <option key={x.code} value={x.code}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label">כתובת</label>
            <input
              className="ui-control"
              name="eventAddress"
              value={form.eventAddress}
              onChange={handleChange}
            />
            {form.travelDistance ? (
              <div className="ui-hint">
                <div className="ui-hint">  זמן נסיעה מוערך: {form.travelTime || "לא זמין"}</div>
              </div>
            ) : null}
          </div>

          <div className="ui-row">
            <label className="ui-label">שעת התחלה</label>
            <input
              className="ui-control"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
            />
          </div>
          <div className="ui-row">
            <label className="ui-label">שעת סיום</label>
            <input
              className="ui-control"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="ui-row--inline"></div>

        <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label">מקור ליד</label>
            <select
              className="ui-control"
              name="leadSourceCode"
              value={form.leadSourceCode}
              onChange={handleChange}
            >
              <option value="">בחר</option>
              {lookups.leadSources.map((x) => (
                <option key={x.code} value={x.code}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-row">
            <label className="ui-label">סוג תפריט</label>
            <select
              className="ui-control"
              name="menuTypeCode"
              value={form.menuTypeCode}
              onChange={handleChange}
            >
              <option value="">בחר</option>
              {lookups.menuTypes.map((x) => (
                <option key={x.code} value={x.code}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-row">
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label className="ui-label">מחיר</label>
            {form.eventTypeCode === "WEDDING_FULL_BAR" && form.price!==0 ? (
              <div className="ui-hint">
              | מחיר לראש לפני מעמ :  {formatPrice(Math.ceil(form.price / form.guestCount / ((1+VAT/100) || 1.18 )))}
              </div>
            ) : null}
            </div>
            <input
              className="ui-control ui-control--price"
              name="price"
              type="text"
              value={(form.price)}
              onChange={handleChange}
              placeholder="הזן מספר שלם או נוסחה המתחילה ב ="
            />
          </div>
        </div>

        <div className="ui-row">
          <label className="ui-label">הערות</label>
          <textarea
            className="ui-control"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="5"
          />
        </div>

        <div className="ui-footer">
          <button
            type="submit"
            className="ui-btn ui-btn--primary"
            disabled={saving}
          >
            {saving ? "שומר..." : "שמור שינויים"}
          </button>
        </div>
      </form>
    </div>
  );
}
