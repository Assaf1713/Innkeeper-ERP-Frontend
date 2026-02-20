
import { apiFetch } from "../utils/apiFetch";


export async function fetchUserByEmployeeId(employeeId) {
  const response = await apiFetch(`/api/users/employee/${employeeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

export async function updateUser(id, data) {
  const response = await apiFetch(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user");
  }
  return response.json();
}

export async function createUser(data) {
  const response = await apiFetch(`/api/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create user");
  }
  return response.json();
}

export async function changeUserPassword(id, data) {
  const response = await apiFetch(`/api/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to change password");
  }
  return response.json();
}