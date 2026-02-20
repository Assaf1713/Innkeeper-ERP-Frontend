/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAlert } from "../../hooks/useAlert";
import { apiFetch } from "../../utils/apiFetch";


export default function NewEventModal({ onClose, onCreated, initialData=null }) {
const defaultFormState = {
    customerId: "",
    customerName: "",
    eventDate: "",
    guestCount: "",
    eventAddress: "",
    startTime: "",
    endTime: "",
    price: "",
    notes: "",
    eventTypeCode: "",
    leadSourceCode: "",
    menuTypeCode: "",
    statusCode: "",
  };
  const [form, setForm] = useState(defaultFormState);
  const { showError, showSuccess } = useAlert();

  const [submitting, setSubmitting] = useState(false);
  const [lookups, setLookups] = useState({
    eventTypes: [],
    leadSources: [],
    menuTypes: [],
    statuses: [],
  });
  const [loadingLookups, setLoadingLookups] = useState(false);


  // Pre-fill form if initialData is provided
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...defaultFormState, 
        customerName: initialData.fullName || "",
        eventDate: initialData.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : "",
        guestCount: initialData.guestCount || "",
        eventAddress: initialData.eventLocation || "", 
        notes: initialData.userNotes || "", 
        customerId: initialData.relatedCustomerId || "", 
        leadId: initialData._id, // I will soon send the leadId to backend to link the event to the lead
        email: initialData.email || "", // needed to check for existing customer
        phone: initialData.phone || "",
      }));
    }
  }, [initialData]);


  // Fetch lookup data on mount
  useEffect(() => {
    const fetchLookups = async () => {
      setLoadingLookups(true);
      try {
        const res = await apiFetch("/api/lookups");
        const data = await res.json();
        setLookups({
          eventTypes: data.eventTypes,
          leadSources: data.leadSources,
          menuTypes: data.menuTypes,
          statuses: data.statuses,
        });
      } catch (error) {
        console.error("Error fetching lookups:", error);
        showError("אירעה שגיאה בטעינת נתוני lookup. אנא רענן את הדף.");
      } finally {
        setLoadingLookups(false);
      }
    };
    fetchLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
 
      const fd = new FormData();
      fd.append("customerName", form.customerName);
      fd.append("customerId", form.customerId);
      fd.append("eventDate", form.eventDate);
      fd.append("guestCount", form.guestCount);
      fd.append("eventAddress", form.eventAddress);
      fd.append("startTime", form.startTime);
      fd.append("endTime", form.endTime);
      fd.append("price", form.price);
      fd.append("notes", form.notes);
      fd.append("eventTypeCode", form.eventTypeCode);
      fd.append("leadSourceCode", form.leadSourceCode);
      fd.append("menuTypeCode", form.menuTypeCode);
      fd.append("statusCode", form.statusCode);
      if (form.leadId) fd.append("leadId", form.leadId); 
        if (!form.customerId) {
             // There is no customerId, so we need to create a new customer in the backend
             fd.append("email", form.email);
             fd.append("phone", form.phone);
        }

      const res = await apiFetch("/api/events", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || "Network response was not ok");
        error.number = errorData.number;
        throw error;
      }
      const data = await res.json();
      onCreated(data.event);
      console.log("Event created:", data);
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      if(error.number===1){
        showError("יש להזין תחילה כתובת מייל לליד");
      }
      else{
      showError("אירעה שגיאה ביצירת האירוע. אנא נסה שוב.");
      }
    } finally {
      setSubmitting(false);
    }
  };

return (
  <div className="ui-modal-backdrop" >
    <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
      <div className="ui-modal__header">
        <h2 className="ui-modal__title">אירוע חדש</h2>
        <button type="button" className="ui-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <form className="ui-form" onSubmit={handleSubmit}>
        <div className="ui-row">
          <label className="ui-label" htmlFor="customerName">לקוח</label>
          <input
            className="ui-control"
            id="customerName"
            name="customerName"
            type="text"
            value={form.customerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label" htmlFor="eventDate">תאריך אירוע</label>
            <input
              className="ui-control"
              id="eventDate"
              name="eventDate"
              type="date"
              value={form.eventDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ui-row">
            <label className="ui-label" htmlFor="guestCount">מספר אורחים</label>
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

        <div className="ui-row--inline">
          <div className="ui-row">
            <label className="ui-label" htmlFor="startTime">שעת התחלה</label>
            <input
              className="ui-control"
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
            />
          </div>

          <div className="ui-row">
            <label className="ui-label" htmlFor="endTime">שעת סיום</label>
            <input
              className="ui-control"
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="ui-row">
          <label className="ui-label" htmlFor="eventAddress">כתובת אירוע</label>
          <input
            className="ui-control"
            id="eventAddress"
            name="eventAddress"
            type="text"
            value={form.eventAddress}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ui-row">
          <label className="ui-label" htmlFor="eventTypeCode">סוג אירוע</label>
          <select
            className="ui-control"
            id="eventTypeCode"
            name="eventTypeCode"
            value={form.eventTypeCode}
            disabled={loadingLookups}
            onChange={handleChange}
            required
          >
            <option value="">בחר סוג אירוע</option>
            {lookups.eventTypes.map((et) => (
              <option key={et.code} value={et.code}>{et.label}</option>
            ))}
          </select>
        </div>

        <div className="ui-row">
          <label className="ui-label" htmlFor="notes">הערות</label>
          <textarea
            className="ui-control"
            id="notes"
            name="notes"
            rows="3"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <div className="ui-footer">
          <button type="button" className="ui-btn" onClick={onClose} disabled={submitting}>
            ביטול
          </button>
          <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
            {submitting ? "שומר..." : "שמור אירוע"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}