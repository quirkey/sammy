// jresig's Class implementation
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  this.Class = function(){};
  Class.extend = function(prop) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;
    for (var name in prop) {
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);       
            this._super = tmp;           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }   
    function Class() {
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    Class.prototype = prototype;
    Class.constructor = Class;
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

(function($) {
  
  var PATH_REPLACER = "([^\/]+)";
  var PATH_NAME_MATCHER = /:([\w\d]+)/g;
  
  Sammy = {};
  
  Sammy.VERSION = '0.1.1';
  
  // == Sammy.Object
  //
  // Sammy.Object is the base for all other Sammy classes. It provides some useful 
  // functionality, including cloning, iterating, etc.
  Sammy.Object = Class.extend({
    
    // Extend the passed object as a Sammy.Object
    init: function(set) {
      $.extend(this, set);
    },
    
    // If passed an obj, clone the attributes and methods of that object
    // If called without arguments, clones the callee.
    clone: function(obj) {
      if (typeof obj == 'undefined') obj = this;
      return $.extend({}, obj);
    },
    
    // Renders a simple HTML version of this Objects attributes.
    // Does not render functions.
    // For example. Given this Sammy.Object:
    //    
    //    var s = new Sammy.Object({first_name: 'Sammy', last_name: 'Davis Jr.'});
    //    s.toHTML() //=> '<strong>first_name</strong> Sammy<br /><strong>last_name</strong> Davis Jr.<br />'
    //
    toHTML: function() {
      var display = "";
      this.each(function(k, v) {
        if (v.constructor != Function) {
          display += "<strong>" + k + "</strong> " + v + "<br />";
        }
      });
      return display;
    },
    
    // Generates a unique identifing string. Used for application namespaceing.
    uuid: function() {
      if (typeof this._uuid == 'undefined' || !this._uuid) {
        this._uuid = (new Date()).getTime() + '-' + parseInt(Math.random() * 1000);
      }
      return this._uuid;
    },
    
    // If passed an object and a callback, will iterate over the object
    // with (k, v) in the context of this object.
    // If passed just an argument - will itterate over 
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
    
    // Uses console.log to log the arguments. If console (firebug is not present), 
    // it logs to the ether.
    // Also prefixes the arguments with a timestamp.
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
  
  // == Sammy.Application
  //
  // Sammy.Application is the Base prototype for defining 'applications'.
  // An 'application' is a collection of 'routes' and bound events that is
  // attached to an element when <tt>run()</tt> is called.
  //
  Sammy.Application = Sammy.Object.extend({
    
    // the four route verbs
    ROUTE_VERBS: ['get','post','put','delete'],
    
    // An array of the default events triggered by the 
    // application during its lifecycle
    APP_EVENTS: ['run','unload','lookup-route','run-route','route-found','event-context-before','event-context-after','changed','error-404','check-form-submission','redirect'],
    
    _last_route: null,
    _running: false,
    
    // On <tt>run()</tt> the application object is stored in a <tt>$.data</tt> entry
    // assocciated with the application's <tt>$element()</tt>
    data_store_name: 'sammy-app',
    
    // Defines what element the application is bound to. Provide a selector 
    // (parseable by <tt>jQuery()</tt>) and this will be used by <tt>$element()</tt>
    element_selector: 'body',
    
    // When set to true, logs all of the default events using <tt>log()</tt>
    debug: false,
    
    // When set to false, will throw a javascript error when a route is invoked
    // and can not be found.
    silence_404: true,
    
    // The time in milliseconds that the URL is queried for changes
    run_interval_every: 50,
    
    // Initializes a new Sammy.Application.
    // The only argument an 'app_function' is evaluated within the context of the application.
    init: function(app_function) {
      var app = this;
      this.routes    = {};
      this.listeners = {};
      this.befores   = [];
      this.namespace = this.uuid();
      this.each(this.ROUTE_VERBS, function(i, verb) {
        this._defineRouteShortcut(verb);
      });
      app_function.apply(this);
      if (this.debug) {
        this.addLogger(function(e, data) {
          this.log(app.toString(), e.cleaned_type, data || {});
        })
      }
    },
    
    // //=> Sammy.Application: body
    toString: function() {
      return 'Sammy.Application:' + this.element_selector;
    },
    
    // returns a jQuery object of the Applications bound element.
    $element: function() {
      return $(this.element_selector);
    },
    
    // <tt>route()</tt> is the main method for defining routes within an application.
    // For great detail on routes, check out: http://code.quirkey.com/sammy/doc/routes.html
    //
    // This method also has aliases for each of the different verbs (eg. <tt>get()</tt>, <tt>post()</tt>, etc.)
    //
    // === Arguments
    //
    // +verb+::     A String in the set of ROUTE_VERBS
    // +path+::     A Regexp or a String representing the path to match to invoke this verb.
    // +callback+:: A Function that is called/evaluated whent the route is run see: <tt>runRoute()</tt>
    //
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
      if (typeof this.routes[verb] == 'undefined' || this.routes[verb].length == 0)  {
        // add to the front of an empty array
        this.routes[verb] = [r];
      } else {
        // place in order of longest path first
        var placed = false;
        this.each(this.routes[verb], function(i, route)  {
          if (path.toString().length >= route.path.toString().length) {
            this.routes[verb].splice(i, 0, r);
            placed = true;
            // exit each()
            return false; 
          }
        });
        // not placed? path is the shortest seen so far. append to the end
        if (!placed) {
          this.routes[verb].push(r);
        }
      }
      // return the route
      return r;
    },
    
    // A unique event namespace defined per application.
    // All events bound with <tt>bind()</tt> are automatically bound within this space.
    eventNamespace: function() {
      return this.data_store_name + '-' + this.namespace + '-';
    },
    
    // Works just like <tt>jQuery.bind()</tt> with a couple noteable differences.
    //
    // * It binds all events to the application element
    // * All events are bound within the <tt>eventNamespace()</tt>
    // * Events are not actually bound until the application is started with <tt>run()</tt>
    //
    // See http://code.quirkey.com/sammy/docs/events.html for more info.
    //
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
    
    // Triggers custom events defined with <tt>bind()</tt>
    //
    // === Arguments
    // 
    // +name+::     The name of the event. Automatically prefixed with the <tt>eventNamespace()</tt>
    // +data+::     An optional Object that can be passed to the bound callback.
    // +context+::  An optional context/Object in which to execute the bound callback. 
    //              If no context is supplied a the context is a new <tt>Sammy.EventContext</tt>
    //
    trigger: function(name, data, context) {
      if (typeof context == 'undefined') {
        context = new Sammy.EventContext(this, 'bind', name, data);
      }
      return this.$element().triggerHandler(context.eventNamespace() + name, [context, data]);
    },
    
    // Takes a single callback that is pushed on to a stack.
    // Before any route is run, the callbacks are evaluated in order within 
    // the current <tt>Sammy.EventContext</tt>
    //
    // If any of the callbacks explicitly return false, execution of any 
    // further callbacks and the route itself is halted.
    before: function(callback) {
      return this.befores.push(callback);
    },
    
    // A shortcut for binding a callback to be run after a route is executed.
    // After callbacks have no guarunteed order.
    after: function(callback) {
      return this.bind('event-context-after', callback);
    },
    
    // Returns a boolean of weather the current application is running.
    isRunning: function() {
      return this._running;
    },
    
    // Actually starts the application's lifecycle. <tt>run()</tt> should be invoked
    // within a document.ready block to ensure the DOM exists before binding events, etc.
    //
    // === Example
    // 
    //    var app = $.sammy(function() { ... }); // your application
    //    $(function() { // document.ready
    //        app.run();
    //     });
    //
    // === Arguments
    //
    // +start_url+::  "value", Optionally, a String can be passed which the App will redirect to 
    //                after the events/routes have been bound.
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
    
    // The opposite of <tt>run()</tt>, un-binds all event listeners and intervals
    // <tt>run()</tt> Automaticaly binds a <tt>onunload</tt> event to run this when
    // the document is closed.
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
    
    // Provide a callback that is invoked every time one of the APP_EVENTS is triggered.
    //
    // === Example
    //
    //  // Prints log messages to #debug
    //  $(function() {
    //    app.addLogger(function(e, data) {
    //      $('#debug').append([app.toString(), app.namespace, e.cleaned_type, data, '<br />'].join(' '));
    //    })
    //    app.run('#/');
    //  });
    //
    addLogger: function(logger) {
      var app = this;
      this.each(this.APP_EVENTS, function() {
        this.bind(this, logger);
      });
    },
    
    // Given a verb and a String path, will return either a route object or false
    // if a matching route can be found within the current defined set. 
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
    
    // First, invokes <tt>lookupRoute()</tt> and if a route is found, parses the 
    // possible URL params and then invokes the route's callback within a new
    // <tt>Sammy.EventContext</tt>.
    // 
    // You probably will never have to call this directly.
    //
    // === Arguments
    // 
    // +verb+:: A String for the verb.
    // +path+:: A String path to lookup.
    // +params+:: An Object of Params pulled from the URI or passed directly.
    //
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
    
    // Returns a cloned location object.
    currentLocation: function() {
      var location = this.clone(window.location);
      return location;
    },
    
    // If <tt>silence_404</tt> is set to <tt>false</tt> will throw a '404 Not Found' error.
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

  // == Sammy.EventContext
  // 
  // <tt>Sammy.EventContext</tt> objects are created every time a route is run or a 
  // bound event is triggered. The callbacks for these events are evaluated within a <tt>Sammy.EventContext</tt>
  // This within these callbacks the special methods of <tt>EventContext</tt> are available.
  // 
  // === Example
  //
  //  $.sammy(function() { with(this) {
  //    // The context here is this Sammy.Application
  //    get('#/:name', function() { with(this) {
  //      // The context here is a new Sammy.EventContext
  //      if (params['name'] == 'sammy') {
  //        partial('name.html.erb', {name: 'Sammy'});
  //      } else {
  //        redirect('#/somewhere-else')
  //      }
  //    }});
  //  }});
  //
  Sammy.EventContext = Sammy.Object.extend({
    
    // Initialize a new EventContext
    //
    // === Arguments
    //
    // +app+::    The <tt>Sammy.Application</tt> this event is called within.
    // +verb+::   The verb invoked to run this context/route.
    // +path+::   The string path invoked to run this context/route.
    // +params+:: An Object of optional params to pass to the context. Is converted
    //            to a <tt>Sammy.Object</tt>.
    init: function(app, verb, path, params) {
      this.app    = app;
      this.verb   = verb;
      this.path   = path;
      this.params = new Sammy.Object(params);
    },
    
    // A shortcut to the app's <tt>$element()</tt>
    $element: function() {
      return this.app.$element();
    },
    
    // Uses <tt>$.srender</tt> to parse ERB like templates.
    //
    // === Arguments
    // 
    // +template+:: A String template. '<% %>' tags are evaluated as Javascript and replaced with the elements in data.
    // +data+::     An Object containing the replacement values for the template. 
    //              data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // +name+::     An optional String name to cache the template. Is used in <tt>partial()</tt> to cache remote templates.
    //
    template: function(template, data, name) {
      // use name for caching
      if (typeof name == 'undefined') name = template;
      return $.srender(name, template, $.extend({}, data, this));
    },
    
    // Used for rendering remote templates or documents within the current application/DOM.
    //
    // There are a couple different ways to use <tt>partial()</tt>:
    // 
    //      partial('doc.html');
    //      //=> Replaces $element() with the contents of doc.html
    //
    //      partial('doc.html.erb', {name: 'Sammy'}); 
    //      //=> Replaces $element() with the contents of doc.html.erb run through <tt>template()</tt>
    //
    //      partial('doc.html.erb', function(data) {
    //        // data is the contents of the template.
    //        $('.other-selector').html(data); 
    //      });
    //
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
    
    // Changes the location of the current window. If <tt>to</tt> begins with 
    // '#' it only changes the document's hash.  
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
    
    // Triggers events on <tt>app</tt> within the current context.
    trigger: function(name, data) {
      return this.app.trigger(name, data, this);
    },
    
    // A shortcut to app's <tt>eventNamespace()</tt>
    eventNamespace: function() {
      return this.app.eventNamespace();
    },
    
    // Raises a possible <tt>notFound()</tt> error for the current path.
    notFound: function() {
      return this.app.notFound(this.verb, this.path);
    }    
    
  });
  
  $.sammy = function(app_function) {
    return new Sammy.Application(app_function);
  };

})(jQuery);