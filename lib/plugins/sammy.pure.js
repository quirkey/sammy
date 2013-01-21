(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy', 'pure'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Pure = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy) {

  // `Sammy.Pure` is a simple wrapper around the pure.js templating engine for
  // use in Sammy apps.
  //
  // Note: You must include the pure.js source before including sammy.pure.js.
  //
  // See http://beebole.com/pure/ for detailed documentation.
  Sammy.Pure = function(app, method_alias) {

    var pure = function(template, data, directives) {
      return $(template).autoRender(data, directives);
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'pure'; }
    app.helper(method_alias, pure);

  };

  return Sammy.Pure;

}));
