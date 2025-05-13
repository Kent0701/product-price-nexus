
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number;
  inStock?: boolean;
  is_deleted?: boolean; // Added is_deleted field
}

const UserProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get products that are NOT deleted
        const { data: productData, error: productError } = await supabase
          .from('product')
          .select('*')
          .eq('is_deleted', false); // Only get non-deleted products
        
        if (productError) throw productError;

        // Get latest price for each product
        const productsWithPrices = await Promise.all(
          productData.map(async (product) => {
            const { data: priceData, error: priceError } = await supabase
              .from('pricehist')
              .select('*')
              .eq('prodcode', product.prodcode)
              .order('effdate', { ascending: false })
              .limit(1);
            
            if (priceError) throw priceError;
            
            return {
              prodcode: product.prodcode,
              description: product.description || '',
              unit: product.unit || '',
              currentPrice: priceData && priceData.length > 0 ? priceData[0].unitprice : 0,
              inStock: true, // We'll assume all products are in stock by default
              is_deleted: product.is_deleted || false
            };
          })
        );

        setProducts(productsWithPrices);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.prodcode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {/* Search bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading products...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.prodcode}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{product.description}</CardTitle>
                    <CardDescription>Code: {product.prodcode}</CardDescription>
                  </div>
                  <Badge variant={product.inStock ? "default" : "secondary"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">${product.currentPrice.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">Per {product.unit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p>No products found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default UserProducts;
