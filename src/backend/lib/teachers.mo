import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Common "../types/common";
import T "../types/teachers";

module {
  public func createTeacher(
    teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
    nextId : Nat,
    principal : Principal,
    args : T.CreateTeacherArgs,
  ) : T.TeacherProfile {
    let profile : T.TeacherProfile = {
      id = nextId;
      principal = principal;
      name = args.name;
      email = args.email;
      subjects = args.subjects;
      qualification = args.qualification;
      isActive = true;
      joinedDate = Time.now();
    };
    teachers.add(nextId, profile);
    profile;
  };

  public func getTeacher(
    teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
    id : Common.TeacherId,
  ) : ?T.TeacherProfile {
    teachers.get(id);
  };

  public func getTeacherByPrincipal(
    teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
    principal : Principal,
  ) : ?T.TeacherProfile {
    teachers.values().find(func(t) { Principal.equal(t.principal, principal) });
  };

  public func listTeachers(
    teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
  ) : [T.TeacherProfile] {
    teachers.values().toArray();
  };

  public func updateTeacher(
    teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
    id : Common.TeacherId,
    args : T.UpdateTeacherArgs,
  ) {
    switch (teachers.get(id)) {
      case null { Runtime.trap("Teacher not found") };
      case (?existing) {
        teachers.add(id, { existing with
          name = args.name;
          email = args.email;
          subjects = args.subjects;
          qualification = args.qualification;
          isActive = args.isActive;
        });
      };
    };
  };

  public func deleteTeacher(
    teachers : Map.Map<Common.TeacherId, T.TeacherProfile>,
    id : Common.TeacherId,
  ) {
    teachers.remove(id);
  };
};
