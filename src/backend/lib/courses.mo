import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Common "../types/common";
import T "../types/courses";

module {
  public func createCourse(
    courses : Map.Map<Common.CourseId, T.Course>,
    nextId : Nat,
    args : T.CreateCourseArgs,
  ) : T.Course {
    let course : T.Course = {
      id = nextId;
      name = args.name;
      description = args.description;
      teacherId = args.teacherId;
      batch = args.batch;
      schedule = args.schedule;
      isActive = true;
      createdAt = Time.now();
    };
    courses.add(nextId, course);
    course;
  };

  public func getCourse(
    courses : Map.Map<Common.CourseId, T.Course>,
    id : Common.CourseId,
  ) : ?T.Course {
    courses.get(id);
  };

  public func listCourses(
    courses : Map.Map<Common.CourseId, T.Course>,
  ) : [T.Course] {
    courses.values().toArray();
  };

  public func listCoursesByBatch(
    courses : Map.Map<Common.CourseId, T.Course>,
    batchId : Common.BatchId,
  ) : [T.Course] {
    courses.values().filter(func(c) { c.batch == batchId }).toArray();
  };

  public func listCoursesByTeacher(
    courses : Map.Map<Common.CourseId, T.Course>,
    teacherId : Common.TeacherId,
  ) : [T.Course] {
    courses.values().filter(func(c) { c.teacherId == teacherId }).toArray();
  };

  public func updateCourse(
    courses : Map.Map<Common.CourseId, T.Course>,
    id : Common.CourseId,
    args : T.UpdateCourseArgs,
  ) {
    switch (courses.get(id)) {
      case null { Runtime.trap("Course not found") };
      case (?existing) {
        courses.add(id, { existing with
          name = args.name;
          description = args.description;
          teacherId = args.teacherId;
          batch = args.batch;
          schedule = args.schedule;
          isActive = args.isActive;
        });
      };
    };
  };

  public func createBatch(
    batches : Map.Map<Common.BatchId, T.Batch>,
    nextId : Nat,
    args : T.CreateBatchArgs,
  ) : T.Batch {
    let batch : T.Batch = {
      id = nextId;
      name = args.name;
      year = args.year;
      courses = [];
      createdAt = Time.now();
    };
    batches.add(nextId, batch);
    batch;
  };

  public func getBatch(
    batches : Map.Map<Common.BatchId, T.Batch>,
    id : Common.BatchId,
  ) : ?T.Batch {
    batches.get(id);
  };

  public func listBatches(
    batches : Map.Map<Common.BatchId, T.Batch>,
  ) : [T.Batch] {
    batches.values().toArray();
  };

  public func addCourseToBatch(
    batches : Map.Map<Common.BatchId, T.Batch>,
    batchId : Common.BatchId,
    courseId : Common.CourseId,
  ) {
    switch (batches.get(batchId)) {
      case null { Runtime.trap("Batch not found") };
      case (?existing) {
        let alreadyAdded = existing.courses.find(func(c) { c == courseId });
        switch (alreadyAdded) {
          case (?_) {};
          case null {
            let newCourses = existing.courses.concat([courseId]);
            batches.add(batchId, { existing with courses = newCourses });
          };
        };
      };
    };
  };
};
