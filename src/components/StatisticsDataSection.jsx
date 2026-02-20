import { useMemo, useState } from "react";
import "../styles/StatisticsDataSection.css";

export default function StatisticsDataSection({ eventActuals }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // פונקציית עזר לחישוב סטטיסטי
  // מקבלת מערך אובייקטים ופונקציית חילוץ ערך
  const calculateStats = (data, valueExtractor) => {
    // 1. חילוץ ערכים וניקוי ערכים לא תקינים
    const values = data
      .map(valueExtractor)
      .filter((v) => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) {
      return { mean: 0, median: 0, stdDev: 0, safePrice: 0 };
    }

    // 2. חישוב ממוצע (Mean)
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;

    // 3. חישוב חציון (Median) - מנטרל אירועי קיצון
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 !== 0
        ? values[mid]
        : (values[mid - 1] + values[mid]) / 2;

    // 4. חישוב סטיית תקן (Standard Deviation)
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
    const avgSquareDiff =
      squareDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // 5. חישוב יעד בטוח (Safe Target) = ממוצע + סטיית תקן
    // סטטיסטית, זה מכסה כ-84% מהמקרים בהתפלגות נורמלית
    const safePrice = mean + stdDev;

    return { mean, median, stdDev, safePrice };
  };

  const stats = useMemo(() => {
    // --- נתוני מאקרו (פר אירוע) ---
    
    // סך הוצאות לאירוע (כולל הכל)
    const expensesPerEvent = calculateStats(eventActuals, (e) => {
        const totalWages = e.totalWages || 0;
        const totalAlcohol = e.totalAlcoholExpenses || 0;
        const totalGeneral = e.totalGeneralExpenses || 0;
        const totalIce = e.totalIceExpenses || 0;
        return totalWages + totalAlcohol + totalGeneral + totalIce;
    });

    // רווח נקי לאירוע
    const profitPerEvent = calculateStats(eventActuals, (e) => {
        const income = e.priceSnapshot || 0;
        const expenses = (e.totalWages || 0) + (e.totalAlcoholExpenses || 0) + (e.totalGeneralExpenses || 0) + (e.totalIceExpenses || 0);
        return income - expenses;
    });

    // הוצאות שכר לאירוע
    const wagesPerEvent = calculateStats(eventActuals, (e) => e.totalWages);


    // --- נתוני מיקרו (פר ראש/אורח) ---
    // מסננים אירועים ללא אורחים כדי למנוע חלוקה באפס
    const eventsWithGuests = eventActuals.filter(e => e.guestCountSnapshot > 0);

    // הוצאות אלכוהול לראש
    const alcoholPerHead = calculateStats(eventsWithGuests, (e) => e.totalAlcoholExpenses / e.guestCountSnapshot);

    // הוצאות שכר לראש
    const wagesPerHead = calculateStats(eventsWithGuests, (e) => e.totalWages / e.guestCountSnapshot);

    // סך הוצאות לראש (הכי קריטי לתמחור)
    const totalExpensesPerHead = calculateStats(eventsWithGuests, (e) => {
        const totalExp = (e.totalWages || 0) + (e.totalAlcoholExpenses || 0) + (e.totalGeneralExpenses || 0) + (e.totalIceExpenses || 0);
        return totalExp / e.guestCountSnapshot;
    });

    // רווח לראש
    const profitPerHead = calculateStats(eventsWithGuests, (e) => {
        const income = e.priceSnapshot || 0;
        const expenses = (e.totalWages || 0) + (e.totalAlcoholExpenses || 0) + (e.totalGeneralExpenses || 0) + (e.totalIceExpenses || 0);
        return (income - expenses) / e.guestCountSnapshot;
    });

    return {
      expensesPerEvent,
      profitPerEvent,
      wagesPerEvent,
      alcoholPerHead,
      wagesPerHead,
      totalExpensesPerHead,
      profitPerHead
    };
  }, [eventActuals]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="statistics-section">
      <div className="statistics-section__header">
        <h2 className="statistics-section__title">ניתוח סטטיסטי ותמחור</h2>
        <button
          className={`statistics-section__toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "הסתר ניתוח סטטיסטי" : "הצג ניתוח סטטיסטי"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={`statistics-section__content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="table-wrapper">
          <table className="global-table statistics-table">
            <thead>
              <tr>
                <th className="stats-col-category">מדד</th>
                <th>ממוצע</th>
                <th>חציון</th>
                <th className="stats-col-std">סטיית תקן</th>
                <th className="stats-col-safe">יעד בטוח (85%)</th>
              </tr>
            </thead>
            <tbody>
              {/* מאקרו - רמת האירוע */}
              <tr className="stats-row-header"><td colSpan="5">ניתוח מאקרו (פר אירוע)</td></tr>
              
              <tr>
                <td className="stats-label">סך הוצאות לאירוע</td>
                <td>{formatCurrency(stats.expensesPerEvent.mean)}</td>
                <td className="stats-median">{formatCurrency(stats.expensesPerEvent.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.expensesPerEvent.stdDev)}</td>
                <td className="stats-safe">{formatCurrency(stats.expensesPerEvent.safePrice)}</td>
              </tr>
              <tr>
                <td className="stats-label">שכר עובדים לאירוע</td>
                <td>{formatCurrency(stats.wagesPerEvent.mean)}</td>
                <td className="stats-median">{formatCurrency(stats.wagesPerEvent.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.wagesPerEvent.stdDev)}</td>
                <td className="stats-safe">{formatCurrency(stats.wagesPerEvent.safePrice)}</td>
              </tr>
              <tr className="stats-row-profit">
                <td className="stats-label">רווח נקי לאירוע</td>
                <td>{formatCurrency(stats.profitPerEvent.mean)}</td>
                <td className="stats-median">{formatCurrency(stats.profitPerEvent.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.profitPerEvent.stdDev)}</td>
                <td className="stats-safe text-muted">-</td> 
              </tr>

              {/* מיקרו - רמת האורח */}
              <tr className="stats-row-header"><td colSpan="5">ניתוח מיקרו (פר ראש) - לתמחור</td></tr>

              <tr>
                <td className="stats-label">עלות אלכוהול לראש</td>
                <td>{formatCurrency(stats.alcoholPerHead.mean)}</td>
                <td className="stats-median">{formatCurrency(stats.alcoholPerHead.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.alcoholPerHead.stdDev)}</td>
                <td className="stats-safe">{formatCurrency(stats.alcoholPerHead.safePrice)}</td>
              </tr>
              <tr>
                <td className="stats-label">עלות שכר לראש</td>
                <td>{formatCurrency(stats.wagesPerHead.mean)}</td>
                <td className="stats-median">{formatCurrency(stats.wagesPerHead.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.wagesPerHead.stdDev)}</td>
                <td className="stats-safe">{formatCurrency(stats.wagesPerHead.safePrice)}</td>
              </tr>
              <tr className="stats-row-highlight">
                <td className="stats-label-bold">סה"כ הוצאות לראש</td>
                <td className="stats-bold">{formatCurrency(stats.totalExpensesPerHead.mean)}</td>
                <td className="stats-median stats-bold">{formatCurrency(stats.totalExpensesPerHead.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.totalExpensesPerHead.stdDev)}</td>
                <td className="stats-safe-bold">{formatCurrency(stats.totalExpensesPerHead.safePrice)}</td>
              </tr>
              <tr className="stats-row-profit">
                <td className="stats-label">רווח לראש</td>
                <td>{formatCurrency(stats.profitPerHead.mean)}</td>
                <td className="stats-median">{formatCurrency(stats.profitPerHead.median)}</td>
                <td className="stats-std">±{formatCurrency(stats.profitPerHead.stdDev)}</td>
                <td className="stats-safe text-muted">-</td>
              </tr>

            </tbody>
          </table>
        </div>
        <div className="statistics-section__info">
          💡 יעד בטוח = הממוצע + סטיית התקן (מכסה את העלויות ברוב המוחלט של המקרים)
        </div>
      </div>
    </div>
  );
}