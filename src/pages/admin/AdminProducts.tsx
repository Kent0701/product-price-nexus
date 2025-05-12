
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package2, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductDialog } from "@/components/ProductDialog";

interface Product {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number;
  inStock?: boolean;
}

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get all products
      const { data: productData, error: productError } = await supabase
        .from('product')
        .select('*');
      
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
            inStock: true // You may want to add this field to your database
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.prodcode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Handle product deletion
  const handleDeleteProduct = async (prodcode: string) => {
    if (confirm("Are you sure you want to delete this product? This will also delete its price history.")) {
      try {
        // First delete price history records
        const { error: priceHistError } = await supabase
          .from('pricehist')
          .delete()
          .eq('prodcode', prodcode);
        
        if (priceHistError) throw priceHistError;
        
        // Then delete the product
        const { error: productError } = await supabase
          .from('product')
          .delete()
          .eq('prodcode', prodcode);
        
        if (productError) throw productError;
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        
        // Refresh the product list
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: "Failed to delete product. It might be referenced in sales records.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle editing product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  // Handle adding new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                    <p>Loading products...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.prodcode}>
                  <TableCell className="font-medium">{product.prodcode}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>${product.currentPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEditProduct(product)}
                      title="Edit product"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteProduct(product.prodcode)}
                      title="Delete product"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Link to={`/admin/products/${product.prodcode}`} className="inline-flex">
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="View details"
                      >
                        <Package2 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <Package2 className="h-12 w-12 mb-2" />
                    <p>No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for adding/editing products */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={(open) => setIsDialogOpen(open)}
        product={editingProduct}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default AdminProducts;
