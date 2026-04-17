import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Common "../types/common";
import T "../types/schedule";

module {
  public func createSession(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
    nextId : Nat,
    teacherId : Common.TeacherId,
    args : T.CreateSessionArgs,
  ) : T.ClassSession {
    let session : T.ClassSession = {
      id = nextId;
      courseId = args.courseId;
      teacherId = teacherId;
      date = args.date;
      time = args.time;
      duration = args.duration;
      topic = args.topic;
      status = #upcoming;
      createdAt = Time.now();
    };
    sessions.add(nextId, session);
    session;
  };

  public func getSession(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
    id : Common.ScheduleId,
  ) : ?T.ClassSession {
    sessions.get(id);
  };

  public func listSessions(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
  ) : [T.ClassSession] {
    sessions.values().toArray();
  };

  public func listSessionsByCourse(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
    courseId : Common.CourseId,
  ) : [T.ClassSession] {
    sessions.values().filter(func(s) { s.courseId == courseId }).toArray();
  };

  public func listSessionsByTeacher(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
    teacherId : Common.TeacherId,
  ) : [T.ClassSession] {
    sessions.values().filter(func(s) { s.teacherId == teacherId }).toArray();
  };

  public func updateSession(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
    id : Common.ScheduleId,
    args : T.UpdateSessionArgs,
  ) {
    switch (sessions.get(id)) {
      case null { Runtime.trap("Session not found") };
      case (?existing) {
        sessions.add(id, { existing with
          date = args.date;
          time = args.time;
          duration = args.duration;
          topic = args.topic;
          status = args.status;
        });
      };
    };
  };

  public func cancelSession(
    sessions : Map.Map<Common.ScheduleId, T.ClassSession>,
    id : Common.ScheduleId,
  ) {
    switch (sessions.get(id)) {
      case null { Runtime.trap("Session not found") };
      case (?existing) {
        sessions.add(id, { existing with status = #cancelled });
      };
    };
  };
};
