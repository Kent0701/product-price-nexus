
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>View all available products</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You can browse products and view their price history.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest product additions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No new products have been added recently.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Price Alerts</CardTitle>
            <CardDescription>Products with significant price changes</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No price alerts at this time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
