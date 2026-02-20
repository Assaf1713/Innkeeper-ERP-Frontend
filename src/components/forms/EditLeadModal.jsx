import { useState, useEffect } from "react";

export default function EditLeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    eventDate: "",
    userNotes: "",
    guestCount: "",
    eventLocation: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        fullName: lead.fullName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        eventDate: lead.eventDate
          ? new Date(lead.eventDate).toISOString().split("T")[0]
          : "",
        message: lead.message || "",
        userNotes: lead.userNotes || "",
        guestCount: lead.guestCount || "",
        eventLocation: lead.eventLocation || "",
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (error) {
      console.error("Error in EditLeadModal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">עריכת ליד</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row">
            <label className="ui-label" htmlFor="fullName">
              שם מלא *
            </label>
            <input
              className="ui-control"
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label" htmlFor="email">
                אימייל
              </label>
              <input
                className="ui-control"
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="ui-row">
              <label className="ui-label" htmlFor="phone">
                טלפון
              </label>
              <input
                className="ui-control"
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label" htmlFor="eventDate">
                תאריך אירוע מבוקש
              </label>
              <input
                className="ui-control"
                id="eventDate"
                name="eventDate"
                type="date"
                value={form.eventDate}
                onChange={handleChange}
              />
            </div>

            <div className="ui-row">
              <label className="ui-label" htmlFor="guestCount">
                כמות אורחים
              </label>
              <input
                className="ui-control"
                id="guestCount"
                name="guestCount"
                type="number"
                min="0"
                value={form.guestCount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ui-row">
            <label className="ui-label" htmlFor="eventLocation">
              כתובת/מיקום האירוע
            </label>
            <input
              className="ui-control"
              id="eventLocation"
              name="eventLocation"
              type="text"
              value={form.eventLocation}
              onChange={handleChange}
            />
          </div>

          {lead.message !== "" && lead.message !== null && (
            <div className="ui-row">
              <label className="ui-label" htmlFor="message">
                הודעת הליד
              </label>
              <textarea
                className="ui-control"
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="ui-row">
            <label className="ui-label" htmlFor="notes">
              הערות מנהל
            </label>
            <textarea
              className="ui-control"
              id="userNotes"
              name="userNotes"
              rows="4"
              value={form.userNotes}
              onChange={handleChange}
            />
          </div>

          <div className="ui-modal__actions">
            <button
              type="button"
              className="ui-btn ui-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="ui-btn ui-btn--primary"
              disabled={submitting}
            >
              {submitting ? "שומר..." : "שמור"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
