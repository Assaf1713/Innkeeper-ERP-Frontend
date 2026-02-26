import { useState, useEffect } from "react";

export default function EditCustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    companyId: "",
    IsBusiness: false,
    payingCustomer: false,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        companyId: customer.companyId || "",
        IsBusiness: customer.IsBusiness || false,
        payingCustomer: customer.payingCustomer || false,
        isActive: customer.isActive ?? true,
      });
    }
  }, [customer]);

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
      await onSave(form);
    } catch (error) {
      console.error("Error in EditCustomerModal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">עריכת לקוח</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row">
            <label className="ui-label" htmlFor="name">
              שם *
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
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label" htmlFor="company">
                חברה
              </label>
              <input
                className="ui-control"
                id="company"
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="ui-row">
              <label className="ui-label" htmlFor="companyId">
                ח.פ / ע.מ
              </label>
              <input
                className="ui-control"
                id="companyId"
                name="companyId"
                type="text"
                value={form.companyId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row ui-row--checkbox">
              <label className="ui-label">
                <input
                  type="checkbox"
                  name="IsBusiness"
                  checked={form.IsBusiness}
                  onChange={handleChange}
                />
                <span>לקוח עסקי</span>
              </label>
            </div>

            <div className="ui-row ui-row--checkbox">
              <label className="ui-label">
                <input
                  type="checkbox"
                  name="payingCustomer"
                  checked={form.payingCustomer}
                  onChange={handleChange}
                />
                <span>לקוח משלם</span>
              </label>
            </div>

            <div className="ui-row ui-row--checkbox">
              <label className="ui-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span>פעיל</span>
              </label>
            </div>
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
