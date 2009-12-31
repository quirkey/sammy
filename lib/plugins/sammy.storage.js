(function($) {

  Sammy = Sammy || {};

  // Sammy.Store is an abstract adapter class that wraps the multitude of in
  // browser data storage into a single common set of methods for storing and
  // retreiving data. The JSON library is used (through the inclusion of the 
  // Sammy.JSON) plugin, to automatically convert objects back and forth from 
  // stored strings.
  // 
  // Sammy.Store can be used directly, but within a Sammy.Application it is much
  // easier to use the <tt>Sammy.Storage</tt> plugin and its helper methods. 
  //
  // Sammy.Store also supports the KVO pattern, by firing DOM/jQuery Events when
  // a key is set.
  //
  // === Example
  //
  //      // create a new store named 'mystore', tied to the #main element, using HTML5 localStorage
  //      // Note: localStorage only works on browsers that support it
  //      var store = new Sammy.Store({name: 'mystore', element: '#element', type: 'local'});
  //      store.set('foo', 'bar');
  //      store.get('foo'); //=> 'bar'
  //      store.set('json', {obj: 'this is an obj'});
  //      store.get('json'); //=> {obj: 'this is an obj'}
  //      store.keys(); //=> ['foo','json']
  //      store.clear('foo');
  //      store.keys(); //=> ['json']
  //      store.clearAll();
  //      store.keys(); //=> []
  // 
  // === Arguments
  //
  // The constructor takes a single argument which is a Object containing these possible options.
  // 
  // +name+::     The name/namespace of this store. Stores are unique by name/type. (default 'store')
  // +element+::  A selector for the element that the store is bound to. (default 'body')
  // +type+::     The type of storage/proxy to use (default 'memory')
  //  
  // Extra options are passed to the storage constructor.
  // Sammy.Store supports the following methods of storage:
  // 
  // +memory+::   Basic object storage
  // +data+::     jQuery.data DOM Storage
  // +cookie+::   Access to document.cookie. Limited to 2K
  // +local+::    HTML5 DOM localStorage, browswer support is currently limited.
  // +session+::  HTML5 DOM sessionStorage, browswer support is currently limited.
  //
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

  // Tests if the type of storage is available/works in the current browser/config.
  // Especially useful for testing the availability of the awesome, but not widely
  // supported HTML5 DOM storage
  Sammy.Store.isAvailable = function(type) {
    return Sammy.Store[Sammy.Store.stores[type]].prototype.isAvailable();
  };

  $.extend(Sammy.Store.prototype, {
    // Checks for the availability of the current storage type in the current browser/config.
    isAvailable: function() {
      if ($.isFunction(this.storage.isAvailable)) {
        return this.storage.isAvailable();
      } else {
        true;
      }
    },
    // Checks for the existance of <tt>key</tt> in the current store. Returns a boolean.
    exists: function(key) {
      return this.storage.exists(key);
    },
    // Sets the value of <tt>key<tt> with <tt>value</tt>. If <tt>value<tt> is an
    // object, it is turned to and stored as a string with <tt>JSON.stringify</tt>.
    // It also tries to conform to the KVO pattern triggering jQuery events on the 
    // element that the store is bound to.
    // 
    // === Example
    //
    //      var store = new Sammy.Store({name: 'kvo'});
    //      $('body').bind('set-kvo.foo', function() { 
    //        alert('foo changed!') 
    //      });
    //      store.set('foo', 'bar'); // alerted: foo changed!
    //
    set: function(key, value) {
      value = (typeof value == 'string') ? value : JSON.stringify(value);
      if (key != this.meta_key) { this._addKey(key); };
      this.storage.set(key, value);
      this.$element.trigger('set-' + this.name + '.' + key, [key, value]);
      this.$element.trigger('set-' + this.name, [key, value]);
      return value;
    },
    // Returns the set value at <tt>key</tt>, parsing with <tt>JSON.parse</tt> and 
    // turning into an object if possible
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
    // Removes the value at <tt>key</tt> from the current store
    clear: function(key) {
      this._removeKey(key);
      return this.storage.clear(key);
    },
    // Clears all the values for the current store.
    clearAll: function() {
      var self = this;
      $.each(this.keys(), function(i, key) {
        self.clear(key);
      });
    },
    // Returns the all the keys set for the current store as an array.
    // Internally Sammy.Store keeps this array in a 'meta_key' for easy access.
    keys: function() {
      return this.get(this.meta_key) || [];
    },
    // Returns the value at <tt>key</tt> if set, otherwise, runs the callback
    // and sets the value to the value returned in the callback.
    // 
    // === Example
    // 
    //    var store = new Sammy.Store;
    //    store.exists('foo'); //=> false
    //    store.fetch('foo', function() {
    //      return 'bar!';
    //    }); //=> 'bar!'
    //    store.get('foo') //=> 'bar!'
    //    store.fetch('foo', function() {
    //      return 'baz!';
    //    }); //=> 'bar!
    // 
    fetch: function(key, callback) {
      if (!this.exists(key)) {
        return this.set(key, callback.apply(this));
      } else {
        return this.get(key);
      }
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
    isAvailable: function() {
      return ('localStorage' in window);
    },
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
    isAvailable: function() {
      return ('sessionStorage' in window);
    },
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

  Sammy.Store.Cookie = function(name, $element, options) {
    this.name = name;
    this.$element = $element;
    this.options = options || {};
    this.path = this.options.path || '/';
    // set the expires in seconds or default 14 days
    this.expires_in = this.options.expires_in || (14 * 24 * 60 * 60); 
  };
  $.extend(Sammy.Store.Cookie.prototype, {
    isAvailable: function() {
      return ('cookie' in document);
    },
    exists: function(key) {
      return (this.get(key) != null);
    },
    set: function(key, value) {
      return this._setCookie(key, value);
    },
    get: function(key) {
      return this._getCookie(key);
    },
    clear: function(key) {
      this._setCookie(key, "", -1);
    },
    _key: function(key) {
      return ['store', this.name, key].join('.');
    },
    _getCookie: function(key) {
      var escaped = this._key(key).replace(/(\.|\*|\(|\)|\[|\])/g, '\\$1');
      var match = document.cookie.match("(^|;\\s)" + escaped + "=([^;]*)(;|$)")
      return (match ? match[2] : null);
    },
    _setCookie: function(key, value, expires) {
      if (!expires) { expires = (this.expires_in * 1000) }
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

  Sammy.Storage = function(app) {
    this.use(Sammy.JSON);

    this.stores = this.stores || {};

    this.store = function(name, options) {
      // if the store has not been initialized
      if (typeof this.stores[name] == 'undefined') { 
        // create initialize the store
        this.stores[name] = new Sammy.Store($.extend({
          name: name, 
          element: this.element_selector
        }, options || {}));
        this[name] = function(key, value) {
          if (typeof value == 'undefined') {
            return this.stores[name].get(key);
          } else if ($.isFunction(value)) {
            return this.stores[name].fetch(key, value);
          } else {
            return this.stores[name].set(key, value)
          }
        };
        this.helper(name, function() {
          return this.app[name].apply(this.app, arguments);
        });
      }
      return this.stores[name];
    };
    
    this.helpers({
      store: function() {
        return this.app.apply(this.app, arguments);
      }
    });
  };
  
  Sammy.Session = function(app, options) {
    this.use(Sammy.Storage);
    // check for local storage, then cookie storage, then just use memory
    var type = 'memory';
    if (Sammy.Store.isAvailable('local')) {
      type = 'local';
    } else if (Sammy.Store.isAvailable('cookie')) {
      type = 'cookie';
    }
    this.store('session', $.extend({type: type}, options));
  };

})(jQuery);