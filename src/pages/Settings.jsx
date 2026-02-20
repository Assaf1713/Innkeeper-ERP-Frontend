import { useState, useEffect } from "react";
import { fetchSettings, updateSetting } from "../api/settingsApi";
import { useAlert } from "../hooks/useAlert";
import "../styles/Settings.css";

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSettings();
      
      // Settings is now an array of objects
      const settingsArray = data.settings || [];
      
      setSettings(settingsArray);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showError("שגיאה בטעינת הגדרות");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, newValue) => {
    try {
      setSavingKey(key);
      await updateSetting(key, newValue);
      
      // Update local state
      setSettings(prev => 
        prev.map(s => s.key === key ? { ...s, value: newValue } : s)
      );
      
      showSuccess("ההגדרה עודכנה בהצלחה");
    } catch (error) {
      console.error("Failed to update setting:", error);
      showError("שגיאה בעדכון ההגדרה");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">טוען הגדרות...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">⚙️ הגדרות מערכת</h1>
        <p className="settings-subtitle">
          ניהול הגדרות כלליות ופרמטרים של המערכת
        </p>
      </div>

      <div className="settings-container">
        {settings.length === 0 ? (
          <div className="settings-empty">אין הגדרות זמינות</div>
        ) : (
          <div className="settings-list">
            {settings.map((setting) => (
              <SettingRow
                key={setting.key}
                setting={setting}
                onSave={handleSave}
                isSaving={savingKey === setting.key}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingRow({ setting, onSave, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(setting.value);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(setting.value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(setting.value);
  };

  const handleSave = async () => {
    await onSave(setting.key, editValue);
    setIsEditing(false);
  };

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getInputType = (value) => {
    if (typeof value === "boolean") return "checkbox";
    if (typeof value === "number") return "number";
    return "text";
  };

  return (
    <div className="setting-row">
      <div className="setting-info">
        <div className="setting-key">{formatKey(setting.key)}</div>
        {setting.description && (
          <div className="setting-description">{setting.description}</div>
        )}
      </div>

      <div className="setting-value">
        {isEditing ? (
          <div className="setting-edit-mode">
            {typeof setting.value === "boolean" ? (
              <label className="setting-checkbox-label">
                <input
                  type="checkbox"
                  checked={editValue}
                  onChange={(e) => setEditValue(e.target.checked)}
                  className="setting-checkbox"
                />
                <span>{editValue ? "פעיל" : "לא פעיל"}</span>
              </label>
            ) : (
              <input
                type={getInputType(setting.value)}
                value={editValue}
                onChange={(e) =>
                  setEditValue(
                    getInputType(setting.value) === "number"
                      ? Number(e.target.value)
                      : e.target.value
                  )
                }
                className="setting-input"
                autoFocus
              />
            )}
            <div className="setting-actions">
              <button
                className="setting-btn setting-btn-save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "שומר..." : "שמור"}
              </button>
              <button
                className="setting-btn setting-btn-cancel"
                onClick={handleCancel}
                disabled={isSaving}
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div className="setting-display" onClick={handleStartEdit}>
            <span className="setting-current-value">
              {typeof setting.value === "boolean"
                ? setting.value
                  ? "✓ פעיל"
                  : "✗ לא פעיל"
                : setting.value}
            </span>
            <button className="setting-edit-icon" title="לחץ לעריכה">
              ✏️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
