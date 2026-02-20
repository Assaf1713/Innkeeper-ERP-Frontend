import { useState } from "react";
import "../styles/EditableCell.css";

export default function EditableCell({ 
  value, 
  onSave, 
  placeholder = "-",
  isSaving = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(value || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value || "");
  };

  const handleSave = async () => {
    await onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="editable-cell__edit-mode">
        <input
          type="text"
          className="editable-cell__input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          autoFocus
        />
        <div className="editable-cell__edit-actions">
          <button
            className="editable-cell__save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "..." : "שמור"}
          </button>
          <button
            className="editable-cell__cancel-btn"
            onClick={handleCancel}
            disabled={isSaving}
          >
            ביטול
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="editable-cell__display"
      onClick={handleStartEdit}
      title="לחץ לעריכה"
    >
      {value || placeholder}
    </div>
  );
}
