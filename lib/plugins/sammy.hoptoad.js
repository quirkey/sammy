(function($) {

  Sammy = Sammy || {};

  // A plugin that posts errors to Hoptoad.
  //
  // ### Requirements
  //
  // The sole requirement is a global Hoptoad object with a notify
  // function. Thoughtbot have published an implementation (see below).
  //
  // ### See Also
  //  * http://hoptoadapp.com/
  //  * http://robots.thoughtbot.com/post/899737797
  //  * http://hoptoadapp.com/javascripts/notifier.js
  Sammy.Hoptoad = function(app) {
    app.bind('error', function(e, data) {
      if (data && data.error) {
        window.Hoptoad.notify(data.error);
      }
    });
  };

})(jQuery);
