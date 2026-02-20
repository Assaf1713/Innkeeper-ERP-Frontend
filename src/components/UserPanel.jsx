
import { useEffect, useState } from "react";
import NewUserModal from "./forms/NewUserModal";

const ROLE_OPTIONS = [
  { value: "BASIC", label: "BASIC" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
];

export default function UserPanel({
  user,
  employeeId,
  onUserSave,
  onCreate,
  loading,
  saving,
  error,
}) {
  const [form, setForm] = useState({
    username: user?.username || "",
    role: user?.role || "",
    password: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    setForm({
      username: user?.username || "",
      role: user?.role || "",
      password: "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUserSave({
      username: form.username.trim(),
      role: form.role,
      password: form.password,
    });
  };

  const canSubmit =
    !!user &&
    form.username.trim() !== "" &&
    form.role !== "" &&
    !saving;

  return (
    <div className="user-panel">
      {loading ? (
        <div className="page-loading">טוען פרטי משתמש...</div>
      ) : error ? (
        <div className="employee-page__error">{error}</div>
      ) : user === null ? (
        <div className="ui-form">
          <h2 className="employee-page__section-title">פרטי משתמש</h2>
          <div className="card__hint">אין משתמש מקושר לעובד זה.</div>
          <div className="ui-footer">
            <button
              type="button"
              className="ui-btn ui-btn--primary"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={saving}
            >
              צור משתמש חדש
            </button>
          </div>
          {isCreateModalOpen && (
            <NewUserModal
              employeeId={employeeId}
              onCreate={onCreate}
              onClose={() => setIsCreateModalOpen(false)}
              saving={saving}
            />
          )}
        </div>
      ) : (
        <form className="ui-form employee-edit-form" onSubmit={handleSubmit}>
          <h2 className="employee-page__section-title">פרטי משתמש</h2>

          <div className="ui-row">
            <label className="ui-label">שם משתמש</label>
            <input
              className="ui-control"
              type="text"
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
              {ROLE_OPTIONS.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-row">
            <label className="ui-label">סיסמה חדשה (אופציונלי)</label>
            <input
              className="ui-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              placeholder="השאר ריק ללא שינוי"
            />
          </div>

          <div className="ui-footer">
            <button type="submit" className="ui-btn ui-btn--primary" disabled={!canSubmit}>
              {saving ? "שומר..." : "שמור"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
