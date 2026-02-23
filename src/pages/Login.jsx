import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "../hooks/useAlert";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL || "";

  const { login } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Call the context function to save state and localStorage
      login(data.token, data.user);

      showSuccess("התחברת בהצלחה");
      navigate("/"); // Redirect to home
    } catch (err) {
      console.error(err);
      showError(err.message || "שגיאה בהתחברות. בדוק שם משתמש וסיסמה.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-logo">
        <img
          src="/logo_slogan.png"
          alt="Vento OS Logo"
          className="login-logo-image"
        />
      </div>
      <div className="login-card">
        <h2 className="login-title">התחברות למערכת</h2>
        <form className="ui-form login-form" onSubmit={handleLogin}>
          <div className="ui-row">
            <label className="ui-label" htmlFor="username">
              שם משתמש
            </label>
            <input
              className="ui-control"
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="ui-row">
            <label className="ui-label" htmlFor="password">
              סיסמה
            </label>
            <input
              className="ui-control"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="ui-btn ui-btn--primary login-submit-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "מתחבר..." : "היכנס"}
          </button>
        </form>
      </div>
      <div className="login-footer-spacer">
        <h3 className="login-footer">Vento OS - כל הזכויות שמורות © 2024</h3>
        <h3 className="login-footer-hint">Developed by Assaf Lewin</h3>
      </div>
    </section>
  );
}
