/* eslint-disable no-unused-vars */
// Reports page
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "../hooks/useAlert";
import FilterPanel, {
  FilterCustomDateRange,
  FilterGuestCountRange,
  FilterSelect,
  FilterActions,
} from "../components/FilterPanel";
import { fetchEventActuals } from "../api/eventActualsApi";
import { fetchExpenses } from "../api/expensesApi";
import { fetchEventTypes } from "../api/eventTypesApi";
import { fetchEvents } from "../api/eventsApi";

export default function Reports() {
  const { user } = useAuth();
  const { showAlert, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventActuals, setEventActuals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch event actuals (with populated events), expenses, event types, and events
        const [actualsData, expensesData, eventTypesData, eventData] =
          await Promise.all([
            fetchEventActuals(),
            fetchExpenses(),
            fetchEventTypes(),
            fetchEvents(),
          ]);

        setEventActuals(actualsData.eventActuals);
        setExpenses(expensesData.expenses);
        setEventTypes(eventTypesData.eventTypes);
        const closedEvents = eventData
          .filter((ev) => ev.status?.code === "CLOSED")
        setEvents(closedEvents);
      } catch (err) {
        setError(err.message);
        showError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showError]);

  return (
    <div className="reports-page">
      <h1>דוחות</h1>
    </div>
  );
}
