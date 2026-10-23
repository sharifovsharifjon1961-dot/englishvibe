module {
  /// Admin passcode gate state. The passcode is compared against the value
  /// supplied by the frontend environment; the canister stores only a hash.
  public type AdminState = {
    var passcodeHash : Text;
  };
};
