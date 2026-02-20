import { NavLink } from 'react-router-dom';

export default function AdminHeader() {
  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link';

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="nav">
          <NavLink to="/admin/events-made" className={linkClass}>אירועים שבוצעו </NavLink>
          <NavLink to="/admin/inventory-products" className={linkClass}>מוצרי מלאי</NavLink>
          <NavLink to="/admin/employees" className={linkClass}>עובדים</NavLink>
          <NavLink to="/admin/customers" className={linkClass}>לקוחות</NavLink>
          <NavLink to="/admin/wage-shifts" className={linkClass}>משמרות </NavLink>
          <NavLink to="/admin/reports" className={linkClass}>דוחות</NavLink>
          <NavLink to="/admin/unavailableDates" className={linkClass}>תאריכים חסומים</NavLink>
        </nav>
                <div className="header-actions">
          <NavLink to="/admin/settings" className="nav-link" title="הגדרות מערכת">
            ⚙️
          </NavLink>
        </div>
      </div>
    </header>
  );
}
