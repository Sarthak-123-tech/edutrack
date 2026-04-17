import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import StudentTypes "../types/students";
import TeacherTypes "../types/teachers";
import CourseTypes "../types/courses";
import FeeTypes "../types/fees";
import AttendanceTypes "../types/attendance";
import PerformanceTypes "../types/performance";
import ScheduleTypes "../types/schedule";

// Seeding mixin — inserts demo data for all domains
mixin (
  accessControlState : AccessControl.AccessControlState,
  students : Map.Map<Common.StudentId, StudentTypes.StudentProfile>,
  teachers : Map.Map<Common.TeacherId, TeacherTypes.TeacherProfile>,
  courses : Map.Map<Common.CourseId, CourseTypes.Course>,
  batches : Map.Map<Common.BatchId, CourseTypes.Batch>,
  fees : Map.Map<Common.FeeId, FeeTypes.FeeTransaction>,
  attendance : Map.Map<Common.AttendanceId, AttendanceTypes.AttendanceRecord>,
  marks : Map.Map<Common.MarkId, PerformanceTypes.Mark>,
  sessions : Map.Map<Common.ScheduleId, ScheduleTypes.ClassSession>,
  nextStudentId : Common.Counter,
  nextTeacherId : Common.Counter,
  nextCourseId : Common.Counter,
  nextBatchId : Common.Counter,
  nextFeeId : Common.Counter,
  nextAttendanceId : Common.Counter,
  nextMarkId : Common.Counter,
  nextSessionId : Common.Counter,
) {
  // Admin: seed demo data (idempotent — skips if data already present)
  public shared ({ caller }) func seedDemoData() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed demo data");
    };
    // Idempotent: skip if already seeded
    if (students.size() > 0) {
      return "Demo data already seeded. Skipping.";
    };

    // ── Reference timestamp ───────────────────────────────────────────────
    let now = Time.now();
    // Approximate nanosecond offsets for relative timestamps
    let day : Int = 86_400_000_000_000;
    let month : Int = 30 * day;

    // ── 3 Batches ─────────────────────────────────────────────────────────
    let batch1 : CourseTypes.Batch = {
      id = 1; name = "Batch Alpha 2024"; year = 2024; courses = [1, 2]; createdAt = now - (6 * month);
    };
    let batch2 : CourseTypes.Batch = {
      id = 2; name = "Batch Beta 2024"; year = 2024; courses = [3]; createdAt = now - (5 * month);
    };
    let batch3 : CourseTypes.Batch = {
      id = 3; name = "Batch Gamma 2025"; year = 2025; courses = [4]; createdAt = now - (2 * month);
    };
    batches.add(1, batch1);
    batches.add(2, batch2);
    batches.add(3, batch3);
    nextBatchId.value += 3;

    // ── 3 Teachers ────────────────────────────────────────────────────────
    let anonPrincipal = Principal.anonymous();
    let teacher1 : TeacherTypes.TeacherProfile = {
      id = 1; principal = anonPrincipal;
      name = "Dr. Priya Sharma"; email = "priya.sharma@edutrack.in";
      subjects = ["Mathematics", "Physics"]; qualification = "PhD Mathematics";
      isActive = true; joinedDate = now - (12 * month);
    };
    let teacher2 : TeacherTypes.TeacherProfile = {
      id = 2; principal = anonPrincipal;
      name = "Mr. Rajan Verma"; email = "rajan.verma@edutrack.in";
      subjects = ["Chemistry", "Biology"]; qualification = "MSc Chemistry";
      isActive = true; joinedDate = now - (8 * month);
    };
    let teacher3 : TeacherTypes.TeacherProfile = {
      id = 3; principal = anonPrincipal;
      name = "Ms. Anita Nair"; email = "anita.nair@edutrack.in";
      subjects = ["English", "History"]; qualification = "MA English Literature";
      isActive = true; joinedDate = now - (4 * month);
    };
    teachers.add(1, teacher1);
    teachers.add(2, teacher2);
    teachers.add(3, teacher3);
    nextTeacherId.value += 3;

    // ── 4 Courses ─────────────────────────────────────────────────────────
    let course1 : CourseTypes.Course = {
      id = 1; name = "Advanced Mathematics"; description = "Calculus, linear algebra, and statistics";
      teacherId = 1; batch = 1; schedule = "Mon/Wed/Fri 09:00-10:00";
      isActive = true; createdAt = now - (6 * month);
    };
    let course2 : CourseTypes.Course = {
      id = 2; name = "Physics Fundamentals"; description = "Mechanics, optics, and electromagnetism";
      teacherId = 1; batch = 1; schedule = "Tue/Thu 10:00-11:30";
      isActive = true; createdAt = now - (6 * month);
    };
    let course3 : CourseTypes.Course = {
      id = 3; name = "Organic Chemistry"; description = "Reaction mechanisms, synthesis, and spectroscopy";
      teacherId = 2; batch = 2; schedule = "Mon/Wed 11:00-12:30";
      isActive = true; createdAt = now - (5 * month);
    };
    let course4 : CourseTypes.Course = {
      id = 4; name = "English Literature"; description = "Poetry, prose, and critical analysis";
      teacherId = 3; batch = 3; schedule = "Tue/Thu/Sat 08:00-09:00";
      isActive = true; createdAt = now - (2 * month);
    };
    courses.add(1, course1);
    courses.add(2, course2);
    courses.add(3, course3);
    courses.add(4, course4);
    nextCourseId.value += 4;

    // ── 8 Students ────────────────────────────────────────────────────────
    let student1 : StudentTypes.StudentProfile = {
      id = 1; principal = anonPrincipal;
      name = "Aarav Mehta"; email = "aarav.mehta@student.in";
      enrolledCourses = [1, 2]; batch = 1;
      joiningDate = now - (6 * month); isActive = true;
    };
    let student2 : StudentTypes.StudentProfile = {
      id = 2; principal = anonPrincipal;
      name = "Diya Patel"; email = "diya.patel@student.in";
      enrolledCourses = [1, 2]; batch = 1;
      joiningDate = now - (6 * month); isActive = true;
    };
    let student3 : StudentTypes.StudentProfile = {
      id = 3; principal = anonPrincipal;
      name = "Rohan Gupta"; email = "rohan.gupta@student.in";
      enrolledCourses = [1, 2]; batch = 1;
      joiningDate = now - (5 * month); isActive = true;
    };
    let student4 : StudentTypes.StudentProfile = {
      id = 4; principal = anonPrincipal;
      name = "Sneha Iyer"; email = "sneha.iyer@student.in";
      enrolledCourses = [3]; batch = 2;
      joiningDate = now - (5 * month); isActive = true;
    };
    let student5 : StudentTypes.StudentProfile = {
      id = 5; principal = anonPrincipal;
      name = "Arjun Singh"; email = "arjun.singh@student.in";
      enrolledCourses = [3]; batch = 2;
      joiningDate = now - (4 * month); isActive = true;
    };
    let student6 : StudentTypes.StudentProfile = {
      id = 6; principal = anonPrincipal;
      name = "Kavya Reddy"; email = "kavya.reddy@student.in";
      enrolledCourses = [3]; batch = 2;
      joiningDate = now - (4 * month); isActive = true;
    };
    let student7 : StudentTypes.StudentProfile = {
      id = 7; principal = anonPrincipal;
      name = "Vikram Sharma"; email = "vikram.sharma@student.in";
      enrolledCourses = [4]; batch = 3;
      joiningDate = now - (2 * month); isActive = true;
    };
    let student8 : StudentTypes.StudentProfile = {
      id = 8; principal = anonPrincipal;
      name = "Priya Nair"; email = "priya.nair@student.in";
      enrolledCourses = [4]; batch = 3;
      joiningDate = now - (2 * month); isActive = false;
    };
    students.add(1, student1);
    students.add(2, student2);
    students.add(3, student3);
    students.add(4, student4);
    students.add(5, student5);
    students.add(6, student6);
    students.add(7, student7);
    students.add(8, student8);
    nextStudentId.value += 8;

    // ── Fee records (one per student, mix of paid/unpaid) ─────────────────
    // Students 1–5: paid; Students 6–8: unpaid
    let feeData : [(Common.StudentId, Nat, FeeTypes.FeeStatus, FeeTypes.FeeType)] = [
      (1, 5000, #paid, #monthly),
      (2, 5000, #paid, #monthly),
      (3, 5000, #paid, #monthly),
      (4, 4500, #paid, #monthly),
      (5, 4500, #paid, #monthly),
      (6, 4500, #unpaid, #monthly),
      (7, 3500, #unpaid, #quarterly),
      (8, 3500, #partial, #quarterly),
    ];
    var feeIdx = 1;
    for ((sid, amt, status, fType) in feeData.values()) {
      let paidDate : ?Common.Timestamp = switch (status) {
        case (#paid) { ?(now - (10 * day)) };
        case (_) { null };
      };
      let fee : FeeTypes.FeeTransaction = {
        id = feeIdx;
        studentId = sid;
        amount = amt;
        dueDate = now - (5 * day);
        paidDate = paidDate;
        status = status;
        feeType = fType;
        notes = if (status == #paid) { "Fee paid on time" } else { "Payment pending" };
        createdAt = now - month;
      };
      fees.add(feeIdx, fee);
      feeIdx += 1;
    };
    nextFeeId.value += 8;

    // ── Attendance records (3 students × 2 courses, multiple dates) ────────
    // For students 1–3 in courses 1 and 2
    let attData : [(Common.StudentId, Common.CourseId, AttendanceTypes.AttendanceStatus, Common.TeacherId)] = [
      // Student 1, Course 1
      (1, 1, #present, 1), (1, 1, #present, 1), (1, 1, #late, 1), (1, 1, #present, 1),
      // Student 2, Course 1
      (2, 1, #present, 1), (2, 1, #absent, 1), (2, 1, #present, 1), (2, 1, #present, 1),
      // Student 3, Course 1
      (3, 1, #present, 1), (3, 1, #present, 1), (3, 1, #absent, 1), (3, 1, #late, 1),
      // Student 1, Course 2
      (1, 2, #present, 1), (1, 2, #present, 1), (1, 2, #present, 1),
      // Student 4, Course 3
      (4, 3, #present, 2), (4, 3, #late, 2), (4, 3, #present, 2),
      // Student 5, Course 3
      (5, 3, #absent, 2), (5, 3, #present, 2), (5, 3, #present, 2),
      // Student 7, Course 4
      (7, 4, #present, 3), (7, 4, #present, 3),
    ];
    var attIdx = 1;
    var dateOffset : Int = 0;
    for ((sid, cid, status, tid) in attData.values()) {
      dateOffset += day;
      let rec : AttendanceTypes.AttendanceRecord = {
        id = attIdx;
        studentId = sid;
        courseId = cid;
        date = now - (20 * day) + dateOffset;
        status = status;
        markedBy = tid;
        notes = "";
      };
      attendance.add(attIdx, rec);
      attIdx += 1;
    };
    nextAttendanceId.value += attIdx - 1;

    // ── Marks (students in their courses) ─────────────────────────────────
    let markData : [(Common.StudentId, Common.CourseId, Text, Nat, Nat, Common.TeacherId)] = [
      (1, 1, "midterm", 78, 100, 1),
      (1, 1, "quiz1",   18,  20, 1),
      (1, 1, "final",   85, 100, 1),
      (2, 1, "midterm", 65, 100, 1),
      (2, 1, "quiz1",   14,  20, 1),
      (2, 1, "final",   70, 100, 1),
      (3, 1, "midterm", 90, 100, 1),
      (3, 1, "final",   88, 100, 1),
      (1, 2, "midterm", 72, 100, 1),
      (1, 2, "final",   80, 100, 1),
      (4, 3, "midterm", 60, 100, 2),
      (4, 3, "final",   74, 100, 2),
      (5, 3, "midterm", 55, 100, 2),
      (5, 3, "final",   63, 100, 2),
      (7, 4, "midterm", 82, 100, 3),
    ];
    var markIdx = 1;
    for ((sid, cid, examType, m, maxM, tid) in markData.values()) {
      let mark : PerformanceTypes.Mark = {
        id = markIdx;
        studentId = sid;
        courseId = cid;
        examType = examType;
        marks = m;
        maxMarks = maxM;
        date = now - (15 * day);
        remarks = if (m >= 80) { "Excellent" } else if (m >= 60) { "Good" } else { "Needs improvement" };
        recordedBy = tid;
      };
      marks.add(markIdx, mark);
      markIdx += 1;
    };
    nextMarkId.value += markIdx - 1;

    // ── Class sessions ────────────────────────────────────────────────────
    let sessionData : [(Common.CourseId, Common.TeacherId, Text, Text, Nat)] = [
      (1, 1, "09:00", "Introduction to Calculus",          60),
      (1, 1, "09:00", "Derivatives and Applications",       60),
      (1, 1, "09:00", "Integration Techniques",             60),
      (2, 1, "10:00", "Newton's Laws of Motion",            90),
      (2, 1, "10:00", "Optics: Reflection and Refraction",  90),
      (3, 2, "11:00", "Alkanes and Alkenes",                90),
      (3, 2, "11:00", "Aromatic Compounds",                 90),
      (4, 3, "08:00", "Poetry Analysis: Keats",             60),
      (4, 3, "08:00", "Prose: Short Story Techniques",      60),
    ];
    var sessIdx = 1;
    var sessDateOffset : Int = day;
    for ((cid, tid, time, topic, dur) in sessionData.values()) {
      let status : ScheduleTypes.ClassStatus = if (sessIdx <= 5) { #completed } else { #upcoming };
      let session : ScheduleTypes.ClassSession = {
        id = sessIdx;
        courseId = cid;
        teacherId = tid;
        date = now - (10 * day) + sessDateOffset;
        time = time;
        duration = dur;
        topic = topic;
        status = status;
        createdAt = now - (12 * day);
      };
      sessions.add(sessIdx, session);
      sessIdx += 1;
      sessDateOffset += day;
    };
    nextSessionId.value += sessIdx - 1;

    let attCount : Nat = attIdx - 1;
    let markCount : Nat = markIdx - 1;
    let sessCount : Nat = sessIdx - 1;
    "Demo data seeded successfully: 3 batches, 4 courses, 3 teachers, 8 students, 8 fees, " #
    attCount.toText() # " attendance records, " #
    markCount.toText() # " marks, " #
    sessCount.toText() # " sessions.";
  };
};
