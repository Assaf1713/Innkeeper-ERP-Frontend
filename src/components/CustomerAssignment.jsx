import { useState } from "react";
import CustomerCombobox from "./forms/CustomerCombobox";
import "../styles/CustomerAssignment.css";

export default function CustomerAssignment({ 
  customerId, 
  customerName, 
  customerEmail,
  onAssign,
  disabled = false 
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleCustomerChange = async (newCustomerId, customer) => {
    await onAssign(newCustomerId, customer.name);
    setIsEditing(false);
  };

  const handleClearCustomer = async () => {
    await onAssign("", customerName);
    setIsEditing(false);
  };




  if (!isEditing && customerId) {
    // Customer is assigned - show read-only view
    return (
      <div className="customer-assignment">
        <div className="customer-assignment__header">👤 לקוח משויך</div>
        <div className="customer-assignment__row">
          <input
            className="ui-control customer-assignment__input"
            value={customerName}
            disabled
          />
          {customerEmail && (
            <input
              className="ui-control customer-assignment__input"
              value={customerEmail}
              disabled
            />
          )}

          <button
            type="button"
            className="ui-btn"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
          >
            שנה לקוח
          </button>
        </div>
      </div>
    );
  }

  // No customer assigned or editing mode
  return (
    <div className="customer-assignment">
      <div className="customer-assignment__title">
        {customerId ? "🔄 שנה לקוח" : "➕ שייך לקוח לאירוע זה"}
      </div>


      <div className="customer-assignment__field">
        <CustomerCombobox
          customerId={customerId}
          onCustomerChange={handleCustomerChange}
          disabled={disabled}
        />
      </div>

      {customerId && (
        <div className="customer-assignment__actions">
          <button
            type="button"
            className="ui-btn"
            onClick={() => setIsEditing(false)}
          >
            ביטול
          </button>

          <button
            type="button"
            className="ui-btn"
            onClick={handleClearCustomer}
          >
            הסר שיוך
          </button>
        </div>
      )}
    </div>
  );
}