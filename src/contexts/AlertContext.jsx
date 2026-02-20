import { useState, useCallback } from "react";
import Alert from "../components/Alert";
import { AlertContext } from "./alertContextValues";

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, message, type, duration };
    
    setAlerts((prev) => [...prev, newAlert]);
    
    return id;
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return showAlert(message, "success", duration);
  }, [showAlert]);

  const showError = useCallback((message, duration) => {
    return showAlert(message, "error", duration);
  }, [showAlert]);

  const showWarning = useCallback((message, duration) => {
    return showAlert(message, "warning", duration);
  }, [showAlert]);

  const showInfo = useCallback((message, duration) => {
    return showAlert(message, "info", duration);
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        hideAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <div className="custom-alert-container">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            duration={alert.duration}
            onClose={() => hideAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
