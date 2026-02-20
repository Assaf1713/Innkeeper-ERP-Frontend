import { useEffect, useState, useMemo } from "react";
import {
  fetchUnavailableDates,
  addUnavailableDate,
  removeUnavailableDate,
} from "../api/unavailableDatesApi";
import FilterPanel, {
  FilterActions,
  FilterChooseEntryLimit,
} from "../components/FilterPanel";
import { useAlert } from "../hooks/useAlert";
import "../styles/UnavailableDates.css";

export default function UnavailableDates() {
  const { showSuccess, showError } = useAlert();
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entryLimit, setEntryLimit] = useState(20);
  
  // Form state
  const [dateMode, setDateMode] = useState("single"); // 'single' or 'range'
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUnavailableDates();
  }, []);

  const loadUnavailableDates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUnavailableDates();
      setUnavailableDates(data || []);
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת התאריכים החסומים. אנא נסה שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  };

  const displayedDates = useMemo(() => {
    if (entryLimit === "all") return unavailableDates;
    return unavailableDates.slice(0, entryLimit);
  }, [unavailableDates, entryLimit]);

  const handleDeleteDate = async (id) => {
    try {
      await removeUnavailableDate(id);
      setUnavailableDates((prev) => prev.filter((date) => date._id !== id));
      showSuccess("התאריך נמחק בהצלחה");
    } catch (err) {
      console.error("Error deleting date:", err);
      showError("שגיאה במחיקת התאריך. אנא נסה שוב.");
    }
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let payload = { reason };

      if (dateMode === "single") {
        if (!singleDate) {
          showError("נא לבחור תאריך");
          setSubmitting(false);
          return;
        }
        payload.blockedDate = singleDate;
      } else {
        if (!startDate || !endDate) {
          showError("נא לבחור תאריך התחלה וסיום");
          setSubmitting(false);
          return;
        }
        payload.startDate = startDate;
        payload.endDate = endDate;
      }

      const result = await addUnavailableDate(payload);
      
      // Reload the dates to get fresh data
      await loadUnavailableDates();
      
      // Reset form
      setSingleDate("");
      setStartDate("");
      setEndDate("");
      setReason("");
      
      showSuccess(
        result.message || "התאריך נוסף בהצלחה"
      );
    } catch (err) {
      console.error("Error adding date:", err);
      let errorMessage = "שגיאה בהוספת התאריך. אנא נסה שוב.";

       if (err.number === 1) {
        errorMessage = "תאריך ההתחלה לא יכול להיות גדול מתאריך הסיום";
      } else if (err.number === 2) {
        errorMessage = "חלק מהתאריכים כבר חסומים.";
      } else if (err.number === 3) {
        errorMessage = "תאריך זה כבר חסום.";
      }
      

      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setEntryLimit(20);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) return <div className="page-loading">טוען...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ניהול תאריכים חסומים</h1>
      </div>

      {/* Add Date Form */}
      <div className="unavailable-dates-form">
        <form onSubmit={handleAddDate}>
          <div className="form-row">
            <div className="form-group">
              <label className="ui-label">סוג הוספה</label>
              <select
                className="ui-control"
                value={dateMode}
                onChange={(e) => setDateMode(e.target.value)}
              >
                <option value="single">תאריך בודד</option>
                <option value="range">טווח תאריכים</option>
              </select>
            </div>

            {dateMode === "single" ? (
              <div className="form-group">
                <label className="ui-label">תאריך</label>
                <input
                  type="date"
                  className="ui-control"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="ui-label">תאריך התחלה</label>
                  <input
                    type="date"
                    className="ui-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="ui-label">תאריך סיום</label>
                  <input
                    type="date"
                    className="ui-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="ui-label">סיבה (אופציונלי)</label>
              <input
                type="text"
                className="ui-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="לדוגמה: חג, חופשה..."
              />
            </div>

            <div className="form-group form-group--submit">
              <button
                type="submit"
                className="ui-btn ui-btn--primary"
                disabled={submitting}
              >
                {submitting ? "מוסיף..." : "הוסף תאריך"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <FilterPanel>
        <FilterChooseEntryLimit
          value={entryLimit}
          onChange={(value) =>
            setEntryLimit(value === "all" ? "all" : Number(value))
          }
        />
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <div className="table-info">
        מציג {displayedDates.length} מתוך {unavailableDates.length} תאריכים
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>סיבה</th>
                <th>נוצר בתאריך</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedDates.map((date) => (
                <tr key={date._id}>
                  <td>{formatDate(date.blockedDate)}</td>
                  <td>{date.reason || "-"}</td>
                  <td>{new Date(date.createdAt).toLocaleDateString("he-IL")}</td>
                  <td>
                    <button
                      className="global-table__btn ui-btn--delete_item"
                      onClick={() => handleDeleteDate(date._id)}
                    >
                      מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedDates.length === 0 && (
          <div className="no-results">לא נמצאו תאריכים חסומים</div>
        )}
      </div>
    </div>
  );
}
