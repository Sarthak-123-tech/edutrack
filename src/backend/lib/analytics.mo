import Map "mo:core/Map";
import Common "../types/common";
import AnalyticsTypes "../types/analytics";
import StudentTypes "../types/students";
import TeacherTypes "../types/teachers";
import CourseTypes "../types/courses";
import FeeTypes "../types/fees";
import AttendanceTypes "../types/attendance";
import MaterialTypes "../types/materials";
import FeeLib "fees";
import AttendanceLib "attendance";

module {
  public func getDashboard(
    students : Map.Map<Common.StudentId, StudentTypes.StudentProfile>,
    teachers : Map.Map<Common.TeacherId, TeacherTypes.TeacherProfile>,
    courses : Map.Map<Common.CourseId, CourseTypes.Course>,
    batches : Map.Map<Common.BatchId, CourseTypes.Batch>,
    fees : Map.Map<Common.FeeId, FeeTypes.FeeTransaction>,
    attendance : Map.Map<Common.AttendanceId, AttendanceTypes.AttendanceRecord>,
    materials : Map.Map<Common.MaterialId, MaterialTypes.StudyMaterial>,
  ) : AnalyticsTypes.DashboardAnalytics {
    let totalStudents = students.size();
    let activeStudents = students.values().filter(func(s) { s.isActive }).size();
    let totalTeachers = teachers.size();
    let activeCourses = courses.values().filter(func(c) { c.isActive }).size();
    let totalBatches = batches.size();
    let totalMaterials = materials.size();
    let feeCollectionRate = FeeLib.calculateCollectionRate(fees);
    let averageAttendance = AttendanceLib.calculateGlobalAverageAttendance(attendance);

    {
      totalStudents = totalStudents;
      activeStudents = activeStudents;
      totalTeachers = totalTeachers;
      activeCourses = activeCourses;
      totalBatches = totalBatches;
      feeCollectionRate = feeCollectionRate;
      averageAttendance = averageAttendance;
      totalMaterials = totalMaterials;
    };
  };
};
