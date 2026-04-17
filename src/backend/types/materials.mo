import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type MaterialType = { #notes; #assignment; #resource };

  public type StudyMaterial = {
    id : Common.MaterialId;
    title : Text;
    description : Text;
    courseId : Common.CourseId;
    uploadedBy : Common.TeacherId;
    fileBlob : Storage.ExternalBlob;
    uploadDate : Common.Timestamp;
    materialType : MaterialType;
    fileName : Text;
  };

  public type CreateMaterialArgs = {
    title : Text;
    description : Text;
    courseId : Common.CourseId;
    fileBlob : Storage.ExternalBlob;
    materialType : MaterialType;
    fileName : Text;
  };
};
