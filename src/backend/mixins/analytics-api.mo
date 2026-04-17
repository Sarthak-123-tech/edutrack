import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import AnalyticsTypes "../types/analytics";
import StudentTypes "../types/students";
import TeacherTypes "../types/teachers";
import CourseTypes "../types/courses";
import FeeTypes "../types/fees";
import AttendanceTypes "../types/attendance";
import MaterialTypes "../types/materials";
import Lib "../lib/analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  students : Map.Map<Common.StudentId, StudentTypes.StudentProfile>,
  teachers : Map.Map<Common.TeacherId, TeacherTypes.TeacherProfile>,
  courses : Map.Map<Common.CourseId, CourseTypes.Course>,
  batches : Map.Map<Common.BatchId, CourseTypes.Batch>,
  fees : Map.Map<Common.FeeId, FeeTypes.FeeTransaction>,
  attendance : Map.Map<Common.AttendanceId, AttendanceTypes.AttendanceRecord>,
  materials : Map.Map<Common.MaterialId, MaterialTypes.StudyMaterial>,
) {
  // Admin: get dashboard analytics
  public query ({ caller }) func getDashboardAnalytics() : async AnalyticsTypes.DashboardAnalytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard analytics");
    };
    Lib.getDashboard(students, teachers, courses, batches, fees, attendance, materials);
  };
};
