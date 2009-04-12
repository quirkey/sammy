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
    _validateType: function(check, type, message) {
      if (check.constructor != type || typeof check != type) {
        throw(message);
      }
    }
  });
  
  //= Sammy.Application
  //
  // Base Class for defining 'applications'
  Sammy.Application = Sammy.Object.extend({
    
    routes: {},
    
    init: function(app_function) {
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
      this.routes[verb] = this.routes[verb] || [];
      this.routes[verb].push(r);
      // return the route
      return r;
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
      if (routed) {
        return routed;
      } else {
        throw("404 Not Found")
      }
    }
    
  });

  //= Sammy.Event
  // 
  // Event wraps jQuery events and is passed to Sammy application routes
  Sammy.Event = Class.extend({
    
  });

})(jQuery);
