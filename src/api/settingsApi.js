/* eslint-disable no-unused-vars */

import { apiFetch } from "../utils/apiFetch";


const API_BASE_URL = "/api/settings";


/**
 * Fetch all settings as a key-value object
 */
export async function fetchSettings() {
  const res = await apiFetch(API_BASE_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch settings");
  }
  return res.json();
}

// Fetch all settings and return as key-value pairs
export async function fetchSettingsAsKeyValue() {
  const res = await apiFetch(`${API_BASE_URL}/key-value`);
  if (!res.ok) {
    throw new Error("Failed to fetch settings as key-value pairs");
  }
  return res.json();
}

/**
 * Fetch a specific setting by key
 */
export async function fetchSettingByKey(key) {
  const res = await apiFetch(`${API_BASE_URL}/${key}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Failed to fetch setting: ${key}`);
  }
  return res.json();
}

/**
 * Create or update a setting
 */
export async function createOrUpdateSetting(key, value, description = "") {
  const res = await apiFetch(API_BASE_URL, {
    method: "POST",
    body: JSON.stringify({ key, value, description }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create or update setting");
  }
  return res.json();
}

/**
 * Update an existing setting
 */
export async function updateSetting(key, value, description) {
  const payload = { value };
  if (description !== undefined) {
    payload.description = description;
  }
  
  const res = await apiFetch(`${API_BASE_URL}/${key}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to update setting");
  }
  return res.json();
}

/**
 * Delete a setting
 */
export async function deleteSetting(key) {
  const res = await apiFetch(`${API_BASE_URL}/${key}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to delete setting");
  }
  return res.json();
}

/**
 * Get the current VAT percentage
 */
export async function getCurrentVAT() {
  try {
    const result = await fetchSettingByKey("currentVAT");
    return result.value;
  } catch (err) {
    return 18;
  }
}
