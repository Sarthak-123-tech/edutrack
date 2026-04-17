import Map "mo:core/Map";
import Common "../types/common";
import T "../types/performance";

module {
  public func recordMark(
    marks : Map.Map<Common.MarkId, T.Mark>,
    nextId : Nat,
    teacherId : Common.TeacherId,
    args : T.CreateMarkArgs,
  ) : T.Mark {
    let mark : T.Mark = {
      id = nextId;
      studentId = args.studentId;
      courseId = args.courseId;
      examType = args.examType;
      marks = args.marks;
      maxMarks = args.maxMarks;
      date = args.date;
      remarks = args.remarks;
      recordedBy = teacherId;
    };
    marks.add(nextId, mark);
    mark;
  };

  public func getMark(
    marks : Map.Map<Common.MarkId, T.Mark>,
    id : Common.MarkId,
  ) : ?T.Mark {
    marks.get(id);
  };

  public func listMarksByStudent(
    marks : Map.Map<Common.MarkId, T.Mark>,
    studentId : Common.StudentId,
  ) : [T.Mark] {
    marks.values().filter(func(m) { m.studentId == studentId }).toArray();
  };

  public func listMarksByCourse(
    marks : Map.Map<Common.MarkId, T.Mark>,
    courseId : Common.CourseId,
  ) : [T.Mark] {
    marks.values().filter(func(m) { m.courseId == courseId }).toArray();
  };

  // Calculates averagePercentage from all marks for a student in a course
  public func getPerformanceSummary(
    marks : Map.Map<Common.MarkId, T.Mark>,
    studentId : Common.StudentId,
    courseId : Common.CourseId,
  ) : T.StudentPerformanceSummary {
    let relevant = marks.values().filter(func(m) {
      m.studentId == studentId and m.courseId == courseId
    }).toArray();
    let totalExams = relevant.size();
    let markIds = relevant.map(func(m : T.Mark) : Common.MarkId { m.id });

    let averagePercentage : Nat = if (totalExams == 0) {
      0
    } else {
      // Sum up percentage for each mark and average
      let totalPct = relevant.foldLeft(0 : Nat, func(acc : Nat, m : T.Mark) : Nat {
        if (m.maxMarks == 0) { acc }
        else { acc + (m.marks * 100) / m.maxMarks }
      });
      totalPct / totalExams
    };

    {
      studentId = studentId;
      courseId = courseId;
      averagePercentage = averagePercentage;
      totalExams = totalExams;
      marks = markIds;
    };
  };
};
