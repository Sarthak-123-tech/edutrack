import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/schedule";
import Lib "../lib/schedule";

mixin (
  accessControlState : AccessControl.AccessControlState,
  sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
  nextSessionId : Common.Counter,
) {
  // Teacher: create a class session — uses teacherId 0 for admin callers
  public shared ({ caller }) func createSession(args : T.CreateSessionArgs) : async T.ClassSession {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let session = Lib.createSession(sessions, nextSessionId.value, 0, args);
    nextSessionId.value += 1;
    session;
  };

  // Any authenticated: get session by id
  public query ({ caller }) func getSession(id : Common.ScheduleId) : async ?T.ClassSession {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getSession(sessions, id);
  };

  // Any authenticated: list sessions by course
  public query ({ caller }) func listSessionsByCourse(courseId : Common.CourseId) : async [T.ClassSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listSessionsByCourse(sessions, courseId);
  };

  // Teacher: list sessions assigned to a teacher
  public query ({ caller }) func listSessionsByTeacher(teacherId : Common.TeacherId) : async [T.ClassSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listSessionsByTeacher(sessions, teacherId);
  };

  // Teacher/Admin: update a session
  public shared ({ caller }) func updateSession(id : Common.ScheduleId, args : T.UpdateSessionArgs) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.updateSession(sessions, id, args);
  };

  // Teacher/Admin: cancel a session
  public shared ({ caller }) func cancelSession(id : Common.ScheduleId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.cancelSession(sessions, id);
  };
};
