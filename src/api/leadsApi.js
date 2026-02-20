import { apiFetch } from "../utils/apiFetch";

const API_BASE_URL = "/api/leads";

export async function fetchLeads() {
    const res = await apiFetch(API_BASE_URL);
    if (!res.ok) {
        throw new Error("Failed to fetch leads");
    }
    return res.json();
}

export async function createLead(leadData) {
    const res = await apiFetch(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(leadData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create lead");
    }
    return res.json();
}

export async function updateLead(id, updates) {
    const res = await apiFetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    }); 
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update lead");
    }
    const data = await res.json();
    return data.lead;
}

export async function deleteLead(id) {
    const res = await apiFetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete lead");
    }
    return await res.json();
}