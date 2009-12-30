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
  
  Sammy.Store.Cookie = function(name, $element, options) {
    this.name = name;
    this.$element = $element;
    this.options = options || {};
    this.path = this.options.path || '/';
    // set the expires in seconds or default 14 days
    this.expires_in = this.options.expires_in || (14 * 24 * 60 * 60); 
  };
  $.extend(Sammy.Store.Cookie.prototype, {
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
  		var set_cookie = [this._key(key), "=", value, "; expires=", date.toGMTString(), "; path=", this.path].join('');
    	document.cookie = set_cookie;
    }
  });  
  
  Sammy.Storage = function(app) {
    this.use(Sammy.JSON);
    
  };

})(jQuery);