import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/performance";
import Lib "../lib/performance";

mixin (
  accessControlState : AccessControl.AccessControlState,
  marks : Map.Map<Common.MarkId, T.Mark>,
  nextMarkId : Common.Counter,
) {
  // Teacher: record marks for a student
  public shared ({ caller }) func recordMark(args : T.CreateMarkArgs) : async T.Mark {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // teacherId 0 is used for admin-seeded data; teachers need a real ID in production
    let mark = Lib.recordMark(marks, nextMarkId.value, 0, args);
    nextMarkId.value += 1;
    mark;
  };

  // Any authenticated: list marks for a student
  public query ({ caller }) func listMarksByStudent(studentId : Common.StudentId) : async [T.Mark] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listMarksByStudent(marks, studentId);
  };

  // Teacher/Admin: list marks for a course
  public query ({ caller }) func listMarksByCourse(courseId : Common.CourseId) : async [T.Mark] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listMarksByCourse(marks, courseId);
  };

  // Any authenticated: get performance summary for a student in a course
  public query ({ caller }) func getPerformanceSummary(studentId : Common.StudentId, courseId : Common.CourseId) : async T.StudentPerformanceSummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getPerformanceSummary(marks, studentId, courseId);
  };
};
