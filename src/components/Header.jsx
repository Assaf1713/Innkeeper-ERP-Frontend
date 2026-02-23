import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link';
  const { logout } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showAlert('התנתקת בהצלחה', 'success');
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo-container">
          <img src="/logo_text.png" alt="Vento OS Logo" className="logo-image" />
        </div>

        <nav className="nav">
          <NavLink to="/" className={linkClass} end>דף הבית </NavLink>
          <NavLink to="/leads" className={linkClass}>לידים</NavLink>
          <NavLink to="/events" className={linkClass}> כל האירועים </NavLink>
          <NavLink to="/expenses" className={linkClass}>הוצאות</NavLink>
          <NavLink to="/admin" className={linkClass}>ממשק מנהל</NavLink>
        </nav>
        <div className="header-right" style={{marginRight: 'auto'}}>
          <button className="btn btn-secondary" onClick={handleLogout} title='התנתק מהמערכת'>התנתק</button>
        </div>
      </div>
    </header>
  );
}
