import type {
  DashboardAnalytics as BackendAnalytics,
  Batch as BackendBatch,
  Course as BackendCourse,
  FeeTransaction as BackendFee,
  FeeStatus as BackendFeeStatus,
  StudentProfile,
  TeacherProfile,
  backendInterface,
} from "@/backend.d";
import { FeeType } from "@/backend.d";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/useBackend";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Database,
  DollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Local display types ─────────────────────────────────────────────────────
interface UIStudent {
  id: bigint;
  name: string;
  email: string;
  batch: bigint;
  courses: number;
  joinDate: string;
  active: boolean;
}
interface UITeacher {
  id: bigint;
  name: string;
  email: string;
  subjects: string[];
  qualification: string;
  active: boolean;
}
interface UICourse {
  id: bigint;
  name: string;
  description: string;
  active: boolean;
  schedule: string;
}
interface UIFee {
  id: bigint;
  studentName: string;
  amount: bigint;
  dueDate: bigint;
  paidDate?: bigint;
  status: BackendFeeStatus;
  feeType: string;
}

function toUIStudent(s: StudentProfile): UIStudent {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    batch: s.batch,
    courses: s.enrolledCourses.length,
    joinDate: new Date(Number(s.joiningDate) / 1_000_000).toLocaleDateString(),
    active: s.isActive,
  };
}

function toUITeacher(t: TeacherProfile): UITeacher {
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    subjects: t.subjects,
    qualification: t.qualification,
    active: t.isActive,
  };
}

function toUICourse(c: BackendCourse): UICourse {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    active: c.isActive,
    schedule: c.schedule,
  };
}

function toUIFee(f: BackendFee, studentMap: Map<bigint, string>): UIFee {
  return {
    id: f.id,
    studentName: studentMap.get(f.studentId) ?? `Student #${f.studentId}`,
    amount: f.amount,
    dueDate: f.dueDate,
    paidDate: f.paidDate,
    status: f.status,
    feeType: String(f.feeType),
  };
}

// ─── Demo analytics (shown when backend returns zeroes) ──────────────────────
const DEMO_ANALYTICS: BackendAnalytics = {
  averageAttendance: BigInt(82),
  feeCollectionRate: BigInt(58),
  activeStudents: BigInt(5),
  totalStudents: BigInt(6),
  totalBatches: BigInt(3),
  totalMaterials: BigInt(14),
  totalTeachers: BigInt(4),
  activeCourses: BigInt(3),
};

// ─── Mini Charts ─────────────────────────────────────────────────────────────
function BarChart({
  data,
  maxValue,
}: { data: { label: string; value: number }[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-1 flex-1 min-w-0"
        >
          <div
            className="w-full rounded-t bg-primary/70 transition-smooth hover:bg-primary"
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: "4px",
            }}
          />
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  paid,
  unpaid,
  partial,
}: { paid: number; partial: number; unpaid: number }) {
  const total = paid + unpaid + partial;
  if (total === 0) return <div className="w-24 h-24 rounded-full bg-muted" />;
  const paidDeg = (paid / total) * 360;
  const partialDeg = (partial / total) * 360;
  const paidPct = Math.round((paid / total) * 100);
  const partialPct = Math.round((partial / total) * 100);
  const unpaidPct = 100 - paidPct - partialPct;
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-full shrink-0"
        style={{
          background: `conic-gradient(
            oklch(var(--chart-1)) 0deg ${paidDeg}deg,
            oklch(var(--chart-2)) ${paidDeg}deg ${paidDeg + partialDeg}deg,
            oklch(var(--destructive)) ${paidDeg + partialDeg}deg 360deg
          )`,
          WebkitMaskImage:
            "radial-gradient(circle at center, transparent 36%, black 36%)",
          maskImage:
            "radial-gradient(circle at center, transparent 36%, black 36%)",
        }}
      />
      <div className="flex flex-col gap-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[oklch(var(--chart-1))]" />
          Paid {paidPct}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[oklch(var(--chart-2))]" />
          Partial {partialPct}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-destructive" />
          Unpaid {unpaidPct}%
        </span>
      </div>
    </div>
  );
}

// ─── Shared small components ──────────────────────────────────────────────────
function FeeStatusBadge({ status }: { status: BackendFeeStatus }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    paid: {
      label: "Paid",
      cls: "bg-[oklch(var(--chart-1)/0.15)] text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.3)]",
    },
    unpaid: {
      label: "Unpaid",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
    },
    partial: {
      label: "Partial",
      cls: "bg-[oklch(var(--chart-2)/0.15)] text-[oklch(var(--chart-2))] border-[oklch(var(--chart-2)/0.3)]",
    },
  };
  const s = String(status);
  const { label, cls } = cfg[s] ?? {
    label: s,
    cls: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${cls}`}>
      {label}
    </Badge>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "bg-[oklch(var(--chart-1)/0.12)] text-[oklch(var(--chart-1))] border-[oklch(var(--chart-1)/0.3)]"
          : "bg-muted text-muted-foreground"
      }
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => `skel-${i}`).map((key) => (
        <Skeleton key={key} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function ConfirmDelete({
  open,
  name,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent data-ocid="confirm.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Remove {name}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            data-ocid="confirm.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            data-ocid="confirm.confirm_button"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<BackendAnalytics>({
      queryKey: ["analytics"],
      queryFn: async () => {
        if (!actor) return DEMO_ANALYTICS;
        try {
          return await actor.getDashboardAnalytics();
        } catch {
          return DEMO_ANALYTICS;
        }
      },
    });

  const { data: rawStudents = [], isLoading: studentsLoading } = useQuery<
    StudentProfile[]
  >({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listStudents();
      } catch {
        return [];
      }
    },
  });

  const { data: rawTeachers = [], isLoading: teachersLoading } = useQuery<
    TeacherProfile[]
  >({
    queryKey: ["teachers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listTeachers();
      } catch {
        return [];
      }
    },
  });

  const { data: rawCourses = [], isLoading: coursesLoading } = useQuery<
    BackendCourse[]
  >({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listCourses();
      } catch {
        return [];
      }
    },
  });

  const { data: rawBatches = [], isLoading: batchesLoading } = useQuery<
    BackendBatch[]
  >({
    queryKey: ["batches"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listBatches();
      } catch {
        return [];
      }
    },
  });

  const { data: rawFees = [], isLoading: feesLoading } = useQuery<BackendFee[]>(
    {
      queryKey: ["fees"],
      queryFn: async () => {
        if (!actor) return [];
        try {
          return await actor.listFees();
        } catch {
          return [];
        }
      },
    },
  );

  const studentMap = useMemo(
    () => new Map(rawStudents.map((s) => [s.id, s.name])),
    [rawStudents],
  );
  const students = useMemo(() => rawStudents.map(toUIStudent), [rawStudents]);
  const teachers = useMemo(() => rawTeachers.map(toUITeacher), [rawTeachers]);
  const courses = useMemo(() => rawCourses.map(toUICourse), [rawCourses]);
  const fees = useMemo(
    () => rawFees.map((f) => toUIFee(f, studentMap)),
    [rawFees, studentMap],
  );

  const displayAnalytics = analytics ?? DEMO_ANALYTICS;

  const seedDemo = async () => {
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    try {
      await actor.seedDemoData();
      queryClient.invalidateQueries();
      toast.success("Demo data loaded!");
    } catch {
      toast.error("Failed to load demo data");
    }
  };

  return (
    <div className="p-6 space-y-6" data-ocid="admin.page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage students, teachers, courses, fees and analytics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={seedDemo}
          data-ocid="admin.load_demo_button"
        >
          <Database className="w-4 h-4 mr-1.5" /> Load Demo Data
        </Button>
      </div>

      <Tabs defaultValue="overview" data-ocid="admin.tab">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" data-ocid="admin.overview.tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" data-ocid="admin.students.tab">
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" data-ocid="admin.teachers.tab">
            Teachers
          </TabsTrigger>
          <TabsTrigger value="courses" data-ocid="admin.courses.tab">
            Courses & Batches
          </TabsTrigger>
          <TabsTrigger value="fees" data-ocid="admin.fees.tab">
            Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            analytics={displayAnalytics}
            loading={analyticsLoading}
            fees={fees}
          />
        </TabsContent>
        <TabsContent value="students">
          <StudentsTab
            students={students}
            batches={rawBatches}
            loading={studentsLoading}
            actor={actor}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["students"] })
            }
          />
        </TabsContent>
        <TabsContent value="teachers">
          <TeachersTab
            teachers={teachers}
            loading={teachersLoading}
            actor={actor}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["teachers"] })
            }
          />
        </TabsContent>
        <TabsContent value="courses">
          <CoursesTab
            courses={courses}
            batches={rawBatches}
            teachers={rawTeachers}
            loading={coursesLoading || batchesLoading}
            actor={actor}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ["courses"] });
              queryClient.invalidateQueries({ queryKey: ["batches"] });
            }}
          />
        </TabsContent>
        <TabsContent value="fees">
          <FeesTab
            fees={fees}
            rawFees={rawFees}
            rawStudents={rawStudents}
            loading={feesLoading}
            actor={actor}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["fees"] })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  analytics,
  loading,
  fees,
}: { analytics: BackendAnalytics; loading: boolean; fees: UIFee[] }) {
  const feeGroups = useMemo(
    () => ({
      paid: fees.filter((f) => String(f.status) === "paid").length,
      partial: fees.filter((f) => String(f.status) === "partial").length,
      unpaid: fees.filter((f) => String(f.status) === "unpaid").length,
    }),
    [fees],
  );

  const subjectData = [
    { label: "Math", value: 12 },
    { label: "Physics", value: 9 },
    { label: "Chemistry", value: 14 },
    { label: "English", value: 5 },
  ];

  const quickStats = [
    { label: "Total Students", value: Number(analytics.totalStudents) },
    { label: "Total Teachers", value: Number(analytics.totalTeachers) },
    { label: "Total Batches", value: Number(analytics.totalBatches) },
    { label: "Study Materials", value: Number(analytics.totalMaterials) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          ["stat-1", "stat-2", "stat-3", "stat-4"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={Number(analytics.totalStudents)}
              icon={Users}
              iconColor="primary"
              trend={{ value: 8, label: "vs last month" }}
              data-ocid="admin.stat.students"
            />
            <StatCard
              title="Active Courses"
              value={Number(analytics.activeCourses)}
              icon={BookOpen}
              iconColor="attendance"
              data-ocid="admin.stat.courses"
            />
            <StatCard
              title="Fee Collection"
              value={`${Number(analytics.feeCollectionRate)}%`}
              icon={DollarSign}
              iconColor="fees"
              data-ocid="admin.stat.fee_rate"
            />
            <StatCard
              title="Avg Attendance"
              value={`${Number(analytics.averageAttendance)}%`}
              icon={TrendingUp}
              iconColor="performance"
              data-ocid="admin.stat.attendance"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground">
            Enrollments by Subject
          </h3>
          <BarChart data={subjectData} maxValue={15} />
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground">
            Fee Status Breakdown
          </h3>
          <DonutChart
            paid={feeGroups.paid}
            partial={feeGroups.partial}
            unpaid={feeGroups.unpaid}
          />
          <p className="text-xs text-muted-foreground">
            Based on {fees.length} transactions
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickStats.map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-muted/40 p-3 text-center"
            >
              <p className="text-xl font-display font-bold text-foreground">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────────────────────
function StudentsTab({
  students,
  batches,
  loading,
  actor,
  onRefresh,
}: {
  students: UIStudent[];
  batches: BackendBatch[];
  loading: boolean;
  actor: backendInterface | null;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UIStudent | null>(null);
  const [form, setForm] = useState({ name: "", email: "", batchId: "" });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [students, search],
  );

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email required");
      return;
    }
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    setSaving(true);
    try {
      await actor.createStudent({
        name: form.name,
        email: form.email,
        batch: BigInt(form.batchId || 0),
        joiningDate: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Student added");
      onRefresh();
      setAddOpen(false);
      setForm({ name: "", email: "", batchId: "" });
    } catch {
      toast.error("Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: UIStudent) => {
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    try {
      await actor.deleteStudent(s.id);
      toast.success("Student removed");
      onRefresh();
    } catch {
      toast.error("Failed to remove student");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="students.search_input"
          />
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          data-ocid="students.add_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Student
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="students.table">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">
                  Courses
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                    data-ocid="students.empty_state"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr
                    key={String(s.id)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`students.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {s.email}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {s.courses}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {s.joinDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActiveBadge active={s.active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(s)}
                        data-ocid={`students.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="students.name.input"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="students.email.input"
              />
            </div>
            <div>
              <Label>Batch</Label>
              <Select
                value={form.batchId}
                onValueChange={(v) => setForm((f) => ({ ...f, batchId: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="students.batch.select"
                >
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={String(b.id)} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="students.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              data-ocid="students.submit_button"
            >
              {saving ? "Adding…" : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─── Teachers Tab ─────────────────────────────────────────────────────────────
function TeachersTab({
  teachers,
  loading,
  actor,
  onRefresh,
}: {
  teachers: UITeacher[];
  loading: boolean;
  actor: backendInterface | null;
  onRefresh: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UITeacher | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subjects: "",
    qualification: "",
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email required");
      return;
    }
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    setSaving(true);
    try {
      await actor.createTeacher(Principal.anonymous(), {
        name: form.name,
        email: form.email,
        subjects: form.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        qualification: form.qualification,
      });
      toast.success("Teacher added");
      onRefresh();
      setAddOpen(false);
      setForm({ name: "", email: "", subjects: "", qualification: "" });
    } catch {
      toast.error("Failed to add teacher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: UITeacher) => {
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    try {
      await actor.deleteTeacher(t.id);
      toast.success("Teacher removed");
      onRefresh();
    } catch {
      toast.error("Failed to remove teacher");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setAddOpen(true)}
          data-ocid="teachers.add_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Teacher
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="teachers.table">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  Subjects
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  Qualification
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                    data-ocid="teachers.empty_state"
                  >
                    No teachers found. Load demo data to get started.
                  </td>
                </tr>
              ) : (
                teachers.map((t, idx) => (
                  <tr
                    key={String(t.id)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`teachers.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {t.email}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {t.qualification}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActiveBadge active={t.active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(t)}
                        data-ocid={`teachers.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent data-ocid="teachers.dialog">
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="teachers.name.input"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="teachers.email.input"
              />
            </div>
            <div>
              <Label>Subjects (comma separated)</Label>
              <Input
                className="mt-1"
                value={form.subjects}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subjects: e.target.value }))
                }
                placeholder="Mathematics, Physics"
                data-ocid="teachers.subjects.input"
              />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input
                className="mt-1"
                value={form.qualification}
                onChange={(e) =>
                  setForm((f) => ({ ...f, qualification: e.target.value }))
                }
                placeholder="Ph.D, M.Sc…"
                data-ocid="teachers.qualification.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="teachers.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              data-ocid="teachers.submit_button"
            >
              {saving ? "Adding…" : "Add Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─── Courses & Batches Tab ────────────────────────────────────────────────────
function CoursesTab({
  courses,
  batches,
  teachers,
  loading,
  actor,
  onRefresh,
}: {
  courses: UICourse[];
  batches: BackendBatch[];
  teachers: TeacherProfile[];
  loading: boolean;
  actor: backendInterface | null;
  onRefresh: () => void;
}) {
  const [courseDialog, setCourseDialog] = useState(false);
  const [batchDialog, setBatchDialog] = useState(false);
  const [deleteCourse, setDeleteCourse] = useState<UICourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    teacherId: "",
    batchId: "",
    schedule: "",
  });
  const [batchForm, setBatchForm] = useState({
    name: "",
    year: String(new Date().getFullYear()),
  });
  const [saving, setSaving] = useState(false);

  const handleAddCourse = async () => {
    if (!courseForm.name || !courseForm.teacherId) {
      toast.error("Name and teacher required");
      return;
    }
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    setSaving(true);
    try {
      await actor.createCourse({
        name: courseForm.name,
        description: courseForm.description,
        teacherId: BigInt(courseForm.teacherId),
        batch: BigInt(courseForm.batchId || 0),
        schedule: courseForm.schedule,
      });
      toast.success("Course added");
      onRefresh();
      setCourseDialog(false);
      setCourseForm({
        name: "",
        description: "",
        teacherId: "",
        batchId: "",
        schedule: "",
      });
    } catch {
      toast.error("Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBatch = async () => {
    if (!batchForm.name) {
      toast.error("Name required");
      return;
    }
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    setSaving(true);
    try {
      await actor.createBatch({
        name: batchForm.name,
        year: BigInt(Number(batchForm.year) || new Date().getFullYear()),
      });
      toast.success("Batch added");
      onRefresh();
      setBatchDialog(false);
      setBatchForm({ name: "", year: String(new Date().getFullYear()) });
    } catch {
      toast.error("Failed to add batch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Courses section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Courses</h3>
          <Button
            size="sm"
            onClick={() => setCourseDialog(true)}
            data-ocid="courses.add_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Course
          </Button>
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="courses.table">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Schedule
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4">
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground"
                      data-ocid="courses.empty_state"
                    >
                      No courses. Load demo data to get started.
                    </td>
                  </tr>
                ) : (
                  courses.map((c, idx) => (
                    <tr
                      key={String(c.id)}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      data-ocid={`courses.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        <p>{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {c.description}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                        {c.schedule || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActiveBadge active={c.active} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteCourse(c)}
                          data-ocid={`courses.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Batches section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Batches</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBatchDialog(true)}
            data-ocid="batches.add_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Batch
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            ["b-skel-1", "b-skel-2", "b-skel-3"].map((k) => (
              <Skeleton key={k} className="h-28 rounded-xl" />
            ))
          ) : batches.length === 0 ? (
            <p
              className="text-sm text-muted-foreground col-span-3 py-8 text-center"
              data-ocid="batches.empty_state"
            >
              No batches. Load demo data to get started.
            </p>
          ) : (
            batches.map((b, idx) => (
              <div
                key={String(b.id)}
                className="rounded-xl border bg-card p-4 space-y-2"
                data-ocid={`batches.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm min-w-0 truncate">
                    {b.name}
                  </p>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {b.courses.length} courses
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Year: {String(b.year)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent data-ocid="courses.dialog">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="courses.name.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={2}
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm((f) => ({ ...f, description: e.target.value }))
                }
                data-ocid="courses.description.textarea"
              />
            </div>
            <div>
              <Label>Teacher</Label>
              <Select
                value={courseForm.teacherId}
                onValueChange={(v) =>
                  setCourseForm((f) => ({ ...f, teacherId: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="courses.teacher.select"
                >
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch</Label>
              <Select
                value={courseForm.batchId}
                onValueChange={(v) =>
                  setCourseForm((f) => ({ ...f, batchId: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="courses.batch.select"
                >
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={String(b.id)} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule</Label>
              <Input
                className="mt-1"
                value={courseForm.schedule}
                onChange={(e) =>
                  setCourseForm((f) => ({ ...f, schedule: e.target.value }))
                }
                placeholder="Mon, Wed, Fri 9AM–11AM"
                data-ocid="courses.schedule.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseDialog(false)}
              data-ocid="courses.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCourse}
              disabled={saving}
              data-ocid="courses.submit_button"
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batchDialog} onOpenChange={setBatchDialog}>
        <DialogContent data-ocid="batches.dialog">
          <DialogHeader>
            <DialogTitle>Add Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Batch Name</Label>
              <Input
                className="mt-1"
                value={batchForm.name}
                onChange={(e) =>
                  setBatchForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="batches.name.input"
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                className="mt-1"
                type="number"
                value={batchForm.year}
                onChange={(e) =>
                  setBatchForm((f) => ({ ...f, year: e.target.value }))
                }
                data-ocid="batches.year.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBatchDialog(false)}
              data-ocid="batches.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBatch}
              disabled={saving}
              data-ocid="batches.submit_button"
            >
              Add Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!deleteCourse}
        name={deleteCourse?.name ?? ""}
        onConfirm={() => {
          toast.info("Course deletion not yet supported by backend");
          setDeleteCourse(null);
        }}
        onCancel={() => setDeleteCourse(null)}
      />
    </div>
  );
}

// ─── Fees Tab ─────────────────────────────────────────────────────────────────
function FeesTab({
  fees,
  rawFees,
  rawStudents,
  loading,
  actor,
  onRefresh,
}: {
  fees: UIFee[];
  rawFees: BackendFee[];
  rawStudents: StudentProfile[];
  loading: boolean;
  actor: backendInterface | null;
  onRefresh: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [addDialog, setAddDialog] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<UIFee | null>(null);
  const [form, setForm] = useState({ studentId: "", amount: "", dueDate: "" });
  const [newStatus, setNewStatus] = useState("paid");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? fees
        : fees.filter((f) => String(f.status) === statusFilter),
    [fees, statusFilter],
  );

  const totalAmount = rawFees.reduce((sum, f) => sum + Number(f.amount), 0);
  const paidAmount = rawFees
    .filter((f) => String(f.status) === "paid")
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const outstanding = totalAmount - paidAmount;

  const handleAdd = async () => {
    if (!form.studentId || !form.amount) {
      toast.error("Student and amount required");
      return;
    }
    if (!actor) {
      toast.error("Backend not available");
      return;
    }
    setSaving(true);
    try {
      const dueTs = form.dueDate
        ? BigInt(new Date(form.dueDate).getTime()) * BigInt(1_000_000)
        : BigInt(Date.now()) * BigInt(1_000_000);
      await actor.createFee({
        studentId: BigInt(form.studentId),
        amount: BigInt(Math.round(Number(form.amount))),
        dueDate: dueTs,
        feeType: FeeType.monthly,
        notes: "",
      });
      toast.success("Fee transaction added");
      onRefresh();
      setAddDialog(false);
      setForm({ studentId: "", amount: "", dueDate: "" });
    } catch {
      toast.error("Failed to add fee");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateTarget || !actor) {
      setUpdateTarget(null);
      return;
    }
    const raw = rawFees.find((f) => f.id === updateTarget.id);
    if (!raw) {
      setUpdateTarget(null);
      return;
    }
    setSaving(true);
    try {
      const statusVal = newStatus as BackendFeeStatus;
      const paidDateVal =
        newStatus === "paid"
          ? BigInt(Date.now()) * BigInt(1_000_000)
          : raw.paidDate;
      await actor.updateFee(updateTarget.id, {
        status: statusVal,
        feeType: raw.feeType,
        dueDate: raw.dueDate,
        paidDate: paidDateVal,
        amount: raw.amount,
        notes: raw.notes,
      });
      toast.success("Fee status updated");
      onRefresh();
    } catch {
      toast.error("Failed to update fee");
    } finally {
      setSaving(false);
      setUpdateTarget(null);
    }
  };

  const statusOptions = ["all", "paid", "partial", "unpaid"];

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Fees</p>
          <p className="text-lg font-display font-semibold">
            ₹{totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
          <p className="text-lg font-display font-semibold text-[oklch(var(--chart-1))]">
            ₹{paidAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
          <p className="text-lg font-display font-semibold text-destructive">
            ₹{outstanding.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {statusOptions.map((opt) => (
            <Button
              key={opt}
              variant={statusFilter === opt ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(opt)}
              data-ocid={`fees.filter.${opt}`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Button>
          ))}
        </div>
        <div className="ml-auto">
          <Button
            size="sm"
            onClick={() => setAddDialog(true)}
            data-ocid="fees.add_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="fees.table">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                    data-ocid="fees.empty_state"
                  >
                    No fee transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((f, idx) => (
                  <tr
                    key={String(f.id)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`fees.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">{f.studentName}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      ₹{Number(f.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                      {new Date(
                        Number(f.dueDate) / 1_000_000,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {f.feeType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeeStatusBadge status={f.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setUpdateTarget(f);
                          setNewStatus(String(f.status));
                        }}
                        data-ocid={`fees.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add fee dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent data-ocid="fees.dialog">
          <DialogHeader>
            <DialogTitle>Add Fee Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Student</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger className="mt-1" data-ocid="fees.student.select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {rawStudents.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  data-ocid="fees.amount.input"
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  data-ocid="fees.duedate.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialog(false)}
              data-ocid="fees.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              data-ocid="fees.submit_button"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update status dialog */}
      <Dialog
        open={!!updateTarget}
        onOpenChange={(o) => !o && setUpdateTarget(null)}
      >
        <DialogContent data-ocid="fees.update.dialog">
          <DialogHeader>
            <DialogTitle>Update Fee Status</DialogTitle>
          </DialogHeader>
          {updateTarget && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {updateTarget.studentName} — ₹
                {Number(updateTarget.amount).toLocaleString()}
              </p>
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="fees.update.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateTarget(null)}
              data-ocid="fees.update.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={saving}
              data-ocid="fees.update.submit_button"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
