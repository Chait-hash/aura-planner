import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, PhoneCall, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contacted: number;
  converted: number;
  conversionRate: number;
  leadsBySource: Array<{ name: string; value: number }>;
  leadsByStatus: Array<{ name: string; value: number }>;
  weeklyTrend: Array<{ day: string; leads: number }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contacted: 0,
    converted: 0,
    conversionRate: 0,
    leadsBySource: [],
    leadsByStatus: [],
    weeklyTrend: [],
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
        const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

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
        }));

        // Weekly trend (last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyTrend = days.map(day => ({
          day,
          leads: Math.floor(Math.random() * 20) + 5, // Mock data for now
        }));

        setStats({
          totalLeads,
          newLeads,
          contacted,
          converted,
          conversionRate,
          leadsBySource,
          leadsByStatus,
          weeklyTrend,
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
      change: "+12.5%",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-primary",
    },
    {
      title: "New Leads",
      value: stats.newLeads,
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-accent",
    },
    {
      title: "Contacted",
      value: stats.contacted,
      change: "+5.1%",
      trend: "up",
      icon: PhoneCall,
      gradient: "from-yellow-500/20 to-amber-500/20",
      iconColor: "text-warning",
    },
    {
      title: "Converted",
      value: stats.converted,
      change: "+18.7%",
      trend: "up",
      icon: CheckCircle,
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-success",
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
            const TrendIcon = card.trend === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <Card
                key={card.title}
                className="group relative overflow-hidden border-border/50 bg-gradient-to-br bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-[1.02]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{card.value}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={`h-4 w-4 ${card.trend === "up" ? "text-success" : "text-destructive"}`} />
                    <p className={`text-xs ${card.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {card.change}
                    </p>
                    <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.leadsBySource}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Lead Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.leadsByStatus.map((status) => {
                  const percentage = stats.totalLeads > 0 ? ((status.value / stats.totalLeads) * 100).toFixed(1) : 0;
                  return (
                    <div key={status.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{status.name}</span>
                        <span className="text-muted-foreground">{status.value} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-primary" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
