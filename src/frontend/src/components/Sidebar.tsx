import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthState } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Calendar,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  GalleryVerticalEnd,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  PieChart,
  Upload,
  Users,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentKey?: "attendance" | "fees" | "performance";
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Fees", href: "/student/fees", icon: CreditCard, accentKey: "fees" },
  {
    label: "Attendance",
    href: "/student/attendance",
    icon: CalendarCheck,
    accentKey: "attendance",
  },
  { label: "Study Materials", href: "/student/materials", icon: FileText },
  {
    label: "My Performance",
    href: "/student/performance",
    icon: BarChart2,
    accentKey: "performance",
  },
];

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Classes", href: "/teacher/classes", icon: BookOpen },
  {
    label: "Attendance",
    href: "/teacher/attendance",
    icon: CalendarCheck,
    accentKey: "attendance",
  },
  { label: "Upload Materials", href: "/teacher/materials", icon: Upload },
  {
    label: "Student Performance",
    href: "/teacher/performance",
    icon: BarChart2,
    accentKey: "performance",
  },
  { label: "Schedule", href: "/teacher/schedule", icon: Calendar },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Teachers", href: "/admin/teachers", icon: Users },
  { label: "Courses & Batches", href: "/admin/courses", icon: Layers },
  {
    label: "Fee Management",
    href: "/admin/fees",
    icon: DollarSign,
    accentKey: "fees",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: PieChart,
    accentKey: "performance",
  },
];

const navByRole: Record<UserRole, NavItem[]> = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav,
};

const accentClasses: Record<string, string> = {
  attendance:
    "text-[oklch(var(--chart-1))] group-data-[active=true]:bg-attendance",
  fees: "text-[oklch(var(--chart-2))] group-data-[active=true]:bg-fees",
  performance:
    "text-[oklch(var(--chart-3))] group-data-[active=true]:bg-performance",
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { role, userProfile, logout } = useAuthState();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = role ? navByRole[role] : [];

  const sidebarContent = (
    <aside className="w-60 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GalleryVerticalEnd size={14} className="text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-sm text-sidebar-foreground tracking-tight">
          TuitionMS
        </span>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-muted-foreground h-7 w-7"
            onClick={onClose}
            aria-label="Close sidebar"
            data-ocid="sidebar.close_button"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-3 px-2"
        aria-label="Main navigation"
      >
        <p className="px-2 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-sidebar-foreground/40 mb-1">
          Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item, idx) => {
            const isActive =
              item.href === "/dashboard"
                ? currentPath === "/dashboard"
                : currentPath.startsWith(item.href);
            const Icon = item.icon;
            const accent = item.accentKey ? accentClasses[item.accentKey] : "";

            return (
              <li key={item.href}>
                <button
                  type="button"
                  data-ocid={`sidebar.nav.item.${idx + 1}`}
                  onClick={() => {
                    navigate({ to: item.href as "/" });
                    onClose?.();
                  }}
                  className={cn(
                    "w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive && !item.accentKey
                        ? "text-sidebar-primary-foreground"
                        : item.accentKey && !isActive
                          ? accent.split(" ")[0]
                          : "",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 pt-2 border-t border-sidebar-border shrink-0">
        <Separator className="mb-3 bg-sidebar-border" />
        <div className="px-2 mb-2">
          <p className="text-xs font-medium text-sidebar-foreground truncate">
            {userProfile?.name ?? "User"}
          </p>
          <p className="text-[11px] text-sidebar-foreground/50 truncate">
            {userProfile?.email ?? role ?? ""}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          onKeyDown={(e) => e.key === "Enter" && logout()}
          data-ocid="sidebar.logout_button"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-smooth"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">{sidebarContent}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose?.()}
            role="button"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="relative z-50 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
