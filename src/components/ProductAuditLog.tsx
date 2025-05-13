
import { useState, useEffect } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Check, X, RotateCw, Pen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProductAudit {
  id: string;
  prodcode: string;
  description: string;
  action: 'created' | 'edited' | 'deleted' | 'recovered';
  performed_by: string;
  performed_at: string;
}

export const ProductAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<ProductAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('product_audit_log')
        .select('*')
        .order('performed_at', { ascending: false });
      
      if (error) throw error;
      
      setAuditLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to load product audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Function to get the appropriate icon for each action type
  const getActionIcon = (action: string) => {
    switch(action) {
      case 'created':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Created</Badge>;
      case 'edited':
        return <Badge className="bg-blue-500"><Pen className="h-3 w-3 mr-1" /> Edited</Badge>;
      case 'deleted':
        return <Badge className="bg-red-500"><X className="h-3 w-3 mr-1" /> Deleted</Badge>;
      case 'recovered':
        return <Badge className="bg-amber-500"><RotateCw className="h-3 w-3 mr-1" /> Recovered</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Audit Log</h1>
        <Button onClick={fetchAuditLogs}>Refresh</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                    <p>Loading audit logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.prodcode}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{getActionIcon(log.action)}</TableCell>
                  <TableCell>{log.performed_by}</TableCell>
                  <TableCell>{formatDate(log.performed_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductAuditLog;
