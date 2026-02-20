import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { useAlert } from '../hooks/useAlert'; 

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Call the context function to save state and localStorage
      login(data.token, data.user);
      
      showSuccess('התחברת בהצלחה');
      navigate('/'); // Redirect to home
      
    } catch (err) {
      console.error(err);
      showError(err.message || 'שגיאה בהתחברות. בדוק שם משתמש וסיסמה.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">
      <h2 className="login-title">התחברות למערכת</h2>
      <form className="ui-form login-form" onSubmit={handleLogin}>
        <div className="ui-row">
          <label className="ui-label" htmlFor="username">שם משתמש</label>
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
          <label className="ui-label" htmlFor="password">סיסמה</label>
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
          {isSubmitting ? 'מתחבר...' : 'היכנס'}
        </button>
      </form>
      </div>
    </section>
  );
}