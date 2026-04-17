import Common "common";

module {
  public type ClassStatus = { #upcoming; #completed; #cancelled };

  public type ClassSession = {
    id : Common.ScheduleId;
    courseId : Common.CourseId;
    teacherId : Common.TeacherId;
    date : Common.Timestamp;
    time : Text; // "HH:MM" 24-hour
    duration : Nat; // minutes
    topic : Text;
    status : ClassStatus;
    createdAt : Common.Timestamp;
  };

  public type CreateSessionArgs = {
    courseId : Common.CourseId;
    date : Common.Timestamp;
    time : Text;
    duration : Nat;
    topic : Text;
  };

  public type UpdateSessionArgs = {
    date : Common.Timestamp;
    time : Text;
    duration : Nat;
    topic : Text;
    status : ClassStatus;
  };
};
