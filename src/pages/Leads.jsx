/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import NewEventModal from "../components/forms/NewEventModal.jsx";
import EditLeadModal from "../components/forms/EditLeadModal.jsx";
import NewLeadModal from "../components/forms/NewLeadModal.jsx";
import TableDropDownActionMenu from "../components/TableDropDownActionMenu.jsx";
import {
  fetchLeads,
  updateLead,
  createLead,
  deleteLead,
} from "../api/leadsApi.js";
import { fetchUnavailableDates } from "../api/unavailableDatesApi.js";
import { fetchEventById, fetchClosedDates } from "../api/eventsApi.js";
import { useAlert } from "../hooks/useAlert";
import FilterPanel, {
  FilterSearch,
  FilterActions,
  FilterSelect,
  FilterChooseEntryLimit,
} from "../components/FilterPanel";
import { useNavigate } from "react-router-dom";
import "../styles/Leads.css";
import { apiFetch } from "../utils/apiFetch";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entryLimit, setEntryLimit] = useState(20);
  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const SourceMap = {
    landing_page_contact_form: "טופס יצירת קשר בדף הנחיתה",
    landing_page_whatsapp_form: "כפתור WhatsApp בדף הנחיתה",
    whatsApp_original: "כפתור WhatsApp אורגני",
    original_contact_form: "טופס יצירת קשר באתר",
    manual: "ידני",
    phone_call: "שיחת טלפון",
  };

  const statusMap = {
    New: "חדש",
    Contacted: "נוצר קשר",
    Qualified: "אירוע נוצר במערכת",
    Lost: "אבוד",
    Converted: "הומר",
  };

  const statusOptions = [
    "all",
    "New",
    "Contacted",
    "Qualified",
    "Lost",
    "Converted",
  ];
  const sourceOptions = [
    "all",
    "landing_page_contact_form",
    "landing_page_whatsapp_form",
    "whatsApp_original",
    "original_contact_form",
    "manual",
    "phone_call",
  ];

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL");
  };

  const findDayOfWeek = (dateString) => {
    const daysOfWeek = [
      "ראשון",
      "שני",
      "שלישי",
      "רביעי",
      "חמישי",
      "שישי",
      "שבת",
    ];
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return daysOfWeek[date.getDay()];
  };

  const displayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("he-IL")} (${findDayOfWeek(dateString)})`;
  };

  const isDateUnavailable = (eventDate) => {
    if (!eventDate || unavailableDates.length === 0) return false;
    const eventDateStr = new Date(eventDate).toDateString();
    return unavailableDates.some(
      (unavailableDate) =>
        new Date(unavailableDate.blockedDate).toDateString() === eventDateStr,
    );
  };

  const isDateClosed = (eventDate) => {
    if (!eventDate || closedDates.length === 0) return false;
    const eventDateStr = new Date(eventDate).toDateString();
    const sameDayClosedCount = closedDates.reduce(
      (count, closedDate) =>
        new Date(closedDate).toDateString() === eventDateStr
          ? count + 1
          : count,
      0,
    );
    return sameDayClosedCount > 1;
  };

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      try {
        const data = await fetchLeads();
        // sorting leads by status (Lost at the end) and then by creation date (newest first)
        const sortedData = data.sort((a, b) => {
          if (a.status === "Lost" && b.status !== "Lost") return 1;
          if (a.status !== "Lost" && b.status === "Lost") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setLeads(sortedData);
      } catch (error) {
        showError("טעות בטעינת הלידים: ");
      } finally {
        setLoading(false);
      }
    };

    const loadUnavailableDates = async () => {
      try {
        const data = await fetchUnavailableDates();
        setUnavailableDates(data);
      } catch (error) {
        showError("טעות בטעינת התאריכים החסומים: ");
      }
    };

    const loadClosedDates = async () => {
      try {
        const data = await fetchClosedDates();
        setClosedDates(data);
      } catch (error) {
        showError("טעות בטעינת התאריכים הסגורים ");
      }
    };

    loadLeads();
    loadUnavailableDates();
    loadClosedDates();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Filter by search query
      if (
        searchQuery &&
        !lead.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by source
      if (sourceFilter !== "all" && lead.source !== sourceFilter) {
        return false;
      }

      // Filter by status
      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, sourceFilter, statusFilter]);

  const displayedLeads = useMemo(() => {
    if (entryLimit === "all") return filteredLeads;
    return filteredLeads.slice(0, entryLimit);
  }, [filteredLeads, entryLimit]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSourceFilter("all");
    setStatusFilter("all");
  };

  const handleConvertClick = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setEditLead(lead);
    setIsEditModalOpen(true);
  };

  const handleLeadCreation = async (newLeadData) => {
    try {
      const newLead = await createLead(newLeadData);
      setLeads((prev) =>
        [newLead, ...prev].sort((a, b) => {
          if (a.status === "Lost" && b.status !== "Lost") return 1;
          if (a.status !== "Lost" && b.status === "Lost") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        }),
      );
      setShowNewLeadModal(false);
      showSuccess("הליד נוצר בהצלחה");
    } catch (err) {
      console.error("Error creating lead:", err);
      throw err;
    }
  };

  // Save edited lead data

  const handleSaveEdit = async (formData) => {
    try {
      await updateLead(editLead._id, formData);
      setLeads((prev) =>
        prev.map((l) => (l._id === editLead._id ? { ...l, ...formData } : l)),
      );
      setIsEditModalOpen(false);
      setEditLead(null);
      showSuccess("הליד עודכן בהצלחה!");
    } catch (error) {
      showError("שגיאה בעדכון הליד: " + error.message);
    }
  };

  // After creating event, update lead status to "Qualified" and navigate to the new event's page
  const handleEventCreated = async (newEvent) => {
    setIsModalOpen(false);
    setSelectedLead(null);

    if (selectedLead && selectedLead._id) {
      try {
        await apiFetch(`/api/leads/${selectedLead._id}`, {
          method: "PUT",
          body: JSON.stringify({ status: "Qualified" }),
        });

        // Update lead status locally
        setLeads((prev) =>
          prev.map((l) =>
            l._id === selectedLead._id ? { ...l, status: "Qualified" } : l,
          ),
        );
        navigate(`/events/${newEvent._id}`);
      } catch (error) {
        showError("שגיאה בעדכון סטטוס הליד: " + error.message);
      }
    }

    showSuccess("האירוע נוצר בהצלחה והליד עודכן!");
  };

  const handleStatusChange = async (leadId, newStatus) => {
    if (newStatus === "deleteLead") {
      // Handle lead deletion
      try {
        await deleteLead(leadId);
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        showSuccess("הליד נמחק בהצלחה!");
      } catch (error) {
        showError("שגיאה במחיקת הליד: " + error.message);
      }
      return;
    }
    try {
      await updateLead(leadId, { status: newStatus });
      setLeads((prev) =>
        prev
          .map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
          .sort((a, b) => {
            if (a.status === "Lost" && b.status !== "Lost") return 1;
            if (a.status !== "Lost" && b.status === "Lost") return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          }),
      );
      showSuccess("סטטוס הליד עודכן בהצלחה!");
    } catch (error) {
      showError("שגיאה בעדכון סטטוס הליד: " + error.message);
    }
  };

  const handleLinkToEvent = async (lead) => {
    if (!lead.relatedEvent) {
      showError("לליד זה אין אירוע מקושר.");
      return;
    }
    try {
      const response = await fetchEventById(lead.relatedEvent);
      if (response && response.event && response.event._id) {
        navigate(`/events/${response.event._id}`);
      } else {
        showError("לא נמצא אירוע מקושר לליד זה");
      }
    } catch (error) {
      showError("שגיאה בטעינת האירוע המקושר - יתכן והאירוע אינו קיים עוד");
    }
  };

  if (loading) return <div className="page-loading">טוען...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">ניהול לידים</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowNewLeadModal(true)}
        >
          + ליד חדש
        </button>
      </div>

      <FilterPanel>
        <FilterSearch
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="חיפוש לפי שם..."
        />
        <FilterSelect
          value={sourceFilter}
          onChange={setSourceFilter}
          options={sourceOptions.map((src) => ({
            value: src,
            label: src === "all" ? "כל המקורות" : SourceMap[src] || src,
          }))}
          label="סינון לפי מקור"
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions.map((status) => ({
            value: status,
            label:
              status === "all" ? "כל הסטטוסים" : statusMap[status] || status,
          }))}
          label="סינון לפי סטטוס"
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
        מציג {displayedLeads.length} מתוך {filteredLeads.length} לידים
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>סטטוס</th>
                <th>תאריך פנייה</th>
                <th>שם</th>
                <th>אימייל</th>
                <th>טלפון</th>
                <th>העדפת התקשרות</th>
                <th>תאריך אירוע </th>
                <th>הודעה</th>
                <th>מקור</th>

                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedLeads.map((lead) => (
                <tr
                  key={lead._id}
                  className={
                    lead.status === "Converted"
                      ? "lead-row--converted"
                      : lead.status === "Lost"
                        ? "lead-row--lost"
                        : ""
                  }
                  style={
                    isDateUnavailable(lead.eventDate)
                      ? {
                          border: "3px solid red",
                          backgroundColor: "rgba(255, 0, 0, 0.1)",
                        }
                      : isDateClosed(lead.eventDate)
                        ? {
                            border: "3px solid orange",
                            backgroundColor: "rgba(255, 165, 0, 0.1)",
                          }
                        : {}
                  }
                  title={
                    isDateUnavailable(lead.eventDate)
                      ? "תאריך האירוע הוגדר במערכת כחסום"
                      : isDateClosed(lead.eventDate)
                        ? "יש לפחות אירוע אחד סגור כבר ביום הזה"
                        : ""
                  }
                >
                  <td>
                    <TableDropDownActionMenu
                      statusValue={lead.status}
                      status={
                        <span
                          className={`lead-status-badge lead-status-badge--${lead.status.toLowerCase()}`}
                        >
                          {statusMap[lead.status] || lead.status}
                        </span>
                      }
                      statusOptions={[
                        { value: "Contacted", label: "נוצר קשר" },
                        { value: "Qualified", label: "אירוע נוצר במערכת" },
                        { value: "Converted", label: "הומר" },
                        { value: "Lost", label: "אבוד" },
                        { value: "deleteLead", label: "מחק" },
                      ]}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(lead._id, newStatus)
                      }
                    />
                  </td>
                  <td>{formatDate(lead.createdAt)}</td>
                  <td>{lead.fullName}</td>
                  <td>
                    <TableDropDownActionMenu
                      email={lead.email}
                      name={lead.fullName}
                      statusValue={lead.status}
                    />
                  </td>
                  <td>
                    <TableDropDownActionMenu
                      phone={lead.phone}
                      name={lead.fullName}
                      statusValue={lead.status}
                    />
                  </td>
                  <td>{lead.preferences || "-"}</td>
                  <td>{displayDate(lead.eventDate)}</td>
                  <td>{lead.message || "-"}</td>
                  <td>{SourceMap[lead.source] || "-"}</td>

                  <td>
                    <div className="global-table__actions-spacer">
                      {lead.status !== "Lost" && (
                        <button
                          className="global-table__btn ui-btn--edit_item"
                          onClick={() => handleEditClick(lead)}
                        >
                          ערוך
                        </button>
                      )}

                      {(lead.status === "New" || lead.status === "Contacted") &&
                      !lead.relatedEvent ? (
                        <button
                          className="global-table__btn ui-btn--edit_item"
                          onClick={() => handleConvertClick(lead)}
                        >
                          צור אירוע
                        </button>
                      ) : (lead.status === "Qualified" ||
                          lead.status === "Contacted") &&
                        lead.relatedEvent ? (
                        <button
                          className="global-table__btn ui-btn--edit_item"
                          onClick={() => handleLinkToEvent(lead)}
                        >
                          קישור לאירוע
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                {/* Spacer row to ensure consistent height for the dropdown menu */}
                <td colSpan="9" style={{ height: "120px" }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {displayedLeads.length === 0 && (
          <div className="no-results">לא נמצאו לידים</div>
        )}
      </div>

      {isModalOpen && (
        <NewEventModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handleEventCreated}
          initialData={selectedLead}
        />
      )}

      {isEditModalOpen && (
        <EditLeadModal
          lead={editLead}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditLead(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onCreate={handleLeadCreation}
        />
      )}
    </div>
  );
}
