// API to get event types
import { apiFetch } from "../utils/apiFetch";

export async function fetchEventTypes() {
    const response = await apiFetch("/api/lookups");
    if (!response.ok) {
        throw new Error("Failed to fetch event types");
    }
    const data = await response.json();
    return { eventTypes: data.eventTypes || [] };
}