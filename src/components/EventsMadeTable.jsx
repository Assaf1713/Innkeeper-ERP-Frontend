// Rendering the EventsMadeTable component to display detailed events table
import React from "react";
import { Link } from "react-router-dom";
import "../styles/EventsMadeTable.css";

export default function EventsMadeTable({ eventActuals }) {
  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL");
  };

  return (
    <div className="events-table-section">
      <h2 className="events-table-section__title">טבלת אירועים מפורטת</h2>
      <div className="table-wrapper">
        <table className="global-table">
          <thead>
            <tr>
              <th>מס&apos; אירוע</th>
              <th>תאריך אירוע</th>
              <th>לקוח</th>
              <th>סוג אירוע</th>
              <th>אורחים</th>
              <th>הכנסות (₪)</th>
              <th>ה. קרח (₪)</th>
              <th>ה. מלאי (₪)</th>
              <th>משכורות (₪)</th>
              <th>ה. כלליות (₪)</th>
              <th>סך כל ההוצאות (₪)</th>
              <th>רווח (₪)</th>
              <th>ה. אלכוהול לראש (₪)</th>
              <th>סך הוצאות לראש (₪)</th>
            </tr>
          </thead>
          <tbody>
            {eventActuals.map((ev) => (
              <tr key={ev._id}>
                <td className="global-table__event-number">
                  <Link to={`/events/${ev.event?._id}`}>{ev.event.eventNumber}</Link>
                </td>
                <td>{formatDate(ev.eventDateSnapshot)}</td>
                <td>{ev.event.customerName}</td>
                <td>{ev.event.eventType.label}</td>
                <td>{ev.guestCountSnapshot}</td>
                <td>{ev.priceSnapshot?.toLocaleString("he-IL")}</td>
                <td>{ev.totalIceExpenses?.toLocaleString("he-IL")}</td>
                <td>{ev.totalAlcoholExpenses?.toLocaleString("he-IL")}</td>
                <td>{ev.totalWages?.toLocaleString("he-IL")}</td>
                <td>{ev.totalGeneralExpenses?.toLocaleString("he-IL")}</td>
                <td>{ev.totalExpenses?.toLocaleString("he-IL")}</td>
                <td>{ev.profit?.toLocaleString("he-IL")}</td>
                <td>{ev.alcoholPerHead?.toLocaleString("he-IL")}</td>
                <td>{ev.totalExpensePerHead?.toLocaleString("he-IL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}