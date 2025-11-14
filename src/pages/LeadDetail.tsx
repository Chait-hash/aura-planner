import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2, Calendar, Mail, Phone } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  car_interest: string | null;
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  notes: string;
  created_at: string;
  user_id: string;
}

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  not_interested: "bg-red-100 text-red-800",
  converted: "bg-cyan-100 text-cyan-800",
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "", notes: "" });

  useEffect(() => {
    if (id) {
      fetchLeadData();
    }
  }, [id]);

  const fetchLeadData = async () => {
    try {
      // Fetch lead
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (leadError) throw leadError;
      setLead(leadData);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!lead) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("leads")
        .update({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source as any,
          status: lead.status as any,
          car_interest: lead.car_interest,
          budget_min: lead.budget_min,
          budget_max: lead.budget_max,
          notes: lead.notes,
        })
        .eq("id", lead.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
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

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      navigate("/leads");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.type || !newActivity.notes) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("lead_activities").insert({
        lead_id: id,
        user_id: user.id,
        activity_type: newActivity.type,
        notes: newActivity.notes,
      });

      if (error) throw error;

      setNewActivity({ type: "", notes: "" });
      fetchLeadData();
      toast({
        title: "Success",
        description: "Activity added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Lead not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/leads")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
              <p className="text-muted-foreground">Lead Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the lead.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Lead Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={lead.name}
                    onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="email"
                      type="email"
                      value={lead.email}
                      onChange={(e) => setLead({ ...lead, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="phone"
                      value={lead.phone}
                      onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={lead.source}
                    onValueChange={(value) => setLead({ ...lead, source: value })}
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={lead.status}
                    onValueChange={(value) => setLead({ ...lead, status: value })}
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
                    value={lead.car_interest || ""}
                    onChange={(e) => setLead({ ...lead, car_interest: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Budget Min</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={lead.budget_min || ""}
                    onChange={(e) =>
                      setLead({ ...lead, budget_min: parseFloat(e.target.value) || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Budget Max</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={lead.budget_max || ""}
                    onChange={(e) =>
                      setLead({ ...lead, budget_max: parseFloat(e.target.value) || null })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={lead.notes || ""}
                  onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Activity */}
              <div className="space-y-2 pb-4 border-b">
                <Label>Add Activity</Label>
                <Select
                  value={newActivity.type}
                  onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Activity notes..."
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  rows={2}
                />
                <Button onClick={handleAddActivity} className="w-full" size="sm">
                  Add Activity
                </Button>
              </div>

              {/* Activities List */}
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activities yet
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="space-y-1 pb-3 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {activity.activity_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{activity.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
