import { apiFetch } from "../utils/apiFetch";

export async function listPlannedShifts(eventId) {
  const res = await apiFetch(`/api/events/${eventId}/planned-shifts`);
  if (!res.ok) throw new Error("Failed to load planned shifts");
  return res.json(); // { plannedShifts }
}

export async function createPlannedShift(eventId, payload) {
  const res = await apiFetch(`/api/events/${eventId}/planned-shifts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { plannedShift }
}

export async function updatePlannedShift(id, payload) {
  const res = await apiFetch(`/api/planned-shifts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePlannedShift(id) {
  const res = await apiFetch(`/api/planned-shifts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
