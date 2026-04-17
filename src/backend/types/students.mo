import Common "common";
import Principal "mo:core/Principal";

module {
  public type StudentProfile = {
    id : Common.StudentId;
    principal : Principal;
    name : Text;
    email : Text;
    enrolledCourses : [Common.CourseId];
    batch : Common.BatchId;
    joiningDate : Common.Timestamp;
    isActive : Bool;
  };

  public type CreateStudentArgs = {
    name : Text;
    email : Text;
    batch : Common.BatchId;
    joiningDate : Common.Timestamp;
  };

  public type UpdateStudentArgs = {
    name : Text;
    email : Text;
    batch : Common.BatchId;
    isActive : Bool;
  };
};
