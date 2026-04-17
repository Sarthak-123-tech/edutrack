module {
  public type DashboardAnalytics = {
    totalStudents : Nat;
    activeStudents : Nat;
    totalTeachers : Nat;
    activeCourses : Nat;
    totalBatches : Nat;
    feeCollectionRate : Nat; // percentage 0–100
    averageAttendance : Nat; // percentage 0–100
    totalMaterials : Nat;
  };
};
