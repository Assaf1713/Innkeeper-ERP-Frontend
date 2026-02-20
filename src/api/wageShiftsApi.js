
import { apiFetch } from "../utils/apiFetch";



export async function fetchWageShifts() {
  const response = await apiFetch("/api/wage-shifts");
    if (!response.ok) {
    throw new Error("Failed to fetch wage shifts");
  }
    return response.json();
}
