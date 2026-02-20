// API for employees related operations
import { apiFetch } from "../utils/apiFetch";

export const fetchEmployees = async () => {
  const response = await apiFetch('/api/employees');   
  if (!response.ok) {
    throw new Error(`Failed to fetch employees. Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const fetchEmployeeById = async (id) => {
  const response = await apiFetch(`/api/employees/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch employee. Status: ${response.status}`);
  }
  return response.json();
};

export const updateEmployee = async (id, employeeData) => {
  const response = await apiFetch(`/api/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update employee');
  }
  
  return response.json();
};

export const createEmployee = async (employeeData) => {
  const response = await apiFetch('/api/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'שגיאה ביצירת העובד');
  }
  
  return response.json();
};

export const fetchEmployeeWageShifts = async (id) => {
  const response = await apiFetch(`/api/employees/${id}/wage-shifts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch wage shifts. Status: ${response.status}`);
  }
  return response.json();
};

export const fetchEmployeePlannedShifts = async (id) => {
  const response = await apiFetch(`/api/employees/${id}/planned-shifts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch planned shifts. Status: ${response.status}`);
  }
  return response.json();
};

