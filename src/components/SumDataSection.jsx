import { useMemo, useState } from "react";
import { EXPENSE_CATEGORIES } from "../constants/expenseCategories";
import "../styles/SumDataSection.css";

export default function SumDataSection({ eventActuals }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const summaryData = useMemo(() => {
    // Section A: Total Income from events
    const totalIncome = eventActuals.reduce(
      (sum, actual) => sum + (actual.priceSnapshot || 0),
      0
    );

    // Section B: Event-Related Expenses
    const totalWages = eventActuals.reduce(
      (sum, actual) => sum + (actual.totalWages || 0),
      0
    );
    
    const totalAlcoholExpenses = eventActuals.reduce(
      (sum, actual) => sum + (actual.totalAlcoholExpenses || 0),
      0
    );
    const totalGeneralExpenses = eventActuals.reduce(
      (sum, actual) => sum + (actual.totalGeneralExpenses || 0),
      0
    );
    const totalIceExpenses = eventActuals.reduce(
      (sum, actual) => sum + (actual.totalIceExpenses || 0),
      0
    );

    const totalEventRelatedExpenses =
      totalWages +
      totalAlcoholExpenses +
      totalGeneralExpenses +
      totalIceExpenses;


  
    // Total Expenses
    const totalAllExpenses =
      totalEventRelatedExpenses 
    // Net Profit
    const netProfit = totalIncome - totalAllExpenses;

    return {
      totalIncome,
      totalWages,
      totalAlcoholExpenses,
      totalGeneralExpenses,
      totalIceExpenses,
      totalEventRelatedExpenses,
      totalAllExpenses,
      netProfit,
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
    <div className="sum-data-section">
      <div className="sum-data-section__header">
        <h2 className="sum-data-section__title">סיכום כספי</h2>
        <button
          className={`sum-data-section__toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "הסתר סיכום כספי" : "הצג סיכום כספי"}
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

      <div className={`sum-data-section__content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>קטגוריה</th>
                <th>סכום</th>
              </tr>
            </thead>
            <tbody>
              {/* Section A: Total Income */}
              <tr className="sum-row-income">
                <td className="sum-label-bold">סה"כ הכנסות</td>
                <td className="sum-value-bold sum-value-positive">
                  {formatCurrency(summaryData.totalIncome)}
                </td>
              </tr>

              {/* Section B: Event-Related Expenses */}
              <tr className="sum-row-header">
                <td colSpan="2">הוצאות קשורות לאירועים</td>
              </tr>
              <tr>
                <td className="sum-label-indent">שכר עובדים</td>
                <td className="sum-value">{formatCurrency(summaryData.totalWages)}</td>
              </tr>
              <tr>
                <td className="sum-label-indent">הוצאות אלכוהול</td>
                <td className="sum-value">{formatCurrency(summaryData.totalAlcoholExpenses)}</td>
              </tr>
              <tr>
                <td className="sum-label-indent">הוצאות כלליות לאירוע</td>
                <td className="sum-value">{formatCurrency(summaryData.totalGeneralExpenses)}</td>
              </tr>
              <tr>
                <td className="sum-label-indent">הוצאות קרח</td>
                <td className="sum-value">{formatCurrency(summaryData.totalIceExpenses)}</td>
              </tr>

              {/* Total Expenses */}
              <tr className="sum-row-total">
                <td className="sum-label-bold">סה"כ הוצאות</td>
                <td className="sum-value-bold sum-value-negative">
                  {formatCurrency(summaryData.totalAllExpenses)}
                </td>
              </tr>

              {/* Net Profit */}
              <tr className={`sum-row-profit ${summaryData.netProfit >= 0 ? 'sum-row-profit-positive' : 'sum-row-profit-negative'}`}>
                <td className="sum-label-bold">רווח נקי</td>
                <td className={`sum-value-bold ${summaryData.netProfit >= 0 ? 'sum-value-profit-positive' : 'sum-value-profit-negative'}`}>
                  {formatCurrency(summaryData.netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}