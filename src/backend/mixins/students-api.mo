import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/students";
import Lib "../lib/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  students : Map.Map<Common.StudentId, T.StudentProfile>,
  nextStudentId : Common.Counter,
) {
  // Admin: create a new student account
  public shared ({ caller }) func createStudent(args : T.CreateStudentArgs) : async T.StudentProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    let profile = Lib.createStudent(students, nextStudentId.value, caller, args);
    nextStudentId.value += 1;
    profile;
  };

  // Admin: get any student profile
  public query ({ caller }) func getStudent(id : Common.StudentId) : async ?T.StudentProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getStudent(students, id);
  };

  // Student: get own profile by principal
  public query ({ caller }) func getMyStudentProfile() : async ?T.StudentProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getStudentByPrincipal(students, caller);
  };

  // Admin/Teacher: list all students
  public query ({ caller }) func listStudents() : async [T.StudentProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listStudents(students);
  };

  // Admin: update student profile
  public shared ({ caller }) func updateStudent(id : Common.StudentId, args : T.UpdateStudentArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    Lib.updateStudent(students, id, args);
  };

  // Admin: delete student
  public shared ({ caller }) func deleteStudent(id : Common.StudentId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    Lib.deleteStudent(students, id);
  };

  // Admin/Teacher: enroll student in course
  public shared ({ caller }) func enrollStudentInCourse(studentId : Common.StudentId, courseId : Common.CourseId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.enrollInCourse(students, studentId, courseId);
  };

  // Admin/Teacher: unenroll student from course
  public shared ({ caller }) func unenrollStudentFromCourse(studentId : Common.StudentId, courseId : Common.CourseId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unenroll students");
    };
    Lib.unenrollFromCourse(students, studentId, courseId);
  };
};
