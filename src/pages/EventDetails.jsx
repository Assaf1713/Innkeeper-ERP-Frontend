/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from "../hooks/useAlert";
import EventEditForm from "../components/forms/EventEditForm.jsx";
import ClosedEventSection from "../components/ClosedEventSection";
import DoneEventSection from "../components/DoneEventSection/DoneEventSection.jsx";
import EventPricingSection from "../components/EventPricingSection.jsx";
import CustomerAssignment from "../components/CustomerAssignment.jsx";
import EventStatusBadge from "../components/EventStatusBadge.jsx";
import { fetchCustomerById } from "../api/customersApi.js";
import { fetchSettingsAsKeyValue } from "../api/settingsApi";
import { apiFetch } from "../utils/apiFetch";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [event, setEvent] = useState(null);
  const [lookups, setLookups] = useState({
    eventTypes: [],
    leadSources: [],
    menuTypes: [],
    statuses: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [plannedShifts, setPlannedShifts] = useState([]);
  const [wageShifts, setWageShifts] = useState([]);
  const [generalExpenses, setGeneralExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [alcoholExpenses, setAlcoholExpenses] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [iceExpenses, setIceExpenses] = useState(0);
  const [carType, setCarType] = useState("transporter");
  const [customer, setCustomer] = useState(null);
  const [settings, setSettings] = useState(null);

  // טופס עריכה (נשמור codes)
  const [form, setForm] = useState({
    customerId: "",
    customerName: "",
    eventDate: "",
    guestCount: "",
    eventAddress: "",
    startTime: "",
    endTime: "",
    price: "",
    notes: "",
    eventTypeCode: "",
    leadSourceCode: "",
    menuTypeCode: "",
    statusCode: "",
    travelTime: "",
    travelDistance: "",
  });

  // refresh the fetch of done event details

  const fetchWageShifts = async (id) => {
    const res = await apiFetch(`/api/events/${id}/wage-shifts`);
    if (!res.ok) throw new Error("Failed to fetch wage shifts");
    const data = await res.json();
    setWageShifts(data.shifts);
  };

  const fetchGeneralExpenses = async (id) => {
    const res = await apiFetch(`/api/events/${id}/general-expenses`);
    if (!res.ok) throw new Error("Failed to fetch general expenses");
    const data = await res.json();
    setGeneralExpenses(data.expenses);
  };

  const fetchExpenseTypes = async () => {
    const res = await apiFetch(`/api/lookups/general-expense-types`);
    if (!res.ok) throw new Error("Failed to fetch expense types");
    const data = await res.json();
    setExpenseTypes(data.expenseTypes);
  };

  const fetchAlcoholExpenses = async (id) => {
    const res = await apiFetch(`/api/events/${id}/alcohol-expenses`);
    if (!res.ok) throw new Error("Failed to fetch alcohol expenses");
    const data = await res.json();
    setAlcoholExpenses(data.alcoholExpenses);
  };

  // initial data load.

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        // Fetch everything in parallel (including settings)
        const [
          evRes,
          luRes,
          emRes,
          psRes,
          wsRes,
          geRes,
          etRes,
          aeRes,
          ipRes,
          eaRes,
          settingsRes,
        ] = await Promise.all([
          apiFetch(`/api/events/${id}`),
          apiFetch(`/api/lookups`),
          apiFetch(`/api/employees`),
          apiFetch(`/api/events/${id}/planned-shifts`),
          apiFetch(`/api/events/${id}/wage-shifts`),
          apiFetch(`/api/events/${id}/general-expenses`),
          apiFetch(`/api/lookups/general-expense-types`),
          apiFetch(`/api/events/${id}/alcohol-expenses`),
          apiFetch(`/api/lookups/inventory-products`),
          apiFetch(`/api/events/${id}/actuals`),
          fetchSettingsAsKeyValue(), // Already returns parsed JSON
        ]);

        // Check all responses
        if (!evRes.ok) throw new Error("Failed to load event");
        if (!luRes.ok) throw new Error("Failed to load lookups");
        if (!emRes.ok) throw new Error("Failed to load employees");
        if (!psRes.ok) throw new Error("Failed to load planned shifts");
        if (!wsRes.ok) throw new Error("Failed to load wage shifts");
        if (!geRes.ok) throw new Error("Failed to load general expenses");
        if (!etRes.ok) throw new Error("Failed to load expense types");
        if (!aeRes.ok) throw new Error("Failed to load alcohol expenses");
        if (!ipRes.ok) throw new Error("Failed to load inventory products");
        if (!eaRes.ok) throw new Error("Failed to load event actuals");

        // Parse all JSON in parallel
        const [
          evData,
          luData,
          emData,
          psData,
          wsData,
          geData,
          etData,
          aeData,
          ipData,
          eaData,
        ] = await Promise.all([
          evRes.json(),
          luRes.json(),
          emRes.json(),
          psRes.json(),
          wsRes.json(),
          geRes.json(),
          etRes.json(),
          aeRes.json(),
          ipRes.json(),
          eaRes.json(),
        ]);

        // Set all states
        const e = evData.event;
        setEvent(e);
        setLookups(luData);
        setEmployees(emData.employees);
        setPlannedShifts(psData.plannedShifts);
        setWageShifts(wsData.shifts);
        setGeneralExpenses(geData.expenses);
        setExpenseTypes(etData.expenseTypes);
        setAlcoholExpenses(aeData.alcoholExpenses);
        setInventoryProducts(ipData.inventoryProducts);
        setIceExpenses(eaData.eventActual?.iceExpense || 0);
        setCarType(eaData.eventActual?.carType ?? "transporter");
        setCustomer(e.customer || null);
        setSettings(settingsRes.settings || {});

        // Set form
        setForm({
          customerId: e.customer?._id || "",
          customerName: e.customerName ?? "",
          eventDate: e.eventDate ? e.eventDate.slice(0, 10) : "",
          guestCount: e.guestCount ?? "",
          eventAddress: e.address ?? "",
          startTime: e.startTime || "",
          endTime: e.endTime || "",
          price: e.price ?? "",
          notes: e.notes ?? "",
          eventTypeCode: e.eventType?.code ?? "",
          leadSourceCode: e.leadSource?.code ?? "",
          menuTypeCode: e.menuType?.code ?? "",
          statusCode: e.status?.code ?? "",
          travelTime: e.travelDuration
            ? FormatTravelDuration(e.travelDuration)
            : "",
          travelDistance: e.travelDistance ? e.travelDistance / 1000 : "",
        });
      } catch (err) {
        console.error(err);
        showError("שגיאה בטעינת פרטי האירוע. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, showError]); // Added showError dependency

  const formatedDate = (dateStr) => {
    const dt = new Date(dateStr);
    return dt.toLocaleDateString("he-IL");
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

  const FormatTravelDuration = (durationSec) => {
    // Add a safety factor of 20 minutes (1800 seconds) to account for traffic and other delays
    durationSec += 1800;
    const hours = Math.floor(durationSec / 3600);
    const minutes = Math.ceil((durationSec % 3600) / 60);
    return `${hours} שעות ו-${minutes} דקות`;
  };

  // edit event save handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json();

        // Show specific error message from server
        if (errorData.error) {
          showError(errorData.error);
        } else {
          showError("שמירה נכשלה");
        }
        return; // Don't continue if there was an error
      }

      const data = await res.json();
      setEvent(data.event); // עכשיו event מעודכן + populated
      // גם נעדכן את form ממה שחזר (אופציונלי)
      const e2 = data.event;
      setForm((p) => ({
        ...p,
        price: e2.price ?? p.price,
        eventTypeCode: e2.eventType?.code ?? p.eventTypeCode,
        leadSourceCode: e2.leadSource?.code ?? p.leadSourceCode,
        menuTypeCode: e2.menuType?.code ?? p.menuTypeCode,
        statusCode: e2.status?.code ?? p.statusCode,
      }));

      showSuccess("נשמר בהצלחה");
    } catch (err) {
      console.error(err);
      showError("שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  };

  // save event actual handlers

  const saveEventActuals = async (eventId) => {
    try {
      const res = await apiFetch(`/api/events/${eventId}/actuals`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to save event actuals");
      showSuccess("נתוני הסיכום נשמרו בהצלחה");
    } catch (error) {
      console.error("Error saving actuals:", error);
      showError("שגיאה בשמירת נתוני הסיכום");
    }
  };

  // ** CLOSED EVENT HANDLERS ** //

  // Planned Shifts callbacks

  const HandleCreateShift = async (eventId, shiftData) => {
    const res = await apiFetch(`/api/events/${eventId}/planned-shifts`, {
      method: "POST",
      body: JSON.stringify(shiftData),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Create shift failed:", errText);
      throw new Error("Failed to create shift");
    }
    // הוספת המשמרת לרשימה מקומית
    const data = await res.json();
    setPlannedShifts((prevShifts) => [...prevShifts, data.plannedShift]);
  };
  const handleDeleteShift = async (shiftId) => {
    const res = await apiFetch(`/api/plannedShifts/${shiftId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Delete shift failed:", errText);
      throw new Error("Failed to delete shift");
    }
    setPlannedShifts((prevShifts) =>
      prevShifts.filter((shift) => shift._id !== shiftId),
    );
  };
  const handleUpdateShift = async (shiftId, updatedData) => {
    const res = await apiFetch(`/api/plannedShifts/${shiftId}`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Update shift failed:", errText);
      showError("שגיאה בעדכון המשמרת");
      return;
    }
    const data = await res.json();
    setPlannedShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift._id === shiftId ? data.plannedShift : shift,
      ),
    );
  };

  // ** DONE EVENT HANDLERS ** //

  // wage-shift callbacks

  const createWageShift = async (eventId, payload) => {
    const res = await apiFetch(`/api/events/${eventId}/wage-shifts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create wage shift");
    await fetchWageShifts(eventId);
  };

  const deleteWageShift = async (eventId, shiftId) => {
    const res = await apiFetch(`/api/wage-shifts/${shiftId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete wage shift");
    await fetchWageShifts(eventId);
  };

  const importWageShiftsFromPlanned = async (eventId) => {
    const res = await apiFetch(
      `/api/events/${eventId}/wage-shifts/import-planned`,
      {
        method: "POST",
      },
    );
    if (!res.ok) throw new Error("Failed to import planned shifts");
    await fetchWageShifts(eventId);
  };

  const updateWageShift = async (eventId, shiftId, payload) => {
    const res = await apiFetch(`/api/wage-shifts/${shiftId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update wage shift");
    await fetchWageShifts(eventId);
  };

  const markAllWageShiftsAsPaid = async (eventId) => {
    const res = await apiFetch(`/api/events/${eventId}/wage-shifts/mark-all-paid`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to mark all wage shifts as paid");
    await fetchWageShifts(eventId);
  };


  // general-expense callbacks

  const createGeneralExpense = async (eventId, payload) => {
    const res = await apiFetch(`/api/events/${eventId}/general-expenses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create general expense");
    await fetchGeneralExpenses(eventId);
  };

  const createExpenseType = async (label) => {
    const res = await apiFetch(`/api/lookups/general-expense-types`, {
      method: "POST",
      body: JSON.stringify({ label }),
    });
    if (!res.ok) throw new Error("Failed to create expense type");
    const created = await res.json();
    await fetchExpenseTypes();
    return created.expenseType; // חשוב לקומבובוקס
  };

  const deleteGeneralExpense = async (eventId, expenseId) => {
    const res = await apiFetch(`/api/general-expenses/${expenseId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete general expense");
    await fetchGeneralExpenses(eventId);
  };

  // update ice expenses

  const updateIceExpenses = async (eventId, amount) => {
    const res = await apiFetch(`/api/events/${eventId}/ice-expenses`, {
      method: "PUT",
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("Failed to update ice expenses");
    setIceExpenses(amount);
    showSuccess("הוצאות הקרח עודכנו בהצלחה");
  };

  const updateCarType = async (eventId, selectedCarType) => {
    const res = await apiFetch(`/api/events/${eventId}/car-type`, {
      method: "PUT",
      body: JSON.stringify({ carType: selectedCarType }),
    });
    if (!res.ok) throw new Error("Failed to update car type");
    setCarType(selectedCarType);
    showSuccess("סוג הרכב עודכן בהצלחה");
  };

  // alcohol-expense callbacks

  const createAlcoholExpense = async (eventId, payload) => {
    const res = await apiFetch(`/api/events/${eventId}/alcohol-expenses`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create alcohol expense");
    await fetchAlcoholExpenses(eventId);
  };

  const deleteAlcoholExpense = async (eventId, expenseId) => {
    const res = await apiFetch(`/api/alcohol-expenses/${expenseId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete alcohol expense");
    await fetchAlcoholExpenses(eventId);
  };

  // status change handler

  const handleStatusChange = async (newStatusCode) => {
    if (newStatusCode === "CLOSED") {
      if (!form.price || Number(form.price) <= 0) {
        showError("יש להזין מחיר לפני סגירת האירוע");
        return;
      }
      if (!form.customerId) {
        showError("יש להקצות לקוח לפני סגירת האירוע");
        return;
      }
    }
    try {
      const res = await apiFetch(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          statusCode: newStatusCode,
          customerId: form.customerId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setEvent(data.event);
      setForm((p) => ({
        ...p,
        statusCode: data.event.status?.code ?? newStatusCode,
      }));
      showSuccess("סטטוס האירוע עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating status:", error);
      showError("שגיאה בעדכון סטטוס האירוע");
    }
  };

  // customer assignment handler

  const handleCustomerAssignment = async (customerId, customerName) => {
    try {
      const res = await apiFetch(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          customerId,
          customerName,
        }),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      const data = await res.json();
      setEvent(data.event);
      const customerData = await fetchCustomerById(customerId);
      setCustomer(customerData.customer);
      setForm((p) => ({
        ...p,
        customerId,
        customerName,
      }));
      showSuccess("לקוח עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating customer:", error);
      showError("שגיאה בעדכון לקוח");
    }
  };

  // rendering

  if (loading) return <div style={{ padding: 16 }}>טוען...</div>;
  if (!event) return <div style={{ padding: 16 }}>לא נמצא אירוע</div>;

  return (
    <>
      <div className="page-header">
        <h1>
          פרטי אירוע - {event.eventNumber} |{" "}
          {formatedDate(event.eventDate)}{" "} | יום {findDayOfWeek(event.eventDate)}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <EventStatusBadge
            status={event.status}
            statusOptions={lookups.statuses}
            onStatusChange={handleStatusChange}
          />
          <button className="ui-btn" onClick={() => navigate(-1)}>
            חזרה
          </button>
        </div>
      </div>
      <div style={{ marginTop: "16px" }}>
        <CustomerAssignment
          customerId={form.customerId}
          customerName={form.customerName}
          customerEmail={customer?.email || ""}
          onAssign={handleCustomerAssignment}
          disabled={saving}
        />
      </div>
      <EventEditForm
        event={event}
        lookups={lookups}
        onSave={handleSave}
        setForm={setForm}
        form={form}
        saving={saving}
        VAT={settings.currentVAT || 0}
      />
      <EventPricingSection
        event={event}
        onPriceChange={(newPrice) =>
          setForm((p) => ({ ...p, price: newPrice }))
        }
        settings={settings}
      />
      {event.status.code === "CLOSED" ? (
        <ClosedEventSection
          event={event}
          statusCode={form.statusCode}
          employees={employees}
          plannedShifts={plannedShifts.sort((a, b) =>
            a.startTime.localeCompare(b.startTime),
          )}
          onCreateShift={HandleCreateShift}
          onDeleteShift={handleDeleteShift}
          onUpdateShift={handleUpdateShift}
          settings={settings}
        />
      ) : null}
      {event.status.code === "DONE" ? (
        // done event - show done event details section
        <DoneEventSection
          event={event}
          employees={employees}
          plannedShifts={plannedShifts}
          wageShifts={wageShifts}
          generalExpenses={generalExpenses}
          alcoholExpenses={alcoholExpenses}
          inventoryProducts={inventoryProducts}
          expenseTypes={expenseTypes}
          iceExpenses={iceExpenses}
          carType={carType}
          onCreateShift={createWageShift}
          onUpdateShift={updateWageShift}
          onDeleteShift={deleteWageShift}
          onImportPlannedShifts={importWageShiftsFromPlanned}
          onCreateGeneralExpense={createGeneralExpense}
          onCreateExpenseType={createExpenseType}
          onDeleteGeneralExpense={deleteGeneralExpense}
          onUpdateIceExpenses={updateIceExpenses}
          onUpdateCarType={updateCarType}
          onUpsertAlcoholExpense={createAlcoholExpense}
          onDeleteAlcoholExpense={deleteAlcoholExpense}
          onSaveActuals={saveEventActuals}
          settings={settings}
          MarkAllAsPaid={markAllWageShiftsAsPaid}
        />
      ) : null}
    </>
  );
}
