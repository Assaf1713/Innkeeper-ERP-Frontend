import { useState } from "react";

export default function NewCustomerModal({ onClose, onCreate, Error }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    companyId: "",
    IsBusiness: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await onCreate(form);
      if (res.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">יצירת לקוח חדש</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          {Error && <div className="ui-error"> ⚠️ {Error}</div>}

          <div className="ui-row">
            <label className="ui-label">שם לקוח *</label>
            <input
              className="ui-control"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="ui-row">
            <label className="ui-label">טלפון</label>
            <input
              className="ui-control"
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="ui-row">
            <label className="ui-label">אימייל</label>
            <input
              className="ui-control"
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="ui-row">
            <label className="ui-label">
              <input
                id="IsBusiness"
                name="IsBusiness"
                type="checkbox"
                checked={form.IsBusiness}
                onChange={handleChange}
              />{" "}
              עסק / חברה
            </label>
          </div>

          {form.IsBusiness && (
            <>
              <div className="ui-row">
                <label className="ui-label">שם חברה</label>
                <input
                  className="ui-control"
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                />
              </div>

              <div className="ui-row">
                <label className="ui-label">ח.פ / ע.מ</label>
                <input
                  className="ui-control"
                  id="companyId"
                  name="companyId"
                  value={form.companyId}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="ui-footer">
            <button
              type="button"
              className="ui-btn"
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
              {submitting ? "שומר..." : "שמור לקוח"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
