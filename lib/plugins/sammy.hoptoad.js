(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Hoptoad = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy) {

  // A plugin that posts errors to Hoptoad.
  //
  // ### Requirements
  //
  // The sole requirement is a Hoptoad object with a notify function.
  // Thoughtbot have published an implementation (see below).
  //
  // ### Arguments
  //
  // Sammy.Hoptoad accepts an optional argument that is the
  // Hoptoad implementation. It will default to the global `Hoptoad` object.
  //
  // ### See Also
  //  * http://hoptoadapp.com/
  //  * http://robots.thoughtbot.com/post/899737797
  //  * http://hoptoadapp.com/javascripts/notifier.js
  Sammy.Hoptoad = function(app, errorReporter) {
    errorReporter = errorReporter || window.Hoptoad;
    app.bind('error', function(e, data) {
      if (data && data.error) {
        errorReporter.notify(data.error);
      }
    });
  };

  return Sammy.Hoptoad;

}));
