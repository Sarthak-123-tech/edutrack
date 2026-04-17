import { SkeletonStatCard } from "@/components/SkeletonCard";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  CalendarCheck,
  Clock,
  CreditCard,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

// ─── Demo data ────────────────────────────────────────────────

const adminStats = [
  {
    title: "Total Students",
    value: "248",
    subtitle: "Across 12 batches",
    icon: GraduationCap,
    iconColor: "primary" as const,
    trend: { value: 8, label: "vs last month" },
  },
  {
    title: "Active Teachers",
    value: "18",
    subtitle: "Across 6 subjects",
    icon: Users,
    iconColor: "default" as const,
    trend: { value: 2, label: "vs last month" },
  },
  {
    title: "Active Courses",
    value: "24",
    subtitle: "32 batches running",
    icon: BookOpen,
    iconColor: "default" as const,
  },
  {
    title: "Monthly Revenue",
    value: "₹1,84,000",
    subtitle: "94% collection rate",
    icon: CreditCard,
    iconColor: "fees" as const,
    trend: { value: 12, label: "vs last month" },
  },
  {
    title: "Avg Attendance",
    value: "87%",
    subtitle: "This week",
    icon: CalendarCheck,
    iconColor: "attendance" as const,
  },
  {
    title: "Pending Fees",
    value: "₹22,500",
    subtitle: "14 students",
    icon: AlertCircle,
    iconColor: "fees" as const,
    trend: { value: -5, label: "vs last month" },
  },
];

const studentStats = [
  {
    title: "Enrolled Courses",
    value: "4",
    subtitle: "2 ongoing, 2 upcoming",
    icon: BookOpen,
    iconColor: "primary" as const,
  },
  {
    title: "Attendance",
    value: "91%",
    subtitle: "This month",
    icon: CalendarCheck,
    iconColor: "attendance" as const,
    trend: { value: 3, label: "vs last month" },
  },
  {
    title: "Fee Status",
    value: "Paid",
    subtitle: "Next due: May 1",
    icon: CreditCard,
    iconColor: "fees" as const,
  },
  {
    title: "Avg Score",
    value: "82%",
    subtitle: "Across all subjects",
    icon: BarChart2,
    iconColor: "performance" as const,
    trend: { value: 5, label: "vs last exam" },
  },
];

const teacherStats = [
  {
    title: "My Classes",
    value: "6",
    subtitle: "3 active batches",
    icon: BookOpen,
    iconColor: "primary" as const,
  },
  {
    title: "Total Students",
    value: "94",
    subtitle: "Under my courses",
    icon: GraduationCap,
    iconColor: "default" as const,
  },
  {
    title: "Avg Attendance",
    value: "89%",
    subtitle: "This week",
    icon: CalendarCheck,
    iconColor: "attendance" as const,
  },
  {
    title: "Avg Class Score",
    value: "78%",
    subtitle: "Last assessment",
    icon: BarChart2,
    iconColor: "performance" as const,
  },
];

const upcomingClasses = [
  {
    subject: "Mathematics",
    batch: "Batch A-1",
    time: "10:00 AM",
    duration: "1.5 hrs",
    status: "In Progress",
  },
  {
    subject: "Physics",
    batch: "Batch B-2",
    time: "12:00 PM",
    duration: "1 hr",
    status: "Upcoming",
  },
  {
    subject: "Chemistry",
    batch: "Batch A-3",
    time: "2:30 PM",
    duration: "1 hr",
    status: "Upcoming",
  },
  {
    subject: "Mathematics",
    batch: "Batch C-1",
    time: "4:00 PM",
    duration: "1.5 hrs",
    status: "Upcoming",
  },
];

const recentActivity = [
  {
    type: "attendance",
    text: "Attendance marked for Batch B-12",
    time: "10 min ago",
    icon: CalendarCheck,
    color: "text-[oklch(var(--chart-1))]",
  },
  {
    type: "fee",
    text: "Fee collected from Riya Mehta — ₹3,500",
    time: "45 min ago",
    icon: CreditCard,
    color: "text-[oklch(var(--chart-2))]",
  },
  {
    type: "upload",
    text: "New study material uploaded: Algebra Ch.5",
    time: "2 hr ago",
    icon: BookOpen,
    color: "text-primary",
  },
  {
    type: "enrollment",
    text: "3 new students enrolled in Physics Batch A",
    time: "Yesterday",
    icon: GraduationCap,
    color: "text-foreground",
  },
  {
    type: "performance",
    text: "Mid-term results published for Batch C-3",
    time: "Yesterday",
    icon: BarChart2,
    color: "text-[oklch(var(--chart-3))]",
  },
];

export default function DashboardPage() {
  const { role, userProfile } = useAuthState();
  const isLoading = false;
  const [showAllActivity, setShowAllActivity] = useState(false);

  const stats =
    role === "admin"
      ? adminStats
      : role === "teacher"
        ? teacherStats
        : studentStats;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            {greeting()}, {userProfile?.name?.split(" ")[0] ?? "User"} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening in your{" "}
            {role === "admin"
              ? "institution"
              : role === "teacher"
                ? "classes"
                : "learning"}{" "}
            today.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 capitalize font-medium">
          {role}
        </Badge>
      </div>

      {/* Stats grid */}
      <section data-ocid="dashboard.stats_section">
        <div
          className={cn(
            "grid gap-4",
            role === "admin"
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {isLoading
            ? Array.from({ length: stats.length }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no id
                <SkeletonStatCard key={i} />
              ))
            : stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>
      </section>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Upcoming classes */}
        <section
          className="lg:col-span-3 rounded-xl border bg-card shadow-card"
          data-ocid="dashboard.upcoming_classes"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-sm font-semibold font-display text-foreground">
              {role === "student" ? "Today's Classes" : "Upcoming Classes"}
            </h3>
            <Clock size={14} className="text-muted-foreground" />
          </div>
          <div className="divide-y">
            {upcomingClasses.map((cls, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static demo list
                key={i}
                data-ocid={`dashboard.class.item.${i + 1}`}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {cls.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cls.batch}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-foreground">
                    {cls.time}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {cls.duration}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold ml-2 shrink-0",
                    cls.status === "In Progress"
                      ? "bg-attendance text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.2)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {cls.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section
          className="lg:col-span-2 rounded-xl border bg-card shadow-card"
          data-ocid="dashboard.recent_activity"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-sm font-semibold font-display text-foreground">
              Recent Activity
            </h3>
            <TrendingUp size={14} className="text-muted-foreground" />
          </div>
          <div className="divide-y">
            {(showAllActivity
              ? recentActivity
              : recentActivity.slice(0, 4)
            ).map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static demo list
                  key={i}
                  data-ocid={`dashboard.activity.item.${i + 1}`}
                  className="flex items-start gap-3 px-5 py-3.5"
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon size={14} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug">
                      {item.text}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t">
            <button
              type="button"
              onClick={() => setShowAllActivity((v) => !v)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {showAllActivity ? "Show less ↑" : "View all activity →"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
