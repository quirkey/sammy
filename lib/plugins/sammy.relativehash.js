(function() {
/** @preserve
RelativeHash module for Sammy.js. 

Allows one to use relative hash references (i.e. "#../../zzzz/xxxx") in routing
between Sammy-controlled pages, where if you start on one "referrer" hash, 
(i.e. "#/aaaa/bbbb/cccc/dddd") the relative hash would be resolved against it
(i.e. to result in "#/aaaa/zzzz/xxxx") before the route is processed by Sammy
or bubbled up to the browser (window.location). Also resolves paths given to
context.app.setLocation() method.

Copyright (c) 2012 Daniel Dotsenko, Willow Systems Corporation (willow-systems.com)
*/
/*
  See examples folder for usage.
*/

var PluginInitializer = function(Sammy, $){
  'use strict'

  var ApplyRelativePath = function(startingPath, relativePath, hashPrefix){
      'use strict'

      // there is a chance folder dividers occur in simulated args in 
      // hash (i.e. #/path/to/resource?arg=value )
      // for that reason we split off the string preceeding '?'

      // why splitting on hashPrefix?
      // This is a bit of magic we allow to be inserted into hash
      // to separate "semi-filebased" path from "pure, dynamic" path
      // portions of the hash.
      // In another plugin - FileSystemContent - we wire up
      // Sammy to derive name of content underlying the requested
      // hash path to be in the actual folder designated by that hash.
      // There we can split and disconnect Sammy from content it serves
      // but duplicate use of hashPrefix pattern in the hash signals
      // switch from "look for this path on the drive" from "this is made up path
      // that is more of data paththrough" than path
      // Example:
      //  #/real/folder/on/drive/#/dynamic/data/you/pass/to/runner
      // Which sorta stands for something like this:
      //  #/real/folder/on/drive/?arg1=dynamic&arg2data&arg3=...etc...
      // We don't want those dynamic values to be interpreted as folders.

      startingPath = startingPath
        .split('?',1)[0]
        .split('/'+hashPrefix+'/', 2)

      if ( startingPath.length > 1 ){
        // we had "/"+hashPrefix+"/" separator in the path.
        // splitting on it chopped off "/" and it needs to go back
        // to indicate we deal with a folder
        startingPath = startingPath[0] + '/'
      } else {
        startingPath = startingPath[0]
      }

      var newHashParts = startingPath.split('/')
      // regardless of if the end was "/" (resulting in last string of "") or "file.ext", it's not a name of "dir". Dropping.
      newHashParts.pop()
      // chopping off "#" and splitting the dirs in new relative hash
      var relativeHashParts = relativePath.split('/')
      , section
      for (var i = 0, l = relativeHashParts.length; i < l; i++) {
        section = relativeHashParts[i]
        if (section === "..") {
            if (newHashParts.length > 1 /* we are keeping hashPrefix in place */) {
              newHashParts.pop()
            }
        }
        else if (section === ".") { /* nothing to do for 'this' folder */ }
        else {newHashParts.push(section)}
      }
      return newHashParts.join('/')
  }

  var ClickEventHandlerConstructor = function($, hashPrefix){
    'use strict'
    return function(e){
      'use strict'
      var t = e.currentTarget
      , $t = $(t)
      // run-around for changes to how .attr() works since jQuery 1.6.1
      , encodedHash = $t.prop ? $t.attr('href') : t.getAttribute('href')
      
      // let's extract the start of path (part before first '/') and see if it looks like
      // hash + start of relative path
      var pathStart = encodedHash.split('/', 1)[0]
      if (pathStart === hashPrefix + '.' || pathStart === hashPrefix + '..'){
        
        var resolvedURL = ( $t.prop ? $t.prop('href') : $t[0].href ).split(encodedHash)

        // if there is nothing trailing the relative hash fragment in resolved URL we can work with it
        if (resolvedURL.length === 2 && resolvedURL[1] === ''){
          var newHash = ApplyRelativePath(
            window.location.hash
            , encodedHash.substr(hashPrefix.length, encodedHash.length) // this one stips hashPrefix from rel hash.
            , hashPrefix
          )
          if ($t.prop) {
            // jQuery 1.6.1+

            // Prop changes the "shadow" DOM property that reflects the current state
            // In this case, a.href Property is usually always computed / resolved
            // already by the browser. we do same.
            // Property value is the one that browser uses for href when bubbling up is done.
            // In some browsers, just changing the attr did not change prop (final destination href)
            // for me, while in other setAttribute auto recalcs e.href. Hence doing both.
            // with changing of property coming first on purpose, allowing setAttribute to do
            // whatever it sees fit. In other words, I expect setAttribute to get it right, but
            // this e.href =  is just in case it does not.
            $t.prop('href', resolvedURL[0] + newHash)

            // Attr changes the actual HTML
            $t.attr('href', newHash)
          } else {
            // crossing figers... hope this works as expected on all browsers.

            // ~ equivalent to $.prop() on 1.6.1+
            t.href = resolvedURL[0] + newHash
            // ~ equivalent to $.attr() on 1.6.1+ 
            t.setAttribute('href', newHash)
          }
        }
      }
      // we don't want to interupt the bubbling up. 
      return true;
    }
  }

  var AttachClickListener = function($e, $, hashPrefix) {
    'use strict'

    // let's not set up event listenner if there is one already there.
    var namespace = 'SammyJS-RelativeHashPlugin-ForHash-' + hashPrefix
    , eventsTree = $e.data('events')
    , doAttach = true

    // tryin to avoid attaching multiple listeners (happens only when you init plugin (or Sammy app)
    // on same page several times.)
    if (eventsTree && eventsTree.click){
      for (var i in eventsTree.click) { 
        if (eventsTree.click.hasOwnProperty(i)){ 
          if (eventsTree.click[i].namespace === namespace) {
            doAttach = false
          }
        } 
      }
    }

    if(doAttach){
      if ($e.on) {
        $e.on(
          'click.' + namespace
          , 'a'
          , ClickEventHandlerConstructor($, hashPrefix)
        )
      } else {
        $e.delegate(
          'a'
          , 'click.' + namespace
          , ClickEventHandlerConstructor($, hashPrefix)
        )
      }
    }
  }

  Sammy['RelativeHash'] = function(app, hashPrefix) {
    'use strict'

    if (typeof hashPrefix !== 'string') {
      throw new Error("hashPrefix is not defined. You must init this plug in with hash prefix string appropriate to your case. (examples: '#', '#!')")
    }

    // wiring sammy_app.setLocation() to convert the paths
    if ( !app.setLocationFilter ) {
      if ( !Sammy.SetLocationFilter ) {
        throw new Error("Sammy SelLocationFilter plugin is required for RelativeHash plugin to run.")
      }
      app.use('SetLocationFilter')
    }
    app.setLocationFilter.add(
      function(path){
        // let's extract the start of path and see if it looks like
        // hash + start of relative path
        var pathStart = path.split('/', 1)[0]
        if (pathStart === hashPrefix + '.' || pathStart === hashPrefix + '..'){
          path = ApplyRelativePath(
            window.location.hash
            , path.substr(hashPrefix.length, path.length) // this one strips hashPrefix from rel hash.
            , hashPrefix
          )
        }
        return path
      }
    )

    // now setting up a-tag-click watcher
    AttachClickListener( app.$element(), $, hashPrefix)
  }
} // end of PluginInitializer



// if ( typeof define === 'function' && define.amd ) {
//   // AMD-loader-compatible (non-)init

//   define(function(){
//     // To attach the plugin to Sammy, 
//     // Need to initialize the plugin with Sammy object and jQuery object
//     // , when that is available.
//     // Example: 
//     //   require(
//     //      ['jquery','sammyjs','sammyjs.relativehash']
//     //      , function(jQuery, Sammy, PluginInitializer){ 
//     //          PluginInitializer(Sammy, jQuery)
//     //          // do something with Sammy that expects to have the plug in in place.
//     //      }
//     //  )
//     return PluginInitializer /* function(SammyObject, jQueryObject) */
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
  PluginInitializer(global.Sammy, global.jQuery)

// }

})();
