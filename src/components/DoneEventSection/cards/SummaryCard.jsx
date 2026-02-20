/* eslint-disable no-unused-vars */
import { useMemo } from "react";
import "../DoneEventSection.css";

export default function DoneSummaryCard({
  TotalIncome,
  wageShifts = [],
  generalExpenses = [],
  alcoholExpenses = [],
  iceExpenses = 0
}) {



   const formatPrice = (price) => {
    if (!price && price !== 0) return "₪0";
    return `₪${price.toLocaleString("he-IL")}`;
  };



  const summary = useMemo(() => {
    let totalGeneral = 0;
    let totalWage = 0;
    let totalTip = 0;
    let totalAlcohol = 0;

    if (wageShifts.length > 0) {
      for (const shift of wageShifts) {
        totalWage += shift.wage || 0;
        totalTip += shift.tip || 0;
      }
    }

    if (generalExpenses.length > 0) {
      for (const exp of generalExpenses) {
        totalGeneral += exp.amount || 0;
      }
    }

    totalAlcohol = alcoholExpenses.reduce((acc, e) => {
      const bottles = Number(e?.bottlesUsed) || 0;
      const price = Number(e?.product?.price) || 0; 
      return acc + bottles * price;
    }, 0);


    const totalExpenses = totalWage + totalTip + totalGeneral + totalAlcohol + Number(iceExpenses);

    return {
      totalWage,
      totalTip,
      totalGeneral,
      totalAlcohol,
      totalExpenses,
      netIncome: TotalIncome - totalExpenses,
    };
  }, [wageShifts, generalExpenses, alcoholExpenses, iceExpenses, TotalIncome]);

  return (
    <div className="done-event__card">
      <div className="card__header">
        <h3>סיכום אירוע</h3>
        <span className="card__hint">מחושב מהנתונים המוזנים</span>
      </div>

      <div className="summary-grid">

        <div className="summary-item">
          <div className="summary-item__label">סה״כ שכר</div>
          <div className="summary-item__value">{formatPrice(summary.totalWage)}</div>
        </div>

        <div className="summary-item">
          <div className="summary-item__label">סה״כ הוצאות כלליות</div>
          <div className="summary-item__value">{formatPrice(summary.totalGeneral)}</div>
        </div>

        <div className="summary-item">
          <div className="summary-item__label">סה״כ הוצאות אלכוהול</div>
          <div className="summary-item__value">{formatPrice(summary.totalAlcohol)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-item__label">סה״כ הוצאות קרח</div>
          <div className="summary-item__value">{formatPrice(iceExpenses)}</div>
        </div>
        <div className="summary-item summary-item--total">
          <div className="summary-item__label">סה״כ הוצאות</div>
          <div className="summary-item__value">{formatPrice(summary.totalExpenses)}</div>
        </div>

        <div className="summary-item summary-item--net">
          <div className="summary-item__label">סה״כ הכנסות נטו</div>
          <div className="summary-item__value">{formatPrice(summary.netIncome)}</div>
        </div>
      </div>
    </div>
  );
}
