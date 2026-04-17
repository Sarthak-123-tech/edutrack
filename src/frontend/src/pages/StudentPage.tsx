import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackend } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type {
  AttendanceRecord,
  ClassSession,
  Course,
  FeeTransaction,
  Mark,
  StudyMaterial,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// ─── Demo data (shown when backend returns empty) ──────────────

const DEMO_STUDENT = {
  id: "s001",
  name: "Arjun Sharma",
  batchName: "Batch A-1 (Science)",
  email: "arjun.sharma@example.com",
};

const DEMO_COURSES: Course[] = [
  {
    id: "c001",
    title: "Advanced Mathematics",
    description:
      "Covers calculus, linear algebra, probability and statistics with exam focus.",
    teacherId: "t001",
    teacherName: "Dr. Priya Nair",
    fee: 3500,
    duration: "6 months",
    subject: "Mathematics",
    status: "active",
  },
  {
    id: "c002",
    title: "Physics — Mechanics & Waves",
    description:
      "Classical mechanics, wave optics and electromagnetism for JEE/NEET.",
    teacherId: "t002",
    teacherName: "Mr. Rahul Verma",
    fee: 3200,
    duration: "5 months",
    subject: "Physics",
    status: "active",
  },
  {
    id: "c003",
    title: "Organic Chemistry",
    description:
      "Reaction mechanisms, functional groups and named reactions with practice sets.",
    teacherId: "t003",
    teacherName: "Ms. Sunita Kapoor",
    fee: 3000,
    duration: "4 months",
    subject: "Chemistry",
    status: "active",
  },
  {
    id: "c004",
    title: "English Communication",
    description: "Grammar, essay writing and comprehension for board exams.",
    teacherId: "t004",
    teacherName: "Mr. Amit Singh",
    fee: 2000,
    duration: "3 months",
    subject: "English",
    status: "active",
  },
];

const DEMO_FEES: FeeTransaction[] = [
  {
    id: "f001",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c001",
    courseName: "Advanced Mathematics",
    amount: 3500,
    dueDate: "2026-04-01",
    paidDate: "2026-03-30",
    status: "paid",
    month: "April",
    year: 2026,
  },
  {
    id: "f002",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c002",
    courseName: "Physics — Mechanics & Waves",
    amount: 3200,
    dueDate: "2026-04-01",
    paidDate: "2026-04-02",
    status: "paid",
    month: "April",
    year: 2026,
  },
  {
    id: "f003",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c003",
    courseName: "Organic Chemistry",
    amount: 3000,
    dueDate: "2026-05-01",
    status: "unpaid",
    month: "May",
    year: 2026,
  },
  {
    id: "f004",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c004",
    courseName: "English Communication",
    amount: 2000,
    dueDate: "2026-03-15",
    status: "overdue",
    month: "March",
    year: 2026,
  },
];

const DEMO_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "a001",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c001",
    date: "2026-04-15",
    status: "present",
    markedBy: "Dr. Priya Nair",
  },
  {
    id: "a002",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c001",
    date: "2026-04-12",
    status: "late",
    markedBy: "Dr. Priya Nair",
  },
  {
    id: "a003",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c002",
    date: "2026-04-14",
    status: "present",
    markedBy: "Mr. Rahul Verma",
  },
  {
    id: "a004",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c002",
    date: "2026-04-10",
    status: "absent",
    markedBy: "Mr. Rahul Verma",
  },
  {
    id: "a005",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c003",
    date: "2026-04-15",
    status: "present",
    markedBy: "Ms. Sunita Kapoor",
  },
  {
    id: "a006",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c003",
    date: "2026-04-11",
    status: "present",
    markedBy: "Ms. Sunita Kapoor",
  },
  {
    id: "a007",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c001",
    date: "2026-04-08",
    status: "absent",
    markedBy: "Dr. Priya Nair",
  },
  {
    id: "a008",
    studentId: "s001",
    studentName: "Arjun Sharma",
    courseId: "c004",
    date: "2026-04-09",
    status: "present",
    markedBy: "Mr. Amit Singh",
  },
];

const DEMO_MARKS: Mark[] = [
  {
    id: "m001",
    studentId: "s001",
    courseId: "c001",
    courseName: "Advanced Mathematics",
    examType: "quiz",
    score: 18,
    maxScore: 20,
    date: "2026-03-05",
    grade: "A+",
  },
  {
    id: "m002",
    studentId: "s001",
    courseId: "c001",
    courseName: "Advanced Mathematics",
    examType: "midterm",
    score: 74,
    maxScore: 100,
    date: "2026-03-20",
    grade: "B+",
  },
  {
    id: "m003",
    studentId: "s001",
    courseId: "c002",
    courseName: "Physics — Mechanics & Waves",
    examType: "quiz",
    score: 15,
    maxScore: 20,
    date: "2026-03-07",
    grade: "A",
  },
  {
    id: "m004",
    studentId: "s001",
    courseId: "c002",
    courseName: "Physics — Mechanics & Waves",
    examType: "midterm",
    score: 68,
    maxScore: 100,
    date: "2026-03-22",
    grade: "B",
  },
  {
    id: "m005",
    studentId: "s001",
    courseId: "c003",
    courseName: "Organic Chemistry",
    examType: "assignment",
    score: 28,
    maxScore: 30,
    date: "2026-03-10",
    grade: "A+",
  },
  {
    id: "m006",
    studentId: "s001",
    courseId: "c003",
    courseName: "Organic Chemistry",
    examType: "midterm",
    score: 82,
    maxScore: 100,
    date: "2026-03-25",
    grade: "A",
  },
  {
    id: "m007",
    studentId: "s001",
    courseId: "c004",
    courseName: "English Communication",
    examType: "assignment",
    score: 23,
    maxScore: 25,
    date: "2026-03-08",
    grade: "A",
  },
];

const DEMO_MATERIALS: StudyMaterial[] = [
  {
    id: "mat001",
    title: "Calculus — Limits & Derivatives",
    description: "Complete notes for limits, derivatives and L'Hopital rule.",
    courseId: "c001",
    courseName: "Advanced Mathematics",
    uploadedBy: "Dr. Priya Nair",
    uploadDate: "2026-04-10",
    fileType: "pdf",
    fileUrl: "#",
    size: "2.4 MB",
  },
  {
    id: "mat002",
    title: "Integration Practice Problems",
    description:
      "50 solved problems on definite and indefinite integrals with solutions.",
    courseId: "c001",
    courseName: "Advanced Mathematics",
    uploadedBy: "Dr. Priya Nair",
    uploadDate: "2026-04-05",
    fileType: "pdf",
    fileUrl: "#",
    size: "3.1 MB",
  },
  {
    id: "mat003",
    title: "Newton's Laws — Summary Sheet",
    description: "Quick reference card for all three laws with examples.",
    courseId: "c002",
    courseName: "Physics — Mechanics & Waves",
    uploadedBy: "Mr. Rahul Verma",
    uploadDate: "2026-04-08",
    fileType: "pdf",
    fileUrl: "#",
    size: "1.2 MB",
  },
  {
    id: "mat004",
    title: "Wave Optics Video Lecture",
    description: "Recorded class — interference, diffraction and polarisation.",
    courseId: "c002",
    courseName: "Physics — Mechanics & Waves",
    uploadedBy: "Mr. Rahul Verma",
    uploadDate: "2026-04-12",
    fileType: "video",
    fileUrl: "#",
    size: "180 MB",
  },
  {
    id: "mat005",
    title: "Named Reactions Handbook",
    description: "50 important named reactions for board & competitive exams.",
    courseId: "c003",
    courseName: "Organic Chemistry",
    uploadedBy: "Ms. Sunita Kapoor",
    uploadDate: "2026-04-03",
    fileType: "pdf",
    fileUrl: "#",
    size: "4.7 MB",
  },
  {
    id: "mat006",
    title: "Essay Writing Assignment",
    description:
      "Practice essay topics with model answers and scoring criteria.",
    courseId: "c004",
    courseName: "English Communication",
    uploadedBy: "Mr. Amit Singh",
    uploadDate: "2026-04-14",
    fileType: "doc",
    fileUrl: "#",
    size: "0.8 MB",
  },
];

const DEMO_SESSIONS: ClassSession[] = [
  {
    id: "cs001",
    courseId: "c001",
    courseName: "Advanced Mathematics",
    batchId: "b001",
    date: "2026-04-18",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    topic: "Differential Equations — Introduction",
    status: "scheduled",
    location: "Room 101",
  },
  {
    id: "cs002",
    courseId: "c002",
    courseName: "Physics — Mechanics & Waves",
    batchId: "b001",
    date: "2026-04-18",
    startTime: "12:00 PM",
    endTime: "1:00 PM",
    topic: "Simple Harmonic Motion",
    status: "scheduled",
    location: "Room 203",
  },
  {
    id: "cs003",
    courseId: "c003",
    courseName: "Organic Chemistry",
    batchId: "b001",
    date: "2026-04-19",
    startTime: "9:30 AM",
    endTime: "10:30 AM",
    topic: "Aldehydes & Ketones",
    status: "scheduled",
    location: "Lab 3",
  },
];

// ─── Fee helpers ───────────────────────────────────────────────

const feeStatusConfig: Record<string, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className:
      "bg-attendance text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.25)]",
  },
  unpaid: {
    label: "Unpaid",
    className:
      "bg-fees text-[oklch(var(--chart-2))] border-[oklch(var(--chart-2)/0.25)]",
  },
  partial: {
    label: "Partial",
    className: "bg-muted text-muted-foreground border-border",
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
};

// ─── Attendance helpers ────────────────────────────────────────

function getAttendanceSummaryByCourse(records: AttendanceRecord[]) {
  const map = new Map<
    string,
    {
      courseId: string;
      courseName: string;
      present: number;
      absent: number;
      late: number;
      total: number;
    }
  >();
  for (const r of records) {
    const key = r.courseId;
    const existing = map.get(key) ?? {
      courseId: r.courseId,
      courseName: r.courseId,
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
    };
    existing.present += r.status === "present" ? 1 : 0;
    existing.absent += r.status === "absent" ? 1 : 0;
    existing.late += r.status === "late" ? 1 : 0;
    existing.total += 1;
    map.set(key, existing);
  }
  return Array.from(map.values());
}

function attendanceDot(status: AttendanceRecord["status"]) {
  if (status === "present")
    return "w-2.5 h-2.5 rounded-full bg-[oklch(var(--chart-1))]";
  if (status === "absent") return "w-2.5 h-2.5 rounded-full bg-destructive";
  return "w-2.5 h-2.5 rounded-full bg-[oklch(var(--chart-2))]";
}

// ─── Material file type badge ──────────────────────────────────

const fileTypeBadge: Record<string, { label: string; className: string }> = {
  pdf: {
    label: "Notes",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  doc: {
    label: "Assignment",
    className:
      "bg-fees text-[oklch(var(--chart-2))] border-[oklch(var(--chart-2)/0.2)]",
  },
  video: {
    label: "Video",
    className:
      "bg-performance text-[oklch(var(--chart-3))] border-[oklch(var(--chart-3)/0.2)]",
  },
  image: {
    label: "Image",
    className: "bg-muted text-muted-foreground border-border",
  },
  other: {
    label: "Resource",
    className: "bg-muted text-muted-foreground border-border",
  },
};

// ─── Exam type badge ───────────────────────────────────────────

const examTypeBadge: Record<string, string> = {
  quiz: "bg-primary/10 text-primary border-primary/20",
  midterm:
    "bg-fees text-[oklch(var(--chart-2))] border-[oklch(var(--chart-2)/0.2)]",
  final: "bg-destructive/10 text-destructive border-destructive/20",
  assignment:
    "bg-attendance text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.2)]",
};

// ─── Sub-components ────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="space-y-3" data-ocid="student.loading_state">
      {[1, 2, 3].map((n) => (
        <Skeleton key={n} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
  ocid,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center py-16 text-center gap-3"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{message}</p>
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────

function OverviewTab({
  courses,
  fees,
  attendance,
  marks,
  sessions,
  onTabChange,
}: {
  courses: Course[];
  fees: FeeTransaction[];
  attendance: AttendanceRecord[];
  marks: Mark[];
  sessions: ClassSession[];
  onTabChange: (tab: string) => void;
}) {
  const totalDue = fees
    .filter((f) => f.status !== "paid")
    .reduce((s, f) => s + f.amount, 0);
  const attendanceRate =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.status === "present").length /
            attendance.length) *
            100,
        )
      : 0;
  const avgScore =
    marks.length > 0
      ? Math.round(
          marks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) /
            marks.length,
        )
      : 0;

  const quickLinks = [
    {
      label: "My Courses",
      tab: "courses",
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Fees",
      tab: "fees",
      icon: CreditCard,
      color: "text-[oklch(var(--chart-2))]",
      bg: "bg-fees",
    },
    {
      label: "Attendance",
      tab: "attendance",
      icon: CalendarCheck,
      color: "text-[oklch(var(--chart-1))]",
      bg: "bg-attendance",
    },
    {
      label: "Performance",
      tab: "performance",
      icon: BarChart2,
      color: "text-[oklch(var(--chart-3))]",
      bg: "bg-performance",
    },
    {
      label: "Materials",
      tab: "materials",
      icon: FileText,
      color: "text-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="space-y-6" data-ocid="student.overview_section">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border border-primary/20 p-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Welcome back, {DEMO_STUDENT.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {DEMO_STUDENT.batchName} · {courses.length} enrolled course
            {courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <GraduationCap size={22} className="text-primary" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={courses.length.toString()}
          subtitle="Active courses"
          icon={BookOpen}
          iconColor="primary"
          data-ocid="student.stat.courses"
        />
        <StatCard
          title="Attendance"
          value={`${attendanceRate}%`}
          subtitle="Overall rate"
          icon={CalendarCheck}
          iconColor="attendance"
          data-ocid="student.stat.attendance"
        />
        <StatCard
          title="Fees Due"
          value={totalDue > 0 ? `₹${totalDue.toLocaleString()}` : "All Clear"}
          subtitle={totalDue > 0 ? "Outstanding balance" : "No dues pending"}
          icon={CreditCard}
          iconColor="fees"
          data-ocid="student.stat.fees_due"
        />
        <StatCard
          title="Avg Score"
          value={`${avgScore}%`}
          subtitle="Across all exams"
          icon={TrendingUp}
          iconColor="performance"
          data-ocid="student.stat.avg_score"
        />
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Quick Access
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((ql) => {
            const Icon = ql.icon;
            return (
              <button
                key={ql.tab}
                type="button"
                data-ocid={`student.quicklink.${ql.tab}`}
                onClick={() => onTabChange(ql.tab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card transition-smooth hover:shadow-md cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    ql.bg,
                  )}
                >
                  <Icon size={14} className={ql.color} />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {ql.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming classes */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Upcoming Classes
        </h3>
        {sessions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No upcoming classes"
            message="No classes scheduled in the next few days."
            ocid="student.upcoming_classes.empty_state"
          />
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 3).map((s, i) => (
              <div
                key={s.id}
                data-ocid={`student.upcoming_class.item.${i + 1}`}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.courseName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.topic}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-foreground">
                    {s.date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.startTime} – {s.endTime}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] ml-1 shrink-0 bg-muted text-muted-foreground"
                >
                  {s.location}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Courses Tab ───────────────────────────────────────────────

function CoursesTab({ courses }: { courses: Course[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses enrolled"
        message="Contact your admin to enrol in a course."
        ocid="student.courses.empty_state"
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      data-ocid="student.courses_section"
    >
      {courses.map((c, i) => (
        <button
          key={c.id}
          type="button"
          data-ocid={`student.course.item.${i + 1}`}
          className="rounded-xl border bg-card p-5 flex flex-col gap-3 transition-smooth hover:shadow-md cursor-pointer text-left w-full"
          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
          aria-expanded={expanded === c.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-primary" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] shrink-0 bg-attendance text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.2)]"
            >
              Active
            </Badge>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{c.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {c.teacherName} · {c.duration}
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {c.description}
          </p>
          {expanded === c.id && (
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium text-foreground">{c.subject}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Monthly Fee</span>
                <span className="font-medium text-[oklch(var(--chart-2))]">
                  ₹{c.fee.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Fees Tab ──────────────────────────────────────────────────

function FeesTab({ fees }: { fees: FeeTransaction[] }) {
  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + f.amount, 0);
  const totalUnpaid = fees
    .filter((f) => f.status !== "paid")
    .reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-5" data-ocid="student.fees_section">
      {/* Fee summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-card bg-attendance">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
            <p className="text-xl font-display font-bold text-[oklch(var(--chart-1))]">
              ₹{totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card bg-fees">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
            <p className="text-xl font-display font-bold text-[oklch(var(--chart-2))]">
              ₹{totalUnpaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
            <p className="text-xl font-display font-bold text-foreground">
              ₹{(totalPaid + totalUnpaid).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee table */}
      {fees.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No fee records"
          message="Your fee records will appear here once generated."
          ocid="student.fees.empty_state"
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Fee Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Course
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                      Due Date
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                      Paid Date
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fees.map((f, i) => {
                    const sc = feeStatusConfig[f.status];
                    return (
                      <tr
                        key={f.id}
                        data-ocid={`student.fee.item.${i + 1}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-foreground text-xs">
                              {f.courseName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {f.month} {f.year}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                          ₹{f.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs hidden sm:table-cell">
                          {f.dueDate}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs hidden md:table-cell">
                          {f.paidDate ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold",
                              sc.className,
                            )}
                          >
                            {sc.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Attendance Tab ────────────────────────────────────────────

function AttendanceTab({
  attendance,
  courses,
}: {
  attendance: AttendanceRecord[];
  courses: Course[];
}) {
  const courseMap = new Map(courses.map((c) => [c.id, c.title]));
  const summaries = getAttendanceSummaryByCourse(attendance).map((s) => ({
    ...s,
    courseName: courseMap.get(s.courseId) ?? s.courseId,
    percentage:
      s.total > 0
        ? Math.round(((s.present + s.late * 0.5) / s.total) * 100)
        : 0,
  }));

  const overallRate =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.status === "present").length /
            attendance.length) *
            100,
        )
      : 0;

  const sorted = [...attendance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-5" data-ocid="student.attendance_section">
      {/* Overall rate banner */}
      <div className="rounded-2xl border bg-attendance p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Overall Attendance Rate
          </p>
          <p className="text-4xl font-display font-bold text-[oklch(var(--chart-1))] mt-1">
            {overallRate}%
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[oklch(var(--chart-1)/0.15)] flex items-center justify-center">
          <CalendarCheck size={26} className="text-[oklch(var(--chart-1))]" />
        </div>
      </div>

      {/* Per-course summary */}
      {summaries.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records"
          message="Your attendance records will appear here once classes begin."
          ocid="student.attendance.empty_state"
        />
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Per-Course Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summaries.map((s, i) => (
              <div
                key={s.courseId}
                data-ocid={`student.attendance_course.item.${i + 1}`}
                className="rounded-xl border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.courseName}
                  </p>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      s.percentage >= 75
                        ? "text-[oklch(var(--chart-1))]"
                        : "text-destructive",
                    )}
                  >
                    {s.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-smooth",
                      s.percentage >= 75
                        ? "bg-[oklch(var(--chart-1))]"
                        : "bg-destructive",
                    )}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="font-semibold text-[oklch(var(--chart-1))]">
                      {s.present}
                    </span>{" "}
                    Present
                  </span>
                  <span>
                    <span className="font-semibold text-destructive">
                      {s.absent}
                    </span>{" "}
                    Absent
                  </span>
                  <span>
                    <span className="font-semibold text-[oklch(var(--chart-2))]">
                      {s.late}
                    </span>{" "}
                    Late
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent records list */}
      {sorted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Recent Records
          </h3>
          <div className="space-y-1.5">
            {sorted.slice(0, 10).map((r, i) => (
              <div
                key={r.id}
                data-ocid={`student.attendance_record.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card"
              >
                <div className={attendanceDot(r.status)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {courseMap.get(r.courseId) ?? r.courseId}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{r.date}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold capitalize",
                    r.status === "present"
                      ? "text-[oklch(var(--chart-1))]"
                      : r.status === "absent"
                        ? "text-destructive"
                        : "text-[oklch(var(--chart-2))]",
                  )}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Study Materials Tab ───────────────────────────────────────

function MaterialsTab({
  materials,
  courses,
}: {
  materials: StudyMaterial[];
  courses: Course[];
}) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? materials
      : materials.filter((m) => m.courseId === filter);

  return (
    <div className="space-y-4" data-ocid="student.materials_section">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger
            className="w-52"
            data-ocid="student.materials.course_filter"
          >
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} material{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No materials found"
          message="No study materials have been uploaded for this course yet."
          ocid="student.materials.empty_state"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((m, i) => {
            const ftb = fileTypeBadge[m.fileType] ?? fileTypeBadge.other;
            return (
              <div
                key={m.id}
                data-ocid={`student.material.item.${i + 1}`}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3 transition-smooth hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] shrink-0", ftb.className)}
                  >
                    {ftb.label}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground leading-snug">
                    {m.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">
                      {m.courseName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.uploadedBy} · {m.uploadDate}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs shrink-0"
                    data-ocid={`student.material.download_button.${i + 1}`}
                    onClick={() => window.open(m.fileUrl, "_blank")}
                  >
                    <Download size={12} />
                    {m.size}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Performance Tab ───────────────────────────────────────────

function PerformanceTab({
  marks,
  courses,
}: {
  marks: Mark[];
  courses: Course[];
}) {
  const courseMap = new Map(courses.map((c) => [c.id, c.title]));

  // Per-course averages
  const coursePerf = courses
    .map((c) => {
      const cm = marks.filter((m) => m.courseId === c.id);
      const avg =
        cm.length > 0
          ? Math.round(
              cm.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) /
                cm.length,
            )
          : 0;
      return { courseId: c.id, courseName: c.title, avg, total: cm.length };
    })
    .filter((cp) => cp.total > 0);

  return (
    <div className="space-y-5" data-ocid="student.performance_section">
      {/* Course performance cards */}
      {coursePerf.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Course Performance Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {coursePerf.map((cp, i) => (
              <div
                key={cp.courseId}
                data-ocid={`student.perf_course.item.${i + 1}`}
                className="rounded-xl border bg-card p-4 space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {cp.courseName}
                </p>
                <p
                  className={cn(
                    "text-2xl font-display font-bold",
                    cp.avg >= 75
                      ? "text-[oklch(var(--chart-1))]"
                      : cp.avg >= 50
                        ? "text-[oklch(var(--chart-2))]"
                        : "text-destructive",
                  )}
                >
                  {cp.avg}%
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {cp.total} exam{cp.total !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart — CSS */}
      {marks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Marks Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40 px-2">
              {marks.map((m, i) => {
                const pct = Math.round((m.score / m.maxScore) * 100);
                return (
                  <div
                    key={m.id}
                    data-ocid={`student.perf_bar.item.${i + 1}`}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${courseMap.get(m.courseId) ?? m.courseId} — ${m.examType}: ${pct}%`}
                  >
                    <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {pct}%
                    </span>
                    <div className="w-full flex items-end justify-center h-28">
                      <div
                        className="w-full rounded-t-md bg-performance transition-smooth"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground truncate w-full text-center capitalize">
                      {m.examType.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marks table */}
      {marks.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No marks recorded"
          message="Your exam results will appear here once graded."
          ocid="student.marks.empty_state"
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Detailed Marks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Course
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Exam
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Score
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                      Progress
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {marks.map((m, i) => {
                    const pct = Math.round((m.score / m.maxScore) * 100);
                    return (
                      <tr
                        key={m.id}
                        data-ocid={`student.mark.item.${i + 1}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-medium text-foreground truncate max-w-[140px]">
                            {courseMap.get(m.courseId) ?? m.courseId}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] capitalize",
                              examTypeBadge[m.examType],
                            )}
                          >
                            {m.examType}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-semibold text-foreground">
                            {m.score}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            /{m.maxScore}
                          </span>
                          <span
                            className={cn(
                              "ml-1 text-xs font-bold",
                              pct >= 75
                                ? "text-[oklch(var(--chart-1))]"
                                : pct >= 50
                                  ? "text-[oklch(var(--chart-2))]"
                                  : "text-destructive",
                            )}
                          >
                            ({pct}%)
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                pct >= 75
                                  ? "bg-[oklch(var(--chart-1))]"
                                  : pct >= 50
                                    ? "bg-[oklch(var(--chart-2))]"
                                    : "bg-destructive",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                          {m.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function StudentPage() {
  const { actor, isFetching } = useBackend();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch the student's own profile to get their studentId
  const { data: studentProfile } = useQuery({
    queryKey: ["my-student-profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyStudentProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const studentId = studentProfile?.id;

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["student-courses", studentId?.toString()],
    queryFn: async () => {
      if (!actor) return DEMO_COURSES;
      try {
        const allCourses = await actor.listCourses();
        if (!studentProfile || allCourses.length === 0) return DEMO_COURSES;
        const enrolled = new Set(studentProfile.enrolledCourses.map(String));
        const filtered = allCourses
          .filter((c) => enrolled.has(String(c.id)))
          .map((c) => ({
            id: String(c.id),
            title: c.name,
            description: c.description,
            teacherId: String(c.teacherId),
            teacherName: String(c.teacherId),
            fee: 0,
            duration: c.schedule,
            subject: c.name,
            status: c.isActive ? ("active" as const) : ("inactive" as const),
          }));
        return filtered.length > 0 ? filtered : DEMO_COURSES;
      } catch {
        return DEMO_COURSES;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEMO_COURSES,
  });

  const { data: fees = [], isLoading: feesLoading } = useQuery<
    FeeTransaction[]
  >({
    queryKey: ["student-fees", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return DEMO_FEES;
      try {
        const result = await actor.listFeesByStudent(studentId);
        if (result.length === 0) return DEMO_FEES;
        return result.map((f) => ({
          id: String(f.id),
          studentId: String(f.studentId),
          studentName: "",
          courseId: "",
          courseName: f.feeType,
          amount: Number(f.amount),
          dueDate: new Date(Number(f.dueDate) / 1_000_000)
            .toISOString()
            .split("T")[0],
          paidDate: f.paidDate
            ? new Date(Number(f.paidDate) / 1_000_000)
                .toISOString()
                .split("T")[0]
            : undefined,
          status: f.status as FeeTransaction["status"],
          month: new Date(Number(f.dueDate) / 1_000_000).toLocaleString(
            "default",
            { month: "long" },
          ),
          year: new Date(Number(f.dueDate) / 1_000_000).getFullYear(),
        }));
      } catch {
        return DEMO_FEES;
      }
    },
    enabled: !!actor && !isFetching && studentId !== undefined,
    placeholderData: DEMO_FEES,
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<
    AttendanceRecord[]
  >({
    queryKey: ["student-attendance", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return DEMO_ATTENDANCE;
      try {
        const result = await actor.listAttendanceByStudent(studentId);
        if (result.length === 0) return DEMO_ATTENDANCE;
        return result.map((a) => ({
          id: String(a.id),
          studentId: String(a.studentId),
          studentName: "",
          courseId: String(a.courseId),
          date: new Date(Number(a.date) / 1_000_000)
            .toISOString()
            .split("T")[0],
          status: a.status as AttendanceRecord["status"],
          markedBy: String(a.markedBy),
        }));
      } catch {
        return DEMO_ATTENDANCE;
      }
    },
    enabled: !!actor && !isFetching && studentId !== undefined,
    placeholderData: DEMO_ATTENDANCE,
  });

  const { data: marks = [], isLoading: marksLoading } = useQuery<Mark[]>({
    queryKey: ["student-marks", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return DEMO_MARKS;
      try {
        const result = await actor.listMarksByStudent(studentId);
        if (result.length === 0) return DEMO_MARKS;
        return result.map((m) => ({
          id: String(m.id),
          studentId: String(m.studentId),
          courseId: String(m.courseId),
          courseName: String(m.courseId),
          examType: m.examType as Mark["examType"],
          score: Number(m.marks),
          maxScore: Number(m.maxMarks),
          date: new Date(Number(m.date) / 1_000_000)
            .toISOString()
            .split("T")[0],
          grade: "",
        }));
      } catch {
        return DEMO_MARKS;
      }
    },
    enabled: !!actor && !isFetching && studentId !== undefined,
    placeholderData: DEMO_MARKS,
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery<
    StudyMaterial[]
  >({
    queryKey: ["student-materials"],
    queryFn: async () => {
      if (!actor) return DEMO_MATERIALS;
      try {
        const result = await actor.listMaterials();
        if (result.length === 0) return DEMO_MATERIALS;
        return result.map((m) => ({
          id: String(m.id),
          title: m.title,
          description: m.description,
          courseId: String(m.courseId),
          courseName: String(m.courseId),
          uploadedBy: String(m.uploadedBy),
          uploadDate: new Date(Number(m.uploadDate) / 1_000_000)
            .toISOString()
            .split("T")[0],
          fileType: (m.materialType === "notes"
            ? "pdf"
            : m.materialType === "assignment"
              ? "doc"
              : "other") as StudyMaterial["fileType"],
          fileUrl: m.fileBlob.getDirectURL(),
          size: "—",
        }));
      } catch {
        return DEMO_MATERIALS;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEMO_MATERIALS,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<
    ClassSession[]
  >({
    queryKey: ["student-sessions"],
    queryFn: async () => {
      if (!actor) return DEMO_SESSIONS;
      try {
        const allCourses = await actor.listCourses();
        if (allCourses.length === 0) return DEMO_SESSIONS;
        const allSessions = await Promise.all(
          allCourses.slice(0, 5).map((c) => actor.listSessionsByCourse(c.id)),
        );
        const flat = allSessions.flat();
        if (flat.length === 0) return DEMO_SESSIONS;
        return flat.map((s) => ({
          id: String(s.id),
          courseId: String(s.courseId),
          courseName: String(s.courseId),
          batchId: "",
          date: new Date(Number(s.date) / 1_000_000)
            .toISOString()
            .split("T")[0],
          startTime: s.time,
          endTime: s.time,
          topic: s.topic,
          status: s.status as ClassSession["status"],
          location: "—",
        }));
      } catch {
        return DEMO_SESSIONS;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEMO_SESSIONS,
  });

  const isLoading =
    coursesLoading ||
    feesLoading ||
    attendanceLoading ||
    marksLoading ||
    materialsLoading ||
    sessionsLoading;

  const tabs = [
    { id: "overview", label: "Overview", icon: GraduationCap },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "fees", label: "Fees", icon: CreditCard },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    { id: "materials", label: "Materials", icon: FileText },
    { id: "performance", label: "Performance", icon: BarChart2 },
  ];

  return (
    <div className="space-y-5" data-ocid="student.page">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-display font-bold text-foreground">
            Student Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            {DEMO_STUDENT.name} · {DEMO_STUDENT.batchName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Badge
              variant="outline"
              className="gap-1.5 text-xs"
              data-ocid="student.loading_state"
            >
              <Clock size={10} className="animate-spin" />
              Loading…
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 text-xs bg-attendance text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.2)]"
            >
              <CheckCircle2 size={10} />
              Active
            </Badge>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="student.tabs"
      >
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.id}
                value={t.id}
                data-ocid={`student.tab.${t.id}`}
                className="flex items-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Icon size={13} />
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-5">
          <TabsContent value="overview" className="m-0">
            {isLoading ? (
              <SectionSkeleton />
            ) : (
              <OverviewTab
                courses={courses}
                fees={fees}
                attendance={attendance}
                marks={marks}
                sessions={sessions}
                onTabChange={setActiveTab}
              />
            )}
          </TabsContent>

          <TabsContent value="courses" className="m-0">
            {coursesLoading ? (
              <SectionSkeleton />
            ) : (
              <CoursesTab courses={courses} />
            )}
          </TabsContent>

          <TabsContent value="fees" className="m-0">
            {feesLoading ? <SectionSkeleton /> : <FeesTab fees={fees} />}
          </TabsContent>

          <TabsContent value="attendance" className="m-0">
            {attendanceLoading ? (
              <SectionSkeleton />
            ) : (
              <AttendanceTab attendance={attendance} courses={courses} />
            )}
          </TabsContent>

          <TabsContent value="materials" className="m-0">
            {materialsLoading ? (
              <SectionSkeleton />
            ) : (
              <MaterialsTab materials={materials} courses={courses} />
            )}
          </TabsContent>

          <TabsContent value="performance" className="m-0">
            {marksLoading ? (
              <SectionSkeleton />
            ) : (
              <PerformanceTab marks={marks} courses={courses} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
