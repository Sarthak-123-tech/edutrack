import Common "common";

module {
  public type Mark = {
    id : Common.MarkId;
    studentId : Common.StudentId;
    courseId : Common.CourseId;
    examType : Text; // e.g. "midterm", "final", "quiz"
    marks : Nat;
    maxMarks : Nat;
    date : Common.Timestamp;
    remarks : Text;
    recordedBy : Common.TeacherId;
  };

  public type CreateMarkArgs = {
    studentId : Common.StudentId;
    courseId : Common.CourseId;
    examType : Text;
    marks : Nat;
    maxMarks : Nat;
    date : Common.Timestamp;
    remarks : Text;
  };

  public type StudentPerformanceSummary = {
    studentId : Common.StudentId;
    courseId : Common.CourseId;
    averagePercentage : Nat; // 0–100
    totalExams : Nat;
    marks : [Common.MarkId];
  };
};
