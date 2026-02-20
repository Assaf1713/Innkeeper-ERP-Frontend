import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWageShifts } from "../api/wageShiftsApi";
import { fetchEmployees } from "../api/employeesApi";
import FilterPanel, {
  FilterSearch,
  FilterActions,
  FilterChooseEntryLimit,
} from "../components/FilterPanel";
import EditWageShiftModal from "../components/forms/EditWageShiftModal";
import { useAlert } from "../hooks/useAlert";
import { apiFetch } from "../utils/apiFetch";

export default function Shifts() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entryLimit, setEntryLimit] = useState(20);
  const [editingShift, setEditingShift] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [shiftsData, employeesData] = await Promise.all([
          fetchWageShifts(),
          fetchEmployees(),
        ]);
        setShifts(shiftsData.shifts || []);
        setEmployees(employeesData.employees || []);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת המשמרות. אנא נסה שוב מאוחר יותר.");
        showError("שגיאה בטעינת המשמרות. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showError]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        shift.employee?.name?.toLowerCase().includes(query) ||
        shift.event?.eventNumber?.toString().includes(query) ||
        shift.event?.address?.toLowerCase().includes(query)
      );
    });
  }, [shifts, searchQuery]);

  const displayedShifts = useMemo(() => {
    if (entryLimit === "all") return filteredShifts;
    return filteredShifts.slice(0, entryLimit);
  }, [filteredShifts, entryLimit]);

  const handleClearFilters = () => {
    setSearchQuery("");
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
  };

  const closeEditModal = () => {
    setEditingShift(null);
  };

  const handleUpdateShift = async (formData) => {
    if (!editingShift) return;

    setSaving(true);
    try {
      const response = await apiFetch(`/api/wage-shifts/${editingShift._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update shift");

      const { shift: updatedShift } = await response.json();
      setShifts((prev) =>
        prev.map((shift) =>
          shift._id === editingShift._id ? { ...shift, ...updatedShift } : shift
        )
      );
      showSuccess("המשמרת עודכנה בהצלחה");
      closeEditModal();
    } catch (err) {
      console.error("Error updating shift:", err);
      showError("שגיאה בעדכון המשמרת. אנא נסה שוב.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL");
  };

  if (loading) return <div className="page-loading">טוען...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>כל המשמרות</h1>
      </div>

      <FilterPanel>
        <FilterSearch
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="חיפוש לפי עובד, מספר אירוע או כתובת..."
        />
        <FilterChooseEntryLimit
          value={entryLimit}
          onChange={(value) =>
            setEntryLimit(value === "all" ? "all" : Number(value))
          }
        />
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <div className="table-info">
        מציג {displayedShifts.length} מתוך {filteredShifts.length} משמרות
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>מספר אירוע</th>
                <th>תאריך אירוע</th>
                <th>כתובת אירוע</th>
                <th>שם עובד</th>
                <th>תפקיד</th>
                <th>שעות</th>
                <th>שכר</th>
                <th>טיפ</th>
                <th>שולם</th>
                <th>הערות</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedShifts.map((shift) => (
                <tr key={shift._id}>
                  <td>
                    <button
                      className="table-link-btn"
                      onClick={() => navigate(`/admin/events/${shift.event?._id}`)}
                    >
                      #{shift.event?.eventNumber || "-"}
                    </button>
                  </td>
                  <td>{formatDate(shift.event?.eventDate)}</td>
                  <td>{shift.event?.address || "-"}</td>
                  <td>
                    <button
                      className="table-link-btn"
                      onClick={() => navigate(`/admin/employees/${shift.employee?._id}`)}
                    >
                      {shift.employee?.name || "-"}
                    </button>
                  </td>
                  <td>
                    {shift.role === "manager" && "מנהל"}
                    {shift.role === "bartender" && "ברמן"}
                    {shift.role === "logistics" && "לוגיסטיקה"}
                  </td>
                  <td>
                    {shift.startTime} - {shift.endTime}
                  </td>
                  <td>₪{shift.wage?.toFixed(2) || "0.00"}</td>
                  <td>₪{shift.tip?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span className={shift.paid ? "status-badge status-badge--paid" : "status-badge status-badge--unpaid"}>
                      {shift.paid ? "כן" : "לא"}
                    </span>
                  </td>
                  <td>{shift.notes || "-"}</td>
                  <td>
                    <button
                      className="ui-btn--edit_item"
                      onClick={() => openEditModal(shift)}
                    >
                      ערוך
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedShifts.length === 0 && (
          <div className="no-results">לא נמצאו משמרות</div>
        )}
      </div>

      {/* Edit modal */}
      {editingShift && (
        <EditWageShiftModal
          shift={editingShift}
          employees={employees.filter((e) => e.isActive !== false)}
          onClose={closeEditModal}
          onSave={handleUpdateShift}
          saving={saving}
        />
      )}
    </div>
  );
}
