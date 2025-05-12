import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // If still loading, show nothing
  if (isLoading) return null;
  
  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />;
  
  // Otherwise, render the child routes
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  // If still loading, show nothing
  if (isLoading) return null;
  
  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />;
  
  // If not admin, redirect to dashboard
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  
  // Otherwise, render the child routes
  return <Outlet />;
};
