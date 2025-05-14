
import { useState, useEffect } from "react";
import { Search, User, Shield, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  joined_at: string;
}

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"ban" | "unban">("ban");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from our user_details view (which requires admin privileges)
      const { data, error } = await supabase
        .from('user_details')
        .select('*')
        .returns<DbUser[]>();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setUsers(data);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast({
        title: "Error",
        description: "Failed to load users. You may not have admin permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Ban or unban a user
  const handleBanUnban = async () => {
    if (!selectedUser) return;
    
    try {
      const bannedUntil = actionType === 'ban' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        : null;
      
      // Call Supabase function to update user
      const { error } = await supabase.rpc('admin_update_user', {
        user_id: selectedUser.id,
        banned_until: bannedUntil
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `User ${actionType === 'ban' ? 'banned' : 'unbanned'} successfully`,
      });
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            status: actionType === 'ban' ? 'inactive' : 'active'
          };
        }
        return user;
      }));
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error(`Error ${actionType}ning user:`, error.message);
      toast({
        title: "Error",
        description: `Failed to ${actionType} user: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Open confirmation dialog for ban/unban
  const openConfirmDialog = (user: DbUser, action: "ban" | "unban") => {
    setSelectedUser(user);
    setActionType(action);
    setDialogOpen(true);
  };
  
  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for user updates
    const channel = supabase
      .channel('public:user_details')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_details' 
      }, () => {
        fetchUsers(); // Refresh users on any change
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                    <p>Loading users...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.joined_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.id !== currentUser?.id && (
                      user.status === "active" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openConfirmDialog(user, "ban")}
                          className="flex items-center gap-1"
                        >
                          <Ban className="h-4 w-4" />
                          Ban
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openConfirmDialog(user, "unban")}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Unban
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <User className="h-12 w-12 mb-2" />
                    <p>No users found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {actionType === 'ban' ? 'Ban' : 'Unban'} User
            </DialogTitle>
            <DialogDescription>
              {actionType === 'ban'
                ? "This will prevent the user from accessing the application. They will not be able to log in until unbanned."
                : "This will restore the user's access to the application."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p><strong>User:</strong> {selectedUser?.name} ({selectedUser?.email})</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'ban' ? "destructive" : "default"}
              onClick={handleBanUnban}
            >
              {actionType === 'ban' ? 'Ban User' : 'Unban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
