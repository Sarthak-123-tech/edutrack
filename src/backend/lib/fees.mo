import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Common "../types/common";
import T "../types/fees";

module {
  public func createFee(
    fees : Map.Map<Common.FeeId, T.FeeTransaction>,
    nextId : Nat,
    args : T.CreateFeeArgs,
  ) : T.FeeTransaction {
    let fee : T.FeeTransaction = {
      id = nextId;
      studentId = args.studentId;
      amount = args.amount;
      dueDate = args.dueDate;
      paidDate = null;
      status = #unpaid;
      feeType = args.feeType;
      notes = args.notes;
      createdAt = Time.now();
    };
    fees.add(nextId, fee);
    fee;
  };

  public func getFee(
    fees : Map.Map<Common.FeeId, T.FeeTransaction>,
    id : Common.FeeId,
  ) : ?T.FeeTransaction {
    fees.get(id);
  };

  public func listFees(
    fees : Map.Map<Common.FeeId, T.FeeTransaction>,
  ) : [T.FeeTransaction] {
    fees.values().toArray();
  };

  public func listFeesByStudent(
    fees : Map.Map<Common.FeeId, T.FeeTransaction>,
    studentId : Common.StudentId,
  ) : [T.FeeTransaction] {
    fees.values().filter(func(f) { f.studentId == studentId }).toArray();
  };

  public func updateFee(
    fees : Map.Map<Common.FeeId, T.FeeTransaction>,
    id : Common.FeeId,
    args : T.UpdateFeeArgs,
  ) {
    switch (fees.get(id)) {
      case null { Runtime.trap("Fee transaction not found") };
      case (?existing) {
        fees.add(id, { existing with
          amount = args.amount;
          dueDate = args.dueDate;
          paidDate = args.paidDate;
          status = args.status;
          feeType = args.feeType;
          notes = args.notes;
        });
      };
    };
  };

  // Returns percentage 0–100 of paid fees out of total
  public func calculateCollectionRate(
    fees : Map.Map<Common.FeeId, T.FeeTransaction>,
  ) : Nat {
    let total = fees.size();
    if (total == 0) { return 0 };
    let paid = fees.values().filter(func(f) {
      switch (f.status) {
        case (#paid) { true };
        case (_) { false };
      }
    }).size();
    (paid * 100) / total;
  };
};
