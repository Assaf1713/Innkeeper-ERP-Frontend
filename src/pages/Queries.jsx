/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import NewEventModal from "../components/forms/NewEventModal";
import { Link, useNavigate } from "react-router-dom";  
import { fetchEvents, fetchClosedDates } from "../api/eventsApi";
import { fetchUnavailableDates } from "../api/unavailableDatesApi";
import { useAlert } from "../hooks/useAlert";
import FilterPanel, { FilterDateRange, FilterSearch, FilterActions } from "../components/FilterPanel";

export default function Queries() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const { showError } = useAlert();
  const navigate = useNavigate();

  // Filter state
  const [dateRangeFilter, setDateRangeFilter] = useState("last3days");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchEvents();
        setEvents(data);
        
      } catch (err) {
        console.error("Error loading events:", err);
        setError("אירעה שגיאה בטעינת האירועים");
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
        showError("שגיאה בטעינת תאריכים חסומים");
      }
    }

     async function loadClosedDates() {
          try {
            const data = await fetchClosedDates();
            setClosedDates(data);
          } catch (error) {
            showError("טעות בטעינת התאריכים הסגורים ");
          }
        };

    loadEvents();
    loadUnavailableDates();
    loadClosedDates();
  }, []);

  const isDateUnavailable = (eventDate) => {
    if (!eventDate || unavailableDates.length === 0) return false;
    const eventDateStr = new Date(eventDate).toDateString();
    return unavailableDates.some(
      (unavailableDate) => new Date(unavailableDate.blockedDate).toDateString() === eventDateStr
    );
  };
  const isAnotherDateClosed = (eventDate, eventID) => {
    if (!eventDate || events.length === 0) return false;
    const eventDateStr = new Date(eventDate).toDateString();
    // Check if another event (not the current one) exists on the same date
    return events.some(
      (event) => event._id !== eventID && new Date(event.eventDate).toDateString() === eventDateStr
    );
  };

    const findDayOfWeek = (dateString) => {
    const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return daysOfWeek[date.getDay()];
  }

  // Filter logic
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Date range filter
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    switch (dateRangeFilter) {
      case "last3days":
        result = result.filter((ev) => new Date(ev.eventDate) >= threeDaysAgo && ev.status?.label !== "נפל").sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        break;
      case "EventsMade":
        result = result.filter((ev) => ev.status?.label === "בוצע").sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        break;
      case "past":
        result = result.filter((ev) => new Date(ev.eventDate) < now).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        break;
      case "all": result = result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)); break;
      default:
        // No date filtering
        break;
    }

    // Search by customer name
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((ev) =>
        ev.customerName?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [events, dateRangeFilter, searchQuery]);

  const handleClearFilters = () => {
    setDateRangeFilter("last3days");
    setSearchQuery("");
  };

  const getRowStyle = (event) => {
    const style = {};
    
    // Border styling - unavailable dates take priority
    if (isDateUnavailable(event.eventDate)) {
      style.border = "3px solid red";
    } else if (isAnotherDateClosed(event.eventDate, event._id)) {
      style.border = "3px solid orange";
    }
    
    // Background styling based on status
    if (event.status?.code === "CLOSED") {
      style.background = "#ECFFDC";
    } else if (event.status?.code === "NOT_CLOSED") {
      style.background = "#FFDCDC";
    }
    else if (event.status?.code === "LOST") {  
      style.background = "#B8B8B8";
    }
    else if (event.status?.code === "DONE") {  
      style.background = "#2EFF69";
    }

    return style;
  };

  const getRowTitle = (event) => {
    if (isDateUnavailable(event.eventDate)) {
      return "תאריך האירוע הוגדר במערכת כחסום";
    } else if (isAnotherDateClosed(event.eventDate, event._id)) {
      return "קיים אירוע אחר סגור באותו תאריך";
    }
    return "";
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL");
  };

  if (loading) {
    return (
      <section className="page">
        <h1 className="page-title">אירועים</h1>
        <p>טוען אירועים...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h1 className="page-title">אירועים</h1>
        <p className="error-text">{error}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">אירועים</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowNewEventModal(true)}
        >
          + אירוע חדש
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel>
        <FilterDateRange
          value={dateRangeFilter}
          onChange={setDateRangeFilter}
          label="טווח תאריכים"
        />
        <FilterSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="חפש לפי שם לקוח..."
          label="חיפוש לקוח"
        />
        <FilterActions
          onClear={handleClearFilters}
          clearDisabled={dateRangeFilter === "last3days" && !searchQuery}
        />
      </FilterPanel>

      {filteredEvents.length === 0 ? (
        <p>
          {events.length === 0
            ? "אין אירועים במערכת עדיין."
            : "לא נמצאו אירועים התואמים את הסינון."}
        </p>
      ) : (
        <div className="table-wrapper">
          <div style={{ marginBottom: "12px", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            מציג {filteredEvents.length} מתוך {events.length} אירועים
          </div>
          <table className="global-table">
            <thead>
              <tr>
                <th>מס&apos; אירוע</th>
                <th>תאריך אירוע</th>
                <th>יום בשבוע</th>
                <th>לקוח</th>
                <th>כתובת</th>
                <th>אורחים</th>
                <th>סוג אירוע</th>
                <th>מחיר (₪)</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => (
                  <tr
                  key={ev._id}
                  style={getRowStyle(ev)}
                  title={getRowTitle(ev)}
                  >
                  <td className="global-table__event-number">
                    <Link to={`/events/${ev._id}`}>{ev.eventNumber}</Link>
                  </td>
                  <td>{formatDate(ev.eventDate)}</td>
                  <td>{findDayOfWeek(ev.eventDate)}</td>
                  <td>{ev.customerName}</td>
                  <td>{ev.address}</td>
                  <td>{ev.guestCount}</td>
                  <td>{ev.eventType?.label ?? ""}</td>
                  <td>{ev.price?.toLocaleString("he-IL")}</td>
                  <td>{ev.status?.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showNewEventModal && (
        <NewEventModal
          onClose={() => setShowNewEventModal(false)}
          onCreated={(newEvent) => {
            setEvents((prevEvents) => [...prevEvents, newEvent]);
            setShowNewEventModal(false);
            // redirect to the new event's page
            navigate(`/events/${newEvent._id}`);
          }}
        />
      )}
    </section>
  );
}