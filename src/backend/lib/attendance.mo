import Map "mo:core/Map";
import Common "../types/common";
import T "../types/attendance";

module {
  public func recordAttendance(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
    nextId : Nat,
    teacherId : Common.TeacherId,
    args : T.CreateAttendanceArgs,
  ) : T.AttendanceRecord {
    let record : T.AttendanceRecord = {
      id = nextId;
      studentId = args.studentId;
      courseId = args.courseId;
      date = args.date;
      status = args.status;
      markedBy = teacherId;
      notes = args.notes;
    };
    attendance.add(nextId, record);
    record;
  };

  public func getAttendance(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
    id : Common.AttendanceId,
  ) : ?T.AttendanceRecord {
    attendance.get(id);
  };

  public func listAttendanceByStudent(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
    studentId : Common.StudentId,
  ) : [T.AttendanceRecord] {
    attendance.values().filter(func(r) { r.studentId == studentId }).toArray();
  };

  public func listAttendanceByCourse(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
    courseId : Common.CourseId,
  ) : [T.AttendanceRecord] {
    attendance.values().filter(func(r) { r.courseId == courseId }).toArray();
  };

  public func listAttendanceByDate(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
    courseId : Common.CourseId,
    date : Common.Timestamp,
  ) : [T.AttendanceRecord] {
    // Match same day by comparing date values directly (seed data uses exact timestamps)
    attendance.values().filter(func(r) { r.courseId == courseId and r.date == date }).toArray();
  };

  // Returns percentage 0–100: (present + late) / total for a student in a course
  public func calculateAttendanceRate(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
    studentId : Common.StudentId,
    courseId : Common.CourseId,
  ) : Nat {
    let relevant = attendance.values().filter(func(r) {
      r.studentId == studentId and r.courseId == courseId
    });
    let total = relevant.size();
    if (total == 0) { return 0 };
    let present = attendance.values().filter(func(r) {
      r.studentId == studentId and r.courseId == courseId and
      (switch (r.status) { case (#present or #late) { true }; case (_) { false } })
    }).size();
    (present * 100) / total;
  };

  // Global average attendance across all records, returns 0–100
  public func calculateGlobalAverageAttendance(
    attendance : Map.Map<Common.AttendanceId, T.AttendanceRecord>,
  ) : Nat {
    let total = attendance.size();
    if (total == 0) { return 0 };
    let present = attendance.values().filter(func(r) {
      switch (r.status) {
        case (#present or #late) { true };
        case (_) { false };
      }
    }).size();
    (present * 100) / total;
  };
};
