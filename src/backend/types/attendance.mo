import Common "common";

module {
  public type AttendanceStatus = { #present; #absent; #late };

  public type AttendanceRecord = {
    id : Common.AttendanceId;
    studentId : Common.StudentId;
    courseId : Common.CourseId;
    date : Common.Timestamp;
    status : AttendanceStatus;
    markedBy : Common.TeacherId;
    notes : Text;
  };

  public type CreateAttendanceArgs = {
    studentId : Common.StudentId;
    courseId : Common.CourseId;
    date : Common.Timestamp;
    status : AttendanceStatus;
    notes : Text;
  };
};
