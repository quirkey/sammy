(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Flash = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy) {

  // A simple plugin that pings Mixpanel tracker
  // every time a route is triggered. Created by Juan Pablo Garcia Dalolla
  // (jpgarcia), based on the Sammy.GoogleAnalytics
  // plugin developed by Brit Gardner (britg) with updates from
  // Aaron Quint (quirkey).
  //
  // ### Example
  //
  // Install Mixpanel to your site as you normally would. Be sure that
  // the 'mixpanel' global variable exists (it should be created by the
  // script provided by Mixpanel).
  //
  // Then, simply add the plugin to your Sammy App and it will automatically
  // track all of your routes in Mixpanel.
  // They will appear as page views to the route's path.
  //
  //      $.sammy(function() {
  //        this.use('Mixpanel');
  //
  //        ...
  //      });
  //
  // If you have routes that you do not want to track, simply call
  // `doNotTrackMixpanel within the route.
  //
  //      $.sammy(function() {
  //        this.use('Mixpanel')
  //
  //        this.get('#/dont/track/me', function() {
  //          this.doNotTrackMixpanel();  // This route will not be tracked
  //        });
  //      });
  //
  Sammy.Mixpanel = function(app) {
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
      doNotTrackMixpanel: function() {
        disableTracking();
      },
      // send a page view to the tracker with `path`
      trackMixpanel: function(path) {
        if((typeof window.mixpanel != 'undefined') && shouldTrack) {
          this.log('tracking mixpanel', path);
          window.mixpanel.track(path);
        }
      }
    });

    this.bind('event-context-after', function() {
      var path = this.app.last_location[1];

      if (path) {
        this.trackMixpanel(path);
        enableTracking();
      }
    });
  };

  return Sammy.Mixpanel;

}));
