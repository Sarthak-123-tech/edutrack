import Map "mo:core/Map";
import Time "mo:core/Time";
import Common "../types/common";
import T "../types/materials";

module {
  public func uploadMaterial(
    materials : Map.Map<Common.MaterialId, T.StudyMaterial>,
    nextId : Nat,
    teacherId : Common.TeacherId,
    args : T.CreateMaterialArgs,
  ) : T.StudyMaterial {
    let material : T.StudyMaterial = {
      id = nextId;
      title = args.title;
      description = args.description;
      courseId = args.courseId;
      uploadedBy = teacherId;
      fileBlob = args.fileBlob;
      uploadDate = Time.now();
      materialType = args.materialType;
      fileName = args.fileName;
    };
    materials.add(nextId, material);
    material;
  };

  public func getMaterial(
    materials : Map.Map<Common.MaterialId, T.StudyMaterial>,
    id : Common.MaterialId,
  ) : ?T.StudyMaterial {
    materials.get(id);
  };

  public func listMaterials(
    materials : Map.Map<Common.MaterialId, T.StudyMaterial>,
  ) : [T.StudyMaterial] {
    materials.values().toArray();
  };

  public func listMaterialsByCourse(
    materials : Map.Map<Common.MaterialId, T.StudyMaterial>,
    courseId : Common.CourseId,
  ) : [T.StudyMaterial] {
    materials.values().filter(func(m) { m.courseId == courseId }).toArray();
  };

  public func deleteMaterial(
    materials : Map.Map<Common.MaterialId, T.StudyMaterial>,
    id : Common.MaterialId,
  ) {
    materials.remove(id);
  };
};
