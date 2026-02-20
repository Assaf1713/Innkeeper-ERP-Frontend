import { apiFetch } from "../utils/apiFetch";

export const fetchUnavailableDates = async () => {
  const res = await apiFetch("/api/unavailable-dates");
  if (!res.ok) throw new Error("Failed to fetch unavailable dates");
  return res.json();
};

export const addUnavailableDate = async (dateData) => {
  const res = await apiFetch("/api/unavailable-dates", {
    method: "POST",
    body: JSON.stringify(dateData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Failed to add unavailable date");
    error.number = errorData.number;
    throw error;
  }
  return res.json();
};

export const removeUnavailableDate = async (dateId) => {
  const res = await apiFetch(`/api/unavailable-dates/${dateId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove unavailable date");
  return res.json();
};
