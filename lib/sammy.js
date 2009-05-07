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

(function($) {
  // Simple JavaScript Templating
  // John Resig - http://ejohn.org/ - MIT Licensed
  // adapted from: http://ejohn.org/blog/javascript-micro-templating/
  // by Greg Borenstein http://ideasfordozens.com in Feb 2009
  // --
  // slightly modified for Sammy for caching templates by name
  $.srender = function(name, template, data) {
    $.srender.cache = $.srender.cache || {};
    // target is an optional element; if provided, the result will be inserted into it
    // otherwise the result will simply be returned to the caller   
    if ($.srender.cache[name]) {
      fn = $.srender.cache[name];
    } else {
      if (typeof template == 'undefined') {
        // was a cache check, return false
        return false;
      }
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      fn = $.srender.cache[name] = new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +

      // Convert the template into pure JavaScript
      template
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
        + "');}return p.join('');");
    }
    
    if (typeof data != 'undefined') {
      return fn(data);
    } else {
      return fn;
    }
  }
})(jQuery);

// Sammy
(function($) {
  
  var PATH_REPLACER = "([^\/]+)";
  var PATH_NAME_MATCHER = /:([\w\d]+)/g;
  
  Sammy = {};
  
  //= Sammy.Object
  //
  // Base Class
  Sammy.Object = Class.extend({
    init: function(set) {
      $.extend(this, set);
    },
    clone: function(obj) {
      if (typeof obj == 'undefined') obj = this;
      return $.extend({}, obj);
    },
    toHTML: function() {
      var display = "";
      this.each(function(k, v) {
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
    // if passed an object and a callback, will iterate over the object
    // with (k, v) in the context of this object.
    // if passed just an argument - will itterate over 
    // the properties of this Sammy.Object
    each: function() {
      var context, object, callback, bound_callback;
      context = this;
      if (typeof arguments[0] != 'function') {
        object = arguments[0];
        callback = arguments[1];
      } else {
        object = this;
        callback = arguments[0];
      }
      bound_callback = function() {
        return callback.apply(context, arguments);
      }
      $.each(object, bound_callback);
    },
    log: function()	{
      var args = [].slice.call(arguments);
      args.unshift("[" + Date() + "]");
			if (typeof window.console != 'undefined') {
					window.console.log.apply(window.console, args);
			} else if (typeof console != 'undefined') {
				console.log.apply(this, args);
			} else {
				// do nothing
			}
		}
  });
  
  //= Sammy.Application
  //
  // Base Class for defining 'applications'
  Sammy.Application = Sammy.Object.extend({
    
    _route_verbs: ['get', 'post', 'put', 'delete'],
    _app_events: [
      'init',
      'run',
      'unload',
      'lookup-route',
      'run-route',
      'route-found',
      'event-context-before',
      'event-context-after',
      'changed',
      'error-404',
      'check-form-submission',
      'redirect'
    ],
    _last_route: null,
    _running: false,
    
    data_store_name: 'sammy-app',
    element_selector: 'body',
    
    debug: true,
    silence_404: true,
    run_interval_every: 50,
    
    init: function(app_function) {
      var app = this;
      this.routes    = {};
      this.listeners = {};
      this.befores   = [];
      this.namespace = this.uuid();
      this.each(this._route_verbs, function(i, verb) {
        this._defineRouteShortcut(verb);
      });
      app_function.apply(this);
      if (this.debug) {
        this.addLogger(function(e, data) {
          this.log(app.toString(), e.cleaned_type, data || {});
        })
      }
      this.trigger('init');
    },
    
    toString: function() {
      return 'Sammy.Application:' + this.element_selector;
    },
    
    $element: function() {
      return $(this.element_selector);
    },
    
    route: function(verb, path, callback) {
      // turn path into regex
      // create a simple object and add the route to it
      var app = this;
      var param_names = [];
      // if path is a string turn it into a regex
      if (path.constructor == String) {
        // find the names
        while ((path_match = PATH_NAME_MATCHER.exec(path)) != null) {
          param_names.push(path_match[1]);
        }
        // replace with the path replacement
        path = new RegExp(path.replace(PATH_NAME_MATCHER, PATH_REPLACER));
      }
      var r = {verb: verb, path: path, callback: callback, param_names: param_names};
      // add route to routes array
      if (typeof this.routes[verb] == 'undefined')  {
        // add to the front of an empty array
        this.routes[verb] = [r];
      } else {
        // place in order of longest path first
        this.each(this.routes[verb], function(i, route)  {
          if (path.toString().length >= route.path.toString().length) {
            this.routes[verb].splice(i, 0, r);
            // exit each()
            return false; 
          }
        });
      }
      // return the route
      return r;
    },
    
    eventNamespace: function() {
      return this.data_store_name + '-' + this.namespace + '-';
    },
    
    bind: function(name, data, callback) {
      // build the callback
      // if the arity is 2, callback is the second argument
      if (typeof callback == 'undefined') callback = data;
      var listener_callback =  function() {
        // pull off the context from the arguments to the callback
        var e, context, data; 
        e       = arguments[0];
        context = arguments[1];
        data    = arguments[2];
        e.cleaned_type = e.type.replace(context.eventNamespace(), '');
        callback.apply(context, [e, data]);
      };
      
      // it could be that the app element doesnt exist yet
      // so attach to the listeners array and then run()
      // will actually bind the event.
      if (!this.listeners[name]) this.listeners[name] = [];
      this.listeners[name].push(listener_callback);
      if (this.isRunning()) {
        // if the app is running
        // *actually* bind the event to the app element
        return this._listen(name, listener_callback);
      }
    },
    
    trigger: function(name, data, context) {
      if (typeof context == 'undefined') {
        context = new Sammy.EventContext(this, 'bind', name, data);
      }
      return this.$element().triggerHandler(context.eventNamespace() + name, [context, data]);
    },
    
    before: function(callback) {
      return this.befores.push(callback);
    },
    
    after: function(callback) {
      return this.bind('event-context-after', callback);
    },
    
    isRunning: function() {
      return this._running;
    },
    
    run: function(start_url) {
      if (this.isRunning()) return false;
      var app = this;
      
      // actually bind all the listeners
      this.each(this.listeners, function(name, listeners) {
        this.each(listeners, function(i, listener_callback) {
          this._listen(name, listener_callback);
        });
      });
      
      this.trigger('run', {start_url: start_url});
      this._running = true;
      // set data for app
      this.$element().data(this.data_store_name, this);
      // set last location
      this.last_location = {href: '', pathname: '', hash: ''};
      if (typeof start_url != 'undefined') window.location = start_url;
      // check url
      this._checkURL();
      // set interval for url check
      this._interval = setInterval(function () {
        app._checkURL.apply(app);
      }, this.run_interval_every);
      
      // bind re-binding to after route
      this.bind('changed', function() {
        // bind form submission 
        app.$element().find('form:not(.' + app.eventNamespace() + ')').bind('submit', function() {
          return app._checkFormSubmission(this);
        }).addClass(app.eventNamespace());
      });
      // bind unload to body unload
      $('body').bind('onunload', function() {
        app.unload();
      });
      
      // trigger html changed
      this.trigger('changed');
    },
    
    unload: function() {
      if (!this.isRunning()) return false;
      var app = this;
      this.trigger('unload');
      // clear interval
      clearInterval(this._interval);
      // unbind form submits
      this.$element().find('form')
        .unbind('submit')
        .removeClass(app.eventNamespace());
      // clear data
      this.$element().removeData(this.data_store_name);
      // unbind all events
      this.each(this.listeners, function(name, listeners) {
        this.each(listeners, function(i, listener_callback) {
          this._unlisten(name, listener_callback);
        });
      });
      this._running = false;
    },
    
    addLogger: function(logger) {
      var app = this;
      this.each(this._app_events, function() {
        this.bind(this, logger);
      });
    },
    
    lookupRoute: function(verb, path) {
      var routed = false;
      this.trigger('lookup-route', {verb: verb, path: path});
      if (typeof this.routes[verb] != 'undefined') {
        this.each(this.routes[verb], function(i, route) {
          if (path.match(route.path)) {
            routed = route;
            return false;
          }
        });
      }
      return routed;
    },
        
    runRoute: function(verb, path, params) {
      this.trigger('run-route', {verb: verb, path: path, params: params});
      if (typeof params == 'undefined') params = {};
      
      var route = this.lookupRoute(verb, path);
      if (route) {
        this.trigger('route-found', {route: route});
        // pull out the params from the path
        if ((path_params = route.path.exec(path)) != null) {
          // first match is the full path
          path_params.shift();
          // for each of the matches
          this.each(path_params, function(i, param) {
            // if theres a matching param name
            if (route.param_names[i]) {
              // set the name to the match
              params[route.param_names[i]] = param;
            } else {
              // initialize 'splat'
              if (!params['splat']) params['splat'] = [];
              params['splat'].push(param);
            }
          });
        }
        
        // set event context
        var context  = new Sammy.EventContext(this, verb, path, params);
        this.last_route = route;
        // run all the before filters
        var before_value = true; 
        var befores = this.befores.slice(0);
        while (befores.length > 0) {
          if (befores.shift().apply(context) === false) return false;
        }
        context.trigger('event-context-before');
        var returned = route.callback.apply(context);
        context.trigger('event-context-after');
        context.trigger('changed');
        return returned;
      } else {
        this.notFound(verb, path);
      }
    },
    
    currentLocation: function() {
      var location = this.clone(window.location);
      return location;
    },
    
    notFound: function(verb, path) {
      this.trigger('error-404', {verb: verb, path: path});
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
      var $form, path, verb, params;
      this.trigger('check-form-submission', {form: form});
      $form = $(form);
      path  = $form.attr('action');
      verb  = $form.attr('method').toString().toLowerCase();
      params = {};
      $form.find(':input[type!=submit]').each(function() {
        params[$(this).attr('name')] = $(this).val();
      });
      
      this.runRoute(verb, path, params);
      return false;
    },
    
    _listen: function(name, callback) {
      return this.$element().bind(this.eventNamespace() + name, callback);
    },
    
    _unlisten: function(name, callback) {
      return this.$element().unbind(this.eventNamespace() + name, callback);
    }
    
    
  });

  //= Sammy.Event
  // 
  // Event wraps jQuery events and is passed to Sammy application routes
  Sammy.EventContext = Sammy.Object.extend({
        
    init: function(app, verb, path, params) {
      this.app    = app;
      this.verb   = verb;
      this.path   = path;
      this.params = new Sammy.Object(params);
    },
    
    // render: function(type, selector, content, options) {
    //   if (typeof options == 'undefined' && 
    //      (typeof content == 'undefined' || typeof content == 'object')) {
    //     // if the arguments are more like type, content, options
    //     options = content;
    //     content = selector;
    //     selector = this.app.$element();
    //   }
    //   return this['_' + this.render_types[type]](selector, content, options);
    // },
    
    $element: function() {
      return this.app.$element();
    },
    
    template: function(template, data, name) {
      // use name for caching
      if (typeof name == 'undefined') name = template;
      return $.srender(name, template, $.extend({}, data, this));
    },
    
    partial: function(path, data, callback) {
      var t, rendered, context;
      context = this;
      if (typeof callback == 'undefined') {
        if (typeof data == 'function') {
          // callback is in the data position
          callback = data;
          data = {};
        } else {
          // we should use the default callback
          callback = function(data) {
            context.app.$element().html(data);
          }
        }
      }
      t    = $.srender(path);
      data = $.extend({}, data, this);
      if (t) {
        // the template was already cached
        rendered = t(data);
        callback.apply(context, [rendered]);
        context.trigger('changed');
      } else {
        // the template wasnt cached, we need to fetch it
        $.get(path, function(template) {
           rendered = $.srender(path, template, data);
           callback.apply(context, [rendered]);
           context.trigger('changed');
        });
      }
    },
        
    redirect: function(to) {
      this.trigger('redirect', {to: to});
      if (to.match(/^\#/)) {
        window.location.hash = to;
      } else if (to.match(/^\//)) {
        window.location.pathname = to;
      } else {
        window.location = to;
      }
      return true;
    },
    
    trigger: function(name, data) {
      return this.app.trigger(name, data, this);
    },
    
    eventNamespace: function() {
      return this.app.eventNamespace();
    },
    
    notFound: function() {
      return this.app.notFound(this.verb, this.path);
    }    
    
  });

})(jQuery);
