import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/teachers";
import Lib "../lib/teachers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
  nextTeacherId : Common.Counter,
) {
  // Admin: create a teacher account
  public shared ({ caller }) func createTeacher(principal : Principal, args : T.CreateTeacherArgs) : async T.TeacherProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create teachers");
    };
    let profile = Lib.createTeacher(teachers, nextTeacherId.value, principal, args);
    nextTeacherId.value += 1;
    profile;
  };

  // Admin: get any teacher profile
  public query ({ caller }) func getTeacher(id : Common.TeacherId) : async ?T.TeacherProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getTeacher(teachers, id);
  };

  // Teacher: get own profile
  public query ({ caller }) func getMyTeacherProfile() : async ?T.TeacherProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getTeacherByPrincipal(teachers, caller);
  };

  // Any authenticated user: list all teachers
  public query ({ caller }) func listTeachers() : async [T.TeacherProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listTeachers(teachers);
  };

  // Admin: update teacher profile
  public shared ({ caller }) func updateTeacher(id : Common.TeacherId, args : T.UpdateTeacherArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update teachers");
    };
    Lib.updateTeacher(teachers, id, args);
  };

  // Admin: delete teacher
  public shared ({ caller }) func deleteTeacher(id : Common.TeacherId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete teachers");
    };
    Lib.deleteTeacher(teachers, id);
  };
};
