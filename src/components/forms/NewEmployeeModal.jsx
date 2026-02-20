import { useState } from "react";

export default function NewEmployeeModal({ onClose, onCreated, Error }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    defaultRole: "",
  });

  const [submitting, setSubmitting] = useState(false);
  

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
      const res = await onCreated(form);
      if (res.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating employee:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">יצירת עובד חדש</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {Error && <div className="ui-error">{Error}</div>}

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row"> 
            <label className="ui-label" htmlFor="name">
                שם עובד *
            </label>
            <input
              className="ui-control"
              id="name"
              name="name"
              type="text"
              value={form.name}
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
                value={form.phone}
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label" htmlFor="defaultRole">
                תפקיד ברירת מחדל
                </label>
                <select
                    className="ui-control"
                    id="defaultRole"
                    name="defaultRole"
                    value={form.defaultRole}
                    onChange={handleChange}
                >
                    <option value="">בחר תפקיד</option>
                    <option value="manager">מנהל</option>
                    <option value="bartender">ברמן</option>
                    <option value="logistics">לוגיסטיקה</option>
                </select>
            </div>
          </div>

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
              {submitting ? "שומר..." : "שמור עובד חדש"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
