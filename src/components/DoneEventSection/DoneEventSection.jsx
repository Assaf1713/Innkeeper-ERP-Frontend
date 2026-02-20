import DoneSummaryCard from "./cards/SummaryCard";
import WageShiftsCard from "./cards/WageShiftsCard";
import GeneralExpensesCard from "./cards/GeneralExpensesCard";
import AlcoholExpensesCard from "./cards/AlcoholExpensesCard";
import "./DoneEventSection.css";
import { useState } from "react";
export default function DoneEventSection({
  event,
  employees,
  plannedShifts,
  iceExpenses,

  wageShifts,
  generalExpenses,
  expenseTypes,
  

  onCreateShift,
  onUpdateShift,
  onDeleteShift,
  onImportPlannedShifts,
  MarkAllAsPaid,

  onCreateGeneralExpense,
  onDeleteGeneralExpense,
  onCreateExpenseType,
  onUpdateIceExpenses,

  
  inventoryProducts,
  alcoholExpenses ,
  onUpsertAlcoholExpense,
  onDeleteAlcoholExpense,
  onSaveActuals,
 
}){

  const [saving, setSaving] = useState(false);

  const handleSaveActuals = async () => {
    if (!onSaveActuals) return;
    setSaving(true);
    try {
      await onSaveActuals(event._id);
    } finally {
      setSaving(false);
    }
  };

  // create event actual object for the first time if not exists





  return (
    <section className="done-event">
      <div className="done-event__header">
        <div className="done-event__title">ביצוע (DONE)</div>
        <div className="done-event__subtitle">
          הזנת נתוני ביצוע בפועל: שכר/טיפים, הוצאות, אלכוהול וסיכום
        </div>
      </div>

      <DoneSummaryCard
        TotalIncome={event?.price}
        wageShifts={wageShifts}
        generalExpenses={generalExpenses}
        alcoholExpenses={alcoholExpenses}
        iceExpenses ={iceExpenses}
      />

      <WageShiftsCard
        eventId={event?._id}
        employees={employees}
        plannedShifts={plannedShifts}
        wageShifts={wageShifts}
        onCreate={onCreateShift}
        onUpdate={onUpdateShift}
        onDelete={onDeleteShift}
        onImportPlannedShifts={onImportPlannedShifts}
        MarkAllAsPaid={MarkAllAsPaid}
      />

      <GeneralExpensesCard
        eventId={event?._id}
        expenseTypes={expenseTypes}
        generalExpenses={generalExpenses}
        iceExpenses={iceExpenses}
        onCreate={onCreateGeneralExpense}
        onDelete={onDeleteGeneralExpense}
        onCreateExpenseType={onCreateExpenseType}
        onUpdateIceExpenses={onUpdateIceExpenses}
      />

      <AlcoholExpensesCard
        eventId={event?._id}
        inventoryProducts={inventoryProducts}
        alcoholExpenses={alcoholExpenses}
        onUpsert={onUpsertAlcoholExpense}
        onDelete={onDeleteAlcoholExpense}
      />
       <div className="done-event__card">
        <div className="card__header">
          <h3>שמירת נתוני ביצוע</h3>
        </div>
        <div className="panel">
          <p>לחץ על הכפתור כדי לשמור את כל נתוני הביצוע לצורך ניתוח עתידי</p>
          <button
            className="ui-btn ui-btn--primary"
            type="button"
            onClick={handleSaveActuals}
            disabled={saving}
          >
            {saving ? "שומר..." : "💾 שמור נתוני ביצוע"}
          </button>
        </div>
      </div>
    </section>
  );
}
