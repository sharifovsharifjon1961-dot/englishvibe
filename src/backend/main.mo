import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import ContentLib "lib/content";
import StudentLib "lib/student";
import AdminLib "lib/admin";
import ContentApi "mixins/content-api";
import StudentApi "mixins/student-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";
import ContentOql "generated/ContentOql";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let content : ContentLib.ContentState;
  let student : StudentLib.StudentState;
  let admin : AdminLib.AdminState;

  include MixinAuthorization(accessControlState, null);
  include ContentApi(content, accessControlState);
  include StudentApi(student);
  include AdminApi(admin);
  include ApiDocMixin();
  include Expose({ entities = ContentOql.entities(content, student) });
};
