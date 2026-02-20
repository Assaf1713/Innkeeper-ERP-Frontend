/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from "react";
import EntityComboboxWithModalCreate from "../../ComboBox/EntityComboboxWithModalCreate";
import InventoryProductCreateForm from "../../forms/InventoryProductCreateForm";
import "../DoneEventSection.css";

export default function AlcoholExpensesCard({
  eventId,
  inventoryProducts = [],
  alcoholExpenses = [],
  onUpsert, // async (eventId, payload) => void
  onDelete, // async (eventId, expenseId) => void
  onCreateInventoryProduct, // optional: async (formValues) => createdProduct
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for adding/upserting an alcohol expense row
  const [form, setForm] = useState({
    productId: "",
    bottlesUsed: "",
  });

  const rows = Array.isArray(alcoholExpenses) ? alcoholExpenses : [];

  // Calculate total alcohol cost (bottlesUsed * product.price)

  const total = useMemo(() => {
    return rows.reduce((acc, e) => {
      const bottles = Number(e?.bottlesUsed) || 0;
      const price = Number(e?.product?.price) || 0; // populated product is ideal
      return acc + bottles * price;
    }, 0);
  }, [rows]);

  // Validation for submit
  const canSubmit =
    !!eventId &&
    !!form.productId &&
    form.bottlesUsed !== "" &&
    Number(form.bottlesUsed) >= 0 &&
    !saving;

  // Reset form inputs
  const resetForm = () => {
    setForm({ productId: "", bottlesUsed: "" });
  };

  // Submit handler (upsert by eventId + productId)
  const submit = async () => {
    if (!onUpsert || !canSubmit) return;

    setSaving(true);
    try {
      await onUpsert(eventId, {
        productId: form.productId,
        bottlesUsed: Number(form.bottlesUsed),
      });

      resetForm();
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // Helper: resolve product label for rendering (supports populated product)
  const getProductLabel = (e) => {
    if (e?.product?.label) return e.product.label; // preferred (populate)
    if (e?.productLabelSnapshot) return e.productLabelSnapshot; // optional snapshot
    return "מוצר לא ידוע";
  };

  // Helper: resolve product price for rendering (supports populated product)
  const getProductPrice = (e) => {
    if (e?.product?.price !== undefined) return Number(e.product.price) || 0;
    if (e?.productPriceSnapshot !== undefined) return Number(e.productPriceSnapshot) || 0;
    return 0;
  };

  return (
    <div className="done-event__card">
      <div className="card__header card__header--split">
        <div>
          <h3>הוצאות אלכוהול</h3>
          <div className="card__meta">סה״כ: ₪ {Number(total).toFixed(0)}</div>
        </div>

        <button
          className="ui-btn ui-btn--primary"
          type="button"
          onClick={() => setIsOpen((p) => !p)}
        >
          {isOpen ? "סגור" : "➕ הוסף אלכוהול"}
        </button>
      </div>

      {/* Add/Upsert panel */}
      {isOpen && (
        <div className="panel">
          <div className="ui-row">
            <label className="ui-label">מוצר מלאי</label>

            <EntityComboboxWithModalCreate
              entityLabel="מוצר"
              items={inventoryProducts}
              valueId={form.productId}
              onChange={(newId) => setForm((p) => ({ ...p, productId: newId }))}

              // inventory mapping
              getItemId={(x) => x._id}
              getItemLabel={(x) => x.label}
              isItemActive={(x) => x?.isActive !== false}

              placeholder="בחר מוצר..."
              allowCreate={!!onCreateInventoryProduct}
              onCreate={onCreateInventoryProduct}
              renderCreateForm={
                onCreateInventoryProduct
                  ? ({ initialName, onSubmit, onCancel, busy, error }) => (
                      <InventoryProductCreateForm
                        initialLabel={initialName}
                        busy={busy}
                        error={error}
                        onCancel={onCancel}
                        onSubmit={onSubmit}
                      />
                    )
                  : undefined
              }
            />
          </div>

          <div className="ui-row--inline">
            <div className="ui-row">
              <label className="ui-label">בקבוקים שנגמרו</label>
              <input
                className="ui-control"
                type="number"
                min="0"
                value={form.bottlesUsed}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bottlesUsed: e.target.value }))
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="ui-footer">
            <button className="ui-btn" type="button" onClick={resetForm}>
              נקה
            </button>
            <button
              className="ui-btn ui-btn--primary"
              type="button"
              onClick={submit}
              disabled={!canSubmit}
            >
              {saving ? "מוסיף..." : "הוסף"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="empty">עדיין לא הוזנו הוצאות אלכוהול</div>
      ) : (
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>מוצר</th>
                <th>בקבוקים</th>
                <th>מחיר/בקבוק</th>
                <th>סה״כ</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const bottles = Number(e.bottlesUsed) || 0;
                const price = getProductPrice(e);
                const rowTotal = bottles * price;

                return (
                  <tr key={e._id}>
                    <td>{getProductLabel(e)}</td>
                    <td>{bottles}</td>
                    <td>₪ {Number(price).toFixed(0)}</td>
                    <td>₪ {Number(rowTotal).toFixed(0)}</td>
                    <td>
                      <button
                        className="ui-btn--delete_item"
                        type="button"
                        onClick={() => onDelete?.(eventId, e._id)}
                        title="מחק שורה"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
