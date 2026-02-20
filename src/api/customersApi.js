import { apiFetch } from "../utils/apiFetch";

export const fetchCustomers = async () => {
  const res = await apiFetch("/api/customers");
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
};

export const createCustomer = async (customerData) => {
  const res = await apiFetch("/api/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
};

export const updateCustomer = async (customerId, customerData) => {
  const res = await apiFetch(`/api/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
};

export const deleteCustomer = async (customerId) => {
  const res = await apiFetch(`/api/customers/${customerId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
};

export const fetchCustomerById = async (customerId) => {
  const res = await apiFetch(`/api/customers/${customerId}`);
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
};




