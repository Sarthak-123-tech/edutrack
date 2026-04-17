import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Common "../types/common";
import T "../types/students";

module {
  public func createStudent(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    nextId : Nat,
    principal : Principal,
    args : T.CreateStudentArgs,
  ) : T.StudentProfile {
    let profile : T.StudentProfile = {
      id = nextId;
      principal = principal;
      name = args.name;
      email = args.email;
      enrolledCourses = [];
      batch = args.batch;
      joiningDate = args.joiningDate;
      isActive = true;
    };
    students.add(nextId, profile);
    profile;
  };

  public func getStudent(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    id : Common.StudentId,
  ) : ?T.StudentProfile {
    students.get(id);
  };

  public func getStudentByPrincipal(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    principal : Principal,
  ) : ?T.StudentProfile {
    students.values().find(func(s) { Principal.equal(s.principal, principal) });
  };

  public func listStudents(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
  ) : [T.StudentProfile] {
    students.values().toArray();
  };

  public func updateStudent(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    id : Common.StudentId,
    args : T.UpdateStudentArgs,
  ) {
    switch (students.get(id)) {
      case null { Runtime.trap("Student not found") };
      case (?existing) {
        students.add(id, { existing with
          name = args.name;
          email = args.email;
          batch = args.batch;
          isActive = args.isActive;
        });
      };
    };
  };

  public func deleteStudent(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    id : Common.StudentId,
  ) {
    students.remove(id);
  };

  public func enrollInCourse(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    studentId : Common.StudentId,
    courseId : Common.CourseId,
  ) {
    switch (students.get(studentId)) {
      case null { Runtime.trap("Student not found") };
      case (?existing) {
        // Avoid duplicates
        let alreadyEnrolled = existing.enrolledCourses.find(func(c) { c == courseId });
        switch (alreadyEnrolled) {
          case (?_) {}; // already enrolled
          case null {
            let newCourses = existing.enrolledCourses.concat([courseId]);
            students.add(studentId, { existing with enrolledCourses = newCourses });
          };
        };
      };
    };
  };

  public func unenrollFromCourse(
    students : Map.Map<Common.StudentId, T.StudentProfile>,
    studentId : Common.StudentId,
    courseId : Common.CourseId,
  ) {
    switch (students.get(studentId)) {
      case null { Runtime.trap("Student not found") };
      case (?existing) {
        let newCourses = existing.enrolledCourses.filter(func(c) { c != courseId });
        students.add(studentId, { existing with enrolledCourses = newCourses });
      };
    };
  };
};
