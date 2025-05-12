import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />;
  
  // Otherwise, render the child routes
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />;
  
  // If not admin, redirect to user dashboard
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  
  // Otherwise, render the child routes
  return <Outlet />;
};
