import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, PhoneCall, CheckCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contacted: number;
  converted: number;
  leadsBySource: Array<{ name: string; value: number }>;
  leadsByStatus: Array<{ name: string; value: number; color: string }>;
}

const STATUS_COLORS = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  qualified: "#10b981",
  not_interested: "#ef4444",
  converted: "#06b6d4",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contacted: 0,
    converted: 0,
    leadsBySource: [],
    leadsByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: leads, error } = await supabase
        .from("leads")
        .select("*");

      if (error) throw error;

      if (leads) {
        const totalLeads = leads.length;
        const newLeads = leads.filter((l) => l.status === "new").length;
        const contacted = leads.filter((l) => l.status === "contacted").length;
        const converted = leads.filter((l) => l.status === "converted").length;

        // Group by source
        const sourceMap = new Map<string, number>();
        leads.forEach((lead) => {
          const source = lead.source;
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        });
        const leadsBySource = Array.from(sourceMap.entries()).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
          value,
        }));

        // Group by status
        const statusMap = new Map<string, number>();
        leads.forEach((lead) => {
          const status = lead.status;
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });
        const leadsByStatus = Array.from(statusMap.entries()).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
          value,
          color: STATUS_COLORS[name as keyof typeof STATUS_COLORS],
        }));

        setStats({
          totalLeads,
          newLeads,
          contacted,
          converted,
          leadsBySource,
          leadsByStatus,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "New Leads",
      value: stats.newLeads,
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Contacted",
      value: stats.contacted,
      icon: PhoneCall,
      color: "text-warning",
    },
    {
      title: "Converted",
      value: stats.converted,
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your lead management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.leadsBySource}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.leadsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
