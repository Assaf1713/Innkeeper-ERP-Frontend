/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../Modal";

export default function EntityComboboxWithModalCreate({
  entityLabel = "פריט",
  items = [],
  valueId = "",
  onChange,

  // mappers
  getItemId = (x) => x._id,
  getItemLabel = (x) => x.label,
  isItemActive = (x) => x?.isActive !== false,

  placeholder = `בחר ${entityLabel}...`,
  disabled = false,

  // creation
  allowCreate = true,
  onCreate, // async (formValues) => createdItem
  renderCreateForm, // ({ initialName, onSubmit, onCancel, busy, error }) => JSX
}) {
  const containerRef = useRef(null);
  const createModalRef = useRef(null);

  const activeItems = useMemo(
    () => items.filter((x) => isItemActive(x)),
    [items, isItemActive]
  );

  const selectedItem = useMemo(() => {
    return activeItems.find((x) => getItemId(x) === valueId) || null;
  }, [activeItems, valueId, getItemId]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(
    selectedItem ? getItemLabel(selectedItem) : ""
  );
  const [highlightIndex, setHighlightIndex] = useState(0);

  // modal creation state
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createInitialName, setCreateInitialName] = useState("");

  // sync input when selection changes from outside
  useEffect(() => {
    setQuery(selectedItem ? getItemLabel(selectedItem) : "");
  }, [valueId]);

  // filter the items by label match (includes)
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return activeItems;

    return activeItems.filter((x) => (getItemLabel(x) || "").includes(q));
  }, [activeItems, query, getItemLabel]);

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
    setCreateError("");
    setOpen(false);
    setQuery(getItemLabel(item));
    onChange?.(getItemId(item), item);
  };

  const canOfferAdd = allowCreate && !!onCreate && !!renderCreateForm;

  const openCreateModal = () => {
    if (!canOfferAdd) return;
    setCreateError("");
    setCreating(false);

    // ניקח “רמז” מהטקסט שהמשתמש כבר הקליד
    setCreateInitialName(query.trim());
    createModalRef.current?.open();
  };

  const closeCreateModal = () => {
    createModalRef.current?.close();
  };

  // החלק הכי חשוב: יצירה + בחירה אוטומטית
  const handleCreateSubmit = async (formValues) => {
    if (!onCreate || creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const created = await onCreate(formValues);
      if (!created) throw new Error("Create returned empty item");
      commit(created); // auto-select newly created
      closeCreateModal();
    } catch (e) {
      console.error(e);
      // Use the error message from the server if available
      setCreateError(e.message || `יצירת ${entityLabel} נכשלה`);
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
        openCreateModal();
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
                  key={getItemId(item)}
                  type="button"
                  className={
                    "combo__item" + (idx === highlightIndex ? " is-active" : "")
                  }
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => commit(item)}
                >
                  {getItemLabel(item)}
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
                  onClick={openCreateModal}
                >
                  ➕ הוסף {entityLabel} חדש
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal create */}
      <Modal
        ref={createModalRef}
        title={`הוסף ${entityLabel} חדש`}
        onClose={() => {}}
      >
        {renderCreateForm?.({
          initialName: createInitialName,
          busy: creating,
          error: createError,
          onCancel: closeCreateModal,
          onSubmit: handleCreateSubmit,
        })}
      </Modal>
    </div>
  );
}
