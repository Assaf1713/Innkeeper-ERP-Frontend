// component that renders a table of all the closed events
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api/eventsApi";
import { fetchUnavailableDates } from "../api/unavailableDatesApi";
import { useAlert } from "../hooks/useAlert";
import {useAuth} from "../hooks/useAuth";
import { listPlannedShifts } from "../api/plannedShiftsApi";
import "../styles/ClosedEvents.css";

export default function ClosedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showAlert } = useAlert();
  const [plannedShiftsByEvent, setPlannedShiftsByEvent] = useState({});
  const [unavailableDates, setUnavailableDates] = useState([]);
  const { user } = useAuth();

  // Format price as currency
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₪0";
    return `₪${price.toLocaleString("he-IL")}`;
  };

  // Format service hours
  const formatServiceHours = (startTime, endTime) => {
    if (!startTime && !endTime) return "-";
    if (startTime && endTime) return `${startTime} - ${endTime}`;
    if (startTime) return startTime;
    if (endTime) return endTime;
    return "-";
  };

  // Format date
  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL");
  };

  const findDayOfWeek = (dateString) => {
    const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return daysOfWeek[date.getDay()];
  }

  // Truncate text for cocktail menu
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // generate palnned employee list and count

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const eventsData = await fetchEvents();
        const closedEvents = eventsData
          .filter((ev) => ev.status?.code === "CLOSED")
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        setEvents(closedEvents);

        // Load planned shifts for all closed events
        const shiftsMap = {};
        await Promise.all(
          closedEvents.map(async (ev) => {
            try {
              const data = await listPlannedShifts(ev._id);
              shiftsMap[ev._id] = data.plannedShifts || [];
            } catch (err) {
              console.error(`Error loading shifts for event ${ev._id}:`, err);
              shiftsMap[ev._id] = [];
            }
          }),
        );
        setPlannedShiftsByEvent(shiftsMap);
      } catch (err) {
        console.error("Error loading closed events:", err);
        setError("אירעה שגיאה בטעינת האירועים הסגורים");
        showAlert("אירעה שגיאה בטעינת האירועים הסגורים", "error");
      } finally {
        setLoading(false);
      }
    }

    async function loadUnavailableDates() {
      try {
        const data = await fetchUnavailableDates();
        setUnavailableDates(data);
      } catch (err) {
        console.error("Error loading unavailable dates:", err);
      }
    }

    loadData();
    loadUnavailableDates();
  }, []);

  const isDateUnavailable = (eventDate) => {
    if (!eventDate || unavailableDates.length === 0) return false;
    const eventDateStr = new Date(eventDate).toDateString();
    return unavailableDates.some(
      (unavailableDate) => new Date(unavailableDate.blockedDate).toDateString() === eventDateStr
    );
  };

  // Simple helper function (no hooks!)
  const renderPlannedEmployees = (eventId) => {
    const shifts = plannedShiftsByEvent[eventId] || [];
    if (shifts.length === 0) return "-";

    const employeeNames = shifts
      .map((shift) => shift.employee?.name)
      .join(", ");
    return <span title={employeeNames}>{shifts.length}</span>;
  };


  

  const CopyEventDetailToClipBoard = (event) => {
    if (!event) return;
    

    const texttoCopy = `
*תאריך:* ${formatDate(event.eventDate)}
*יום:* ${findDayOfWeek(event.eventDate)}
*מיקום:* ${event.address || "טרם עודכן"}
--שעות משמרת--
*שעת הגעה למקום האירוע:* 
*שעת סיום משוערת:* 
שעות סרוויס: ${formatServiceHours(event.startTime, event.endTime)}

-יש לשים לב כי השעות הרלוונטיות באמת הן שעות המשמרת ולא שעות הסרוויס-
*--קוד לבוש--*
קוד לבוש גברים : חולצה לבנה מכופתרת חלקה + ג'ינס שחור חלק ללא קרעים + חגורה
קוד לבוש נשים : שמלה שחורה אלגנטית
יש להקפיד לבוא עם בגדי עבודה נוחים לשעות הראשונות של האירוע

`;

    navigator.clipboard.writeText(texttoCopy);
    showAlert("הודעה לצוות הועתקה ללוח!", "success");
  };


// ... (imports and logic remains the same)

  return (
    <div className="closed-events-section">
      <h2 className="closed-events-section__title">אירועים סגורים</h2>
      {loading ? (
        <div>טוען אירועים סגורים...</div>
      ) : error ? (
        <div className="closed-events-section__error">⚠️ {error}</div>
      ) : events.length === 0 ? (
        <div>אין אירועים סגורים להצגה.</div>
      ) : (
        /* UPDATED CLASS: ce-table-container */
        <div className="ce-table-container"> 
          
            {/* UPDATED CLASS: ce-table (Removed table-wrapper div completely as it's not needed now) */}
            <table className="ce-table">
              <thead>
                <tr>
                  <th>העתק</th>
                  <th>מספר אירוע</th>
                  <th>תאריך</th>
                  <th>שם הלקוח</th>
                  <th>טלפון</th>
                  <th>מיקום</th>
                  <th>כמות אורחים</th>
                  <th>שעות סרוויס</th>
                  <th>שעת הגעה למחסן</th>
                  <th>סוג אירוע</th>
                  <th>הערות</th>
                  <th>כמות צוות עליה התחייבנו</th>
                  <th>צוות סגור</th>
                  <th>קוקטיילים לאירוע</th>
                  <th>הכנסה צפויה</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr
                  key={ev._id}
                  style={isDateUnavailable(ev.eventDate) ? { border: "3px solid red" } : {}}
                  title={isDateUnavailable(ev.eventDate) ? "תאריך האירוע הוגדר במערכת כחסום" : ""}
                  >
                    <td>
                      <button
                        /* UPDATED CLASS: ce-copy-btn */
                        className="ce-copy-btn" 
                        onClick={() => CopyEventDetailToClipBoard(ev)}
                        title="העתק פרטי אירוע לצוות"
                      >
                        📄
                      </button>
                    </td>
                    <td>
                      {/* UPDATED CLASS: ce-table-link */}
                      <Link to={`/events/${ev._id}`} className="ce-table-link">
                        {ev.eventNumber}
                      </Link>
                    </td>
                    <td>{`${formatDate(ev.eventDate)} | ${findDayOfWeek(ev.eventDate)}`} </td>
                    <td>{ev.customerName}</td>
                    <td>{ev.customer?.phone}</td>
                    <td>{ev.address}</td>
                    <td>{ev.guestCount}</td>
                    <td>{formatServiceHours(ev.startTime, ev.endTime)}</td>
                    <td>{ev.warehouseArrivalTime}</td>
                    <td>{ev.eventType?.label}</td>
                    <td>{ev.notes || "-"}</td>
                    <td>{ev.promisedStaffCount || 0}</td>
                    <td>{renderPlannedEmployees(ev._id)} </td>
                    <td title={ev.cocktailMenu }>
                      {truncateText(ev.cocktailMenu)}
                    </td>
                    <td>{formatPrice(ev.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          
        </div>
      )}
    </div>
  );
}
