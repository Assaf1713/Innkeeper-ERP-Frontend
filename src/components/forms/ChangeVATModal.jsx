import { useState } from "react";
import Modal from "../Modal";
import { ChangeVAT } from "../../api/inventoryProductsApi";
import { useAlert } from "../../hooks/useAlert";
import {updateSetting} from "../../api/settingsApi";



export default function ChangeVATModal({ onClose, onSuccess, currentVAT }) {
  const { showSuccess, showError } = useAlert();
  const [newVAT, setNewVAT] = useState("");
  const [submitting, setSubmitting] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vatValue = parseFloat(newVAT);
    if (isNaN(vatValue) || vatValue < 0 || vatValue > 100) {
      showError("אנא הזן אחוז מע\"מ תקין (0-100)");
      return;
    }

    setSubmitting(true);
    try {
      await ChangeVAT(vatValue);
      await updateSetting("currentVAT", vatValue);
      showSuccess("מע\"מ עודכן בהצלחה עבור כל המוצרים");
      onSuccess?.();
    } catch (err) {
      console.error("Error updating VAT:", err);
      showError(err.message || "שגיאה בעדכון מע\"מ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
     <div className="ui-modal-backdrop" >
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">עריכת מע"מ</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row">
            <label className="ui-label" htmlFor="newVAT">
                אחוז מע"מ חדש: (נוכחי : {currentVAT}%  )
            </label>
            <input
              className="ui-control"
              id="newVAT"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={newVAT}
              onChange={(e) => setNewVAT(e.target.value)}
              placeholder="הכנס מספר שלם ללא סימן אחוז"
              required
              autoFocus
            />
            <small className="form-help">
              לאחר עדכון המע"מ, המחירים של כל המוצרים יתעדכנו אוטומטית בהתאם.
            </small>
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
              {submitting ? "מעדכן..." : "עדכן מע\"מ"}
            </button>
          </div>
        </form>
    </div>
    </div>
  );
}
