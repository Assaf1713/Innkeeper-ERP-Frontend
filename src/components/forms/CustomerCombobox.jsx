import EntityComboboxWithModalCreate from "../ComboBox/EntityComboboxWithModalCreate";
import { useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

export default function CustomerCombobox({ customerId, onCustomerChange, disabled = false }) {
  const [customers, setCustomers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Lazy load customers when combobox opens
  const ensureCustomers = async () => {
    if (loaded) return;
    try {
      const res = await apiFetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers);
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleCreate = async (formValues) => {
    const res = await apiFetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(formValues),
    });
    if (!res.ok) {
      // Extract error message from response and show on the form
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create customer");
    }
    const data = await res.json();
    setCustomers((prev) => [...prev, data.customer]);
    return data.customer;
  };

  const formRenderingFunction= ({ initialName, onSubmit, onCancel, busy, error }) => (
    <CustomerCreateForm
      initialName={initialName} 
      onSubmit={onSubmit} 
      onCancel={onCancel} 
      busy={busy} 
      error={error} 
    />
  );

  return (
    <div onFocus={ensureCustomers}>
      <EntityComboboxWithModalCreate
        entityLabel="לקוח"
        items={customers}
        valueId={customerId}
        onChange={(id, customer) => onCustomerChange(id, customer)}
        getItemId={(c) => c._id}
        getItemLabel={(c) => c.name}
        isItemActive={(c) => c.isActive}
        placeholder="בחר לקוח..."
        disabled={disabled}
        allowCreate={true}
        onCreate={handleCreate}
        // render the customer creation form using CustomerCreateForm component
        renderCreateForm={formRenderingFunction}
      />
    </div>
  );
}

// JSX component for the customer creation form

function CustomerCreateForm({ initialName, onSubmit, onCancel, busy, error }) {
  const [form, setForm] = useState({
    name: initialName || "",
    email: "",
    phone: "",
    company: "",
    companyId: "",
    IsBusiness: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="ui-form" onSubmit={handleSubmit}>
      {error && <div className="ui-error"> ⚠️ {error}</div>}

      <div className="ui-row">
        <label className="ui-label">שם לקוח *</label>
        <input
          className="ui-control"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          autoFocus
        />
      </div>

      <div className="ui-row">
        <label className="ui-label">טלפון</label>
        <input
          className="ui-control"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>

      <div className="ui-row">
        <label className="ui-label">אימייל</label>
        <input
          className="ui-control"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>

      <div className="ui-row">
        <label className="ui-label">
          <input
            type="checkbox"
            checked={form.IsBusiness}
            onChange={(e) => setForm((p) => ({ ...p, IsBusiness: e.target.checked }))}
          />
          {" "}עסק / חברה
        </label>
      </div>

      {form.IsBusiness && (
        <>
          <div className="ui-row">
            <label className="ui-label">שם חברה</label>
            <input
              className="ui-control"
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            />
          </div>

          <div className="ui-row">
            <label className="ui-label">ח.פ / ע.מ</label>
            <input
              className="ui-control"
              value={form.companyId}
              onChange={(e) => setForm((p) => ({ ...p, companyId: e.target.value }))}
            />
          </div>
        </>
      )}

      <div className="ui-footer">
        <button type="button" className="ui-btn" onClick={onCancel} disabled={busy}>
          ביטול
        </button>
        <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
          {busy ? "שומר..." : "שמור לקוח"}
        </button>
      </div>
    </form>
  );
}