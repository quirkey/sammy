(function($) {

  Sammy = Sammy || {};

  Sammy.MemoryCacheProxy = function(initial) {
    this._cache = initial || {};
  };

  $.extend(Sammy.MemoryCacheProxy.prototype, {
    exists: function(name) {
      return (typeof this._cache[name] != "undefined");
    },
    set: function(name, value) {
      return this._cache[name] = value;
    },
    get: function(name) {
      return this._cache[name];
    },
    clear: function(name) {
      delete this._cache[name];
    }
  });

  Sammy.Cache = function(app, proxy) {

    if (typeof proxy == 'undefined' || proxy == 'memory') {
      this.cache_proxy = new Sammy.MemoryCacheProxy({});
    }

    $.extend(app, {
      cache: function(name, value) {
        if (typeof value == 'undefined') {
          return this.cache_proxy.get(name);
        } else if ($.isFunction(value) && !this.cache_proxy.exists(name)) {
          return this.cache_proxy.set(name, value.apply(this));
        } else {
          return this.cache_proxy.set(name, value)
        }
      },

      clearCache: function(name) {
        return this.cache_proxy.clear(name);
      }
    });
  };

})(jQuery);