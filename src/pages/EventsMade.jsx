/* eslint-disable no-unused-vars */
import { useState, useMemo } from "react";
import { fetchEventActuals } from "../api/eventActualsApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchEventTypes } from "../api/eventTypesApi";
import { useAlert } from "../hooks/useAlert";
import FilterPanel, {
  FilterCustomDateRange,
  FilterGuestCountRange,
  FilterSelect,
  FilterChooseEntryLimit,
  FilterSearch,
  FilterActions,
} from "../components/FilterPanel";
import SumDataSection from "../components/SumDataSection";
import StatisticsDataSection from "../components/StatisticsDataSection";
import EventsMadeTable from "../components/EventsMadeTable";
import { useEffect } from "react";

export default function EventsMade() {
  const [eventActuals, setEventActuals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useAlert();
  const [searchQuery, setSearchQuery] = useState("");

  // Date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Guest count range filters
  const [minGuests, setMinGuests] = useState("");
  const [maxGuests, setMaxGuests] = useState("");

  // Event type filter
  const [selectedEventType, setSelectedEventType] = useState("all");

  // Entry limit filter
  const [entryLimit, setEntryLimit] = useState("20");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch event actuals (with populated events), expenses, and event types
        const [actualsData, expensesData, eventTypesData] = await Promise.all([
          fetchEventActuals(),
          fetchExpenses(),
          fetchEventTypes(),
        ]);

        setEventActuals(actualsData.eventActuals);
        setExpenses(expensesData.expenses);
        setEventTypes(eventTypesData.eventTypes);
      } catch (err) {
        setError(err.message);
        showError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showError]);

  // Filter event actuals and expenses by date range, guest count, and event type
  const filteredData = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const minGuestCount = minGuests ? parseInt(minGuests) : null;
    const maxGuestCount = maxGuests ? parseInt(maxGuests) : null;

    // Filter event actuals by event date snapshot, guest count, event type, and search query
    let filteredActuals = eventActuals.filter((actual) => {
      // Date filter
      if (start || end) {
        const eventDate = new Date(actual.eventDateSnapshot);
        if (start && eventDate < start) return false;
        if (end && eventDate > end) return false;
      }

      // Guest count filter
      if (minGuestCount !== null || maxGuestCount !== null) {
        const guestCount = actual.guestCountSnapshot;
        if (minGuestCount !== null && guestCount < minGuestCount) return false;
        if (maxGuestCount !== null && guestCount > maxGuestCount) return false;
      }

      // Event type filter
      if (selectedEventType && selectedEventType !== "all") {
        const eventTypeCode = actual.event?.eventType?.code;
        if (eventTypeCode !== selectedEventType) return false;
      }

      // Search query filter
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        if (
          !actual.event?.customerName?.toLowerCase().includes(lowerCaseQuery) &&
          !actual.event?.eventNumber?.toString().includes(lowerCaseQuery)
        ) {
          return false;
        }
      }

      return true;
    });

    return filteredActuals;
  }, [
    eventActuals,
    startDate,
    endDate,
    minGuests,
    maxGuests,
    selectedEventType,
    searchQuery,
  ]);



  // Apply entry limit to filtered data
  const displayedData = useMemo(() => {
    if (entryLimit === "all") {
      return filteredData.sort(
        (a, b) => new Date(b.eventDateSnapshot) - new Date(a.eventDateSnapshot),
      );
    }
    const limit = parseInt(entryLimit);
    return filteredData
      .sort(
        (a, b) => new Date(b.eventDateSnapshot) - new Date(a.eventDateSnapshot),
      )
      .slice(0, limit);
  }, [filteredData, entryLimit]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinGuests("");
    setMaxGuests("");
    setSelectedEventType("all");
    setEntryLimit("20");
  };

  // Prepare event type options for select filter
  const eventTypeOptions = useMemo(() => {
    const options = eventTypes.map((type) => ({
      value: type.code,
      label: type.label,
    }));
    return [{ value: "all", label: "כל סוגי האירועים" }, ...options];
  }, [eventTypes]);

  if (loading) {
    return (
      <section className="page">
        <h1 className="page-title">סיכום אירועים שבוצעו</h1>
        <p className="loading-text">טוען נתונים...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h1 className="page-title">סיכום אירועים שבוצעו</h1>
        <p className="error-text">{error}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1 className="page-title">סיכום אירועים שבוצעו</h1>

      {/* Panel 1: Filter Section */}
      <FilterPanel>
        <FilterCustomDateRange
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          label="בחר טווח תאריכים"
        />
        <FilterGuestCountRange
          minGuests={minGuests}
          maxGuests={maxGuests}
          onMinChange={setMinGuests}
          onMaxChange={setMaxGuests}
          label="מספר אורחים"
        />
        <FilterSelect
          value={selectedEventType}
          onChange={setSelectedEventType}
          options={eventTypeOptions}
          label="סוג אירוע"
        />
        <FilterSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="חפש לפי שם לקוח או מספר אירוע..."
          label="חיפוש אירוע"
        />
        <FilterChooseEntryLimit
          value={entryLimit}
          onChange={setEntryLimit}
          label="מספר רשומות להצגה"
        />
        <FilterActions
          onClear={handleClearFilters}
          clearDisabled={
            selectedEventType === "all" &&
            !startDate &&
            !endDate &&
            !minGuests &&
            !maxGuests &&
            !searchQuery
          }
        />
      </FilterPanel>

      {filteredData.length === 0 ? (
        <div className="table-info">
          לא נמצאו אירועים התואמים את הקריטריונים שנבחרו.
        </div>
      ) : (
        <>
          <div className="table-info">
            מציג {displayedData.length} אירועים מתוך {filteredData.length}{" "}
            אירועים מסוננים ({eventActuals.length} סה״כ)
          </div>

          {/* Panel 2: Summary Data Section */}
          <SumDataSection eventActuals={filteredData} />
          <StatisticsDataSection eventActuals={filteredData} />

          {/* Panel 3: Detailed Events Table */}
          <EventsMadeTable eventActuals={displayedData} />
        </>
      )}
    </section>
  );
}
