/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useAlert } from "../hooks/useAlert";
import { apiFetch } from "../utils/apiFetch";

import "../styles/EventPricingSection.css";

export default function EventPricingSection({
  event,
  onPriceChange,
  settings,
}) {
  const { showError } = useAlert();
  const [isExpanded, setIsExpanded] = useState(false);

  // --- Calculator State ---
  
  const [calcData, setCalcData] = useState({
    guests: event.guestCount || 0,
    hours: 0,
    // Staffing
    managers: 1,
    bartenders: 0,
    managerOvertime: settings?.defaultSetupTimePerEventForManager || 7,
    bartenderOvertime: settings?.defaultSetupTimePerEvent || 3,
    drivingDistance: 80, // Default distance in km
    drivingTime: settings?.defaultDrivingTimePerEvent || 1,
    hourlyWage: settings?.defaultBartenderWage || 60,
    profitMargin: (Number(settings?.profitMarginTarget)/100) || 0.5,
    // Variable Costs
    alcoholPerHead: 0,
    iceTotal: 0,
    fuelPerKM: settings?.fuel_price_per_km || 2.5,
    TotalFuel: 200,
    logistics: 300,
    extra: 0,
  });


  // --- External Data State ---
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState({
    staff: false,
    alcohol: false,
    ice: false,
  });

  // --- Initialization (Run once on mount/event change) ---
  useEffect(() => {
    // 1. Calculate Hours
    let hours = 3;
    if (event.startTime && event.endTime) {
      const [sh, sm] = event.startTime.split(":").map(Number);
      const [eh, em] = event.endTime.split(":").map(Number);
      let diff = eh * 60 + em - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      hours = Math.ceil(diff / 60);
    }

    // 2. Calculate Staff (Rule: 1 Manager + Rest Bartenders, Total = Guests/50)
    const guests = event.guestCount || 0;
    const totalStaff = Math.max(
      1,
      Math.ceil(guests / (settings?.guestsPerStaffRatio || 50)),
    ); // Ensure at least 1 staff
    const managers = 1;
    const bartenders = Math.max(0, totalStaff - 1);
    const iceDefault = guests * 1 * (settings?.defaultIceCostPerKg || 4); // 1kg * 4nis

    // 3.caculate the set-up time for manager and bartender based on the settings and the event type
      if (!event.eventType?.code) {
        showError("שים לב! סוג אירוע לא הוגדר ועל כן שעות העבודה הוגדרו לפי ברירת מחדל. אנא הגדר סוג אירוע כדי לקבל חישוב מדויק יותר.");
        return;
      }
      // NOTE - the 'warehouse work time' and the 'set-up time' only refer to the pre-event work hours
      let WarehouseWorkTime=0;
      let PreEventSetUpTime = 0;
      if (event.eventType.code === "WEDDING_FULL_BAR" ) {
        WarehouseWorkTime = settings?.defaultWarehouseWorkTimeForFullBar || 1.5;
        PreEventSetUpTime = settings?.defaultSetupTimeForFullBar || 4;
      }
      else if (event.eventType.code === "PRIVATE_FULL_BAR" || event.eventType.code === "CORP_PARTY") {
        WarehouseWorkTime = settings?.defaultWarehouseWorkTimeForFullBar || 1.5;
        PreEventSetUpTime = settings?.defaultSetupTimeForFullBar || 3;
      }
      else {
        WarehouseWorkTime = settings?.defaultWarehouseWorkTime || 1;
        PreEventSetUpTime = settings?.defaultSetupTime || 2;
      }
      const managerOvertime = WarehouseWorkTime + PreEventSetUpTime +2; // +2 hours for post-event wrap-up
      const bartenderOvertime = PreEventSetUpTime +1;


// 4. Calculate and Update Driving Time and Distance
      
      const drivingDistance = (event.travelDistance / 1000) || 80; // Default to 80km if not provided
      const roundTripDistance = drivingDistance * 2; // Round trip
      const fuelCost = roundTripDistance * calcData.fuelPerKM;
      const FinalFuelCost = Math.max(200, Math.ceil(fuelCost/50)*50); // Minimum 200 nis for fuel

      let drivingTime = settings?.defaultDrivingTimePerEvent || 1;
      
      if (event.travelDuration) {
        const safetyMargin = settings?.drivingTimeSafetyMargin || 1800; // 30 minutes
        
        // 1. Calculate raw hours (including safety margin)
        const totalSeconds = event.travelDuration + safetyMargin;
        const rawHours = totalSeconds / 3600;

        // 2. Define tolerance (10 minutes in decimal hours = ~0.166)
        const tolerance = 10 / 60;

        // 3. Apply logic: Subtract tolerance, then round UP (Ceil) to nearest 0.5
        // We multiply by 2, Ceil, then divide by 2 to get 0.5 steps
        const calculatedWithTolerance = Math.ceil((rawHours - tolerance) * 2) / 2;

        // 4. Set final time (Minimum 1 hour)
        drivingTime = Math.max(1, calculatedWithTolerance);

    
      }

    setCalcData((prev) => ({
      ...prev,
      guests,
      hours,
      managers,
      bartenders,
      managerOvertime,
      bartenderOvertime,
      drivingTime,
      drivingDistance,
      iceTotal: iceDefault,
      TotalFuel: FinalFuelCost,
    }));
  }, [event]);

  // --- Fetch Pricing Analysis when Event Type or Guests change ---
  useEffect(() => {
    if (!event.eventType?.code || calcData.guests === 0) return;
    const fetchAnalysis = async () => {
      setLoadingAnalysis(true);
      try {
        const parms = new URLSearchParams({
          eventTypeCode: event.eventType.code,
          guestCount: calcData.guests,
        });
        const response = await apiFetch(
          `/api/pricing/analysis?${parms.toString()}`,
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setAnalysis(data);

        // Update alcohol default ONLY if user hasn't touched it yet
        setCalcData((prev) => {
          if (!hasUserEdited.alcohol) {
            return {
              ...prev,
              alcoholPerHead: Math.ceil(data.history.alcoholPerHead),
            };
          }
          if (!hasUserEdited.ice) {
            return { ...prev, iceTotal: Math.ceil(data.history.iceExpenses) };
          }
          return prev;
        });
      } catch (error) {
        console.error("Pricing analysis failed", error);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    const timeoutId = setTimeout(fetchAnalysis, 500);
    return () => clearTimeout(timeoutId);
  }, [event.eventType, calcData.guests]); // Re-fetch if event type changes (guests change doesn't necessarily change per-head stats)

  // --- Real-time Cost Calculation ---
  const costs = useMemo(() => {
    // 1. Staff Cost
    // Formula: (Count * (BaseHours + Overtime) * Wage)
    
    // Manager: BaseHours = Event Hours + (Driving Time * 2 for round trip) + Manager Overtime
    const managerTotalHours = Math.ceil(calcData.hours + calcData.managerOvertime + calcData.drivingTime * 2);
    const managerRawCost = (managerTotalHours * calcData.hourlyWage);
    const managerCost = Math.ceil(managerRawCost *1.1 /50)*50; // Round up to nearest 50 nis with 10% buffer

    // Bartender: BaseHours = Event Hours + Bartender Overtime (No driving time added for bartenders)
    const bartenderTotalHours = Math.ceil(calcData.hours + calcData.bartenderOvertime);
    const bartenderRawCost = Math.max(
    bartenderTotalHours * calcData.hourlyWage * 1.1,600) ; // Minimum 600 nis per bartender
    const bartenderCost = Math.ceil(bartenderRawCost / 50) * 50; // Round up to nearest 50 nis

    // Total Staff Cost
    const bartenderTotalCost = calcData.bartenders * bartenderCost;
    const managerTotalCost = calcData.managers * managerCost;
    
    const staffTotal = managerTotalCost + bartenderTotalCost;

    //2. Logistics


    const logisticsTotal = calcData.TotalFuel + calcData.logistics + calcData.extra;

    // 2. Alcohol
    const alcoholTotal = calcData.guests * calcData.alcoholPerHead;

    // 3. Total
    const total =
      staffTotal + alcoholTotal + calcData.iceTotal + logisticsTotal;

    const perHead = calcData.guests > 0 ? total / calcData.guests : 0;

    return {
      staff: staffTotal,
      managerCost,
      bartenderCost,
      managerTotalHours,
      bartenderTotalHours,
      managerTotalCost,
      bartenderTotalCost,
      alcohol: alcoholTotal,
      ice: calcData.iceTotal,
      logistics: logisticsTotal,
      total: total,
      perHead: perHead,
    };
  }, [calcData]);

  // --- Handlers ---
  const handleInputChange = (field, value) => {
    setCalcData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));

    // Mark as edited so we don't override with defaults later
    if (field === "alcoholPerHead")
      setHasUserEdited((p) => ({ ...p, alcohol: true }));
    if (field === "iceTotal") setHasUserEdited((p) => ({ ...p, ice: true }));
  };

  const handleApplyPrice = (price) => {
    onPriceChange(price);
  };

  const fmt = (n) => Number(n).toLocaleString();

  const currentProfit = (event.price || 0) - costs.total;
  const currentMargin = event.price ? (currentProfit / event.price) * 100 : 0;

  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <div className="pricing-header-content">
          <h3 className="pricing-title">🏷️ מחשבון תמחור ורווחיות</h3>
          <div className="pricing-subtitle">
            חישוב עלויות צפויות לאירוע <strong>{event.eventType?.label}</strong>
          </div>
        </div>
        <button
          className={`pricing-section__toggle ${isExpanded ? "expanded" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "הסתר מחשבון תמחור" : "הצג מחשבון תמחור"}
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

      <div
        className={`pricing-section__content ${isExpanded ? "expanded" : "collapsed"}`}
      >
        <div className="pricing-grid">
          {/* --- LEFT COLUMN: INPUTS --- */}
          <div className="pricing-inputs-column">
            {/* A. GENERAL */}
            <div className="input-group-header">כללי</div>
            <div className="inputs-row two-col">
              <div className="pricing-input-wrapper">
                <label>כמות אורחים</label>
                <input
                  type="number"
                  value={calcData.guests}
                  onChange={(e) => handleInputChange("guests", e.target.value)}
                  className="pricing-input"
                />
              </div>
              <div className="pricing-input-wrapper">
                <label>שעות אירוע</label>
                <input
                  type="number"
                  value={calcData.hours}
                  onChange={(e) => handleInputChange("hours", e.target.value)}
                  className="pricing-input"
                />
              </div>
            </div>

            {/* B. STAFFING */}
            <div className="input-group-header">
              כוח אדם (לפי ₪{calcData.hourlyWage}/שעה)
            </div>
            <div className="staff-inputs-container">
              {/* Manager Row */}
              <div className="staff-row">
                <div className="staff-label">תקן מנהל</div>
                <div className="staff-input-row">
                  <div className="staff-input-group">
                    <label>כמות מנהלים</label>
                    <input
                      className="amount"
                      type="number"
                      value={calcData.managers}
                      onChange={(e) =>
                        handleInputChange("managers", e.target.value)
                      }
                    />
                  </div>
                  <div className="staff-input-group">
                    <label>ש. סרוויס</label>
                    <input type="number" value={calcData.hours} disabled />
                  </div>
                  <div className="staff-input-group">
                    <label>נסיעה (הלוך) </label>
                    <input
                      type="number"
                      value={calcData.drivingTime}
                      onChange={(e) =>
                        handleInputChange("drivingTime", e.target.value)
                      }
                    />
                  </div>

                  <div className="staff-input-group">
                    <label>ש. הקמה ופירוק</label>
                    <input
                      type="number"
                      value={calcData.managerOvertime}
                      onChange={(e) =>
                        handleInputChange("managerOvertime", e.target.value)
                      }
                      title="יש לכלול שעות עבודה על הקמה + פירוק של האירוע"
                    />
                  </div>
                </div>
                <div className="staff-summary-text">
                  סך הכל שעות למנהל: {costs.managerTotalHours}{" "}
                  שעות | סך הוצאה למנהל: ₪
                  {Number(costs.managerCost).toFixed(2)}
                </div>
              </div>
              {/* Bartender Row */}
              <div className="staff-row">
                <div className="staff-label">תקן ברמן</div>
                <div className="staff-input-row">
                  <div className="staff-input-group">
                    <label>כמות ברמנים</label>
                    <input
                      className="amount"
                      type="number"
                      value={calcData.bartenders}
                      onChange={(e) =>
                        handleInputChange("bartenders", e.target.value)
                      }
                    />
                  </div>
                  <div className="staff-input-group">
                    <label>ש. סרוויס</label>
                    <input type="number" value={calcData.hours} disabled />
                  </div>
                                    <div className="staff-input-group">
                    <label>נסיעה (הלוך חזור) </label>
                    <input
                      type="number"
                      value={0}
                      disabled
                    />
                  </div>
                  <div className="staff-input-group">
                    <label>ש. הקמה ופירוק</label>
                    <input
                      type="number"
                      value={calcData.bartenderOvertime}
                      onChange={(e) =>
                        handleInputChange("bartenderOvertime", e.target.value)
                      }
                      title="יש לכלול שעות עבודה על הקמה + פירוק של האירוע"
                    />
                  </div>
                </div>
                <div className="staff-summary-text">
                  סך הכל שעות לברמן: {costs.bartenderTotalHours} שעות | סך הוצאה
                  לברמן: ₪
                  {Number(costs.bartenderCost).toFixed(2)}
                </div>
              </div>
              {/* Wage Setting */}
              <div className="wage-setting-row">
                <label>תעריף שעתי לחישוב:</label>
                <input
                  type="number"
                  value={calcData.hourlyWage}
                  onChange={(e) =>
                    handleInputChange("hourlyWage", e.target.value)
                  }
                  className="wage-input"
                />
              </div>
            </div>

            {/* C. VARIABLE COSTS */}
            <div className="input-group-header">הוצאות משתנות</div>

            {/* Alcohol */}
            <div className="variable-input-row">
              <div className="pricing-input-wrapper">
                <label>אלכוהול (לראש)</label>
                <div className="input-with-prefix">
                  <span>₪</span>
                  <input
                    type="number"
                    value={calcData.alcoholPerHead}
                    onChange={(e) =>
                      handleInputChange("alcoholPerHead", e.target.value)
                    }
                  />
                </div>
                {analysis && (
                  <div className="input-helper-text">
                    ממוצע סטטיסטי: ₪{" "}
                    {Number(analysis.history.alcoholPerHead).toFixed(2)}
                    <span className="std-dev">
                      (±{analysis.history.alcoholStdDev})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ice */}
            <div className="variable-input-row">
              <div className="pricing-input-wrapper">
                <label>הוצאות קרח (סה"כ)</label>
                <div className="input-with-prefix">
                  <span>₪</span>
                  <input
                    type="number"
                    value={calcData.iceTotal}
                    onChange={(e) =>
                      handleInputChange("iceTotal", e.target.value)
                    }
                  />
                </div>
                <div className="input-helper-text">
                  מחושב: {calcData.guests} ק"ג * ₪ 4
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="variable-input-row">
              <div className="inputs-row three-col">
                <div className="pricing-input-wrapper">
                  <label> דלק </label>
                  <div className="input-with-prefix">
                    <span>₪</span>
                    <input
                      type="number"
                      value={calcData.TotalFuel}
                      onChange={(e) =>
                        handleInputChange("TotalFuel", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="pricing-input-wrapper">
                  <label> לוגיסטיקה</label>
                  <div className="input-with-prefix">
                    <span>₪</span>
                    <input
                      type="number"
                      value={calcData.logistics}
                      onChange={(e) =>
                        handleInputChange("logistics", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="pricing-input-wrapper">
                  <label> הוצאות נוספות </label>
                  <div className="input-with-prefix">
                    <span>₪</span>
                    <input
                      type="number"
                      value={calcData.extra}
                      onChange={(e) =>
                        handleInputChange("extra", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: RESULTS & COMPARISON --- */}
          <div className="pricing-results-column">
            {/* Cost Breakdown Card */}
            <div className="pricing-card cost-card">
              <div className="card-header">
                <div className="card-title">📉 פירוט עלויות</div>
                <div className="card-total">₪{fmt(costs.total)}</div>
              </div>
              <div className="card-total-per-head">
                <span>עלות משוקללת לראש</span>
                <span className="val">₪{fmt(Math.round(costs.perHead))}</span>
              </div>
              
              {/* Historical Comparison Section */}

              <div className="costs-breakdown-separator">העלויות שחושבו</div>

              <div className="breakdown-list">
                {/* Add Per Head line at the top of breakdown */}

                <div className="breakdown-item">
                  <span>
                    צוות ({calcData.managers + calcData.bartenders} עובדים)
                  </span>
                  <span className="val">₪{fmt(costs.staff)}</span>
                </div>
                {/* ... existing sub-items ... */}
                <div className="breakdown-item sub-item">
                  <span>מנהלים</span>
                  <span>₪{fmt(costs.managerTotalCost)}</span>
                </div>
                <div className="breakdown-item sub-item">
                  <span>ברמנים</span>
                  <span>₪{fmt(costs.bartenderTotalCost)}</span>
                </div>

                <div className="separator"></div>

                <div className="breakdown-item">
                  <span>אלכוהול ({calcData.guests} אורחים)</span>
                  <span className="val">₪{fmt(costs.alcohol)}</span>
                </div>
                <div className="breakdown-item">
                  <span>קרח</span>
                  <span className="val">₪{fmt(costs.ice)}</span>
                </div>
                <div className="breakdown-item">
                  <span>לוגיסטיקה</span>
                  <span className="val">₪{fmt(costs.logistics)}</span>
                </div>
              </div>
            </div>
                          {analysis?.history?.samples > 0 && (
                <div className="historical-comparison-box">
                  <div className="historical-title">📊 נתונים היסטוריים</div>
                  <div className="historical-row">
                    <span className="historical-label">
                      ממוצע הוצאות סטטיסטי (על בסיס {analysis.history.samples} אירועים):
                    </span>
                    <strong className="historical-value">
                      ₪{fmt(Math.round(analysis.history.totalExpenses))} 
                    </strong>
                    <span className="std-dev">
                      (±{fmt(Math.round(analysis.history.stdDevTotalExpenses))})
                    </span>
                  </div>
                  <div className="historical-row secondary">
                    <span className="historical-label">ממוצע לראש:</span>
                    <span className="historical-value">
                      ₪{fmt(Math.round(analysis.history.totalPerHead))} 
                      <span className="std-dev">
                        (±{fmt(Math.round(analysis.history.stdDevTotalPerHead))})
                      </span>
                      {costs.perHead > analysis.history.totalPerHead * 1.15 && (
                        <span className="comparison-indicator high">
                          {" "}(המחיר שלך גבוה מהממוצע ▲)
                        </span>
                      )}
                      {costs.perHead < analysis.history.totalPerHead * 0.85 && (
                        <span className="comparison-indicator low">
                          {" "}(המחיר שלך נמוך מהממוצע ▼)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

            {/* Revenue / Price List Card */}
            <div className="pricing-card revenue-card">
              <div className="card-header">
                <div className="card-title">💰 המלצות ומחירון</div>
              </div>

              {/* Price List Match */}
              <div className="recommendation-row">
                <div className="rec-info">
                  <span className="rec-label">מחיר מחירון לפני מע"מ</span>
                  {analysis?.recommendation ? (
                    <span className="rec-name">
                      {analysis.recommendation.name}
                    </span>
                  ) : (
                    <span className="rec-name text-muted">לא נמצאה התאמה</span>
                  )}
                </div>
                <div className="rec-action">
                  {analysis?.recommendation ? (
                    <>
                      <span className="rec-price">
                        ₪{Number(analysis.recommendation.price).toLocaleString()}
                      </span>
                      <button
                        className="apply-btn"
                        onClick={() =>
                          handleApplyPrice(analysis.recommendation.price * (1 + settings.currentVAT/100))
                        }
                      >
                        החל
                      </button>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>

              {/* Profit Target */}
              <div className="recommendation-row">
                <div className="rec-info">
                  <span className="rec-label">יעד רווח {Math.round(calcData.profitMargin * 100)}%</span>
                  <span className="rec-name">מחיר מחושב לפני מע"מ</span>
                </div>
                <div className="rec-action">
                  <span className="rec-price">
                    ₪{Math.round(costs.total * (1 + calcData.profitMargin)).toLocaleString()}
                  </span>
                  <button
                    className="apply-btn"
                    onClick={() =>
                      handleApplyPrice(Math.round(costs.total * (1 + calcData.profitMargin) * (1 + settings.currentVAT/100)))
                    }
                  >
                    החל
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Line Profit */}
            <div className="profit-summary">
              <div className="profit-label">רווח צפוי (מהמחיר הנוכחי):</div>
              <div
                className={`profit-number ${currentMargin < 20 ? "low" : "good"}`}
              >
                ₪{currentProfit.toLocaleString()}
                <span className="profit-percent">
                  ({Math.round(currentMargin)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
