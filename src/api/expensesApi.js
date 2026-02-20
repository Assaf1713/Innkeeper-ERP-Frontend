import { apiFetch } from "../utils/apiFetch";

// API to get all the expenses
export const fetchExpenses = async () => {
  const response = await apiFetch('/api/expenses');
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  const data = await response.json();
  return data.expenses || [];
};

// API to add a new expense
export const addExpense = async (expenseData) => {
  const response = await apiFetch('/api/expenses', {
    method: 'POST', 
    body: JSON.stringify(expenseData),
    }); 
    if (!response.ok) {
      throw new Error('Failed to add expense');
    }
    return response.json();
};

// API to update an existing expense
export const updateExpense = async (expenseId, expenseData) => {
  const response = await apiFetch(`/api/expenses/${expenseId}`, {
    method: 'PUT',
    body: JSON.stringify(expenseData),
    });
    if (!response.ok) {
        throw new Error('Failed to update expense');
    }
    return response.json();
};

// API to delete an expense
export const deleteExpense = async (expenseId) => {
  const response = await apiFetch(`/api/expenses/${expenseId}`, {
    method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete expense');
    }
    return response.json();
};