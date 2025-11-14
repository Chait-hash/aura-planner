import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function NewLead() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "website",
    status: "new",
    car_interest: "",
    budget_min: "",
    budget_max: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: formData.source as any,
        status: formData.status as any,
        car_interest: formData.car_interest || null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      navigate("/leads");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Lead</h1>
            <p className="text-muted-foreground">Add a new lead to the system</p>
          </div>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="offline_event">Offline Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_interest">Car Interest</Label>
                  <Input
                    id="car_interest"
                    value={formData.car_interest}
                    onChange={(e) => setFormData({ ...formData, car_interest: e.target.value })}
                    placeholder="e.g. BMW X5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Budget Min ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    placeholder="20000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Budget Max ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information about this lead..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/leads")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
