(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).JSON = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy) {

  // A simple plugin that pings KISSmetrics tracker
  // every time a route is triggered. Created by Juan Pablo Garcia Dalolla
  // (jpgarcia), based on the Sammy.GoogleAnalytics
  // plugin developed by Brit Gardner (britg) with updates from
  // Aaron Quint (quirkey).
  //
  // ### Example
  //
  // Install KISSmetrics to your site as you normally would. Be sure that
  // the '_kmq' global variable exists (it should be created by the
  // script provided by KISSmetrics).
  //
  // Then, simply add the plugin to your Sammy App and it will automatically
  // track all of your routes in KISSmetrics.
  // They will appear as page views to the route's path.
  //
  //      $.sammy(function() {
  //        this.use('KISSmetrics');
  //
  //        ...
  //      });
  //
  // If you have routes that you do not want to track, simply call
  // `doNotTrackKISSmetrics within the route.
  //
  //      $.sammy(function() {
  //        this.use('KISSmetrics')
  //
  //        this.get('#/dont/track/me', function() {
  //          this.doNotTrackKISSmetrics();  // This route will not be tracked
  //        });
  //      });
  //
  Sammy.KISSmetrics = function(app) {
    var shouldTrack = true;

    function disableTracking() {
      shouldTrack = false;
    }

    function enableTracking() {
      shouldTrack = true;
    }

    this.helpers({
      // Disable tracking for the current route. Put at the begining of the
      // route's callback
      doNotTrackKISSmetrics: function() {
        disableTracking();
      },
      // send a page view to the tracker with `path`
      trackKISSmetrics: function(path) {
        if((typeof window._kmq != 'undefined') && shouldTrack) {
          this.log('tracking KISSmetrics', path);
          window._kmq.push(['record', path]);
        }
      }
    });

    this.bind('event-context-after', function() {
      var path = this.app.last_location[1];

      if (path) {
        this.trackKISSmetrics(path);
        enableTracking();
      }
    });
  };

  return Sammy.KISSmetrics;

}));
