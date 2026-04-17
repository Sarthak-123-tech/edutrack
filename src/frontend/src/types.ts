// ──────────────────────────────────────────────────────────────
//  Domain types — mirror the Motoko backend models
// ──────────────────────────────────────────────────────────────

export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  principal: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// Students ──────────────────────────────────────────────────────
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: string[];
  batchId: string;
  joinDate: string;
  status: "active" | "inactive";
}

// Teachers ──────────────────────────────────────────────────────
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  joinDate: string;
  status: "active" | "inactive";
}

// Courses & Batches ─────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  fee: number;
  duration: string;
  subject: string;
  status: "active" | "inactive";
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  schedule: string;
}

// Attendance ────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  date: string;
  status: "present" | "absent" | "late";
  markedBy: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

// Fees ──────────────────────────────────────────────────────────
export type FeeStatus = "paid" | "unpaid" | "partial" | "overdue";

export interface FeeTransaction {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  month: string;
  year: number;
}

// Marks & Performance ───────────────────────────────────────────
export interface Mark {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  examType: "quiz" | "midterm" | "final" | "assignment";
  score: number;
  maxScore: number;
  date: string;
  grade: string;
}

export interface PerformanceSummary {
  studentId: string;
  courseId: string;
  courseName: string;
  averageScore: number;
  grade: string;
  rank?: number;
}

// Study Materials ───────────────────────────────────────────────
export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  uploadedBy: string;
  uploadDate: string;
  fileType: "pdf" | "doc" | "video" | "image" | "other";
  fileUrl: string;
  size: string;
}

// Class Sessions ────────────────────────────────────────────────
export interface ClassSession {
  id: string;
  courseId: string;
  courseName: string;
  batchId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
  location: string;
}

// Dashboard Analytics ───────────────────────────────────────────
export interface DashboardAnalytics {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalBatches: number;
  monthlyRevenue: number;
  pendingFees: number;
  averageAttendance: number;
  newEnrollmentsThisMonth: number;
  revenueByMonth: { month: string; amount: number }[];
  enrollmentsBySubject: { subject: string; count: number }[];
  feeCollectionRate: number;
}
