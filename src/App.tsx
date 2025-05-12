
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// User pages
import UserDashboard from "./pages/user/Dashboard";
import UserProducts from "./pages/user/Products";
import Account from "./pages/user/Account";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductDetail from "./pages/admin/AdminProductDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/products" element={<UserProducts />} />
                <Route path="/account" element={<Account />} />
              </Route>
            </Route>
            
            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/:id" element={<AdminProductDetail />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
