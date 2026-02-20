import { useState } from "react";

const ROLES = [
  { value: "BASIC", label: "BASIC" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
];

export default function NewUserModal({ employeeId, onCreate, onClose, saving = false }) {
  const [form, setForm] = useState({
    username: "",
    role: "BASIC",
    password: "",
  });
  const [error, setError] = useState("");

  const canSubmit =
    !!employeeId &&
    form.username.trim() !== "" &&
    form.password.trim().length >= 6 &&
    !saving;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    try {
      await onCreate({
        employeeId,
        username: form.username.trim(),
        role: form.role,
        password: form.password,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create user");
    }
  };

  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">יצירת משתמש חדש</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="ui-error">{error}</div>}

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row">
            <label className="ui-label">שם משתמש</label>
            <input
              className="ui-control"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ui-row">
            <label className="ui-label">תפקיד</label>
            <select
              className="ui-control"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              {ROLES.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-row">
            <label className="ui-label">סיסמה</label>
            <input
              className="ui-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="ui-footer">
            <button type="button" className="ui-btn" onClick={onClose} disabled={saving}>
              ביטול
            </button>
            <button type="submit" className="ui-btn ui-btn--primary" disabled={!canSubmit}>
              {saving ? "שומר..." : "צור משתמש"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
