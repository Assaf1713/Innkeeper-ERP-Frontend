/* eslint-disable no-unused-vars */
import { useState } from "react";
import "../styles/FilterPanel.css";

export default function FilterPanel({ 
  filters,
  onFiltersChange,
  children 
}) {
  return (
    <div className="filter-panel">
      <div className="filter-panel__content">
        {children}
      </div>
    </div>
  );
}

// Reusable filter components
export function FilterDateRange({ value, onChange, label = "טווח תאריכים" }) {
  return (
    <div className="filter-item">
      <label className="filter-item__label">{label}</label>
      <select 
        className="filter-item__control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="last3days">3 ימים אחרונים ואילך</option>
        <option value="all">כל האירועים</option>
        <option value="EventsMade"> אירועים שבוצעו </option>
        <option value="past">אירועים שעברו</option>
      </select>
    </div>
  );
}

export function FilterCustomDateRange({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  label = "טווח תאריכים מותאם אישית"
}) {
  return (
    <div className="filter-item filter-item--date-range">
      <label className="filter-item__label">{label}</label>
      <div className="filter-date-range">
        <input
          type="date"
          className="filter-item__control filter-date-input"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="מתאריך"
        />
        <span className="filter-date-separator">-</span>
        <input
          type="date"
          className="filter-item__control filter-date-input"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="עד תאריך"
        />
      </div>
    </div>
  );
}

export function FilterExpensesByCategory({ 
  value, 
  onChange,
  options = [],
  label = "סינון לפי קטגוריה"
}) {
  return (
    <div className="filter-item">
      <label className="filter-item__label">{label}</label>
      <select
        className="filter-item__control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? "כל הקטגוריות" : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterSearch({ 
  value, 
  onChange, 
  placeholder = "חיפוש...",
  label = "חיפוש"
}) {
  return (
    <div className="filter-item">
      <label className="filter-item__label">{label}</label>
      <input
        type="text"
        className="filter-item__control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FilterSelect({ 
  value, 
  onChange, 
  options = [],
  label = "בחר",
  
}) {
  return (
    <div className="filter-item">
      <label className="filter-item__label">{label}</label>
      <select
        className="filter-item__control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}


export function FilterChooseEntryLimit({ 
  value, 
  onChange,
  label = "מספר רשומות"
}) {
  return (
    <div className="filter-item">
      <label className="filter-item__label">{label}</label>
      <select
        className="filter-item__control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value="all">הכל</option>
      </select>
    </div>
  );
}

export function FilterActions({ onClear, onApply, clearDisabled = false }) {
  return (
    <div className="filter-actions">
      <button
        type="button"
        className="ui-btn"
        onClick={onClear}
        disabled={clearDisabled}
      >
        נקה סינון
      </button>
      {onApply && (
        <button
          type="button"
          className="ui-btn ui-btn--primary"
          onClick={onApply}
        >
          החל
        </button>
      )}
    </div>
  );
}

export function FilterGuestCountRange({ 
  minGuests, 
  maxGuests, 
  onMinChange, 
  onMaxChange,
  label = "מספר אורחים"
}) {
  return (
    <div className="filter-item filter-item--guest-range">
      <label className="filter-item__label">{label}</label>
      <div className="filter-date-range">
        <input
          type="number"
          className="filter-item__control filter-date-input"
          value={minGuests}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder="מינימום"
          min="0"
        />
        <span className="filter-date-separator">-</span>
        <input
          type="number"
          className="filter-item__control filter-date-input"
          value={maxGuests}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder="מקסימום"
          min="0"
        />
      </div>
    </div>
  );
}