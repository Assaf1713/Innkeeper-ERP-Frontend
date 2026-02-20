import { useCallback, useEffect, useState } from "react";
import EntityComboboxWithModalCreate from "../ComboBox/EntityComboboxWithModalCreate";
import { fetchCustomers } from "../../api/customersApi";

export default function NewLeadModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    userNotes: "",
    eventDate: "",
    eventLocation: "",
    guestCount: "",
  });
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [useExistingCustomer, setUseExistingCustomer] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    if (customers.length > 0 || loadingCustomers) return;
    setLoadingCustomers(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("שגיאה בטעינת רשימת לקוחות");
    } finally {
      setLoadingCustomers(false);
    }
  }, [customers.length, loadingCustomers]);

  useEffect(() => {
    if (useExistingCustomer) {
      loadCustomers();
    }
  }, [useExistingCustomer, loadCustomers]);

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
    setError("");

    try {
      if (useExistingCustomer && !customerId) {
        throw new Error("יש לבחור לקוח מהרשימה");
      }

      if (!form.fullName?.trim()) {
        throw new Error("שם מלא הוא שדה חובה");
      }

      // Source is always "manual" for manually created leads
      const leadData = {
        ...form,
        relatedCustomer: useExistingCustomer ? customerId : undefined,
        source: "manual",
        guestCount: form.guestCount ? Number(form.guestCount) : undefined,
      };

      await onCreate(leadData);
      onClose();
    } catch (err) {
      console.error("Error creating lead:", err);
      setError(err.message || "שגיאה ביצירת הליד. אנא נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">יצירת ליד חדש</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          {error && <div className="ui-error"> ⚠️ {error}</div>}


        <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label">שם לקוח *</label>
            {!useExistingCustomer ? (
              <>
                <input
                  className="ui-control"
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => setUseExistingCustomer(true)}
                >
                  בחר לקוח קיים
                </button>
              </>
            ) : (
              <>
                <EntityComboboxWithModalCreate
                  entityLabel="לקוח"
                  items={customers}
                  valueId={customerId}
                  onChange={(id, customer) => {
                    setCustomerId(id || "");
                    setForm((prev) => ({
                      ...prev,
                      fullName: customer?.name || "",
                      email: customer?.email || "",
                      phone: customer?.phone || "",
                    }));
                  }}
                  getItemId={(c) => c._id}
                  getItemLabel={(c) => c.name}
                  isItemActive={(c) => c?.isActive !== false}
                  placeholder={loadingCustomers ? "טוען לקוחות..." : "בחר לקוח..."}
                  disabled={loadingCustomers}
                  allowCreate={false}
                />
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => {
                    setUseExistingCustomer(false);
                    setCustomerId("");
                  }}
                >
                  הזן שם ידנית
                </button>
              </>
            )}
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
    
            <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label">תאריך אירוע מבוקש</label>
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
            <label className="ui-label">מיקום האירוע</label>
            <input
              className="ui-control"
              id="eventLocation"
              name="eventLocation"
              type="text"
              value={form.eventLocation}
              onChange={handleChange}
            />
          </div>
            </div>

          <div className="ui-row">
            <label className="ui-label">מספר אורחים משוער</label>
            <input
              className="ui-control"
              id="guestCount"
              name="guestCount"
              type="number"
              value={form.guestCount}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="ui-row">
            <label className="ui-label">הודעה / הערות</label>
            <textarea
              className="ui-control"
              id="userNotes"
              name="userNotes"
              value={form.userNotes}
              onChange={handleChange}
              rows="4"
            />
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
              {submitting ? "שומר..." : "שמור ליד"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
