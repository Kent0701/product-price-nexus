
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure system-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable-notifications">Enable notifications</Label>
              <Switch id="enable-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable-history">Track price history</Label>
              <Switch id="enable-history" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable-analytics">Analytics tracking</Label>
              <Switch id="enable-analytics" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input id="company-name" defaultValue="Acme Inc" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure email notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-price-changes">Price change alerts</Label>
              <Switch id="email-price-changes" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-stock">Out of stock alerts</Label>
              <Switch id="email-stock" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-new-users">New user notifications</Label>
              <Switch id="email-new-users" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-email">Notification email</Label>
              <Input id="notification-email" type="email" defaultValue="admin@example.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
