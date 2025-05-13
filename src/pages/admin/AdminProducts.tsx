
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
import { Package2, Plus, Search, Edit, Trash2, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductDialog } from "@/components/ProductDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number;
  inStock?: boolean;
  is_deleted?: boolean;
}

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState("active");
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
            inStock: true, // You may want to add this field to your database
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term and active tab
  const filteredProducts = searchTerm
    ? products.filter(product =>
        (product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.prodcode.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeTab === "active" ? !product.is_deleted : product.is_deleted)
      )
    : products.filter(product => 
        activeTab === "active" ? !product.is_deleted : product.is_deleted
      );

  // Handle product soft deletion
  const handleSoftDeleteProduct = async (prodcode: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const productToDelete = products.find(p => p.prodcode === prodcode);
        if (!productToDelete) return;
        
        // Update product to mark as deleted
        const { error } = await supabase
          .from('product')
          .update({ is_deleted: true })
          .eq('prodcode', prodcode);
        
        if (error) throw error;
        
        // Log the delete action
        const { error: auditError } = await supabase
          .from('product_audit_log')
          .insert({
            prodcode: prodcode,
            description: productToDelete.description,
            action: 'deleted',
            performed_by: 'admin', // In a real app, use the actual user name/id
            performed_at: new Date().toISOString()
          });

        if (auditError) console.error("Error logging audit:", auditError);
        
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
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle product recovery
  const handleRecoverProduct = async (prodcode: string) => {
    try {
      const productToRecover = products.find(p => p.prodcode === prodcode);
      if (!productToRecover) return;
      
      // Update product to mark as not deleted
      const { error } = await supabase
        .from('product')
        .update({ is_deleted: false })
        .eq('prodcode', prodcode);
      
      if (error) throw error;
      
      // Log the recovery action
      const { error: auditError } = await supabase
        .from('product_audit_log')
        .insert({
          prodcode: prodcode,
          description: productToRecover.description,
          action: 'recovered',
          performed_by: 'admin', // In a real app, use the actual user name/id
          performed_at: new Date().toISOString()
        });

      if (auditError) console.error("Error logging audit:", auditError);
      
      toast({
        title: "Success",
        description: "Product recovered successfully",
      });
      
      // Refresh the product list
      fetchProducts();
    } catch (error) {
      console.error("Error recovering product:", error);
      toast({
        title: "Error",
        description: "Failed to recover product.",
        variant: "destructive",
      });
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
      
      <Tabs 
        defaultValue="active" 
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="active">Active Products</TabsTrigger>
          <TabsTrigger value="deleted">Deleted Products</TabsTrigger>
        </TabsList>
      </Tabs>
      
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
                    <Badge variant={product.is_deleted ? "secondary" : "default"}>
                      {product.is_deleted ? "Deleted" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!product.is_deleted ? (
                      <>
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
                          onClick={() => handleSoftDeleteProduct(product.prodcode)}
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
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleRecoverProduct(product.prodcode)}
                        title="Recover product"
                      >
                        <RotateCw className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
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
