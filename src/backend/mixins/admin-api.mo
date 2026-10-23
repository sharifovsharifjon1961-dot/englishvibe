import AdminLib "../lib/admin";

mixin (state : AdminLib.AdminState) {
  /// Check the admin passcode. Returns true when the passcode matches.
  public query func checkAdminPasscode(passcode : Text) : async Bool {
    AdminLib.checkPasscode(state, passcode);
  };
};
