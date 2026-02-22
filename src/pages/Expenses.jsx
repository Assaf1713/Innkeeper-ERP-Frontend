import { useEffect, useState, useMemo } from "react";
import { fetchExpenses } from "../api/expensesApi";
import { useAlert } from "../hooks/useAlert";
import { apiFetch } from "../utils/apiFetch";
import FilterPanel, {
  FilterSearch,
  FilterActions,
  FilterExpensesByCategory,
  FilterChooseEntryLimit,
} from "../components/FilterPanel";
import NewExpenseModal from "../components/forms/NewExpenseModal";
import EditableCell from "../components/EditableCell";

export default function Expenses() {
  const { showError, showSuccess } = useAlert();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [repurchaseExpense, setRepurchaseExpense] = useState(null);
  const [categories, setCategories] = useState([]);
  const [entryLimit, setEntryLimit] = useState(20);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // Filtered expenses based on search and category
  const filteredExpenses = useMemo(() => {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedExpenses.filter((expense) => {
      // Filter by category
      if (categoryFilter !== "All" && expense.category !== categoryFilter) {
        return false;
      }

      // Filter by search query
      if (
        searchQuery &&
        !expense.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !expense.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  // Load expenses and categories on mount

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [expensesData, categoriesRes] = await Promise.all([
          fetchExpenses(),
          apiFetch("/api/expenses/categories"),
        ]);

        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();
        const filreredExpensesData = expensesData.filter((expense) => expense.date <= new Date().toISOString());
        setExpenses(filreredExpensesData);
        setCategories(["All", ...categoriesData.categories]);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const displayedExpenses = useMemo(() => {
    if (entryLimit === "all") return filteredExpenses;
    return filteredExpenses.slice(0, entryLimit);
  }, [filteredExpenses, entryLimit]);

  // Clear all filters

  const handleClearFilters = () => {
    setCategoryFilter("All");
    setSearchQuery("");
  };

  const handleOpenNewExpenseModal = () => {
    setRepurchaseExpense(null);
    setShowNewExpenseModal(true);
  };

  const handlePurchaseAgain = (expense) => {
    setRepurchaseExpense(expense);
    setShowNewExpenseModal(true);
  };

  // Delete expense

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await apiFetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("אין לך הרשאות למחוק הוצאה זו");
        }
        throw new Error("שגיאה במחיקת הוצאה");
      }

      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      showSuccess("הוצאה נמחקה בהצלחה");
    } catch (err) {
      console.error("Error deleting expense:", err);
      showError(err.message);
    }
  };

  // Save notes for an expense

  const handleSaveNote = async (expenseId, newNote) => {
    try {
      const res = await apiFetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        body: JSON.stringify({ notes: newNote }),
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("אין לך הרשאות לעדכן הערות זו");
        }
        throw new Error("שגיאה בעדכון הערות");
      }

      const data = await res.json();
      setExpenses((prev) =>
        prev.map((e) => (e._id === expenseId ? data.expense : e))
      );
    } catch (err) {
      console.error("Error updating notes:", err);
      showError(err.message);
      throw err;
    }
  };

  // Toggle paid status for an expense

  const handleTogglePaid = async (expenseId, currentStatus) => {
    try {
      const res = await apiFetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        body: JSON.stringify({ waspaid: !currentStatus }),
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("אין לך הרשאות לעדכן סטטוס תשלום זה");
        }
        throw new Error("שגיאה בעדכון סטטוס תשלום");
      }

      const data = await res.json();
      setExpenses((prev) =>
        prev.map((e) => (e._id === expenseId ? data.expense : e))
      );
    } catch (err) {
      console.error("Error updating payment status:", err);
      showError(err.message);
    }
  };

  // Format date for display

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL");
  };

  if (loading) {
    return (
      <section className="page">
        <h1 className="page-title">הוצאות כלליות </h1>
        <p>טוען הוצאות...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h1 className="page-title">הוצאות כלליות </h1>
        <p className="error-text">{error}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">הוצאות כלליות</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenNewExpenseModal}
        >
          + הוצאה חדשה
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel>
        <FilterChooseEntryLimit
          value={entryLimit}
          onChange={(value) =>
            setEntryLimit(value === "all" ? "all" : Number(value))
          }
        />
        <FilterExpensesByCategory
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories}
          label="סינון לפי קטגוריה"
        />

        <FilterSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="חפש לפי שם הוצאה..."
          label="חיפוש הוצאה"
        />
        <FilterActions
          onClear={handleClearFilters}
          clearDisabled={categoryFilter === "All" && !searchQuery}
        />
      </FilterPanel>

      {displayedExpenses.length === 0 ? (
        <p>
          {expenses.length === 0
            ? "אין הוצאות במערכת עדיין."
            : "לא נמצאו הוצאות התואמות את הסינון."}
        </p>
      ) : (
        <div className="table-wrapper">
          <div
            style={{
              marginBottom: "12px",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
            }}
          >
            מציג {displayedExpenses.length} מתוך {expenses.length} הוצאות
          </div>
          <table className="global-table">
            <thead>
              <tr>
                <th>תאריך </th>
                <th>שם הוצאה</th>
                <th>ספק</th>
                <th>קטגוריה</th>
                <th>סכום (₪)</th>
                <th>שולם</th>
                <th>הערות</th>
                <th> פעולות </th>
              </tr>
            </thead>
            <tbody>
              {displayedExpenses.map((expense) => (
                <tr
                  key={expense._id}
                  className={!expense.waspaid ? "expense-row--unpaid" : ""}
                >
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.name}</td>
                  <td>{expense.supplier || "-"}</td>
                  <td>{expense.category || "-"}</td>
                  <td>{expense.price.toFixed(2)}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={expense.waspaid}
                      onChange={() =>
                        handleTogglePaid(expense._id, expense.waspaid)
                      }
                      className="expense-checkbox"
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={expense.notes}
                      onSave={(newNote) => handleSaveNote(expense._id, newNote)}
                      placeholder="-"
                    />
                  </td>
                  <td style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
                    <button
                      className="global-table__btn"
                      onClick={() => handlePurchaseAgain(expense)}
                    >
                      קנה שוב
                    </button>
                    <button
                      className="global-table__btn ui-btn--delete_item"
                      onClick={() => handleDeleteExpense(expense._id)}
                    >
                      מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showNewExpenseModal && (
        <NewExpenseModal
          initialExpense={repurchaseExpense}
          onClose={() => {
            setShowNewExpenseModal(false);
            setRepurchaseExpense(null);
          }}
          onCreated={(newExpense) => {
            setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
            setShowNewExpenseModal(false);
            setRepurchaseExpense(null);
          }}
        />
      )}
    </section>
  );
}
