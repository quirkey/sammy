(function() {
/** @preserve
SetLocationFilter module for Sammy.js. 

Allows to delegate path scrubbing and alteration filters management to Sammy. 
The filters are automatically invoked context.app.setLocation(path). 
The resulting path will be result of application of all of the filters.

Copyright (c) 2012 Daniel Dotsenko, Willow Systems Corporation (willow-systems.com)
*/
/*
### Usage

    var mysammyapp = Sammy(function(){
      this.use('SetLocationFilter')
      var badWordfilterToken = this.setLocationFilter.add(
        function(path, stop){
          // we don't like bad words in links
          if (path.indexOf("badword") > -1) {
            stop() // no need to return. we die here.
          }
          var newpath = path + "_we_are_clean!"
          return newpath
        }
      )
    })

    // ...
    // later in route somewhere
    var returnvalue = this.setLocation("he he, badword here") // quietly dies elsewhere
    // returnvalue === false.

    // alternatively:
    var flag = {}
    var cleanpath = this.app.setLocationFilter.filter("#/i/am/a/badword/path", flag)
    if (flag.success) {
      console.log("Yey!!!. I can use :", cleanpath)
    }

    // or if you don't care about filter alarms:
    var cleanpath = this.app.setLocationFilter.filter("#/i/am/a/badword/path")

*/

var PluginInitializer = function(Sammy){
  'use strict'

  var FilterManager = function(SammyApplicationObject) {
    'use strict'

    var inventory = {}

    /**
     `add` allows adding a callback to the end of the filter callback stack
     of the setLocation(path) and setLocationFilter.filter(path) functions. The filter
     stack allows one to inject path manipulation logic that alters the 
     resulting path before it's sent to window.location or history.pushState()
    
     The callback should have the following signature:

         function(String path, Function(String message) StopSetLocation){
            // this === Sammy applicaiton object
            // StopSetLocationFn is your "red lever on a train"
            //    pull that when you need to stop the application of
            //    the filters and prevent setLocation from finishing.
            return manipulated_path
         }

      `add` returns a _token_ object. Keep it around if you want to remove
      the filter later. remove(token) function will expect that token.

     ### Examples
         var mysammyapp = Sammy(function(){
            this.use('SetLocationFilter')
            var badWordfilterToken = this.setLocationFilter.add(
              function(path, stop){
                // we don't like bad words in links
                if (path.indexOf("badword") > -1) {
                  stop() // no need to return. we die here.
                }
                var newpath = path + "_we_are_clean!"
                return newpath
              }
            )

            // ...
            // later in route somewhere
            var returnvalue = this.setLocation("he he, badword here") // quietly dies elsewhere
            // returnvalue === false.
         })
          
    */
    this['add'] = function(fn) {
      var token = [Date.now() + fn.toString().substr(0, 100), fn]
      inventory[token[0]] = fn
      return token
    }

    this['remove'] = function(token) {
      if (inventory[token[0]] === token[1]) {
        delete inventory[token[0]]
      }
    }

    var StopSetLocationEvent = function(){this.name = 'StopSetLocationEvent'}
    StopSetLocationEvent.prototype = Error

    var StopSetLocationFn = function(message){
      throw new StopSetLocationEvent(message)
    }

    /**
      `filter` method applies all the filters to the given path and
      returns the path back.
      
      If you care about filters raising a "stop iteration" alarm,
      pass in a `signal` object. When filter is done, it will have a property
      signal.success, which will either be Boolean `true` (for all filters
      went through their motions and did not raise any alarms) or
      Boolean `false`, meaning some filter raised an alarm and filtering
      loop was cut short.

      ### Examples

        // ... somewhere in route, where 'this' is the context object
        var flag = {}
        var cleanpath = this.app.setLocationFilter.filter("#/i/am/a/dirty/path")
        if (flag.success) {
          console.log("Yey!!!. I can use :", cleanpath)
        }
    */
    this['filter'] = function(path, signal){
      if (typeof signal !== 'object') { 
        signal = {} 
      }

      try {
        for (var key in inventory) {
          if (inventory.hasOwnProperty(key)) {
            path = inventory[key].call(SammyApplicationObject, path, StopSetLocationFn)
          }
        }
        signal.success = true
      }
      catch (e) {
        if (e.name === 'StopSetLocationEvent') {
          signal.success = false
        } else {
          throw e
        }
      }
      return path
    }

  };

  Sammy['SetLocationFilter'] = function(app) {
    'use strict'

    if (! app.setLocationFilter) {
      app.setLocationFilter = new FilterManager(app)
      var originalSetLocationFn = app.setLocation

      app.setLocation = function(new_location) {
        // this === app
        var signal = {}
        , args = Array.prototype.slice.call(arguments)

        args[0] = this.setLocationFilter['filter'](new_location, signal)

        if (signal.success){
          return originalSetLocationFn.apply(this, args)
        } else {
          return false
        }
      }      
    }
  }
} // end of PluginInitializer


// if ( typeof define === 'function' && define.amd ) {
//   // AMD-loader-compatible (non-)init

//   define(function(){
//     // To attach the plugin to Sammy, 
//     // Need to initialize it with Sammy object, when that is available.
//     // Example: 
//     //   require(
//     //      ['sammyjs','sammyjs.setlocationfilter']
//     //      , function(Sammy,PluginInitializer){ 
//     //          PluginInitializer(Sammy)
//     //          // do something with Sammy that expect to have the plug in in place.
//     //      }
//     //  )
//     return PluginInitializer /* function(SammyObject) */
//   })

// } else {

  var global = typeof window === 'object' ? 
    window : 
    // with 'use strict' there is a chance 'this' is undefined
    typeof this === 'object' ? 
      this : 
      (function(){throw new Error("Cannot find 'window' object or its equivalent.")})()

  if (!global.Sammy){
    global.Sammy = {} // Sammy will extend from this when it loads.
  }
  PluginInitializer(global.Sammy)

// }

})();
