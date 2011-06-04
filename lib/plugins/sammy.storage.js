(function($) {

  // helpers
  //
  var _invoke = function() {
    var args = Sammy.makeArray(arguments),
    fun  = args.shift(),
    thisarg = args.shift();

    if (Sammy.isFunction(fun)) {
      setTimeout(function() {
        fun.apply(thisarg || {}, args);
      }, 0);
    }
  };

  Sammy = Sammy || {};

  // Sammy.Store is an abstract adapter class that wraps the multitude of in
  // browser data storage into a single common set of methods for storing and
  // retreiving data. The JSON library is used (through the inclusion of the
  // Sammy.JSON) plugin, to automatically convert objects back and forth from
  // stored strings.
  //
  // Sammy.Store can be used directly, but within a Sammy.Application it is much
  // easier to use the `Sammy.Storage` plugin and its helper methods.
  //
  // Sammy.Store also supports the KVO pattern, by firing DOM/jQuery Events when
  // a key is set.
  //
  // ### Example
  //
  //       // create a new store named 'mystore', tied to the #main element, using HTML5 localStorage
  //       // Note: localStorage only works on browsers that support it
  //       var store = new Sammy.Store({name: 'mystore', element: '#element', type: 'local'});
  //       store.set('foo', 'bar');
  //       store.get('foo'); //=> 'bar'
  //       store.set('json', {obj: 'this is an obj'});
  //       store.get('json'); //=> {obj: 'this is an obj'}
  //       store.keys(); //=> ['foo','json']
  //       store.clear('foo');
  //       store.keys(); //=> ['json']
  //       store.clearAll();
  //       store.keys(); //=> []
  //
  // ### Arguments
  //
  // The constructor takes a single argument which is a Object containing these possible options.
  //
  // * `name` The name/namespace of this store. Stores are unique by name/type. (default 'store')
  // * `element` A selector for the element that the store is bound to. (default 'body')
  // * `type` The type of storage/proxy to use (default 'memory')
  //
  // Extra options are passed to the storage constructor.
  // Sammy.Store supports the following methods of storage:
  //
  // * `memory` Basic object storage
  // * `data` jQuery.data DOM Storage
  // * `cookie` Access to document.cookie. Limited to 2K
  // * `local` HTML5 DOM localStorage, browswer support is currently limited.
  // * `session` HTML5 DOM sessionStorage, browswer support is currently limited.
  //
  Sammy.Store = function(options) {
    var store = this;
    this.options  = options || {};
    this.name     = this.options.name || 'store';
    this.app      = this.options.app;
    if (Sammy.isArray(this.options.type)) {
      var i = 0, l = this.options.type.length, type;
      for (; i < l; i++) {
        type = this.options.type[i];
        if (Sammy.Store.isAvailable(type)) {
          store.type = type;
          break;
        }
      }
    } else {
      this.type = this.options.type || 'memory';
    }
    this.storage  = new Sammy.Store[Sammy.Store.stores[this.type]](this.name, this.options);
  };

  Sammy.Store.stores = {
    'memory': 'Memory',
    'local': 'LocalStorage',
    'session': 'SessionStorage',
    'cookie': 'Cookie'
  };

  Sammy.extend(Sammy.Store.prototype, {
    // Checks for the availability of the current storage type in the current browser/config.
    isAvailable: function() {
      if (Sammy.isFunction(this.storage.isAvailable)) {
        return this.storage.isAvailable();
      } else {
        return true;
      }
    },
    // Checks for the existance of `key` in the current store. Returns a boolean.
    exists: function(key, callback) {
      this.storage.exists(key, callback);
      return this;
    },
    // Sets the value of `key` with `value`. If `value` is an
    // object, it is turned to and stored as a string with `JSON.stringify`.
    // It also tries to conform to the KVO pattern triggering jQuery events on the
    // element that the store is bound to.
    //
    // ### Example
    //
    //     var store = new Sammy.Store({name: 'kvo'});
    //     $('body').bind('set-kvo-foo', function(e, data) {
    //       Sammy.log(data.key + ' changed to ' + data.value);
    //     });
    //     store.set('foo', 'bar'); // logged: foo changed to bar
    //
    set: function(key, value, callback) {
      var string_value = (typeof value == 'string') ? value : JSON.stringify(value);
      var store = this;
      key = key.toString();
      this.storage.set(key, string_value, function() {
        if (store.app) {
          store.app.trigger('set-' + store.name, {key: key, value: value});
          store.app.trigger('set-' + store.name + '-' + key, {key: key, value: value});
        }
        _invoke(callback, store, value, key);
      });
      return this;
    },
    // Returns the set value at `key`, parsing with `JSON.parse` and
    // turning into an object if possible
    get: function(key, callback) {
      var store = this;
      this.storage.get(key, function(value) {
        var val;
        if (typeof value == 'undefined' || value === null || value === '') {
          val = value;
        }
        try {
          val = JSON.parse(value);
        } catch(e) {
          val = value;
        }
        _invoke(callback, store, val);
      });
      return this;
    },

    // Removes the value at `key` from the current store
    clear: function(key, callback) {
      var store = this;
      this.storage.clear(key, function() {
        _invoke(callback, store);
      });
      return this;
    },
    // Clears all the values for the current store.
    clearAll: function(callback) {
      var store = this;
      this.storage.clearAll(function() {
        _invoke(callback, store);
      });
      return this;
    }
  });

  // Tests if the type of storage is available/works in the current browser/config.
  // Especially useful for testing the availability of the awesome, but not widely
  // supported HTML5 DOM storage
  Sammy.Store.isAvailable = function(type) {
    try {
      return Sammy.Store[Sammy.Store.stores[type]].prototype.isAvailable();
    } catch(e) {
      return false;
    }
  };

  // Memory ('memory') is the basic/default store. It stores data in a global
  // JS object. Data is lost on refresh.
  Sammy.Store.Memory = function(name) {
    this.name = name;
    Sammy.Store.Memory.store = Sammy.Store.Memory.store || {};
    Sammy.Store.Memory.store[this.name] = Sammy.Store.Memory.store[this.name] || {};
    this.store = Sammy.Store.Memory.store[this.name];
  };
  Sammy.extend(Sammy.Store.Memory.prototype, {
    isAvailable: function() { return true; },
    exists: function(key, callback) {
      return _invoke(callback, this, this.store.hasOwnProperty(key));
    },
    set: function(key, value, callback) {
      return _invoke(callback, this, this.store[key] = value, key);
    },
    get: function(key, callback) {
      return _invoke(callback, this, this.store[key]);
    },
    clear: function(key, callback) {
      delete Sammy.Store.Memory.store[this.name][key];
      return _invoke(callback, this, key);
    },
    clearAll: function(callback) {
      this.store = Sammy.Store.Memory.store[this.name] = {};
      return _invoke(callback, this, true);
    }
  });


  // LocalStorage ('local') makes use of HTML5 DOM Storage, and the window.localStorage
  // object. The great advantage of this method is that data will persist beyond
  // the current request. It can be considered a pretty awesome replacement for
  // cookies accessed via JS. The great disadvantage, though, is its only available
  // on the latest and greatest browsers.
  //
  // For more info on DOM Storage:
  // https://developer.mozilla.org/en/DOM/Storage
  // http://www.w3.org/TR/2009/WD-webstorage-20091222/
  //
  Sammy.Store.LocalStorage = function(name) {
    this.name = name;
    this.key_prefix = ['store', this.name].join('.');
    this.meta_key = "__" + name + "_keys__";
  };
  Sammy.extend(Sammy.Store.LocalStorage.prototype, {
    storage: window.localStorage,

    isAvailable: function() {
      return (this.storage !== null) &&
             (window.location.protocol != 'file:');
    },
    exists: function(key, callback) {
      this.get(key, function(val) {
        _invoke(callback, this, val !== null);
      });
    },
    set: function(key, value, callback) {
      this.storage.setItem(this._key(key), value);
      _invoke(callback, this, value, key);
    },
    get: function(key, callback) {
      var value = this.storage.getItem(this._key(key));
      // Some implementations of storage (I'm looking at you FF 3.0.8)
      // return an object from getItem
      if (value && typeof value.value != "undefined") {
        value = value.value;
      }
      _invoke(callback, this, value);
    },
    clear: function(key, callback) {
      this.storage.removeItem(this._key(key));
      _invoke(callback, this, key);
    },
    clearAll: function(callback) {
      var i = 0,
          l = this.storage.length,
          k,
          matcher = new RegExp("^" + this.key_prefix.replace('.', '\\.') + '\\.');
      for (; i < l; i++) {
        try {
          k = this.storage.key(i);
          if (matcher.test(k)) {
              this.storage.removeItem(k);
          }
        } catch(e) {}
      }
      _invoke(callback, this, true);
    },
    _key: function(key) {
      return [this.key_prefix, key].join('.');
    }
  });

  // .SessionStorage ('session') is similar to LocalStorage (part of the same API)
  // and shares similar browser support/availability. The difference is that
  // SessionStorage is only persistant through the current 'session' which is defined
  // as the length that the current window is open. This means that data will survive
  // refreshes but not close/open or multiple windows/tabs. For more info, check out
  // the `LocalStorage` documentation and links.
  Sammy.Store.SessionStorage = function(name) {
    this.name = name;
    this.key_prefix = ['store', this.name].join('.');
    this.meta_key = "__" + name + "_keys__";
  };
  Sammy.extend(Sammy.Store.SessionStorage.prototype, Sammy.Store.LocalStorage.prototype, {
    storage: window.sessionStorage
  });

  // .Cookie ('cookie') storage uses browser cookies to store data. JavaScript
  // has access to a single document.cookie variable, which is limited to 2Kb in
  // size. Cookies are also considered 'unsecure' as the data can be read easily
  // by other sites/JS. Cookies do have the advantage, though, of being widely
  // supported and persistent through refresh and close/open. Where available,
  // HTML5 DOM Storage like LocalStorage and SessionStorage should be used.
  //
  // .Cookie can also take additional options:
  //
  // * `expires_in` Number of seconds to keep the cookie alive (default 2 weeks).
  // * `path` The path to activate the current cookie for (default '/').
  //
  // For more information about document.cookie, check out the pre-eminint article
  // by ppk: http://www.quirksmode.org/js/cookies.html
  //
  Sammy.Store.Cookie = function(name, options) {
    this.name = name;
    this.options = options || {};
    this.path = this.options.path || '/';
    // set the expires in seconds or default 14 days
    this.expires_in = this.options.expires_in || (14 * 24 * 60 * 60);
  };
  $.extend(Sammy.Store.Cookie.prototype, {
    isAvailable: function() {
      return ('cookie' in document) && (window.location.protocol != 'file:');
    },
    exists: function(key, callback) {
      this.get(key, function(val) {
        _invoke(callback, this, val !== null);
      });
    },
    set: function(key, value, callback) {
      this._setCookie(key, value);
      _invoke(callback, false, value, key);
    },
    get: function(key, callback) {
      _invoke(callback, false, this._getCookie(key));
    },
    clear: function(key, callback) {
      this._setCookie(key, "", -1);
      _invoke(callback, false, key);
    },
    clearAll: function(callback) {
      _invoke(callback, true);
    },
    _key: function(key) {
      return ['store', this.name, key].join('.');
    },
    _escapedKey: function(key) {
      return key.replace(/(\.|\*|\(|\)|\[|\])/g, '\\$1');
    },
    _getCookie: function(key) {
      var match = document.cookie.match("(^|;\\s)" + this._escapedKey(this._key(key))+ "=([^;]*)(;|$)");
      return (match ? match[2] : null);
    },
    _setCookie: function(key, value, expires) {
      if (!expires) { expires = (this.expires_in * 1000); }
      var date = new Date();
      date.setTime(date.getTime() + expires);
      var set_cookie = [
        this._key(key), "=", value,
        "; expires=", date.toGMTString(),
        "; path=", this.path
      ].join('');
      document.cookie = set_cookie;
    }
  });

  // Sammy.Storage is a plugin that provides shortcuts for creating and using
  // Sammy.Store objects. Once included it provides the `store()` app level
  // and helper methods. Depends on Sammy.JSON (or json2.js).
  Sammy.Storage = function(app) {
    this.use(Sammy.JSON);

    this.stores = this.stores || {};

    // `store()` creates and looks up existing `Sammy.Store` objects
    // for the current application. The first time used for a given `'name'`
    // initializes a `Sammy.Store` and also creates a helper under the store's
    // name.
    //
    // ### Example
    //
    //     var app = $.sammy(function() {
    //       this.use(Sammy.Storage);
    //
    //       // initializes the store on app creation.
    //       this.store('mystore', {type: 'cookie'});
    //
    //       this.get('#/', function() {
    //         // returns the Sammy.Store object
    //         this.store('mystore');
    //         // sets 'foo' to 'bar' using the shortcut/helper
    //         // equivilent to this.store('mystore').set('foo', 'bar');
    //         this.mystore('foo', 'bar');
    //         // returns 'bar'
    //         // equivilent to this.store('mystore').get('foo');
    //         this.mystore('foo');
    //         // returns 'baz!'
    //         // equivilent to:
    //         // this.store('mystore').fetch('foo!', function() {
    //         //   return 'baz!';
    //         // })
    //         this.mystore('foo!', function() {
    //           return 'baz!';
    //         });
    //
    //         this.clearMystore();
    //         // equivilent to:
    //         // this.store('mystore').clearAll()
    //       });
    //
    //     });
    //
    // ### Arguments
    //
    // * `name` The name of the store and helper. the name must be unique per application.
    // * `options` A JS object of options that can be passed to the Store constuctor on initialization.
    //
    this.store = function(name, options) {
      // if the store has not been initialized
      if (typeof this.stores[name] == 'undefined') {
        // create initialize the store
        var clear_method_name = "clear" + name.substr(0,1).toUpperCase() + name.substr(1);
        this.stores[name] = new Sammy.Store($.extend({
          name: name,
          element: this.element_selector
        }, options || {}));
        // app.name()
        this[name] = function(key, value) {
          if (typeof value == 'undefined') {
            return this.stores[name].get(key);
          } else if ($.isFunction(value)) {
            return this.stores[name].fetch(key, value);
          } else {
            return this.stores[name].set(key, value)
          }
        };
        // app.clearName();
        this[clear_method_name] = function() {
          return this.stores[name].clearAll();
        }
        // context.name()
        this.helper(name, function() {
          return this.app[name].apply(this.app, arguments);
        });
        // context.clearName();
        this.helper(clear_method_name, function() {
          return this.app[clear_method_name]();
        });
      }
      return this.stores[name];
    };

    this.helpers({
      store: function() {
        return this.app.store.apply(this.app, arguments);
      }
    });
  };

  // Sammy.Session is an additional plugin for creating a common 'session' store
  // for the given app. It is a very simple wrapper around `Sammy.Storage`
  // that provides a simple fallback mechanism for trying to provide the best
  // possible storage type for the session. This means, `LocalStorage`
  // if available, otherwise `Cookie`, otherwise `Memory`.
  // It provides the `session()` helper through `Sammy.Storage#store()`.
  //
  // See the `Sammy.Storage` plugin for full documentation.
  //
  Sammy.Session = function(app, options) {
    this.use(Sammy.Storage);
    // check for local storage, then cookie storage, then just use memory
    this.store('session', $.extend({type: ['local', 'cookie', 'memory']}, options));
  };

  // Sammy.Cache provides helpers for caching data within the lifecycle of a
  // Sammy app. The plugin provides two main methods on `Sammy.Application`,
  // `cache` and `clearCache`. Each app has its own cache store so that
  // you dont have to worry about collisions. As of 0.5 the original Sammy.Cache module
  // has been deprecated in favor of this one based on Sammy.Storage. The exposed
  // API is almost identical, but Sammy.Storage provides additional backends including
  // HTML5 Storage. `Sammy.Cache` will try to use these backends when available
  // (in this order) `LocalStorage`, `SessionStorage`, and `Memory`
  Sammy.Cache = function(app, options) {
    this.use(Sammy.Storage);
    // set cache_partials to true
    this.cache_partials = true;
    // check for local storage, then session storage, then just use memory
    this.store('cache', $.extend({type: ['local', 'session', 'memory']}, options));
  };

})(jQuery);
