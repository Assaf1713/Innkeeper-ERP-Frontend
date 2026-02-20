import { useState, useEffect } from "react";
import { useAlert } from "../../hooks/useAlert";
import { apiFetch } from "../../utils/apiFetch";

const createInitialForm = (initialExpense) => ({
  name: initialExpense?.name || "",
  supplier: initialExpense?.supplier || "",
  category: initialExpense?.category || "",
  date: new Date().toISOString().slice(0, 10),
  price: "",
  notes: "",
  waspaid: true,
});

export default function NewExpenseModal({ onClose, onCreated, initialExpense = null }) {
  const [form, setForm] = useState(() => createInitialForm(initialExpense));
  const { showError, showSuccess } = useAlert();

  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await apiFetch("/api/expenses/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showError("אירעה שגיאה בטעינת קטגוריות. אנא רענן את הדף.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setForm(createInitialForm(initialExpense));
  }, [initialExpense]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "שגיאה ביצירת הוצאה");
      }
      
      const data = await res.json();
      onCreated(data.expense);
      showSuccess("הוצאה נוצרה בהצלחה");
      onClose();
    } catch (error) {
      console.error("Error creating expense:", error);
      showError(error.message || "אירעה שגיאה ביצירת ההוצאה. אנא נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-modal-backdrop">
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">הוצאה חדשה</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row">
            <label className="ui-label" htmlFor="name">
              שם הוצאה *
            </label>
            <input
              className="ui-control"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label" htmlFor="date">
                תאריך הוצאה *
              </label>
              <input
                className="ui-control"
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ui-row">
              <label className="ui-label" htmlFor="price">
                מחיר (₪) *
              </label>
              <input
                className="ui-control"
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label" htmlFor="category">
                קטגוריה *
              </label>
              <select
                className="ui-control"
                id="category"
                name="category"
                value={form.category}
                disabled={loadingCategories}
                onChange={handleChange}
                required
              >
                <option value="">בחר קטגוריה</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="ui-row">
              <label className="ui-label" htmlFor="supplier">
                ספק
              </label>
              <input
                className="ui-control"
                id="supplier"
                name="supplier"
                type="text"
                value={form.supplier}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ui-row">
            <label className="ui-label" htmlFor="notes">
              הערות
            </label>
            <textarea
              className="ui-control"
              id="notes"
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div className="ui-row" style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="waspaid"
              name="waspaid"
              checked={form.waspaid}
              onChange={handleChange}
              style={{ width: "auto" }}
            />
            <label htmlFor="waspaid" style={{ marginBottom: 0, cursor: "pointer" }}>
              שולם
            </label>
          </div>

          <div className="ui-footer">
            <button
              type="button"
              className="ui-btn"
              onClick={onClose}
              disabled={submitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="ui-btn ui-btn--primary"
              disabled={submitting}
            >
              {submitting ? "שומר..." : "שמור הוצאה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
