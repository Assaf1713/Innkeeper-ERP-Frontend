import { useState } from "react";
import "../../styles/EmployeeEditForm.css";


export default function EmployeeEditForm({ employee, onSave, saving, isAdmin }) {

  const [form, setForm] = useState({
    name: employee.name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    defaultRole: employee.defaultRole || "bartender",
    isActive: employee.isActive ?? true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="ui-form employee-edit-form" onSubmit={handleSubmit}>
      <h2 className="employee-edit-form__title">פרטי עובד</h2>
      {!employee.isActive && <span className="employee-edit-form__notes">העובד אינו פעיל, לא ניתן לערוך את פרטיו</span>}

      <div className="ui-row">
        <label className="ui-label">שם מלא*</label>
        <input
          className="ui-control"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={employee.isActive === false || !isAdmin}
          required
        />
      </div>

      <div className="ui-row--inline">
        <div className="ui-row">
          <label className="ui-label">טלפון</label>
          <input
            className="ui-control"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            disabled={employee.isActive === false || !isAdmin}
          
          />
        </div>

        <div className="ui-row">
          <label className="ui-label">אימייל</label>
          <input
            className="ui-control"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={employee.isActive === false || !isAdmin}
          />
        </div>
      </div>

      <div className="ui-row--inline">
        <div className="ui-row">
          <label className="ui-label">תפקיד ברירת מחדל*</label>
          <select
            className="ui-control"
            name="defaultRole"
            value={form.defaultRole}
            onChange={handleChange}
            disabled={employee.isActive === false || !isAdmin}
            required
          >
            <option value="bartender">ברמן</option>
            <option value="manager">מנהל</option>
            <option value="logistics">לוגיסטיקה</option>
          </select>
        </div>

      </div>

      <div className="employee-edit-form__actions">
        <button
          type="submit"
          className={employee.isActive && isAdmin ? "ui-btn ui-btn--primary" : "ui-btn ui-btn--disabled"}
          disabled={saving || employee.isActive === false || !isAdmin}
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </form>
  );
}