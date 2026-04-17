import Common "common";
import Principal "mo:core/Principal";

module {
  public type TeacherProfile = {
    id : Common.TeacherId;
    principal : Principal;
    name : Text;
    email : Text;
    subjects : [Text];
    qualification : Text;
    isActive : Bool;
    joinedDate : Common.Timestamp;
  };

  public type CreateTeacherArgs = {
    name : Text;
    email : Text;
    subjects : [Text];
    qualification : Text;
  };

  public type UpdateTeacherArgs = {
    name : Text;
    email : Text;
    subjects : [Text];
    qualification : Text;
    isActive : Bool;
  };
};
