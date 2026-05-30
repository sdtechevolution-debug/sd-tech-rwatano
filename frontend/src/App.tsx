import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProductsPage from "./pages/inventory/ProductsPage";
import SalesPage from "./pages/sales/SalesPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import ServicesPage from "./pages/services/ServicesPage";
import DebtsPage from "./pages/debts/DebtsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotesPage from "./pages/notes/NotesPage";
import Layout from "./components/layout/Layout";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="debts" element={<DebtsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="report" element={<Navigate to="/reports" replace />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
