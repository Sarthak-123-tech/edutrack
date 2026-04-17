import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/useAuth";
import type { UserProfile, UserRole } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// ── Static data ────────────────────────────────────────────────

const FEATURES = [
  {
    icon: GraduationCap,
    label: "Students",
    desc: "Track progress, fees, and attendance in real time",
  },
  {
    icon: Users,
    label: "Teachers",
    desc: "Manage classes, assignments, and student performance",
  },
  {
    icon: BarChart3,
    label: "Admins",
    desc: "Full analytics, fee management, and reporting suite",
  },
];

const ROLES: {
  value: UserRole;
  label: string;
  icon: React.ReactNode;
  badge: string;
}[] = [
  {
    value: "student",
    label: "Student",
    icon: <GraduationCap className="w-5 h-5" />,
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  {
    value: "teacher",
    label: "Teacher",
    icon: <Users className="w-5 h-5" />,
    badge:
      "bg-attendance text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.2)]",
  },
  {
    value: "admin",
    label: "Admin",
    icon: <ShieldCheck className="w-5 h-5" />,
    badge:
      "bg-performance text-[oklch(var(--chart-3))] border-[oklch(var(--chart-3)/0.2)]",
  },
];

const DEMO_ACCOUNTS: { role: UserRole; name: string; email: string }[] = [
  { role: "student", name: "Alex Johnson", email: "alex.johnson@edutrack.edu" },
  {
    role: "teacher",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@edutrack.edu",
  },
  { role: "admin", name: "Admin User", email: "admin@edutrack.edu" },
];

// ── Component ──────────────────────────────────────────────────

export default function LoginPage() {
  const { isAuthenticated, isLoading, login, setUserProfile, setRole } =
    useAuthState();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [loggingIn, setLoggingIn] = useState(false);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);
  const [step, setStep] = useState<"login" | "role">("login");
  const [error, setError] = useState<string | null>(null);
  const [pendingPrincipal] = useState<string | null>(null);

  // If II authenticated, move to role selection
  useEffect(() => {
    if (isAuthenticated && step === "login") {
      setStep("role");
      setLoggingIn(false);
    }
  }, [isAuthenticated, step]);

  const handleIILogin = () => {
    setError(null);
    setLoggingIn(true);
    try {
      login();
    } catch {
      setError("Authentication failed. Please try again.");
      setLoggingIn(false);
    }
  };

  const handleConfirmRole = () => {
    const profile: UserProfile = {
      id: `ii-${selectedRole}`,
      principal: pendingPrincipal ?? "ii-principal",
      name:
        selectedRole === "admin"
          ? "Admin User"
          : selectedRole === "teacher"
            ? "Teacher User"
            : "Student User",
      email: `${selectedRole}@edutrack.local`,
      role: selectedRole,
    };
    setUserProfile(profile);
    setRole(selectedRole);
    navigate({ to: "/dashboard" });
  };

  const handleDemoLogin = async (
    role: UserRole,
    name: string,
    email: string,
  ) => {
    setDemoLoading(role);
    await new Promise((r) => setTimeout(r, 500));
    const profile: UserProfile = {
      id: `demo-${role}`,
      principal: `demo-principal-${role}`,
      name,
      email,
      role,
    };
    setUserProfile(profile);
    setRole(role);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* ── Left panel: branding ─────────────────────────────────── */}
      <div className="hidden md:flex md:w-[44%] flex-col justify-between p-10 relative overflow-hidden login-panel-bg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-[0.08] login-panel-blob-top" />
        <div className="pointer-events-none absolute bottom-16 -left-16 w-64 h-64 rounded-full opacity-[0.07] login-panel-blob-bottom" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg login-panel-icon-bg">
            <BookOpen className="w-5 h-5 login-panel-icon-color" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight login-panel-text-title">
            EduTrack
          </span>
        </div>

        {/* Hero copy + features */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-bold leading-tight login-panel-text-heading">
              Manage Your{" "}
              <span className="login-panel-text-accent">Learning</span> Journey
            </h1>
            <p className="text-sm leading-relaxed max-w-xs login-panel-text-body">
              One platform for students, teachers, and admins — attendance,
              fees, performance, and more.
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-3.5">
                <div className="mt-0.5 w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center login-panel-feature-icon-bg">
                  <Icon className="w-4 h-4 login-panel-text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-display login-panel-text-label">
                    {label}
                  </p>
                  <p className="text-xs leading-relaxed mt-0.5 login-panel-text-dim">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs login-panel-text-footer">
          Trusted by institutions across the country
        </p>
      </div>

      {/* ── Right panel: login form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-card px-6 py-12 md:px-14">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            EduTrack
          </span>
        </div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
        >
          <AnimatePresence mode="wait">
            {/* ── Step 1: Login ── */}
            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.28 }}
                className="space-y-7"
              >
                <div className="space-y-1">
                  <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Internet Identity to continue
                  </p>
                </div>

                {/* II Login button */}
                <Button
                  data-ocid="login.ii_button"
                  className="w-full h-12 gap-3 text-base font-semibold font-display transition-smooth"
                  onClick={handleIILogin}
                  disabled={isLoading || loggingIn}
                >
                  {isLoading || loggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>

                {/* Error state */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      data-ocid="login.error_state"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    or try a demo account
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Demo accounts */}
                <div className="space-y-2.5" data-ocid="login.demo_accounts">
                  {DEMO_ACCOUNTS.map(({ role, name, email }, idx) => {
                    const roleConfig = ROLES.find((r) => r.value === role);
                    return (
                      <button
                        type="button"
                        key={role}
                        data-ocid={`login.demo_account.${idx + 1}`}
                        onClick={() => handleDemoLogin(role, name, email)}
                        disabled={demoLoading !== null}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition-smooth text-left disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold border ${roleConfig?.badge ?? ""}`}
                        >
                          {role}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {email}
                          </p>
                        </div>
                        {demoLoading === role && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Register notice */}
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Need an account?
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contact your institution's administrator to get enrolled.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Role selection ── */}
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.28 }}
                className="space-y-7"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-2 border login-panel-authenticated-bg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Authenticated
                  </div>
                  <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
                    Select Your Role
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'll be using EduTrack today
                  </p>
                </div>

                {/* Role toggle grid */}
                <div
                  className="grid grid-cols-3 gap-3"
                  data-ocid="login.role_selector"
                >
                  {ROLES.map(({ value, label, icon }) => {
                    const isSelected = selectedRole === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        data-ocid={`login.role_${value}`}
                        onClick={() => setSelectedRole(value)}
                        aria-pressed={isSelected}
                        className={[
                          "flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-4 text-sm font-semibold font-display transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isSelected
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-smooth",
                            isSelected
                              ? "bg-primary/12 text-primary"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          {icon}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>

                <Button
                  data-ocid="login.continue_button"
                  className="w-full h-12 gap-2 text-base font-semibold font-display transition-smooth"
                  onClick={handleConfirmRole}
                >
                  Continue as{" "}
                  {ROLES.find((r) => r.value === selectedRole)?.label}
                </Button>

                <button
                  type="button"
                  data-ocid="login.back_button"
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                  onClick={() => {
                    setStep("login");
                    setLoggingIn(false);
                  }}
                >
                  Sign in with a different account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p className="mt-12 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} EduTrack. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
