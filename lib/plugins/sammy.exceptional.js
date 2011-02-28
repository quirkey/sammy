(function($) {

  Sammy = Sammy || {};

  // A plugin that posts errors to Exceptional.
  //
  // ### Arguments
  //
  // Sammy.Exceptional accepts an optional argument that is the Exceptional
  // implementation. It will default to the global `Exceptional` object.
  //
  // ### Requirements
  //
  // The sole requirement is a global Exceptional object with a handle
  // function. Contrast have published an implementation (see below).
  //
  // ### See Also
  //  * http://www.getexceptional.com/
  //  * https://github.com/contrast/exceptional-js
  Sammy.Exceptional = function(app, errorReporter) {
    errorReporter = errorReporter || window.Exceptional;
    app.bind('error', function(e, data) {
      if (data && data.error) {
        errorReporter.handle(data.error.message, window.location.href, '0');
      }
    });
  };

}(jQuery));
