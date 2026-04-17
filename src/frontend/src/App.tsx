import { Layout } from "@/components/Layout";
import { useAuthState } from "@/hooks/useAuth";
import AdminPage from "@/pages/AdminPage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import StudentPage from "@/pages/StudentPage";
import TeacherPage from "@/pages/TeacherPage";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function IndexRedirect() {
    const { isAuthenticated } = useAuthState();
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />;
  },
});

// Login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Protected layout wrapper
function ProtectedLayout() {
  const { isAuthenticated } = useAuthState();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <Layout />;
}

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

// Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

// Admin
const adminRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/admin",
  component: AdminPage,
});

// Teacher
const teacherRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/teacher",
  component: TeacherPage,
});

// Student
const studentRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/student",
  component: StudentPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    adminRoute,
    teacherRoute,
    studentRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
