import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import AdminHeader from "./components/AdminHeader";
import Home from "./pages/Home";
import Queries from "./pages/Queries";
import EventsMade from "./pages/EventsMade";
import Expenses from "./pages/Expenses";
import Customers from "./pages/Customers";
import Employees from "./pages/Employees";
import Employee from "./pages/Employee";
import EventDetails from "./pages/EventDetails";
import Shifts from "./pages/Shifts";
import Reports from "./pages/Reports";
import InventoryProducts from "./pages/InventoryProducts";
import Leads from "./pages/Leads";
import UnavailableDates from "./components/UnavailableDates";
import Settings from "./pages/Settings";
import { AlertProvider } from "./contexts/AlertContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isLoginPage = location.pathname === "/login";

  return (
    <AlertProvider>
      <AuthProvider>
        <div className="app">
          {!isLoginPage && <Header />}
          {!isLoginPage && isAdminRoute && <AdminHeader />}
          <main className="app-main">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Queries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <ProtectedRoute>
                    <EventDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Navigate to="/admin/events-made" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <Navigate to="/admin/events-made" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventory-products"
                element={
                  <ProtectedRoute>
                    <InventoryProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute>
                    <Employees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees/:id"
                element={
                  <ProtectedRoute>
                    <Employee />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/wage-shifts"
                element={
                  <ProtectedRoute>
                    <Shifts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/events-made"
                element={
                  <ProtectedRoute>
                    <EventsMade />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/unavailableDates"
                element={
                  <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                    <UnavailableDates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </AlertProvider>
  );
}
