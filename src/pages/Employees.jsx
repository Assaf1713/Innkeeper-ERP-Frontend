import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchEmployees } from "../api/employeesApi";
import FilterPanel, {
  FilterSearch,
  FilterActions,
FilterChooseEntryLimit,
} from "../components/FilterPanel";
import NewEmployeeModal from "../components/forms/NewEmployeeModal";
import { createEmployee } from "../api/employeesApi";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entryLimit, setEntryLimit] = useState(20);
  const [EmployeeCreationError, setEmployeeCreationError] = useState(null);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchEmployees();
        setEmployees(data.employees || []);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת העובדים. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        employee.name?.toLowerCase().includes(query) ||
        employee.phone?.toLowerCase().includes(query) ||
        employee.role?.toLowerCase().includes(query)
      );
    });
  }, [employees, searchQuery]);

  const displayedEmployees = useMemo(() => {
    if (entryLimit === "all") return filteredEmployees;
    return filteredEmployees.slice(0, entryLimit);
  }, [filteredEmployees, entryLimit]);

  const handleClearFilters = () => {
    setSearchQuery("");
  };

const handleCreateNewEmployee = async (newEmployeeData) => {
  setEmployeeCreationError(null);
  try {
    const data = await createEmployee(newEmployeeData);
    setEmployees((prev) => [...prev, data.employee]);
    return { success: true };
  } catch (error) {
    console.error("Error creating employee:", error);
    setEmployeeCreationError(error.message || "אירעה שגיאה ביצירת העובד. אנא נסה שוב.");
    return { success: false };
  }
};

  if (loading) return <div className="page-loading">טוען...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ניהול עובדים</h1>
          <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowNewEmployeeModal(true)}
        >
          + עובד חדש
        </button>
      </div>

      <FilterPanel>
        <FilterSearch
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="חיפוש לפי שם, טלפון או תפקיד..."
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
        מציג {displayedEmployees.length} מתוך {filteredEmployees.length} עובדים
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>טלפון</th>
                <th>תפקיד</th>
                <th>פעיל</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedEmployees.map((employee) => (
                <tr
                  key={employee._id}
                  className={!employee.isActive ? "customer-row--inactive" : ""}
                >
                  <td>{employee.name}</td>
                  <td>{employee.phone || "-"}</td>
                  <td>{employee.defaultRole === "manager" ? "מנהל" : employee.defaultRole === "bartender" ? "ברמן" : "לוגיסטיקה"}</td>
                  <td>{employee.isActive ? "כן" : "לא"}</td>
                  <td>
                    <Link
                      to={`/admin/employees/${employee._id}`}
                      className="ui-btn--edit_item"
                    >
                      פרטים
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedEmployees.length === 0 && (
          <div className="no-results">לא נמצאו עובדים</div>
        )}
      </div>
      {showNewEmployeeModal && (
        <NewEmployeeModal
          onClose={() => setShowNewEmployeeModal(false)}
          onCreated={handleCreateNewEmployee}
          Error={EmployeeCreationError}
        />
      )}
    </div>
  );
}
