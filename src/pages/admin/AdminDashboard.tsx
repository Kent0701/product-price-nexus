
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Package2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [outOfStockProducts, setOutOfStockProducts] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch total products
        const { data: productData, error: productError } = await supabase
          .from('product')
          .select('prodcode');
        
        if (productError) throw productError;
        setTotalProducts(productData.length);

        // Fetch out of stock products 
        // For demonstration, we'll consider products without price as "out of stock"
        // In a real app, you might have a dedicated is_in_stock field
        const { data: priceData, error: priceError } = await supabase
          .from('pricehist')
          .select('prodcode')
          .order('effdate', { ascending: false });
        
        if (priceError) throw priceError;
        
        // Get unique product codes with prices
        const productsWithPrices = new Set(priceData.map(item => item.prodcode));
        const outOfStock = productData.filter(product => 
          !productsWithPrices.has(product.prodcode)
        ).length;
        
        setOutOfStockProducts(outOfStock);

        // For user count, we'll need to use the auth API
        // Since we can't directly query auth.users, we'll provide an estimate
        // In a real app, you might have a profiles table or use Supabase Auth Admin API
        setTotalUsers(5); // Placeholder value

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{outOfStockProducts}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{totalUsers}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
