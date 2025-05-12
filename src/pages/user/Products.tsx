
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProducts } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const UserProducts = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </div>
                <Badge variant={product.inStock ? "default" : "secondary"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="font-bold text-lg">${product.currentPrice.toFixed(2)}</span>
                {product.previousPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    ${product.previousPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserProducts;
