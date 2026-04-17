import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/courses";
import Lib "../lib/courses";

mixin (
  accessControlState : AccessControl.AccessControlState,
  courses : Map.Map<Common.CourseId, T.Course>,
  batches : Map.Map<Common.BatchId, T.Batch>,
  nextCourseId : Common.Counter,
  nextBatchId : Common.Counter,
) {
  // Admin: create a course
  public shared ({ caller }) func createCourse(args : T.CreateCourseArgs) : async T.Course {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create courses");
    };
    let course = Lib.createCourse(courses, nextCourseId.value, args);
    Lib.addCourseToBatch(batches, args.batch, nextCourseId.value);
    nextCourseId.value += 1;
    course;
  };

  // Any authenticated user: get course by id
  public query ({ caller }) func getCourse(id : Common.CourseId) : async ?T.Course {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getCourse(courses, id);
  };

  // Any authenticated user: list all courses
  public query ({ caller }) func listCourses() : async [T.Course] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listCourses(courses);
  };

  // Any authenticated user: list courses by batch
  public query ({ caller }) func listCoursesByBatch(batchId : Common.BatchId) : async [T.Course] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listCoursesByBatch(courses, batchId);
  };

  // Any authenticated user: list courses by teacher
  public query ({ caller }) func listCoursesByTeacher(teacherId : Common.TeacherId) : async [T.Course] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listCoursesByTeacher(courses, teacherId);
  };

  // Admin: update course
  public shared ({ caller }) func updateCourse(id : Common.CourseId, args : T.UpdateCourseArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update courses");
    };
    Lib.updateCourse(courses, id, args);
  };

  // Admin: create a batch
  public shared ({ caller }) func createBatch(args : T.CreateBatchArgs) : async T.Batch {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create batches");
    };
    let batch = Lib.createBatch(batches, nextBatchId.value, args);
    nextBatchId.value += 1;
    batch;
  };

  // Any authenticated user: get batch by id
  public query ({ caller }) func getBatch(id : Common.BatchId) : async ?T.Batch {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getBatch(batches, id);
  };

  // Any authenticated user: list all batches
  public query ({ caller }) func listBatches() : async [T.Batch] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listBatches(batches);
  };
};
