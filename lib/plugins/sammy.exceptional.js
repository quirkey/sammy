(function($) {

  Sammy = Sammy || {};

  // A plugin that posts errors to Exceptional.
  //
  // ### Requirements
  //
  // The sole requirement is a global Exceptional object with a handle
  // function. Contrast have published an implementation (see below).
  //
  // ### See Also
  //  * http://www.getexceptional.com/
  //  * https://github.com/contrast/exceptional-js
  Sammy.Exceptional = function(app) {
    app.bind('error', function(e, data) {
      if (data && data.error) {
        window.Exceptional.handle(data.error.message, window.location.href, '0');
      }
    });
  };

}(jQuery));
