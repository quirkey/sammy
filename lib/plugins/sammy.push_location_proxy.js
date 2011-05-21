(function($) {

    Sammy = Sammy || {};

    // The PushLocationProxy is an optional location proxy prototype.
    // PushLocationProxy gets its location from history API. No hash needed here.
    // Only compatible with Firefox >= Chrom 6, Firefox 4.0, Safari 5.0
    //
    // ### Example
    //
    //     var app = $.sammy(function() {
    //         // set up the location proxy
    //         this.setLocationProxy(new Sammy.PushLocationProxy(this));
    //
    //         this.get('/about', function() {
    //           // Do something here
    //         });
    //
    //     });
    //
    // Clicking on that link would not go to /about, but would set the apps location
    // to 'about' and trigger the route.
    Sammy.PushLocationProxy = function(app) {
        this.app = app;
    };

    Sammy.PushLocationProxy.prototype = {
      bind: function() {
        var proxy = this;
        $(window).bind('popstate', function(e) {
           proxy.app.trigger('location-changed');
        });
        $('a').live('click', function(e) {
          // Do not bind external links
          if (location.hostname == this.hostname) {
            e.preventDefault();
            proxy.setLocation($(this).attr('href'));
            proxy.app.trigger('location-changed');
          }
        });
      },
      unbind: function() {
        $('a').unbind('click');
        $(window).unbind('popstate');
      },

      getLocation: function() {
        return window.location.pathname;
      },

      setLocation: function(new_location) {
        history.pushState({ path: this.path }, '', new_location);
      }
    };

})(jQuery);
