import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import T "../types/fees";
import Lib "../lib/fees";

mixin (
  accessControlState : AccessControl.AccessControlState,
  fees : Map.Map<Common.FeeId, T.FeeTransaction>,
  nextFeeId : Common.Counter,
) {
  // Admin: record a new fee transaction
  public shared ({ caller }) func createFee(args : T.CreateFeeArgs) : async T.FeeTransaction {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create fee transactions");
    };
    let fee = Lib.createFee(fees, nextFeeId.value, args);
    nextFeeId.value += 1;
    fee;
  };

  // Admin: get a specific fee transaction
  public query ({ caller }) func getFee(id : Common.FeeId) : async ?T.FeeTransaction {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view fee details");
    };
    Lib.getFee(fees, id);
  };

  // Admin: list all fee transactions
  public query ({ caller }) func listFees() : async [T.FeeTransaction] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all fees");
    };
    Lib.listFees(fees);
  };

  // Admin/Student: list fees for a specific student
  public query ({ caller }) func listFeesByStudent(studentId : Common.StudentId) : async [T.FeeTransaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listFeesByStudent(fees, studentId);
  };

  // Admin: update fee transaction (mark as paid, etc.)
  public shared ({ caller }) func updateFee(id : Common.FeeId, args : T.UpdateFeeArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update fees");
    };
    Lib.updateFee(fees, id, args);
  };

  // Admin: calculate fee collection rate (percentage)
  public query ({ caller }) func getFeeCollectionRate() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view fee stats");
    };
    Lib.calculateCollectionRate(fees);
  };
};
