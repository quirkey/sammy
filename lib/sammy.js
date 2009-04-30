// jresig's Class implementation
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

// Sammy
(function($) {
  
  Sammy = {};
  
  //= Sammy.Object
  //
  // Base Class
  Sammy.Object = Class.extend({
    init: function(set) {
      $.extend(this, set);
    },
    validateType: function(check, type, message) {
      if (check.constructor != type || typeof check != type) {
        throw(message);
      }
    },
    clone: function(obj) {
      return $.extend({}, obj);
    },
    toHTML: function() {
      var display = "";
      $.each(this, function(k, v) {
        if (v.constructor != Function) {
          display += "<strong>" + k + "</strong> " + v + "<br />";
        }
      });
      return display;
    },
    uuid: function() {
      if (typeof this._uuid == 'undefined' || !this._uuid) {
        this._uuid = Date.now() + '-' + parseInt(Math.random() * 1000);
      }
      return this._uuid;
    },
    log: function()	{
			if (typeof window.console != 'undefined') {
					window.console.log.apply(window.console, arguments);
			} else if (typeof console != 'undefined') {
				console.log.apply(this, arguments);
			} else {
				// do nothing
			}
		}
  });
  
  //= Sammy.Application
  //
  // Base Class for defining 'applications'
  Sammy.Application = Sammy.Object.extend({
    
    route_verbs: ['get', 'post', 'put'],
    data_store_name: 'sammy.app',
    last_route: null,
    silence_404: true,
    run_interval_every: 50,
    
    init: function(app_function) {
      var app = this;
      this.routes = {};
      this.namespace = this.uuid();
      $.each(this.route_verbs, function() {
        app._defineRouteShortcut(this);
      });
      app_function.apply(this);
    },
    
    route: function(verb, path, callback) {
      // validate that they are the right params
      var error_message = "#route needs a verb, path and callback"
      // this._validateType(verb, String, error_message);
      //       this._validateType(path, [String, RegExp], error_message);
      //       this._validateType(path, "function", error_message);
      //       
      // turn path into regex
      // create a simple object and add the route to it
      var r = {verb: verb, path: path, callback: callback};
      // add route to routes array
      if (typeof this.routes[verb] == 'undefined') this.routes[verb] = [];
      this.routes[verb].push(r);
      // return the route
      return r;
    },
    
    run: function() {
      var app = this;
      // set data for app
      $('body').data(this.data_store_name, this);
      // set last location
      this.last_location = {href: '', pathname: '', hash: ''};
      // check url
      this._checkURL();
      // set interval for url check
      this._interval = setInterval(function () {
        app._checkURL.apply(app);
      }, this.run_interval_every);
      
      // bind to form submission
      $('form').bind('submit', function() {
        return app._checkFormSubmission(this);
      });
      // bind unload to body unload
      $('body').bind('onunload', function() {
        app.unload();
      });
    },
    
    unload: function() {
      // clear interval
      clearInterval(this._interval);
      $('body').removeData(this.data_store_name);
      $('form').unbind('submit');
      // clear data
    },
    
    lookupRoute: function(verb, path) {
      var routed = false;
      if (typeof this.routes[verb] != 'undefined') {
        $.each(this.routes[verb], function(i, route) {
          if (route.path.constructor == RegExp) {
            if (path.match(route.path)) {
              routed = route;
              return false;
            }
          } else if (path == route.path) {
              routed = route;
              return false;
          }
        });
      }
      return routed;
    },
    
    runRoute: function(verb, path, params) {
      this.log('runRoute', verb, path);
      var route = this.lookupRoute(verb, path)
      if (route) {
        // set event context
        var context  = new Sammy.EventContext(this, verb, path, params);
        this.last_route = route;
        return route.callback.apply(context);
      } else {
        this.notFound(verb, path);
      }
    },
    
    currentLocation: function() {
      var location = this.clone(window.location);
      return location;
    },
    
    notFound: function(verb, path) {
      this.log('404 Not Found', 'app: ', this, verb, path);
      if (!this.silence_404) {
        throw('404 Not Found ' + verb + ' ' + path);
      };
    },
    
    _defineRouteShortcut: function(verb) {
      var app = this;
      this[verb] = function(path, callback) {
        app.route.apply(app, [verb, path, callback]);
      }
    },
    
    _checkURL: function() {
      // get current location
      var location = this.currentLocation();
      // compare to see if hash has changed
      if (location.hash != '' && location.hash != this.last_location.hash) {
        // lookup route for current hash
        this.runRoute('get', location.hash);
      // compare to see if path has changed
      } else if (location.pathname != this.last_location.pathname) {
        // lookup route for current path
        this.runRoute('get', location.pathname)
      }
      // reset last location
      this.last_location = location;
    },
    
    _checkFormSubmission: function(form) {
      this.log('_checkFormSubmission', form);
      var $form, path, verb, params;
      $form = $(form);
      path  = $form.attr('action');
      verb  = $form.attr('method').toString().toLowerCase();
      params = {};
      $form.find(':input[type!=submit]').each(function() {
        params[$(this).attr('name')] = $(this).val();
      });
      
      try {
        this.runRoute(verb, path, params);
        return false;
      } catch(err) {
        this.log(err);
      }
      return false;
    }
    
    
  });

  //= Sammy.Event
  // 
  // Event wraps jQuery events and is passed to Sammy application routes
  Sammy.EventContext = Sammy.Object.extend({
    
    render_types: {
                   'text': 'renderText', 
                   'html': 'renderHTML',
                   'partial': 'renderPartial'
                  },
    
    init: function(app, verb, path, params) {
      this.app    = app;
      this.verb   = verb;
      this.path   = path;
      this.params = new Sammy.Object(params);
    },
    
    render: function(type, selector, content) {
      try {
        this[this.render_types[type]](selector, content);
      } catch(e) {
        this.log('ERROR', e);
      }
    },
    
    renderText: function(selector, content) {
      return $(selector).text(content);
    },
    
    renderHTML: function(selector, content) {
      return $(selector).html(content);
    },
    
    renderPartial: function(selector, content) {
      return $.get(content, function(data) {
        $(selector).html(data);
      });
    },
    
    redirect: function(to) {
      this.log('Redirecting to', to)
      if (to.match(/^\#/)) {
        window.location.hash = to;
      } else if (to.match(/^\//)) {
        window.location.pathname = to;
      } else {
        window.location = to;
      }
      return true;
    },
    
    notFound: function() {
      this.log('running context not found');
      return this.app.notFound(this.verb, this.path);
    }
    
  });

})(jQuery);
