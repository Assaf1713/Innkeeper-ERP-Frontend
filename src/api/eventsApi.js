import { apiFetch } from "../utils/apiFetch";

// API to get all the events
export const fetchEvents = async () => {
  const response = await apiFetch('/api/events');
    if (!response.ok) {
        throw new Error(`Failed to fetch events. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};



// API to get a single event by ID
export const fetchEventById = async (eventId) => {
  const response = await apiFetch(`/api/events/${eventId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch event with ID ${eventId}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};



export const fetchClosedDates = async () => {
  const response = await apiFetch('/api/events/closed-dates');
    if (!response.ok) {
        throw new Error(`Failed to fetch closed dates. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};


// API to get predictive consumption data for an event
export const fetchPredictiveConsumption = async (eventId) => {
  const response = await apiFetch(`/api/events/${eventId}/predictive-consumption`);
    if (!response.ok) {
        throw new Error(`Failed to fetch predictive consumption data for event with ID ${eventId}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};
