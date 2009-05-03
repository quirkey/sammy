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
      'html-changed',
      'unload',
      'lookup-route',
      'run-route',
      'route-found',
      'event-context-before',
      'event-context-after',
      'error-404',
      'check-form-submission',
      'render-text',
      'render-html',
      'render-partial',
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
      this.namespace = this.uuid();
      $.each(this._route_verbs, function() {
        app._defineRouteShortcut(this);
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
        $.each(this.routes[verb], function(i, route)  {
          if (path.toString().length >= route.path.toString().length) {
            app.routes[verb].splice(i, 0, r);
            // exit each()
            return false; 
          }
        });
      }
      // return the route
      return r;
    },
    
    eventNamespace: function() {
      return this.data_store_name + '-' + this.namespace + ':';
    },
    
    bind: function(name, data, callback) {
      // it could be that the app element doesnt exist yet
      // so attach to the listeners array and then run()
      // will actually bind the event.
      if (!this.listeners[name]) this.listeners[name] = [];
      this.listeners[name].push([name, data, callback]);
      if (this.isRunning()) {
        // if the app is running
        // *actually* bind the event to the app element
        return this._listen(name, data, callback);
      }
    },
    
    trigger: function(name, data, context) {
      if (typeof context == 'undefined') context = this;
      return this.$element().triggerHandler(context.eventNamespace() + name, [context, data]);
    },
    
    before: function(callback) {
      return this.bind('event-context-before', callback);
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
      $.each(this.listeners, function(name, listeners) {
        $.each(listeners, function(i, listener) {
          app._listen.apply(app, listener);
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
      
      // bind re-binding to html-changed event
      this.bind('html-changed', function() {
        // bind form submission 
        app.$element().find('form').bind('submit', function() {
          return app._checkFormSubmission(this);
        });
      });
      // bind unload to body unload
      $('body').bind('onunload', function() {
        app.unload();
      });
      
      // trigger html changed
      this.trigger('html-changed');
    },
    
    unload: function() {
      if (!this.isRunning()) return false;
      this.trigger('unload');
      // clear interval
      clearInterval(this._interval);
      // unbind form submits
      this.$element().find('form').unbind('submit');
      // clear data
      this.$element().removeData(this.data_store_name);
      this._running = false;
    },
    
    addLogger: function(logger) {
      var app = this;
      $.each(this._app_events, function() {
        app.bind(this, logger);
      });
    },
    
    lookupRoute: function(verb, path) {
      var routed = false;
      this.trigger('lookup-route', {verb: verb, path: path});
      if (typeof this.routes[verb] != 'undefined') {
        $.each(this.routes[verb], function(i, route) {
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
          $.each(path_params, function(i, param) {
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
        context.trigger('event-context-before');
        var returned = route.callback.apply(context);
        context.trigger('event-context-after');
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
    
    _listen: function(name, data, callback) {
      // if the arity is 2, callback is the second argument
      if (typeof callback == 'undefined') callback = data;
      return this.$element().bind(this.eventNamespace() + name, data, function() {
        // pull off the context from the arguments to the callback
        var e, context, data; 
        e       = arguments[0];
        context = arguments[1];
        data    = arguments[2];
        e.cleaned_type = e.type.replace(context.eventNamespace(), '');
        return callback.apply(context, [e, data]);
      });
    }
    
    
  });

  //= Sammy.Event
  // 
  // Event wraps jQuery events and is passed to Sammy application routes
  Sammy.EventContext = Sammy.Object.extend({
    
    render_types: {
                   'text':    'renderText', 
                   'html':    'renderHTML',
                   'partial': 'renderPartial'
                  },
    
    init: function(app, verb, path, params) {
      this.app    = app;
      this.verb   = verb;
      this.path   = path;
      this.params = new Sammy.Object(params);
    },
    
    render: function(type, selector, content) {
      return this[this.render_types[type]](selector, content);
    },
    
    renderText: function(selector, content) {
      var $selector = $(selector).text(content);
      this.trigger('render-text', {selector: selector, content: content});
      this.trigger('html-changed');
      return $selector;
    },
    
    renderHTML: function(selector, content) {
      var $selector = $(selector).html(content);
      this.trigger('render-html', {selector: selector, content: content});
      this.trigger('html-changed');
      return $selector;
    },
    
    renderPartial: function(selector, content) {
      var context = this;
      this.trigger('render-partial', {selector: selector, content: content});
      return $.get(content, function(data) {
        $(selector).html(data);
        context.trigger('html-changed');
      });
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
