/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAlert } from "../../hooks/useAlert";
import { apiFetch } from "../../utils/apiFetch";

export default function NewInventoryProductModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    label: "",
    category: "",
    menuTypeLabel: "",
    supplier: "",
    volumeMl: "",
    price: "",
    netPrice: "",
  });
  const { showError, showSuccess } = useAlert();

  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await apiFetch("/api/inventory-products/categories");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/inventory-products", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to create inventory product"
        );
      }
      const data = await res.json();
      onCreated(data.inventoryProduct);
      onClose();
    } catch (error) {
      console.error("Error creating inventory product:", error);
      showError("אירעה שגיאה ביצירת מוצר במלאי. אנא נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">מוצר מלאי חדש</h2>
          <button type="button" className="ui-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="ui-form" onSubmit={handleSubmit}>
          <div className="ui-row">
            <label className="ui-label" htmlFor="label">
              שם מוצר מלאי *
            </label>
            <input
              className="ui-control"
              id="label"
              name="label"
              type="text"
              value={form.label}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ui-row">
            <div className="ui-col">
              <label className="ui-label" htmlFor="category">
                קטגוריה
              </label>
              <select
                className="ui-control"
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">בחר קטגוריה</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="ui-col">
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
            <div className="ui-col">
              <label className="ui-label" htmlFor="volumeMl">
                נפח (מ"ל)
              </label>
              <input
                className="ui-control"
                id="volumeMl"
                name="volumeMl"
                type="number"
                value={form.volumeMl}
                onChange={handleChange}
              />
            </div>
            <div className="ui-col">
              <label className="ui-label" htmlFor="netPrice">
                מחיר לפני מע"מ
              </label>
              <input
                className="ui-control"
                id="netPrice"
                name="netPrice"
                type="number"
                step="0.01"
                value={form.netPrice}
                onChange={handleChange}
              />
            </div>
            <div className="ui-col">
              <label className="ui-label" htmlFor="price">
                מחיר כולל מע"מ
              </label>
              <input
                className="ui-control"
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
              />
            </div>
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
              {submitting ? "שומר..." : "שמור מוצר מלאי"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
