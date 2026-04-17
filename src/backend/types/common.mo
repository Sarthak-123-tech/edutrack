module {
  // Cross-cutting scalar aliases
  public type Timestamp = Int; // nanoseconds from Time.now()
  public type StudentId = Nat;
  public type TeacherId = Nat;
  public type CourseId = Nat;
  public type BatchId = Nat;
  public type FeeId = Nat;
  public type AttendanceId = Nat;
  public type MaterialId = Nat;
  public type MarkId = Nat;
  public type ScheduleId = Nat;

  // Mutable counter — used to pass var Nat state into mixins
  public type Counter = { var value : Nat };

  // Shared role variant for cross-domain authorization checks
  public type AppRole = {
    #student;
    #teacher;
    #admin;
  };
};
