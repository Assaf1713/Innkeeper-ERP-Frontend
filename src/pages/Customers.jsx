import { useEffect, useState, useMemo } from "react";
import {
  fetchCustomers,
  updateCustomer,
  createCustomer,
  deleteCustomer,
} from "../api/customersApi";
import FilterPanel, {
  FilterSearch,
  FilterActions,
  FilterChooseEntryLimit,
  FilterSelect,
} from "../components/FilterPanel";
import { useAlert } from "../hooks/useAlert";
import NewCustomerModal from "../components/forms/NewCustomerModal";
import TableDropDownActionMenu from "../components/TableDropDownActionMenu.jsx";

import EditCustomerModal from "../components/forms/EditCustomerModal";


export default function Customers() {
  const { showSuccess, showError } = useAlert();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [entryLimit, setEntryLimit] = useState(20);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  

  const HandleCustomerCreation = async (newCustomerData) => {
    try {
      const response = await createCustomer(newCustomerData);
      setCustomers((prev) => [response.customer, ...prev]);
      setShowNewCustomerModal(false);
      showSuccess("הלקוח נוצר בהצלחה");
    } catch (err) {
      console.error("Error creating customer:", err);
      showError("שגיאה ביצירת הלקוח. אנא נסה שוב.");
    }
  };

  // Filtered customers based on search

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCustomers();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת הלקוחות. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter((customer) => {
      // Active status filter
      if (activeFilter === "active" && !customer.isActive) return false;
      if (activeFilter === "inactive" && customer.isActive) return false;

      // Search query filter
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.company?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    });



    // Sort by payingCustomer first, then by IsBusiness
    return filtered.sort((a, b) => {

      // Not active customers go to the end
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }

      if (a.payingCustomer !== b.payingCustomer) {
        return a.payingCustomer ? -1 : 1;
      }

      if (a.IsBusiness !== b.IsBusiness) {
        return a.IsBusiness ? -1 : 1;
      }

      return 0;
    });
  }, [customers, searchQuery, activeFilter]);

  const displayedCustomers = useMemo(() => {
    if (entryLimit === "all") return filteredCustomers;
    return filteredCustomers.slice(0, entryLimit);
  }, [filteredCustomers, entryLimit]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  const handleDeactivateCustomer = async (customerId) => {
    try {
      const response = await updateCustomer(customerId, {
        isActive: false,
      });
      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId ? response.customer : c)),
      );
      showSuccess("הלקוח בוטל בהצלחה");
    } catch (err) {
      console.error("Error deactivating customer:", err);
      showError("שגיאה בביטול לקוח");
    }
  };

  const handleAbsoluteDelete = async (customerId) => {
    try {
      await deleteCustomer(customerId);
      setCustomers((prev) =>
        prev.filter((c) => c._id !== customerId)
      );
      showSuccess("הלקוח נמחק לצמיתות בהצלחה");
    } catch (err) {
      console.error("Error deleting customer:", err);
      showError("שגיאה במחיקת לקוח");
    }
  };

  const handleRestoreCustomer = async (customerId) => {
    try {
      const response = await updateCustomer(customerId, {
        isActive: true,
      });
      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId ? response.customer : c)),
      );
      showSuccess("הלקוח שוחזר בהצלחה");
    } catch (err) {
      console.error("Error restoring customer:", err);
      showError("שגיאה בשחזור לקוח");
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedCustomer) => {
    try {
      const response = await updateCustomer(
        editingCustomer._id,
        updatedCustomer,
      );
      setCustomers((prev) =>
        prev.map((c) => (c._id === editingCustomer._id ? response.customer : c)),
      );
      setShowEditModal(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error("Error updating customer:", err);
      showError("שגיאה בעדכון פרטי הלקוח. אנא נסה שוב");
    }
  };

  if (loading) return <div className="page-loading">טוען...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ניהול לקוחות</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowNewCustomerModal(true)}
        >
          + לקוח חדש
        </button>
      </div>

      <FilterPanel>
        <FilterSearch
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="חיפוש לפי שם, אימייל, חברה או טלפון..."
        />

        <FilterSelect
          label="סטטוס"
          value={activeFilter}
          onChange={(value) => setActiveFilter(value)}
          options={[
            { value: "all", label: "הכל" },
            { value: "active", label: "פעיל" },
            { value: "inactive", label: "לא פעיל" },
          ]}
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
        מציג {displayedCustomers.length} מתוך {filteredCustomers.length} לקוחות
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>אימייל</th>
                <th>עסק</th>
                <th>לקוח משלם</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className={!customer.isActive ? "customer-row--inactive" : ""}
                >
                  <td>{customer.name}</td>
                  <td>
                    <TableDropDownActionMenu email={customer.email} />
                  </td>
                  <td>{customer.IsBusiness ? "כן" : "לא"}</td>
                  <td>{customer.payingCustomer ? "כן" : "לא"}</td>

                  <td>
                    <div className="global-table__actions-spacer">
                      {customer.isActive ? (
                        <button
                          onClick={() => handleEditClick(customer)}
                          className="ui-btn--edit_item"
                        >
                          פרטים
                        </button>
                      ) : (
                        <>
                        <button
                          onClick={() => handleRestoreCustomer(customer._id)}
                          className="ui-btn--edit_item"
                        >
                          שחזר לקוח
                        </button>
                        <button
                        onClick={()=>handleAbsoluteDelete(customer._id)}
                        className="ui-btn--edit_item"
                      >
                        מחק לצמיתות
                      </button>
                      </>
                      )}
                      
                      {customer.isActive && (
                        <button
                          onClick={() => handleDeactivateCustomer(customer._id)}
                          className="ui-btn--delete_item"
                        >
                          בטל
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedCustomers.length === 0 && (
          <div className="no-results">לא נמצאו לקוחות</div>
        )}
      </div>

      {showEditModal && (
        <EditCustomerModal
          customer={editingCustomer}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
      {showNewCustomerModal && (
        <NewCustomerModal
          onClose={() => setShowNewCustomerModal(false)}
          onCreate={HandleCustomerCreation}
        />
      )}
    </div>
  );
}
