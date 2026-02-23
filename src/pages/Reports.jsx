/* eslint-disable no-unused-vars */
// Reports page
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import FilterPanel, {
  FilterCustomDateRange,
  FilterGuestCountRange,
  FilterSelect,
  FilterActions,
} from "../components/FilterPanel";


export default function Reports() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);

return (
    <div className="reports-page">
      <h1>דוחות</h1>    
      </div>
  );
}


