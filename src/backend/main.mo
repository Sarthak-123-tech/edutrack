import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";

import Common "types/common";
import StudentTypes "types/students";
import TeacherTypes "types/teachers";
import CourseTypes "types/courses";
import FeeTypes "types/fees";
import AttendanceTypes "types/attendance";
import MaterialTypes "types/materials";
import PerformanceTypes "types/performance";
import ScheduleTypes "types/schedule";

import StudentsMixin "mixins/students-api";
import TeachersMixin "mixins/teachers-api";
import CoursesMixin "mixins/courses-api";
import FeesMixin "mixins/fees-api";
import AttendanceMixin "mixins/attendance-api";
import MaterialsMixin "mixins/materials-api";
import PerformanceMixin "mixins/performance-api";
import ScheduleMixin "mixins/schedule-api";
import AnalyticsMixin "mixins/analytics-api";
import SeedMixin "mixins/seed-api";

actor {
  // ── Authorization ────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Object Storage ───────────────────────────────────────────────────
  include MixinObjectStorage();

  // ── ID counters ──────────────────────────────────────────────────────
  let nextStudentId : Common.Counter = { var value = 1 };
  let nextTeacherId : Common.Counter = { var value = 1 };
  let nextCourseId : Common.Counter = { var value = 1 };
  let nextBatchId : Common.Counter = { var value = 1 };
  let nextFeeId : Common.Counter = { var value = 1 };
  let nextAttendanceId : Common.Counter = { var value = 1 };
  let nextMaterialId : Common.Counter = { var value = 1 };
  let nextMarkId : Common.Counter = { var value = 1 };
  let nextSessionId : Common.Counter = { var value = 1 };

  // ── Domain state ─────────────────────────────────────────────────────
  let students = Map.empty<Common.StudentId, StudentTypes.StudentProfile>();
  let teachers = Map.empty<Common.TeacherId, TeacherTypes.TeacherProfile>();
  let courses = Map.empty<Common.CourseId, CourseTypes.Course>();
  let batches = Map.empty<Common.BatchId, CourseTypes.Batch>();
  let fees = Map.empty<Common.FeeId, FeeTypes.FeeTransaction>();
  let attendance = Map.empty<Common.AttendanceId, AttendanceTypes.AttendanceRecord>();
  let materials = Map.empty<Common.MaterialId, MaterialTypes.StudyMaterial>();
  let marks = Map.empty<Common.MarkId, PerformanceTypes.Mark>();
  let sessions = Map.empty<Common.ScheduleId, ScheduleTypes.ClassSession>();

  // ── Mixins ────────────────────────────────────────────────────────────
  include StudentsMixin(accessControlState, students, nextStudentId);
  include TeachersMixin(accessControlState, teachers, nextTeacherId);
  include CoursesMixin(accessControlState, courses, batches, nextCourseId, nextBatchId);
  include FeesMixin(accessControlState, fees, nextFeeId);
  include AttendanceMixin(accessControlState, attendance, teachers, nextAttendanceId);
  include MaterialsMixin(accessControlState, materials, teachers, nextMaterialId);
  include PerformanceMixin(accessControlState, marks, nextMarkId);
  include ScheduleMixin(accessControlState, sessions, nextSessionId);
  include AnalyticsMixin(accessControlState, students, teachers, courses, batches, fees, attendance, materials);
  include SeedMixin(
    accessControlState,
    students, teachers, courses, batches,
    fees, attendance, marks, sessions,
    nextStudentId, nextTeacherId, nextCourseId, nextBatchId,
    nextFeeId, nextAttendanceId, nextMarkId, nextSessionId,
  );
};
