(function($) {

  Sammy = Sammy || {};

  Sammy.Hoptoad = function(app) {
    app.bind('error', function(e, data) {
      if (data && data.error) {
        window.Hoptoad.notify(data.error);
      }
    });
  };

})(jQuery);
