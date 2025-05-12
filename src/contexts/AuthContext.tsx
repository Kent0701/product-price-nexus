
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User, UserRole } from "../types/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string, role: UserRole) => {
    // This is a mock function. In a real app, you'd connect to a backend API
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock credentials check for demo
      if (email === "" || password === "") {
        throw new Error("Please enter both email and password");
      }
      
      // Create mock user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role
      };
      
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      
      // Show success message
      toast.success("Logged in successfully");
      
      // Redirect based on role
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    // This is a mock function. In a real app, you'd connect to a backend API
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation check
      if (!name || !email || !password) {
        throw new Error("Please fill in all required fields");
      }
      
      // Create mock user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role
      };
      
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      
      // Show success message
      toast.success("Account created successfully");
      
      // Redirect based on role
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
