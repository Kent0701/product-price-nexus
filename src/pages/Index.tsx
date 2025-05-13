
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Package } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If user is logged in, redirect them to their dashboard
  const handleGetStarted = () => {
    if (user) {
      // Redirect based on role
      navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } else {
      // Not logged in, go to signup
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ProductManager</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard")}>
                  My Account
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center bg-gradient-to-b from-white to-sky-50">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Product Management System
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your products and track price history with our powerful management system
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Product Management</h3>
              <p className="text-muted-foreground">
                Easily add, edit, and manage your product inventory with our intuitive interface.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Price History Tracking</h3>
              <p className="text-muted-foreground">
                Monitor price changes over time with detailed historical charts and data.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Control who can view and modify data with separate user and admin access levels.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto py-8 px-6 text-center text-muted-foreground">
          <p>© 2025 ProductManager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
