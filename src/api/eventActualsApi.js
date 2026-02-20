// API for getting event actuals related data
import { apiFetch } from "../utils/apiFetch";

export const fetchEventActuals = async () => {
  const response = await apiFetch('/api/events/actuals');
    if (!response.ok) {
        throw new Error(`Failed to fetch event actuals. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

export const fetchEventActualsById = async (eventId) => {
  const response = await apiFetch(`/api/events/${eventId}/actuals`);
    if (!response.ok) {
        throw new Error(`Failed to fetch event actuals for event ID ${eventId}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};