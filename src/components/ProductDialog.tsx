
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  prodcode: z.string().min(1, "Product code is required"),
  description: z.string().min(1, "Description is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Price must be a valid number"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    prodcode: string;
    description: string;
    unit: string;
    currentPrice: number;
  } | null;
  onSuccess: () => void;
}

export const ProductDialog = ({ open, onOpenChange, product, onSuccess }: ProductDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      prodcode: "",
      description: "",
      unit: "",
      price: "0.00",
    },
  });

  // Update form when editing product
  useEffect(() => {
    if (product) {
      form.reset({
        prodcode: product.prodcode,
        description: product.description,
        unit: product.unit,
        price: product.currentPrice.toString(),
      });
    } else {
      form.reset({
        prodcode: "",
        description: "",
        unit: "",
        price: "0.00",
      });
    }
  }, [product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (isEditing) {
        // Update existing product
        const { error: productError } = await supabase
          .from('product')
          .update({
            description: values.description,
            unit: values.unit,
          })
          .eq('prodcode', values.prodcode);
        
        if (productError) throw productError;
        
        // Add new price history record if price changed
        if (parseFloat(values.price) !== product!.currentPrice) {
          const { error: priceError } = await supabase
            .from('pricehist')
            .insert({
              prodcode: values.prodcode,
              unitprice: parseFloat(values.price),
              effdate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            });
          
          if (priceError) throw priceError;
        }
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Add new product
        const { error: productError } = await supabase
          .from('product')
          .insert({
            prodcode: values.prodcode,
            description: values.description,
            unit: values.unit,
          });
        
        if (productError) throw productError;
        
        // Add initial price history record
        const { error: priceError } = await supabase
          .from('pricehist')
          .insert({
            prodcode: values.prodcode,
            unitprice: parseFloat(values.price),
            effdate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          });
        
        if (priceError) throw priceError;
        
        toast({
          title: "Success",
          description: "Product added successfully",
        });
      }
      
      // Close dialog and refresh products
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: isEditing 
          ? "Failed to update product. Please try again." 
          : "Failed to add product. Product code might already exist.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the product details below." 
              : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prodcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter product code" 
                      {...field} 
                      disabled={isEditing} // Don't allow editing product code
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unit (e.g., pcs, kg)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
