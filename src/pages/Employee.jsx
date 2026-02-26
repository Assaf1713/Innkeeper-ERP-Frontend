
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchEmployeeById,
  updateEmployee,
  fetchEmployeeWageShifts,
  fetchEmployeePlannedShifts,
} from "../api/employeesApi";
import { fetchUserByEmployeeId, updateUser, createUser } from "../api/usersApi";
import UserPanel from "../components/UserPanel";
import EmployeeEditForm from "../components/forms/EmployeeEditForm";
import EmployeeShiftsTable from "../components/EmployeeShiftsTable";
import SoftDeleteButton from "../components/SoftDeleteButton";
import { useAuth } from "../hooks/useAuth";
import FilterPanel, {
  FilterSelect,
  FilterChooseEntryLimit,
} from "../components/FilterPanel";
import { useAlert } from "../hooks/useAlert";
import "../styles/EmployeePage.css";

export default function Employee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [employee, setEmployee] = useState(null);
  const [user, setUser] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("wage"); // "wage" or "planned"
  const [entryLimit, setEntryLimit] = useState(20);
  const { user: authUser } = useAuth();

  // Load employee data and associated user on mount
  useEffect(() => {
    const loadEmployee = async () => {
      setError("");
      try {
        const [employeeData, userData] = await Promise.all([
          fetchEmployeeById(id),
          fetchUserByEmployeeId(id),
        ]);
        setEmployee(employeeData.employee);
        setUser(userData.user);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת פרטי העובד או המשתמש.");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadEmployee();
  }, [id]);

  // Load shifts based on view mode
  useEffect(() => {
    const loadShifts = async () => {
      if (!employee) return;

      try {
        let data;
        if (viewMode === "wage") {
          data = await fetchEmployeeWageShifts(id);
        } else {
          data = await fetchEmployeePlannedShifts(id);
        }
        setShifts(data.shifts || []);
      } catch (err) {
        console.error("Error loading shifts:", err);
        setShifts([]);
      }
    };

    loadShifts();
  }, [id, viewMode, employee]);

  const handleUserUpdate = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const data = await updateUser(user._id, formData);
      setUser(data.user);
      showSuccess("פרטי המשתמש עודכנו בהצלחה");
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "שגיאה בעדכון פרטי המשתמש";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUserCreate = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const data = await createUser(formData);
      setUser(data.user);
      showSuccess("משתמש נוצר בהצלחה");
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "שגיאה ביצירת המשתמש";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const data = await updateEmployee(id, formData);
      setEmployee(data.employee);
      showSuccess("העובד עודכן בהצלחה");
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "שגיאה בעדכון העובד";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setToggling(true);
    setError("");
    try {
      const updatedData = { isActive: !employee.isActive };
      const data = await updateEmployee(id, updatedData);
      setEmployee(data.employee);
      const status = data.employee.isActive ? "הופעל" : "הושבת";
      showSuccess(`העובד ${status} בהצלחה`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "שגיאה בעדכון סטטוס העובד";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setToggling(false);
    }
  };

  const copyPlannedShiftListToClipBoard = () => {
    const plannedShiftsText = shifts
      .map((shift) => {
        const dateOfEvent = shift.event?.eventDate
          ? new Date(shift.event.eventDate).toLocaleDateString("he-IL")
          : "תאריך לא ידוע";
        const startTime = shift.startTime;
        const endTime = shift.endTime;
        const location =
          shift.role === "manager"
            ? "מחסן"
            : shift.event?.address || " מיקום האירוע";

        return `
        תאריך משמרת: ${dateOfEvent}
        שעת התחלה: ${startTime}
        שעת סיום: ${endTime}
        מיקום: ${location}
        ${shift.notes ? `הערות: ${shift.notes}` : ""}

        ----- `;
      })
      .join("\n");
    navigator.clipboard.writeText(
      `משמרות מתוכננות לעובד ${employee.name}:
      ${plannedShiftsText} 
     
      קוד לבוש בנים : חולצה מכופתרת לבנה חלקה + מכנס ג'ינס שחור חלק ללא קרעים + חגרה 
      קוד לבוש בנות : שמלה שחורה אלגנטית`,
    );
    showSuccess("רשימת המשמרות המתוכננות הועתקה ללוח");
  };

  const displayedShifts = useMemo(() => {
    if (entryLimit === "all") return shifts;
    return shifts.slice(0, entryLimit);
  }, [shifts, entryLimit]);

  const viewModeOptions = [
    { value: "wage", label: "משמרות שבוצעו" },
    { value: "planned", label: "משמרות מתוכננות" },
  ];

  if (loading) return <div className="page-loading">טוען...</div>;
  if (error && !employee) return <div className="page-error">{error}</div>;
  if (!employee) return <div className="page-error">עובד לא נמצא</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1> פרטי עובד : {employee.name}</h1>
        {employee.isActive ? null : (
          <span className="employee-inactive-label"> (לא פעיל)</span>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/admin/employees")}
        >
          חזרה לרשימה
        </button>
      </div>

      {error && <div className="employee-page__error">{error}</div>}

      {/* Section A: Employee Edit Form */}
      <div className="employee-page__section">
        <EmployeeEditForm
          employee={employee}
          onSave={handleSave}
          saving={saving}
          isAdmin={authUser.role === "SUPER_ADMIN"}
        />
      </div>

      {/* Section C: Shifts Table */}
      <div className="employee-page__section">
        <h2 className="employee-page__section-title">היסטוריית משמרות</h2>

        <FilterPanel>
          <FilterSelect
            value={viewMode}
            onChange={setViewMode}
            options={viewModeOptions}
            label="סוג נתונים"
            placeholder="בחר סוג"
          />

          <FilterChooseEntryLimit
            value={entryLimit}
            onChange={(value) =>
              setEntryLimit(value === "all" ? "all" : Number(value))
            }
          />
        </FilterPanel>

        <div className="table-info employee-page__table-info">
          <span>
            מציג {displayedShifts.length} מתוך {shifts.length} משמרות
          </span>
          {viewMode === "planned" && shifts.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={copyPlannedShiftListToClipBoard}
            >
              📄 העתק רשימת משמרות לעובד
            </button>
          )}
        </div>

        <EmployeeShiftsTable shifts={displayedShifts} viewMode={viewMode} />
      </div>

      {/* Section B: User Edit Form */}
      {authUser.role === "SUPER_ADMIN" && (
        <div className="employee-page__section">
          <UserPanel
            user={user}
            employeeId={id}
            onUserSave={handleUserUpdate}
            onCreate={handleUserCreate}
            loading={loading}
            saving={saving}
            error={error}
          />
        </div>
      )}

      {/* Soft Delete Button */}
      <div className="employee-page__section" style={{ textAlign: "center" }}>
        <SoftDeleteButton
          isActive={employee.isActive}
          onToggle={handleToggleActive}
          entityLabel="עובד"
          loading={toggling}
        />
      </div>

      <div className="ui-footer__info">
        last edited {new Date(employee.updatedAt).toLocaleString("he-IL")}
      </div>
    </div>
  );
}
