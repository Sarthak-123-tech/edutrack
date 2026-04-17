import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/materials";
import TeacherTypes "../types/teachers";
import Lib "../lib/materials";
import TeacherLib "../lib/teachers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  materials : Map.Map<Common.MaterialId, T.StudyMaterial>,
  teacherMap : Map.Map<Common.TeacherId, TeacherTypes.TeacherProfile>,
  nextMaterialId : Common.Counter,
) {
  // Teacher/Admin: upload study material metadata + file blob
  public shared ({ caller }) func uploadMaterial(args : T.CreateMaterialArgs) : async T.StudyMaterial {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let teacherId : Common.TeacherId = switch (TeacherLib.getTeacherByPrincipal(teacherMap, caller)) {
      case (?t) { t.id };
      case null {
        if (AccessControl.isAdmin(accessControlState, caller)) { 0 }
        else { Runtime.trap("Caller is not a registered teacher") }
      };
    };
    let material = Lib.uploadMaterial(materials, nextMaterialId.value, teacherId, args);
    nextMaterialId.value += 1;
    material;
  };

  // Any authenticated: get a specific material
  public query ({ caller }) func getMaterial(id : Common.MaterialId) : async ?T.StudyMaterial {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.getMaterial(materials, id);
  };

  // Any authenticated: list materials by course
  public query ({ caller }) func listMaterialsByCourse(courseId : Common.CourseId) : async [T.StudyMaterial] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listMaterialsByCourse(materials, courseId);
  };

  // Any authenticated: list all materials
  public query ({ caller }) func listMaterials() : async [T.StudyMaterial] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listMaterials(materials);
  };

  // Teacher/Admin: delete a material
  public shared ({ caller }) func deleteMaterial(id : Common.MaterialId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.deleteMaterial(materials, id);
  };
};
