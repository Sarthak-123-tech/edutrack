import Common "common";

module {
  public type Course = {
    id : Common.CourseId;
    name : Text;
    description : Text;
    teacherId : Common.TeacherId;
    batch : Common.BatchId;
    schedule : Text; // e.g. "Mon/Wed/Fri 10:00-11:00"
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type CreateCourseArgs = {
    name : Text;
    description : Text;
    teacherId : Common.TeacherId;
    batch : Common.BatchId;
    schedule : Text;
  };

  public type UpdateCourseArgs = {
    name : Text;
    description : Text;
    teacherId : Common.TeacherId;
    batch : Common.BatchId;
    schedule : Text;
    isActive : Bool;
  };

  public type Batch = {
    id : Common.BatchId;
    name : Text;
    year : Nat;
    courses : [Common.CourseId];
    createdAt : Common.Timestamp;
  };

  public type CreateBatchArgs = {
    name : Text;
    year : Nat;
  };
};
