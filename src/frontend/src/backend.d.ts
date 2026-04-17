import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export interface CreateMaterialArgs {
    title: string;
    fileBlob: ExternalBlob;
    description: string;
    fileName: string;
    courseId: CourseId;
    materialType: MaterialType;
}
export interface CreateBatchArgs {
    name: string;
    year: bigint;
}
export interface CreateFeeArgs {
    studentId: StudentId;
    feeType: FeeType;
    dueDate: Timestamp;
    notes: string;
    amount: bigint;
}
export interface FeeTransaction {
    id: FeeId;
    status: FeeStatus;
    studentId: StudentId;
    createdAt: Timestamp;
    feeType: FeeType;
    dueDate: Timestamp;
    paidDate?: Timestamp;
    notes: string;
    amount: bigint;
}
export type AttendanceId = bigint;
export interface UpdateTeacherArgs {
    subjects: Array<string>;
    name: string;
    isActive: boolean;
    email: string;
    qualification: string;
}
export type BatchId = bigint;
export interface Course {
    id: CourseId;
    name: string;
    createdAt: Timestamp;
    description: string;
    isActive: boolean;
    teacherId: TeacherId;
    batch: BatchId;
    schedule: string;
}
export type MarkId = bigint;
export type FeeId = bigint;
export interface CreateSessionArgs {
    topic: string;
    duration: bigint;
    date: Timestamp;
    time: string;
    courseId: CourseId;
}
export interface StudyMaterial {
    id: MaterialId;
    title: string;
    fileBlob: ExternalBlob;
    description: string;
    fileName: string;
    courseId: CourseId;
    uploadDate: Timestamp;
    materialType: MaterialType;
    uploadedBy: TeacherId;
}
export interface Mark {
    id: MarkId;
    marks: bigint;
    studentId: StudentId;
    date: Timestamp;
    recordedBy: TeacherId;
    maxMarks: bigint;
    examType: string;
    courseId: CourseId;
    remarks: string;
}
export type CourseId = bigint;
export interface Batch {
    id: BatchId;
    courses: Array<CourseId>;
    name: string;
    createdAt: Timestamp;
    year: bigint;
}
export interface UpdateCourseArgs {
    name: string;
    description: string;
    isActive: boolean;
    teacherId: TeacherId;
    batch: BatchId;
    schedule: string;
}
export interface CreateAttendanceArgs {
    status: AttendanceStatus;
    studentId: StudentId;
    date: Timestamp;
    notes: string;
    courseId: CourseId;
}
export interface AttendanceRecord {
    id: AttendanceId;
    status: AttendanceStatus;
    studentId: StudentId;
    date: Timestamp;
    markedBy: TeacherId;
    notes: string;
    courseId: CourseId;
}
export interface DashboardAnalytics {
    averageAttendance: bigint;
    feeCollectionRate: bigint;
    activeStudents: bigint;
    totalStudents: bigint;
    totalBatches: bigint;
    totalMaterials: bigint;
    totalTeachers: bigint;
    activeCourses: bigint;
}
export interface UpdateFeeArgs {
    status: FeeStatus;
    feeType: FeeType;
    dueDate: Timestamp;
    paidDate?: Timestamp;
    notes: string;
    amount: bigint;
}
export interface StudentPerformanceSummary {
    marks: Array<MarkId>;
    studentId: StudentId;
    totalExams: bigint;
    averagePercentage: bigint;
    courseId: CourseId;
}
export interface CreateTeacherArgs {
    subjects: Array<string>;
    name: string;
    email: string;
    qualification: string;
}
export interface CreateMarkArgs {
    marks: bigint;
    studentId: StudentId;
    date: Timestamp;
    maxMarks: bigint;
    examType: string;
    courseId: CourseId;
    remarks: string;
}
export type StudentId = bigint;
export type TeacherId = bigint;
export interface TeacherProfile {
    id: TeacherId;
    principal: Principal;
    subjects: Array<string>;
    name: string;
    isActive: boolean;
    email: string;
    joinedDate: Timestamp;
    qualification: string;
}
export type MaterialId = bigint;
export interface StudentProfile {
    id: StudentId;
    principal: Principal;
    name: string;
    joiningDate: Timestamp;
    isActive: boolean;
    email: string;
    batch: BatchId;
    enrolledCourses: Array<CourseId>;
}
export type ScheduleId = bigint;
export interface CreateCourseArgs {
    name: string;
    description: string;
    teacherId: TeacherId;
    batch: BatchId;
    schedule: string;
}
export interface ClassSession {
    id: ScheduleId;
    status: ClassStatus;
    topic: string;
    duration: bigint;
    date: Timestamp;
    createdAt: Timestamp;
    time: string;
    teacherId: TeacherId;
    courseId: CourseId;
}
export interface UpdateSessionArgs {
    status: ClassStatus;
    topic: string;
    duration: bigint;
    date: Timestamp;
    time: string;
}
export interface UpdateStudentArgs {
    name: string;
    isActive: boolean;
    email: string;
    batch: BatchId;
}
export interface CreateStudentArgs {
    name: string;
    joiningDate: Timestamp;
    email: string;
    batch: BatchId;
}
export enum AttendanceStatus {
    present = "present",
    late = "late",
    absent = "absent"
}
export enum ClassStatus {
    upcoming = "upcoming",
    cancelled = "cancelled",
    completed = "completed"
}
export enum FeeStatus {
    paid = "paid",
    unpaid = "unpaid",
    partial = "partial"
}
export enum FeeType {
    annual = "annual",
    quarterly = "quarterly",
    monthly = "monthly"
}
export enum MaterialType {
    resource = "resource",
    assignment = "assignment",
    notes = "notes"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelSession(id: ScheduleId): Promise<void>;
    createBatch(args: CreateBatchArgs): Promise<Batch>;
    createCourse(args: CreateCourseArgs): Promise<Course>;
    createFee(args: CreateFeeArgs): Promise<FeeTransaction>;
    createSession(args: CreateSessionArgs): Promise<ClassSession>;
    createStudent(args: CreateStudentArgs): Promise<StudentProfile>;
    createTeacher(principal: Principal, args: CreateTeacherArgs): Promise<TeacherProfile>;
    deleteMaterial(id: MaterialId): Promise<void>;
    deleteStudent(id: StudentId): Promise<void>;
    deleteTeacher(id: TeacherId): Promise<void>;
    enrollStudentInCourse(studentId: StudentId, courseId: CourseId): Promise<void>;
    getAttendanceRate(studentId: StudentId, courseId: CourseId): Promise<bigint>;
    getBatch(id: BatchId): Promise<Batch | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(id: CourseId): Promise<Course | null>;
    getDashboardAnalytics(): Promise<DashboardAnalytics>;
    getFee(id: FeeId): Promise<FeeTransaction | null>;
    getFeeCollectionRate(): Promise<bigint>;
    getMaterial(id: MaterialId): Promise<StudyMaterial | null>;
    getMyStudentProfile(): Promise<StudentProfile | null>;
    getMyTeacherProfile(): Promise<TeacherProfile | null>;
    getPerformanceSummary(studentId: StudentId, courseId: CourseId): Promise<StudentPerformanceSummary>;
    getSession(id: ScheduleId): Promise<ClassSession | null>;
    getStudent(id: StudentId): Promise<StudentProfile | null>;
    getTeacher(id: TeacherId): Promise<TeacherProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAttendanceByCourse(courseId: CourseId): Promise<Array<AttendanceRecord>>;
    listAttendanceByDate(courseId: CourseId, date: Timestamp): Promise<Array<AttendanceRecord>>;
    listAttendanceByStudent(studentId: StudentId): Promise<Array<AttendanceRecord>>;
    listBatches(): Promise<Array<Batch>>;
    listCourses(): Promise<Array<Course>>;
    listCoursesByBatch(batchId: BatchId): Promise<Array<Course>>;
    listCoursesByTeacher(teacherId: TeacherId): Promise<Array<Course>>;
    listFees(): Promise<Array<FeeTransaction>>;
    listFeesByStudent(studentId: StudentId): Promise<Array<FeeTransaction>>;
    listMarksByCourse(courseId: CourseId): Promise<Array<Mark>>;
    listMarksByStudent(studentId: StudentId): Promise<Array<Mark>>;
    listMaterials(): Promise<Array<StudyMaterial>>;
    listMaterialsByCourse(courseId: CourseId): Promise<Array<StudyMaterial>>;
    listSessionsByCourse(courseId: CourseId): Promise<Array<ClassSession>>;
    listSessionsByTeacher(teacherId: TeacherId): Promise<Array<ClassSession>>;
    listStudents(): Promise<Array<StudentProfile>>;
    listTeachers(): Promise<Array<TeacherProfile>>;
    recordAttendance(args: CreateAttendanceArgs): Promise<AttendanceRecord>;
    recordMark(args: CreateMarkArgs): Promise<Mark>;
    seedDemoData(): Promise<string>;
    unenrollStudentFromCourse(studentId: StudentId, courseId: CourseId): Promise<void>;
    updateCourse(id: CourseId, args: UpdateCourseArgs): Promise<void>;
    updateFee(id: FeeId, args: UpdateFeeArgs): Promise<void>;
    updateSession(id: ScheduleId, args: UpdateSessionArgs): Promise<void>;
    updateStudent(id: StudentId, args: UpdateStudentArgs): Promise<void>;
    updateTeacher(id: TeacherId, args: UpdateTeacherArgs): Promise<void>;
    uploadMaterial(args: CreateMaterialArgs): Promise<StudyMaterial>;
}
