import { Toaster } from "@/components/ui/sonner";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/student/courses": "My Courses",
  "/student/fees": "Fees",
  "/student/attendance": "Attendance",
  "/student/materials": "Study Materials",
  "/student/performance": "My Performance",
  "/teacher/classes": "My Classes",
  "/teacher/attendance": "Attendance",
  "/teacher/materials": "Upload Materials",
  "/teacher/performance": "Student Performance",
  "/teacher/schedule": "Schedule",
  "/admin/students": "Students",
  "/admin/teachers": "Teachers",
  "/admin/courses": "Courses & Batches",
  "/admin/fees": "Fee Management",
  "/admin/analytics": "Analytics",
};

function getPageTitle(path: string): string {
  if (pageTitles[path]) return pageTitles[path];
  for (const [key, label] of Object.entries(pageTitles)) {
    if (path.startsWith(key)) return label;
  }
  return "TuitionMS";
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const title = getPageTitle(currentPath);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={title}
          onMenuClick={() => setMobileOpen(true)}
          showMenu
        />
        <main
          className="flex-1 overflow-y-auto bg-background"
          data-ocid="layout.main"
        >
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
