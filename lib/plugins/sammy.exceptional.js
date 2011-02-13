(function($) {

  Sammy = Sammy || {};

  Sammy.Exceptional = function(app) {
    app.bind('error', function(e, data) {
      if (data && data.error) {
        window.Exceptional.handle(data.error.message, window.location.href, '0');
      }
    });
  };

}(jQuery));
