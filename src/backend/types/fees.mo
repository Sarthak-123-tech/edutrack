import Common "common";

module {
  public type FeeStatus = { #paid; #unpaid; #partial };
  public type FeeType = { #monthly; #quarterly; #annual };

  public type FeeTransaction = {
    id : Common.FeeId;
    studentId : Common.StudentId;
    amount : Nat; // in smallest currency unit (e.g. paise/cents)
    dueDate : Common.Timestamp;
    paidDate : ?Common.Timestamp;
    status : FeeStatus;
    feeType : FeeType;
    notes : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateFeeArgs = {
    studentId : Common.StudentId;
    amount : Nat;
    dueDate : Common.Timestamp;
    feeType : FeeType;
    notes : Text;
  };

  public type UpdateFeeArgs = {
    amount : Nat;
    dueDate : Common.Timestamp;
    paidDate : ?Common.Timestamp;
    status : FeeStatus;
    feeType : FeeType;
    notes : Text;
  };
};
