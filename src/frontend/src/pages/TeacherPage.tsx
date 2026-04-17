import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassSession,
  ClassStatus,
  Course,
  Mark,
  StudentProfile,
  StudyMaterial,
  TeacherProfile,
} from "@/backend.d";
import { MaterialType } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── helpers ───────────────────────────────────────────────────
function tsToDateStr(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function pct(score: bigint, max: bigint): string {
  if (max === 0n) return "0%";
  return `${Math.round((Number(score) / Number(max)) * 100)}%`;
}

function gradeColor(score: bigint, max: bigint): string {
  const p = max === 0n ? 0 : (Number(score) / Number(max)) * 100;
  if (p >= 80) return "text-[oklch(var(--chart-1))]";
  if (p >= 60) return "text-[oklch(var(--chart-2))]";
  return "text-destructive";
}

function statusColor(status: AttendanceStatus | string): string {
  if (status === "present")
    return "bg-[oklch(var(--chart-1)/0.15)] text-[oklch(var(--chart-1))]";
  if (status === "late")
    return "bg-[oklch(var(--chart-2)/0.15)] text-[oklch(var(--chart-2))]";
  return "bg-destructive/10 text-destructive";
}

function sessionStatusColor(status: ClassStatus | string): string {
  if (status === "completed")
    return "bg-[oklch(var(--chart-1)/0.15)] text-[oklch(var(--chart-1))]";
  if (status === "cancelled") return "bg-destructive/10 text-destructive";
  return "bg-primary/10 text-primary";
}

// ─── skeleton ──────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <Skeleton key={`sk-${n}`} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── My Classes ────────────────────────────────────────────────
interface MyClassesTabProps {
  courses: Course[];
  students: StudentProfile[];
  batches: { id: bigint; name: string }[];
  isLoading: boolean;
}

function MyClassesTab({
  courses,
  students,
  batches,
  isLoading,
}: MyClassesTabProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  if (isLoading) return <PageSkeleton />;

  const batchName = (id: bigint) =>
    batches.find((b) => b.id === id)?.name ?? `Batch #${id}`;

  const enrolledInCourse = (courseId: bigint) =>
    students.filter((s) => s.enrolledCourses.includes(courseId));

  return (
    <div className="space-y-4">
      {courses.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
          data-ocid="teacher.classes.empty_state"
        >
          <BookOpen className="w-12 h-12 opacity-40" />
          <p className="text-sm">No courses assigned yet.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const enrolled = enrolledInCourse(course.id);
          return (
            <Card
              key={`course-${course.id}`}
              className="group cursor-pointer hover:border-primary/40 hover:shadow-md transition-smooth"
              data-ocid={`teacher.course_card.${course.id}`}
              onClick={() => setSelectedCourse(course)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {course.name}
                  </CardTitle>
                  <Badge
                    variant={course.isActive ? "default" : "secondary"}
                    className="shrink-0 text-[10px]"
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{enrolled.length} students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {course.schedule || "No schedule set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>{batchName(course.batch)}</span>
                </div>
                <div className="flex items-center justify-end pt-1">
                  <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-smooth">
                    View students <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Students dialog */}
      <Dialog
        open={!!selectedCourse}
        onOpenChange={() => setSelectedCourse(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="teacher.students_dialog">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse?.name} — Enrolled Students
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {enrolledInCourse(selectedCourse.id).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No students enrolled.
                </p>
              ) : (
                enrolledInCourse(selectedCourse.id).map((s, idx) => (
                  <div
                    key={`student-row-${s.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40"
                    data-ocid={`teacher.student_item.${idx + 1}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.email}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCourse(null)}
              data-ocid="teacher.students_dialog.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Attendance ─────────────────────────────────────────────────
interface AttendanceTabProps {
  courses: Course[];
  students: StudentProfile[];
  actor: ReturnType<typeof useBackend>["actor"];
}

function AttendanceTab({ courses, students, actor }: AttendanceTabProps) {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [statusMap, setStatusMap] = useState<
    Record<string, "present" | "absent" | "late">
  >({});

  const courseId = selectedCourseId ? BigInt(selectedCourseId) : null;

  const { data: attendanceRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ["attendance-course", selectedCourseId],
    queryFn: async () => {
      if (!actor || !courseId) return [];
      return actor.listAttendanceByCourse(courseId);
    },
    enabled: !!actor && !!courseId,
  });

  const enrolledStudents = useMemo(
    () =>
      courseId
        ? students.filter((s) => s.enrolledCourses.includes(courseId))
        : [],
    [students, courseId],
  );

  // Prefill status from existing records for selected date
  useEffect(() => {
    const ts = dateToTimestamp(selectedDate);
    const init: Record<string, "present" | "absent" | "late"> = {};
    for (const s of enrolledStudents) {
      const record = attendanceRecords.find(
        (r) => r.studentId === s.id && r.date === ts,
      );
      init[`${s.id}`] =
        (record?.status as "present" | "absent" | "late") ?? "absent";
    }
    setStatusMap(init);
  }, [enrolledStudents, attendanceRecords, selectedDate]);

  const recordMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !courseId) return;
      const ts = dateToTimestamp(selectedDate);
      const promises = enrolledStudents.map((s) =>
        actor.recordAttendance({
          studentId: s.id,
          courseId,
          date: ts,
          status: (statusMap[`${s.id}`] ?? "absent") as AttendanceStatus,
          notes: "",
        }),
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Attendance recorded successfully");
      queryClient.invalidateQueries({
        queryKey: ["attendance-course", selectedCourseId],
      });
    },
    onError: () => toast.error("Failed to record attendance"),
  });

  const cyclicStatus = (cur: string): "present" | "absent" | "late" => {
    if (cur === "absent") return "present";
    if (cur === "present") return "late";
    return "absent";
  };

  const statusIcon = (s: string) => {
    if (s === "present") return <CheckCircle2 className="w-4 h-4" />;
    if (s === "late") return <Clock className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  // Group past records by date for table
  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of attendanceRecords) {
      const d = tsToDateStr(r.date);
      if (!map[d]) map[d] = [];
      map[d].push(r);
    }
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 10);
  }, [attendanceRecords]);

  const studentName = (id: bigint) =>
    students.find((s) => s.id === id)?.name ?? `Student #${id}`;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label>Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger data-ocid="teacher.attendance.course_select">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={`att-course-${c.id}`} value={`${c.id}`}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                data-ocid="teacher.attendance.date_input"
              />
            </div>
          </div>

          {courseId && enrolledStudents.length > 0 && (
            <div className="space-y-2">
              {enrolledStudents.map((s, idx) => {
                const cur = statusMap[`${s.id}`] ?? "absent";
                return (
                  <div
                    key={`att-row-${s.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    data-ocid={`teacher.attendance.student_row.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate">
                        {s.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setStatusMap((m) => ({
                          ...m,
                          [`${s.id}`]: cyclicStatus(cur),
                        }))
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-smooth ${statusColor(cur)}`}
                      data-ocid={`teacher.attendance.status_toggle.${idx + 1}`}
                    >
                      {statusIcon(cur)}
                      {cur.charAt(0).toUpperCase() + cur.slice(1)}
                    </button>
                  </div>
                );
              })}

              <Button
                className="w-full mt-2"
                onClick={() => recordMutation.mutate()}
                disabled={recordMutation.isPending}
                data-ocid="teacher.attendance.submit_button"
              >
                {recordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Record Attendance
              </Button>
            </div>
          )}

          {courseId && enrolledStudents.length === 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-4"
              data-ocid="teacher.attendance.empty_state"
            >
              No students enrolled in this course.
            </p>
          )}

          {!courseId && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Select a course to mark attendance.
            </p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {courseId && recordsByDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Recent Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecords ? (
              <PageSkeleton />
            ) : (
              <div className="space-y-4">
                {recordsByDate.map(([date, records]) => (
                  <div key={`att-date-${date}`}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      {date}
                    </p>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/40">
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">
                              Student
                            </th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((r) => (
                            <tr key={`hist-${r.id}`} className="border-t">
                              <td className="px-3 py-2">
                                {studentName(r.studentId)}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(r.status)}`}
                                >
                                  {r.status.charAt(0).toUpperCase() +
                                    r.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Materials ──────────────────────────────────────────────────
interface MaterialsTabProps {
  courses: Course[];
  actor: ReturnType<typeof useBackend>["actor"];
}

function MaterialsTab({ courses, actor }: MaterialsTabProps) {
  const queryClient = useQueryClient();
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    materialType: MaterialType.notes,
    file: null as File | null,
    uploadProgress: 0,
  });

  const { data: materials = [], isLoading } = useQuery<StudyMaterial[]>({
    queryKey: ["materials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMaterials();
    },
    enabled: !!actor,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !form.file || !form.courseId)
        throw new Error("Missing fields");
      const { ExternalBlob } = await import("@/backend.d");
      const buf = await form.file.arrayBuffer();
      const blob = ExternalBlob.fromBytes(
        new Uint8Array(buf),
      ).withUploadProgress((p) =>
        setForm((f) => ({ ...f, uploadProgress: p })),
      );
      return actor.uploadMaterial({
        title: form.title,
        description: form.description,
        courseId: BigInt(form.courseId),
        materialType: form.materialType,
        fileBlob: blob,
        fileName: form.file.name,
      });
    },
    onSuccess: () => {
      toast.success("Material uploaded successfully");
      setUploadOpen(false);
      setForm({
        title: "",
        description: "",
        courseId: "",
        materialType: MaterialType.notes,
        file: null,
        uploadProgress: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: () => toast.error("Upload failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      await actor.deleteMaterial(id);
    },
    onSuccess: () => {
      toast.success("Material deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const filtered =
    filterCourse === "all"
      ? materials
      : materials.filter((m) => `${m.courseId}` === filterCourse);

  const courseName = (id: bigint) =>
    courses.find((c) => c.id === id)?.name ?? `Course #${id}`;

  const typeIcon = (t: string) => {
    if (t === "notes") return <FileText className="w-5 h-5 text-primary" />;
    if (t === "assignment")
      return <BookOpen className="w-5 h-5 text-[oklch(var(--chart-2))]" />;
    return <Download className="w-5 h-5 text-[oklch(var(--chart-3))]" />;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger
            className="w-52"
            data-ocid="teacher.materials.course_filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={`mat-filter-${c.id}`} value={`${c.id}`}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => setUploadOpen(true)}
          data-ocid="teacher.materials.upload_button"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {isLoading && <PageSkeleton />}

      {!isLoading && filtered.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
          data-ocid="teacher.materials.empty_state"
        >
          <FileText className="w-12 h-12 opacity-40" />
          <p className="text-sm">No materials found.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, idx) => (
          <Card
            key={`mat-${m.id}`}
            className="group relative"
            data-ocid={`teacher.material_card.${idx + 1}`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {typeIcon(m.materialType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {m.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  {courseName(m.courseId)}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {tsToDateStr(m.uploadDate)}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={m.fileBlob.getDirectURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    data-ocid={`teacher.material_download.${idx + 1}`}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(m.id)}
                  data-ocid={`teacher.material_delete.${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md" data-ocid="teacher.upload_dialog">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Chapter 3 Notes"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="teacher.upload.title_input"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                data-ocid="teacher.upload.description_input"
              />
            </div>
            <div className="space-y-1">
              <Label>Course</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
              >
                <SelectTrigger data-ocid="teacher.upload.course_select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={`upl-c-${c.id}`} value={`${c.id}`}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={form.materialType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, materialType: v as MaterialType }))
                }
              >
                <SelectTrigger data-ocid="teacher.upload.type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
                }
                data-ocid="teacher.upload.file_input"
              />
              {uploadMutation.isPending && form.uploadProgress > 0 && (
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${form.uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              data-ocid="teacher.upload_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={
                !form.title ||
                !form.courseId ||
                !form.file ||
                uploadMutation.isPending
              }
              data-ocid="teacher.upload_dialog.submit_button"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent data-ocid="teacher.delete_material_dialog">
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this material? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="teacher.delete_material_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget)
              }
              disabled={deleteMutation.isPending}
              data-ocid="teacher.delete_material_dialog.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Performance ────────────────────────────────────────────────
interface PerformanceTabProps {
  courses: Course[];
  students: StudentProfile[];
  teacherId: bigint;
  actor: ReturnType<typeof useBackend>["actor"];
}

function PerformanceTab({ courses, students, actor }: PerformanceTabProps) {
  const queryClient = useQueryClient();
  const [selStudentId, setSelStudentId] = useState<string>("");
  const [selCourseId, setSelCourseId] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    examType: "",
    marks: "",
    maxMarks: "",
    remarks: "",
  });

  const studentId = selStudentId ? BigInt(selStudentId) : null;
  const courseId = selCourseId ? BigInt(selCourseId) : null;

  const { data: marks = [], isLoading } = useQuery<Mark[]>({
    queryKey: ["marks-student", selStudentId, selCourseId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      const all = await actor.listMarksByStudent(studentId);
      return courseId ? all.filter((m) => m.courseId === courseId) : all;
    },
    enabled: !!actor && !!studentId,
  });

  const addMarkMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.recordMark({
        studentId: BigInt(form.studentId),
        courseId: BigInt(form.courseId),
        examType: form.examType,
        marks: BigInt(form.marks),
        maxMarks: BigInt(form.maxMarks),
        remarks: form.remarks,
        date: BigInt(Date.now()) * BigInt(1_000_000),
      });
    },
    onSuccess: () => {
      toast.success("Mark recorded");
      setAddOpen(false);
      setForm({
        studentId: "",
        courseId: "",
        examType: "",
        marks: "",
        maxMarks: "",
        remarks: "",
      });
      queryClient.invalidateQueries({ queryKey: ["marks-student"] });
    },
    onError: () => toast.error("Failed to record mark"),
  });

  const courseName = (id: bigint) =>
    courses.find((c) => c.id === id)?.name ?? `Course #${id}`;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Select value={selStudentId} onValueChange={setSelStudentId}>
            <SelectTrigger
              className="w-52"
              data-ocid="teacher.performance.student_select"
            >
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={`perf-s-${s.id}`} value={`${s.id}`}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selCourseId} onValueChange={setSelCourseId}>
            <SelectTrigger
              className="w-52"
              data-ocid="teacher.performance.course_select"
            >
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={`perf-c-${c.id}`} value={`${c.id}`}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          data-ocid="teacher.performance.add_mark_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Mark
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <PageSkeleton />
            </div>
          ) : !selStudentId ? (
            <div
              className="py-16 text-center text-muted-foreground text-sm"
              data-ocid="teacher.performance.empty_state"
            >
              Select a student to view performance.
            </div>
          ) : marks.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground text-sm"
              data-ocid="teacher.performance.empty_state"
            >
              No marks recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Course
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Exam Type
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Marks
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Max
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                      %
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m, idx) => (
                    <tr
                      key={`mark-${m.id}`}
                      className="border-t hover:bg-muted/20"
                      data-ocid={`teacher.mark_row.${idx + 1}`}
                    >
                      <td className="px-4 py-3">{courseName(m.courseId)}</td>
                      <td className="px-4 py-3 capitalize">{m.examType}</td>
                      <td className="px-4 py-3 text-right font-mono">{`${m.marks}`}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{`${m.maxMarks}`}</td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${gradeColor(m.marks, m.maxMarks)}`}
                      >
                        {pct(m.marks, m.maxMarks)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tsToDateStr(m.date)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">
                        {m.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add mark dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md" data-ocid="teacher.add_mark_dialog">
          <DialogHeader>
            <DialogTitle>Add Mark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, studentId: v }))
                  }
                >
                  <SelectTrigger data-ocid="teacher.add_mark.student_select">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={`am-s-${s.id}`} value={`${s.id}`}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Course</Label>
                <Select
                  value={form.courseId}
                  onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                >
                  <SelectTrigger data-ocid="teacher.add_mark.course_select">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={`am-c-${c.id}`} value={`${c.id}`}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Exam Type</Label>
              <Input
                placeholder="e.g. Midterm, Quiz 1, Final"
                value={form.examType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, examType: e.target.value }))
                }
                data-ocid="teacher.add_mark.exam_type_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Marks</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.marks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, marks: e.target.value }))
                  }
                  data-ocid="teacher.add_mark.marks_input"
                />
              </div>
              <div className="space-y-1">
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={form.maxMarks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxMarks: e.target.value }))
                  }
                  data-ocid="teacher.add_mark.max_marks_input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Remarks</Label>
              <Input
                placeholder="Optional remarks"
                value={form.remarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                data-ocid="teacher.add_mark.remarks_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="teacher.add_mark_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addMarkMutation.mutate()}
              disabled={
                !form.studentId ||
                !form.courseId ||
                !form.examType ||
                !form.marks ||
                !form.maxMarks ||
                addMarkMutation.isPending
              }
              data-ocid="teacher.add_mark_dialog.submit_button"
            >
              {addMarkMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Mark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Schedule ───────────────────────────────────────────────────
interface ScheduleTabProps {
  courses: Course[];
  teacherId: bigint;
  actor: ReturnType<typeof useBackend>["actor"];
}

function ScheduleTab({ courses, teacherId, actor }: ScheduleTabProps) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<bigint | null>(null);
  const [form, setForm] = useState({
    courseId: "",
    date: "",
    time: "09:00",
    duration: "60",
    topic: "",
  });

  const { data: sessions = [], isLoading } = useQuery<ClassSession[]>({
    queryKey: ["sessions-teacher", `${teacherId}`],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSessionsByTeacher(teacherId);
    },
    enabled: !!actor,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !form.courseId || !form.date) return;
      return actor.createSession({
        courseId: BigInt(form.courseId),
        date: dateToTimestamp(form.date),
        time: form.time,
        duration: BigInt(form.duration),
        topic: form.topic,
      });
    },
    onSuccess: () => {
      toast.success("Session scheduled");
      setAddOpen(false);
      setForm({
        courseId: "",
        date: "",
        time: "09:00",
        duration: "60",
        topic: "",
      });
      queryClient.invalidateQueries({ queryKey: ["sessions-teacher"] });
    },
    onError: () => toast.error("Failed to schedule session"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      await actor.cancelSession(id);
    },
    onSuccess: () => {
      toast.success("Session cancelled");
      setCancelTarget(null);
      queryClient.invalidateQueries({ queryKey: ["sessions-teacher"] });
    },
    onError: () => toast.error("Failed to cancel session"),
  });

  const courseName = (id: bigint) =>
    courses.find((c) => c.id === id)?.name ?? `Course #${id}`;

  // Group sessions by date string
  const grouped = useMemo(() => {
    const map: Record<string, ClassSession[]> = {};
    for (const s of sessions) {
      const d = tsToDateStr(s.date);
      if (!map[d]) map[d] = [];
      map[d].push(s);
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessions]);

  const now = Date.now();
  const upcoming = sessions.filter((s) => {
    const ms = Number(s.date) / 1_000_000;
    return ms >= now && s.status !== "cancelled";
  }).length;
  const past = sessions.filter((s) => {
    const ms = Number(s.date) / 1_000_000;
    return ms < now;
  }).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Upcoming",
            value: upcoming,
            icon: Calendar,
            color: "text-primary",
          },
          {
            label: "Past",
            value: past,
            icon: Clock,
            color: "text-muted-foreground",
          },
          {
            label: "Total",
            value: sessions.length,
            icon: CalendarDays,
            color: "text-[oklch(var(--chart-3))]",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={`sched-stat-${label}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setAddOpen(true)}
          data-ocid="teacher.schedule.add_session_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      {isLoading && <PageSkeleton />}

      {!isLoading && sessions.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
          data-ocid="teacher.schedule.empty_state"
        >
          <Calendar className="w-12 h-12 opacity-40" />
          <p className="text-sm">No sessions scheduled yet.</p>
        </div>
      )}

      {/* Timeline grouped by date */}
      <div className="space-y-6">
        {grouped.map(([date, daySessions]) => (
          <div key={`day-${date}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {date}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3 pl-2 border-l-2 border-border ml-4">
              {daySessions.map((s, idx) => (
                <div
                  key={`session-${s.id}`}
                  className="relative ml-4 pl-4 py-3 pr-3 rounded-xl border bg-card hover:border-primary/30 transition-smooth"
                  data-ocid={`teacher.session_item.${idx + 1}`}
                >
                  <div
                    className="absolute -left-[1.1rem] top-4 w-3 h-3 rounded-full border-2 bg-background"
                    style={{
                      borderColor:
                        s.status === "completed"
                          ? "oklch(var(--chart-1))"
                          : s.status === "cancelled"
                            ? "oklch(var(--destructive))"
                            : "oklch(var(--primary))",
                    }}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {s.topic || "No topic"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sessionStatusColor(s.status)}`}
                        >
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {courseName(s.courseId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.time} · {`${s.duration}`} min
                        </span>
                      </div>
                    </div>
                    {s.status === "upcoming" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => setCancelTarget(s.id)}
                        data-ocid={`teacher.session_cancel.${idx + 1}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add session dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="max-w-md"
          data-ocid="teacher.add_session_dialog"
        >
          <DialogHeader>
            <DialogTitle>Schedule a Class Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Course</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
              >
                <SelectTrigger data-ocid="teacher.add_session.course_select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={`sess-c-${c.id}`} value={`${c.id}`}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="teacher.add_session.date_input"
                />
              </div>
              <div className="space-y-1">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  data-ocid="teacher.add_session.time_input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min="15"
                step="15"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
                data-ocid="teacher.add_session.duration_input"
              />
            </div>
            <div className="space-y-1">
              <Label>Topic</Label>
              <Input
                placeholder="e.g. Introduction to Calculus"
                value={form.topic}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topic: e.target.value }))
                }
                data-ocid="teacher.add_session.topic_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="teacher.add_session_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                !form.courseId || !form.date || createMutation.isPending
              }
              data-ocid="teacher.add_session_dialog.submit_button"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent data-ocid="teacher.cancel_session_dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Cancel Session
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this session? Students will be
            notified.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
              data-ocid="teacher.cancel_session_dialog.cancel_button"
            >
              Keep Session
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                cancelTarget && cancelMutation.mutate(cancelTarget)
              }
              disabled={cancelMutation.isPending}
              data-ocid="teacher.cancel_session_dialog.confirm_button"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────
export default function TeacherPage() {
  const { actor, isFetching } = useBackend();
  const [activeTab, setActiveTab] = useState("classes");

  const { data: teacherProfile, isLoading: profileLoading } =
    useQuery<TeacherProfile | null>({
      queryKey: ["my-teacher-profile"],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getMyTeacherProfile();
      },
      enabled: !!actor && !isFetching,
    });

  const teacherId = teacherProfile?.id ?? 0n;

  const { data: allCourses = [], isLoading: coursesLoading } = useQuery<
    Course[]
  >({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCourses();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: allStudents = [], isLoading: studentsLoading } = useQuery<
    StudentProfile[]
  >({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: allBatches = [], isLoading: batchesLoading } = useQuery<
    { id: bigint; name: string }[]
  >({
    queryKey: ["batches"],
    queryFn: async () => {
      if (!actor) return [];
      const batches = await actor.listBatches();
      return batches.map((b) => ({ id: b.id, name: b.name }));
    },
    enabled: !!actor && !isFetching,
  });

  // Filter courses by teacher
  const myCourses = useMemo(() => {
    if (!teacherProfile) return allCourses;
    return allCourses.filter((c) => c.teacherId === teacherProfile.id);
  }, [allCourses, teacherProfile]);

  const isLoadingBase =
    profileLoading || coursesLoading || studentsLoading || batchesLoading;

  return (
    <div className="space-y-6" data-ocid="teacher.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            {profileLoading
              ? "Teacher Panel"
              : teacherProfile
                ? `Welcome, ${teacherProfile.name}`
                : "Teacher Panel"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage attendance, materials, performance and schedule
          </p>
        </div>
        {teacherProfile && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-card border">
            <TrendingUp className="w-4 h-4 text-[oklch(var(--chart-3))]" />
            <div>
              <p className="text-xs text-muted-foreground">Courses</p>
              <p className="text-sm font-semibold">{myCourses.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full sm:w-auto" data-ocid="teacher.tabs">
          <TabsTrigger
            value="classes"
            data-ocid="teacher.tab.classes"
            className="flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" /> My Classes
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            data-ocid="teacher.tab.attendance"
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Attendance
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            data-ocid="teacher.tab.materials"
            className="flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Materials
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            data-ocid="teacher.tab.performance"
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Performance
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            data-ocid="teacher.tab.schedule"
            className="flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="classes">
            <MyClassesTab
              courses={myCourses}
              students={allStudents}
              batches={allBatches}
              isLoading={isLoadingBase}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab
              courses={myCourses}
              students={allStudents}
              actor={actor}
            />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsTab courses={myCourses} actor={actor} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab
              courses={myCourses}
              students={allStudents}
              teacherId={teacherId}
              actor={actor}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab
              courses={myCourses}
              teacherId={teacherId}
              actor={actor}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
