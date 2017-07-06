"use strict";
/**
 * This messages trait is to be used to when we are using messages in
 * the crud component that is a child of the component that is using
 * that trait
 */
var UserMessages = {
  warning: function(message) {
    this.$refs.crud.warning(message);
  },
  error: function(message) {
    this.$refs.crud.error(message);
  },
  success: function(message) {
    this.$refs.crud.success(message);
  },
};

export default {
  UserMessages
}