import { apiFetch } from "../utils/apiFetch";

const API_BASE_URL = "/api/inventory-products";

export async function fetchInventoryProducts() {
  const res = await apiFetch(API_BASE_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch inventory products");
  }
  return res.json();
}

export async function createInventoryProduct(productData) {
  const res = await apiFetch(API_BASE_URL, {
    method: "POST",
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create inventory product");
  }
  return res.json();
}

export async function updateInventoryProduct(id, updates) {
  const res = await apiFetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to update inventory product");
  }
  const data = await res.json();
  return data.inventoryProduct;
}

export async function deleteInventoryProduct(id) {
  const res = await apiFetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ isActive: false }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to delete inventory product");
  }
  return res.json();
}

export async function ChangeVAT(newVAT) {
  const res = await apiFetch(`${API_BASE_URL}/update-vat`, {
    method: "POST",
    body: JSON.stringify({ newVAT }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to update VAT for inventory products");
  }
  return res.json();
}
