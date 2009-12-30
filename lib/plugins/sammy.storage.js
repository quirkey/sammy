(function($) {

  Sammy = Sammy || {};

  Sammy.Store = function(options) {
    this.options  = options || {};
    this.name     = this.options.name || 'store';
    this.$element = $(this.options.element || 'body');
    this.type     = this.options.type || 'memory';
    this.meta_key = this.options.meta_key || '__keys__';
    this.storage  = new Sammy.Store[Sammy.Store.stores[this.type]](this.name, this.$element, this.options);
  };
  
  Sammy.Store.stores = {
    'memory': 'Memory',
    'data': 'Data',
    'local': 'LocalStorage',
    'session': 'SessionStorage',
    'cookie': 'Cookie'
  };
  
  $.extend(Sammy.Store.prototype, {
    exists: function(key) {
      return this.storage.exists(key);
    },
    set: function(key, value) {
      value = (typeof value == 'string') ? value : JSON.stringify(value);
      if (key != this.meta_key) { this._addKey(key); };
      this.storage.set(key, value);
      return value;
    },
    get: function(key) {
      var value = this.storage.get(key);
      if (typeof value == 'undefined' || value == null || value == '') {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch(e) {
        return value;
      }
    },
    clear: function(key) {
      this._removeKey(key);
      return this.storage.clear(key);
    },
    clearAll: function() {
      var self = this;
      $.each(this.keys(), function(i, key) {
        self.clear(key);
      });
    },
    keys: function() {
      return this.get(this.meta_key) || [];
    },
    fetch: function(key, callback) {
      
    },
    _addKey: function(key) {
      var keys = this.keys();
      if ($.inArray(key, keys) == -1) { keys.push(key); }
      this.set(this.meta_key, keys);
    },
    _removeKey: function(key) {
      var keys = this.keys();
      var index = $.inArray(key, keys);
      if (index != -1) { keys.splice(index, 1); }
      this.set(this.meta_key, keys);
    }
  });
  
  Sammy.Store.Memory = function(name) {
    this.name  = name;
    Sammy.Store.Memory.store = Sammy.Store.Memory.store || {};
    Sammy.Store.Memory.store[name] = Sammy.Store.Memory.store[name] || {};
    this.store = Sammy.Store.Memory.store[name];
  };
  $.extend(Sammy.Store.Memory.prototype, {
    exists: function(key) {
      return (typeof this.store[key] != "undefined");
    },
    set: function(key, value) {
      return this.store[key] = value;
    },
    get: function(key) {
      return this.store[key];
    },
    clear: function(key) {
      delete this.store[key];
    }
  });
  
  Sammy.Store.Data = function(name, $element) {
    this.name = name;
    this.$element = $element;
  };
  $.extend(Sammy.Store.Data.prototype, {
    exists: function(key) {
      return (typeof this.$element.data(this._key(key)) != "undefined");
    },
    set: function(key, value) {
      return this.$element.data(this._key(key), value);
    },
    get: function(key) {
      return this.$element.data(this._key(key));
    },
    clear: function(key) {
      this.$element.removeData(this._key(key));
    },
    _key: function(key) {
      return ['store', this.name, key].join('.');
    }
  });
  
  Sammy.Store.LocalStorage = function(name) {
    this.name = name;
  };
  $.extend(Sammy.Store.LocalStorage.prototype, {
    exists: function(key) {
      return (this.get(key) != null);
    },
    set: function(key, value) {
      return window.localStorage.setItem(this._key(key), value);
    },
    get: function(key) {
      return window.localStorage.getItem(this._key(key));
    },
    clear: function(key) {
      window.localStorage.removeItem(this._key(key));;
    },
    _key: function(key) {
      return ['store', this.name, key].join('.');
    }
  }); 
  
  Sammy.Store.SessionStorage = function(name) {
    this.name = name;
  };
  $.extend(Sammy.Store.SessionStorage.prototype, {
    exists: function(key) {
      return (this.get(key) != null);
    },
    set: function(key, value) {
      return window.sessionStorage.setItem(this._key(key), value);
    },
    get: function(key) {
      return window.sessionStorage.getItem(this._key(key));
    },
    clear: function(key) {
      window.sessionStorage.removeItem(this._key(key));;
    },
    _key: function(key) {
      return ['store', this.name, key].join('.');
    }
  });
  
  Sammy.Storage = function(app) {
    this.use(Sammy.JSON);
    
  };

  // // A simple cache strategy that stores key/values in memory. 
  // Sammy.MemoryCacheProxy = function(initial) {
  //   this._cache = initial || {};
  // };
  // 
  // $.extend(Sammy.MemoryCacheProxy.prototype, {
  //   exists: function(name) {
  //     return (typeof this._cache[name] != "undefined");
  //   },
  //   set: function(name, value) {
  //     return this._cache[name] = value;
  //   },
  //   get: function(name) {
  //     return this._cache[name];
  //   },
  //   clear: function(name) {
  //     delete this._cache[name];
  //   }
  // });
  // 
  // // A simple cache strategy that stores key/values <tt>$element.data()</tt> with a <tt>cache.</tt> prefix 
  // Sammy.DataCacheProxy = function(initial, $element) {
  //   initial = initial || {};
  //   this.$element = $element;
  //   $.each(initial, function(key, value) {
  //     $element.data('cache.' + key, value);
  //   });
  // };
  // 
  // $.extend(Sammy.DataCacheProxy.prototype, {
  //   exists: function(name) {
  //     return (typeof this.$element.data('cache.' + name) != "undefined");
  //   },
  //   set: function(name, value) {
  //     return this.$element.data('cache.' + name, value);
  //   },
  //   get: function(name) {
  //     return this.$element.data('cache.' + name);
  //   },
  //   clear: function(name) {
  //     this.$element.removeData('cache.' + name);
  //   }
  // });
  // 
  // // Sammy.Cache provides helpers for caching data within the lifecycle of a 
  // // Sammy app. The plugin provides two main methods on <tt>Sammy.Application<tt>,
  // // <tt>cache</tt> and <tt>clearCache</tt>. Each app has its own cache store so that
  // // you dont have to worry about collisions. There are currently two different 'cache proxies'
  // // that share the same API but store the data in different ways. 
  // //
  // // === Arguments
  // //
  // // +proxy+:: decides which caching proxy to use, either 'memory'(default) or 'data' 
  // //
  // Sammy.Cache = function(app, proxy) {
  // 
  //   if (proxy == 'data') {
  //     this.cache_proxy = new Sammy.DataCacheProxy({}, this.$element());
  //   } else {
  //     this.cache_proxy = new Sammy.MemoryCacheProxy({});
  //   } 
  //   
  //   app.cache_partials = true;
  // 
  //   $.extend(app, {
  //     // cache is the main method for interacting with the cache store. The same
  //     // method is used for both setting and getting the value. The API is similar
  //     // to jQuery.fn.attr()
  //     //
  //     // === Examples
  //     //
  //     //      // setting a value
  //     //      cache('key', 'value');
  //     //
  //     //      // getting a value
  //     //      cache('key'); //=> 'value'
  //     //
  //     //      // setting a value with a callback
  //     //      cache('key', function() {
  //     //        // this is the app
  //     //        return app.element_selector;
  //     //      });
  //     //            
  //     cache: function(name, value) {
  //       if (typeof value == 'undefined') {
  //         return this.cache_proxy.get(name);
  //       } else if ($.isFunction(value) && !this.cache_proxy.exists(name)) {
  //         return this.cache_proxy.set(name, value.apply(this));
  //       } else {
  //         return this.cache_proxy.set(name, value)
  //       }
  //     },
  // 
  //     // clears the cached value for <tt>name</tt>
  //     clearCache: function(name) {
  //       return this.cache_proxy.clear(name);
  //     }
  //   });
  //   
  //   app.helpers({
  //     // a helper shortcut for use in <tt>Sammy.EventContext</tt>
  //     cache: function(name, value) {
  //       return this.app.cache(name, value);
  //     }
  //   });
  // };

})(jQuery);