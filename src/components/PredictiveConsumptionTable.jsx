/* eslint-disable no-unused-vars */
import { fetchPredictiveConsumption } from "../api/eventsApi";
import { useEffect, useState } from "react";
import "../styles/PredictiveConsumptionTable.css";
import { useAlert } from "../hooks/useAlert";

export default function PredictiveConsumptionTable({ event }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showError } = useAlert();

  // Initialization (Run once on mount or when event changes)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const predictiveData = await fetchPredictiveConsumption(event._id);
        setData(predictiveData);
      } catch (err) {
        setError(err.message);
        showError("אירעה שגיאה בטעינת נתוני העבר");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [event._id, showError]);

  if (loading) {
    return <div className="loading-text">Loading...</div>;
  }

  if (error) {
    return <div className="error-text">Error: {error}</div>;
  }

  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <div className="pricing-header-content">
          <h3 className="pricing-title">מחשבון צריכת אלכוהול</h3>
          <div className="pricing-subtitle">
            טבלת צריכת אלכוהול ממוצעת לאירוע <strong>{event.eventType?.label}</strong>
            <br />
            <span className="pricing-subtitle-meta">
              מבוסס על {data?.basedOnEventsCount || 0} אירועי עבר | כמות אורחים: {data?.targetGuestCount || 0}
            </span>
          </div>
        </div>
        <button
          className={`pricing-section__toggle ${isExpanded ? "expanded" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "הסתר מחשבון צריכת אלכוהול" : "הצג מחשבון צריכת אלכוהול"}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="predictive-consumption__table-wrapper">
          <div className="table-wrapper predictive-table-spacing">
            <table className="global-table">
              <thead>
                <tr>
                  <th>סוג</th>
                  <th>ממוצע מ"ל לראש</th>
                  <th>ס. תקן</th>
                  <th>ממוצע משוקלל לראש</th>
                  <th>כמות בליטרים</th>
                  <th>בקבוקי 700</th>
                  <th>בקבוקי 1000</th>
                </tr>
              </thead>
              <tbody>
                {data?.predictions?.length > 0 ? (
                  data.predictions.map((row, index) => (
                    <tr key={index}>
                      <td>{row.category}</td>
                      <td>{row.averageMlPerHead}</td>
                      <td>{row.stdDev}</td>
                      <td>{row.weightedAveragePerHead}</td>
                      <td>{row.projectedLiters}</td>
                      <td>{row.bottles700}</td>
                      <td>{row.bottles1000}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="global-table__empty-state">
                      לא נמצאו נתונים להצגה
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}