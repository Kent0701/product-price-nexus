
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  LogOut, 
  User, 
  Package2, 
  Settings,
  History
} from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to homepage
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-card border-r transition-all duration-300 ease-in-out relative flex flex-col", 
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className={cn("font-bold text-primary transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0")}>
            {isAdmin ? "Admin Panel" : "Products App"}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="h-8 w-8"
          >
            {isSidebarOpen ? "←" : "→"}
          </Button>
        </div>
        
        <div className="p-2 space-y-1 flex-grow">
          {isAdmin ? (
            <>
              <NavItem 
                to="/admin/dashboard" 
                icon={<Package2 className="h-5 w-5" />} 
                label="Dashboard" 
                isSidebarOpen={isSidebarOpen} 
              />
              <NavItem 
                to="/admin/products" 
                icon={<Package className="h-5 w-5" />} 
                label="Products" 
                isSidebarOpen={isSidebarOpen} 
              />
              <NavItem 
                to="/admin/audit" 
                icon={<History className="h-5 w-5" />} 
                label="Product Audit" 
                isSidebarOpen={isSidebarOpen} 
              />
              <NavItem 
                to="/admin/users" 
                icon={<User className="h-5 w-5" />} 
                label="Users" 
                isSidebarOpen={isSidebarOpen} 
              />
              <NavItem 
                to="/admin/settings" 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                isSidebarOpen={isSidebarOpen} 
              />
            </>
          ) : (
            <>
              <NavItem 
                to="/dashboard" 
                icon={<Package2 className="h-5 w-5" />} 
                label="Dashboard" 
                isSidebarOpen={isSidebarOpen} 
              />
              <NavItem 
                to="/products" 
                icon={<Package className="h-5 w-5" />} 
                label="Products" 
                isSidebarOpen={isSidebarOpen} 
              />
              <NavItem 
                to="/account" 
                icon={<User className="h-5 w-5" />} 
                label="Account" 
                isSidebarOpen={isSidebarOpen} 
              />
            </>
          )}
        </div>
        
        {/* Sign Out Button - Now within the sidebar card */}
        <div className="p-2 mt-auto mb-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {isSidebarOpen && "Sign Out"}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-14 border-b flex items-center px-6 bg-white">
          <div className="ml-auto flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              {user?.name} ({user?.role})
            </div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isSidebarOpen: boolean;
}

const NavItem = ({ to, icon, label, isSidebarOpen }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className="flex items-center p-2 rounded-md hover:bg-accent text-foreground transition-colors"
    >
      <div className="mr-2">{icon}</div>
      {isSidebarOpen && <span>{label}</span>}
    </Link>
  );
};

export default DashboardLayout;
