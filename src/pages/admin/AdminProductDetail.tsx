
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface Product {
  prodcode: string;
  description: string;
  unit: string;
  is_deleted?: boolean;
}

interface PriceHistory {
  effdate: string;
  unitprice: number;
}

const AdminProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    unit: '',
    is_deleted: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  // Fetch product and price history data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from('product')
          .select('*')
          .eq('prodcode', id)
          .single();
        
        if (productError) throw productError;
        
        setProduct(productData);
        setFormData({
          description: productData.description || '',
          unit: productData.unit || '',
          is_deleted: productData.is_deleted || false
        });
        
        // Fetch price history
        const { data: priceData, error: priceError } = await supabase
          .from('pricehist')
          .select('*')
          .eq('prodcode', id)
          .order('effdate', { ascending: false });
        
        if (priceError) throw priceError;
        
        setPriceHistory(priceData || []);
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, toast]);

  const handleSave = async () => {
    if (!product) return;
    
    try {
      const { error } = await supabase
        .from('product')
        .update({
          description: formData.description,
          unit: formData.unit,
          is_deleted: formData.is_deleted
        })
        .eq('prodcode', product.prodcode);
      
      if (error) throw error;
      
      // Log the edit action
      const { error: auditError } = await supabase
        .from('product_audit_log')
        .insert({
          prodcode: product.prodcode,
          description: formData.description,
          action: 'edited',
          performed_by: 'admin', // In a real app, use the actual user name/id
          performed_at: new Date().toISOString()
        });

      if (auditError) console.error("Error logging audit:", auditError);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
      // Update local state
      setProduct({
        ...product,
        description: formData.description,
        unit: formData.unit,
        is_deleted: formData.is_deleted
      });
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Prepare data for chart
  const chartData = priceHistory.map(item => ({
    date: formatDate(item.effdate),
    price: item.unitprice
  })).reverse(); // Reverse to show oldest to newest

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium mb-4">Product not found</p>
        <Button onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  const currentPrice = priceHistory.length > 0 ? priceHistory[0].unitprice : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" className="mr-4" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Product: {product.prodcode}</h1>
        </div>
        <Badge variant={product.is_deleted ? "secondary" : "default"}>
          {product.is_deleted ? "Deleted" : "Active"}
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Edit product information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prodcode">Product Code</Label>
              <Input 
                id="prodcode" 
                value={product.prodcode} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input 
                id="unit" 
                value={formData.unit} 
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Current Price ($)</Label>
              <Input 
                id="price" 
                type="number" 
                value={currentPrice}
                disabled
              />
              <p className="text-sm text-muted-foreground">To change the price, use the price update dialog from the products page</p>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="is-deleted">Deleted Status</Label>
              <Switch 
                id="is-deleted" 
                checked={formData.is_deleted} 
                onCheckedChange={(checked) => setFormData({...formData, is_deleted: checked})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Track price changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            {priceHistory.length > 0 ? (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Price Change History</h3>
                  <div className="border rounded-md divide-y">
                    <div className="grid grid-cols-2 py-2 px-3 font-medium bg-muted">
                      <span>Date</span>
                      <span>Price</span>
                    </div>
                    {priceHistory.map((entry, index) => (
                      <div key={index} className="grid grid-cols-2 py-2 px-3">
                        <span>{formatDate(entry.effdate)}</span>
                        <span>${entry.unitprice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>No price history available for this product</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProductDetail;
