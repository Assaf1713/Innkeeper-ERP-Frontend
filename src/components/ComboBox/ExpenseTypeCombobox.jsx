import { useEffect, useMemo, useRef, useState } from "react";
import "./ExpenseTypeCombobox.css";

export default function ExpenseTypeCombobox({
  items = [], // [{_id, label, code, isActive}]
  valueId = "", // selected _id
  onChange, // (newId, item) => void
  onCreateNew, // async (label) => createdItem({_id,label,code,isActive})
  placeholder = "בחר קטגוריה...",
  disabled = false,
}) {
  const containerRef = useRef(null);

  const activeItems = useMemo(
    () => items.filter((x) => x?.isActive !== false),
    [items]
  );

  const selectedItem = useMemo(
    () => activeItems.find((x) => x._id === valueId) || null,
    [activeItems, valueId]
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedItem?.label ?? "");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // sync input when selection changes from outside
  useEffect(() => {
    setQuery(selectedItem?.label ?? "");
  }, [selectedItem?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return activeItems;

    return activeItems.filter((x) => x.label?.includes(q));
  }, [activeItems, query]);

  // trim query for creation checks. example : "  test  " -> "test" / " car rental" -> "car rental"
  const normalizedQuery = query.trim();
  const exactExists = useMemo(() => {
    if (!normalizedQuery) return false;
    return activeItems.some((x) => x.label === normalizedQuery);
  }, [activeItems, normalizedQuery]);

  const canOfferAdd = !!normalizedQuery && !exactExists && !!onCreateNew;

  // close on outside click
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const commit = (item) => {
    setError("");
    setOpen(false);
    setQuery(item.label);
    onChange?.(item._id, item);
  };

  const handleCreateNew = async () => {
    if (!canOfferAdd || creating) return;

    setCreating(true);
    setError("");
    try {
      const created = await onCreateNew(normalizedQuery);
      if (!created?._id) throw new Error("Create returned invalid item");
      commit(created); // auto-select the newly created one
    } catch (e) {
      setError("יצירת קטגוריה נכשלה");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    const listCount = filtered.length + (canOfferAdd ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(0, listCount - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex < filtered.length) {
        const item = filtered[highlightIndex];
        if (item) commit(item);
      } else if (canOfferAdd) {
        handleCreateNew();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="combo" ref={containerRef}>
      <input
        className="ui-control combo__input"
        type="text"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightIndex(0);
          setError("");
        }}
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className="combo__menu" role="listbox">
          {filtered.length === 0 && !canOfferAdd ? (
            <div className="combo__empty">אין התאמות</div>
          ) : (
            <>
              {filtered.map((item, idx) => (
                <button
                  key={item._id}
                  type="button"
                  className={
                    "combo__item" + (idx === highlightIndex ? " is-active" : "")
                  }
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => commit(item)}
                >
                  {item.label}
                </button>
              ))}

              {canOfferAdd && (
                <button
                  type="button"
                  className={
                    "combo__item combo__item--add" +
                    (highlightIndex === filtered.length ? " is-active" : "")
                  }
                  onMouseEnter={() => setHighlightIndex(filtered.length)}
                  onClick={handleCreateNew}
                  disabled={creating}
                >
                  {creating
                    ? "יוצר קטגוריה..."
                    : `➕ הוסף קטגוריה חדשה: "${normalizedQuery}"`}
                </button>
              )}
            </>
          )}

          {error && <div className="combo__error">{error}</div>}
        </div>
      )}
    </div>
  );
}
