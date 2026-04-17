import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/attendance";
import TeacherTypes "../types/teachers";
import Lib "../lib/attendance";
import TeacherLib "../lib/teachers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
  teachers : Map.Map<Common.TeacherId, TeacherTypes.TeacherProfile>,
  nextAttendanceId : Common.Counter,
) {
  // Teacher: record attendance for a student
  public shared ({ caller }) func recordAttendance(args : T.CreateAttendanceArgs) : async T.AttendanceRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // Resolve teacher id from caller principal, or use 0 if admin seeding
    let teacherId : Common.TeacherId = switch (TeacherLib.getTeacherByPrincipal(teachers, caller)) {
      case (?t) { t.id };
      case null {
        if (AccessControl.isAdmin(accessControlState, caller)) { 0 }
        else { Runtime.trap("Caller is not a registered teacher") }
      };
    };
    let record = Lib.recordAttendance(attendance, nextAttendanceId.value, teacherId, args);
    nextAttendanceId.value += 1;
    record;
  };

  // Any authenticated: list attendance for a student
  public query ({ caller }) func listAttendanceByStudent(studentId : Common.StudentId) : async [T.AttendanceRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listAttendanceByStudent(attendance, studentId);
  };

  // Teacher/Admin: list attendance for a course
  public query ({ caller }) func listAttendanceByCourse(courseId : Common.CourseId) : async [T.AttendanceRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listAttendanceByCourse(attendance, courseId);
  };

  // Teacher/Admin: list attendance for a course on a specific date
  public query ({ caller }) func listAttendanceByDate(courseId : Common.CourseId, date : Common.Timestamp) : async [T.AttendanceRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listAttendanceByDate(attendance, courseId, date);
  };

  // Any authenticated: get attendance rate for a student in a course (0–100)
  public query ({ caller }) func getAttendanceRate(studentId : Common.StudentId, courseId : Common.CourseId) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.calculateAttendanceRate(attendance, studentId, courseId);
  };
};
