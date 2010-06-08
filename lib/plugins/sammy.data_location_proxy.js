(function($) {
  
  Sammy = Sammy || {};
  
  // The DataLocationProxy is an optional location proxy prototype. As opposed to
  // the `HashLocationProxy` it gets its location from a jQuery.data attribute
  // tied to the application's element. You can set the name of the attribute by
  // passing a string as the second argument to the constructor. The default attribute
  // name is 'sammy-location'. To read more about location proxies, check out the
  // documentation for `Sammy.HashLocationProxy`
  Sammy.DataLocationProxy = function(app, data_name) {
    this.app = app;
    this.data_name = data_name || 'sammy-location';
  };

  Sammy.DataLocationProxy.prototype = {
    bind: function() {
      var proxy = this;
      this.app.$element().bind('setData', function(e, key, value) {
        if (key == proxy.data_name) {
          // jQuery unfortunately fires the event before it sets the value
          // work around it, by setting the value ourselves
          proxy.app.$element().each(function() {
            $.data(this, proxy.data_name, value);
          });
          proxy.app.trigger('location-changed');
        }
      });
    },

    unbind: function() {
      this.app.$element().unbind('setData');
    },

    getLocation: function() {
      return this.app.$element().data(this.data_name);
    },

    setLocation: function(new_location) {
      return this.app.$element().data(this.data_name, new_location);
    }
  };

})(jQuery);