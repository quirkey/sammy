(function($) {

  Sammy = Sammy || {};

  Sammy.FlashHash = function() {
    this.now = {};
  };

  Sammy.FlashHash.prototype = {
    // @return [String] this Flash, rendered as an <ul>.
    toHTML: function() {
      result = this._renderUL();
      this.clear();
      return result;
    },

    clear: function() {
      this._clearHash(this);
      this._clearHash(this.now);
    },

    // Callback on redirect.
    // @api private
    _onRedirect: function() {
      this._clearHash(this.now);
    },

    // clear out all flash keys
    // @api private
    _clearHash: function(hash) {
      var key;
      for (key in hash) {
        if (key !== 'now' && hash.hasOwnProperty(key)) {
          hash[key] = undefined;
        }
      }
    },

    _renderUL: function() {
      return '<ul class="flash">' +
             this._renderLIs(this) +
             this._renderLIs(this.now) +
             '</ul>';
    },

    _renderLIs: function(hash) {
      var result = '',
          key;
      for (key in hash) {
        if (hash[key] && key !== 'now' && hash.hasOwnProperty(key)) {
          result = result + '<li class="' + key + '">' + hash[key] + '</li>';
        }
      }
      Sammy.log('rendered flash: ' + result);
      return result;
    }
  };

  // Sammy.Flash is a plugin for storing and sending status messages to the client. It's API and use
  // is similar to Ruby on Rails' `flash` explained here:
  // [http://apidock.com/rails/ActionController/Flash](http://apidock.com/rails/ActionController/Flash)
  Sammy.Flash = function(app) {
    app.flash = new Sammy.FlashHash();

    // *Helper* flash(key, value) get or set a flash message that will
    // be erased on the next render (but not on redirect).
    //
    // @param [String] key, the Flash key
    // @param [String] value, the new value; optional
    // @return [Sammy.FlashHash, String, null] if a key was given, the value for that key; else, the Flash
    app.helper('flash', function(key, value) {
      if (arguments.length === 0) {
        return this.app.flash;
      } else if (arguments.length === 2) {
        this.app.flash[key] = value;
      }
      return this.app.flash[key];
    });

    // *Helper* flashNow(key, value) get or set a flash message that
    // will be erased on the next render or redirect.
    //
    // @param [String] key, the Flash key
    // @param [String] value, the new value; optional
    // @return [String, null] the value for the given key
    app.helper('flashNow', function(key, value) {
      if (arguments.length === 0) {
        return this.app.flash.now;
      }else if (arguments.length === 2) {
        this.app.flash.now[key] = value;
      }
      return this.app.flash.now[key];
    });

    app.bind('redirect', function() {
      this.app.flash._onRedirect();
    });
  };

})(jQuery);
