
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { mockProducts } from "@/data/mockData";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState } from "react";

const AdminProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find(p => p.id === id);
  const [formData, setFormData] = useState(product ?? {
    name: '',
    description: '',
    category: '',
    currentPrice: 0,
    inStock: true
  });

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <Badge variant={product.inStock ? "default" : "secondary"}>
          {product.inStock ? "In Stock" : "Out of Stock"}
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
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                defaultValue={product.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                defaultValue={product.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                defaultValue={product.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Current Price ($)</Label>
              <Input 
                id="price" 
                type="number" 
                defaultValue={product.currentPrice} 
                onChange={(e) => setFormData({...formData, currentPrice: parseFloat(e.target.value)})}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="in-stock">In Stock</Label>
              <Switch 
                id="in-stock" 
                defaultChecked={product.inStock} 
                onCheckedChange={(checked) => setFormData({...formData, inStock: checked})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Track price changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={product.priceHistory}
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
              <h3 className="font-medium mb-2">Price Change History</h3>
              <div className="space-y-2">
                {product.priceHistory.map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{entry.date}</span>
                    <span>${entry.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProductDetail;
