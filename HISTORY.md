== 0.7.6 [8/26/2014]

New:

- Extended renderEach documentation [rprince]
- Added bower.json file [mkoryak]

Fixed:

- Indentation in README [crzidea]

== 0.7.5 [2/22/2014]

New:

- Allow for different selectors in the push location proxy and only bind them within the app's element [kevingessner]
- Add AMD support to Handlebars [rikkert]
- Allow template paths with query parameters [trengrj]
- Allow JSON paths with query parameters [vicb]
- Support for new Google Analytics [erpheus]
- More documentation for contextMatchesOptions [PhilippSoehnlein]

Fixed:

- Documentation for onComplete was formatted incorrectly [togakangaroo]
- AMD issues [rikkert]
- Hostname issues in IE [teelahti]
- Clicking an element within a link that targets a different window should be ignored [dtretyakov]
- Allow using jQuery in noConflict mode [vicb]
- Test for console.log is broken in IE8 [CodeOtter]
- When not passing a verb to `route`, the assignment of path is broken [luckydrq]

== 0.7.4 [1/27/2013]

Fixed:

- Hotfix for bad jshinting of form matching

== 0.7.3 [1/27/2013]

New:

- Support for asynchronous chained callbacks [deitch]
- Make plugins AMD enabled [delrosario]
- Mixpanel and kissmetrics plugins [jpgarcia]

Fixed:

- Better target checking for links and forms [jamesarosen]
- Changed $.live() to $.delegate() [smithkl42]

== 0.7.2 [10/19/2012]

New:

- Partials support for jQuery.Tmpl [avalez]
- Make tests asynchronous [endor]
- Add a destroy method for unbinding and removing the app reference [mshmelev]

Fixed:

- Make syntax more js-lint friendly and add a missing return [piecioshka]
- Correct mustache documentation [ept]
- Template language plugin documentations were out of date [nsdpt]
- Only cache json if cache is explicitly true, only stop caching everything else if cache is explicitly false [cyx]
- Cmd-Click now works as expected on a Mac [pbiggar, o.v.]

Changed:

- Switch minification to use uglify.js

== 0.7.1 [01/18/2012]

New:

- Swap now takes an optional callback to execute after the swap is complete [enix, dfunckt]
- Added log function to Sammy.Application which adds the element_selector, so you can tell which app is running [Avi Deitcher]
- Sammy.Application.contextMatchesOptions can now match against an array of paths.

Fixed:

- DefaultLocationProxy tries to handle every link on the page [dfunckt]
- Fixes issue when multiple params with the same name are passed with empty values [bentruyman]
- Fix case where get form wasn't matching routes correctly if the form was empty
- Fix loadPartials to work with multiple partials [endor]
- dataType for $.ajax cant be null
- Use $.isPlainObject() to check for empty object in contextMatchesOptions

== 0.7.0 [07/30/2011]

New:

- Seamless Support for HTML5 History (on by default, use `disable_push_state` to turn off). [Thanks to chatgris for initial implementation]
- Sammy.Hoptoad and Sammy.Exceptional plugins [Thanks James Rosen!]
- Form2JSON Plugin [Thanks stephen101]
- Partials loading in render/load [Thanks endor]
- before matchers match verb arrays [Thanks endor]

Changed:

- ! Changes related to HTML5 History:
  - EventContext#path now returns the full path after the host from / even if HTML5 support is not enabled. (could be a breaking change)
  - HashLocationProxy is now DefaultLocationProxy and includes the pushState support
- ! All template plugins are now just wrappers without the actual template code (with the exception of Sammy.Meld and Sammy.Template) this
  means that you have to include the template code in your app before the Sammy plugin. The template library files have been included in
  this repo under `/vendor/templating` for your convenience
- Removed low timeout setting in RenderContext
- add support for more template caching options [Thanks Bryan Woods, Conner Peirce & Matt Vermaak (howaboutwe)]
- Upgraded/tested with latest jQuery (1.6.2)

Fixed:

- Don't blow up if a query string key doesn't have a corresponding value. [Thanks Ben Pickles!]
- defer loading content in RenderContext.render [Thanks Johann Klähn!]
- HashLocationProxy does not need to constantly trigger the 'hashchange' event when there is no hash. [Thanks Kevin Gessner!]
- _decode should be able to handle undefined arguments in order to deal with routes with optional params [Thanks Elijah Hamovitz!]
- GA plugin didn't work with async code. Now checks existence of _gaq in this.helpers.track(). [Thanks Gavin Cooper!]

== 0.6.3 [01/24/2011]

New:

- Sammy.Flash plugin [Thanks James Rosen!]
- Sammy.OAuth2 plugin from [Thanks assaf!]
- app.element takes a jQuery selector [Thanks Chris Mytton!]
- Updated docs and new site :)

Changed:

- Sammy.Template and Sammy.Tmpl use better internal vars to prevent collisions and auto-escape HTML [Thanks dvv!]
- Allow for passing of options and {escape_html: false} to Sammy.Template

Fixed:

- URL encoded and decoding properley handles spaces and + [Thanks kbuckler and benvinegar!]
- empty action or form method was crashing chrome when checking in _getFormVerb

== 0.6.2 [10/11/2010]

New:

- Sammy.Handlebars - a templating plugin for Handlebars.js [Thanks PlasticLizard!]
- Sammy.Tmpl - a templating plugin for the official jquery.tmpl engine [Thanks stevenharman!]
- Pulled the Sammy.GoogleAnalytics plugin into core, with modifications [Thanks to britg for the original!]

Changed:

- Upgraded to the latest Haml.js [Thanks stevenharman!]

Fixed:

- Fixed issue with DataLocationProxy#getLocation() returning null [Thanks crofty!]
- Fixed Rakefile and backend example issues. [Thanks fhemberger!]

== 0.6.1 [09/25/2010]

New:

- RenderContext#send() can execute arbitrary functions within the queue
- Application#clearTemplateCache() (self explanatory)
- RenderContext#`load()` automagically parses JSON and can pass that data to render()

Changed:

- RenderContext#renderEach() takes a callback that is called each for each value with the interpolated template [Thanks endor!]
- If RenderContext#collect() is passed only a function, its assumed that array is the previous content
- if RenderContext#then() is passed a string, its assumed that you want to call a helper in its context
- RenderContext#collect() can take a third argument which will run the collect immediately instead of in the queue

Fixed:

- Fixed renderEach for DOM templates
- Fixed Meld attribute interpolation
- Fix a number of jslint warnings

== 0.6.0 [08/04/2010]

New:

- Sammy.RenderContext provides a completely new way of handling loading,
interpolating and placing templates. It was rethought from the ground up to
fix a lot of the frustrations with nested templates and callbacks and handling
complex template scenarios. It also supports DOM elements as templates. The main
changes that effect existing sammy apps:
    - `partial()` is no longer very polymorphous. The basic usage
      `partial(template, data)` is still supported, but other forms have been
      removed in favor of specific methods like `render()` and `load()`
    - template engine lookup has been moved to `engineFor()`
- Sammy.Meld is a simple new templating engine written specifically for use with Sammy.
It uses jQuery's powerful DOM manipulation to merge data into DOM elements quickly. It's also currently < 100LOC
- Sammy.Pure wraps the pure.js templating engine for use with Sammy.
- Sammy.Object#escapeHTML() escapes HTML strings (for use in templates).
- Sammy.DataLocationProxy takes an optional `href_attribute` for binding clicks
directly to the proxy/data [Thanks CodeOfficer]
- Sammy.PathLocationProxy is a location proxy that does no in page changing and
is strictly for loading different code at different URIs
- Sammy looks for the rails style form method override (`input[name=_method]`) to
determine the submitted form's verb.

Changed:

- Upgraded to jQuery 1.4.2 - Previous 1.4.1 should still work, but I'm only
testing against 1.4.2
- You can no longer set the location_proxy directly. Instead, use
`setLocationProxy()`
which will ensure proper binding/unbinding.
- `use()` can now take a string of the sammy plugin you want to include:
`use('Storage')`. This is now the preferred way of including plugins, as it
improves error reporting greatly.
- Updated Sammy.Mustache

Fixed:

- The HashLocationProxy poller would not stop running even if the proxy had been
replaced.
- IE was incorrectly reporting the form method attribute if it wasn't GET/POST. [Thanks rmurphey]
- Mustache was not checking for its own existence correctly.


== 0.5.4 [04/29/2010]

New:

- Sammy.EJS plugin for using embeddedjs templates. [Thanks CodeOfficer!]
- Sammy.Store#each(), #filter() and #first()

Changed:

- $form is no longer passed as part of params. Instead use this.target in an event context.
This fixes issues with chrome running $.param() on form params
with the jQuery object nested.
- Sammy.Haml updated to haml-js 0.2.2 [Thanks creationix!]
- Forms with the 'get' method now change the location instead of submitting
behind the scenes. This makes it comply better with browser expectations. [Thanks langalex!]
- Refactored the query + form param parsing to all use a single internal method _parseParamPair()
- Completely remove the Sammy.Object#uuid() method.
- Inline documentation now just uses markdown instead of RDoc format.

Fixed:

- last_location was being overriden if you redirected back multiple times. #20
- Fixed some typos in docs. [Thanks akahn and manalang]

== 0.5.3 [04/02/2010]

Fixed:

- Fix hashchange events in IE8 when compatibility mode is turned on. [Thanks binary42, yeungda]
- Fixes for qunit-spec [Thanks Rich Manalang]
- Fix broken DataLocationProxy because of change in the way jQuery fires setData
- Use unbind instead of die in location proxies [Thanks Mickael Bailly]
- Fix double extension of partial() data [Thanks Jens Bissinger]
- Sammy.Store's KVO events fire two events, one for the store and one for the specific key.

New:

- Sammy.Title plugin for managing document.title
- Sammy.Form plugin for creating reusable forms based on objects
- Sammy.Store can take an array of types. Each type is checked in order for availability and the first available type is used.

Changed:

- Sammy.Haml Updated to latest haml-js [Thanks Tim Caswell]
- NestedParams should parse true and false values to literals

== 0.5.2 [03/14/2010]

Fixed:

- Error handling changed from 0.5.1 killed forms that weren't supposed to be caught by sammy.

New:

- New package.json file for easy install support with Jim. Also places some project meta-data in a universal place.

== 0.5.1 [03/06/2010]

New:

- EventContext#swap is a shortcut to Application#swap (used within `partial`)
- The contents of a regexp route match are now forwarded to the route callback as args.

Changed:

- Error handling has been refactored. All errors are now sent through #error() which will raise or just log errors based on the `raise_errors` setting. the  `silence_404` setting has been removed.
- use() now sends errors through error()
- The Sammy.Application no longer adds the app to the elements .data()
- The Sammy.Store KVO better conforms to Sammy.Application#bind() [Thanks dpree!]

Fixed:

- The unload bindings have been updated to correctly unload on window.onbeforeunload
- Sammy core now passes JSLint (basic settings).
- Sammy.Store#set() should return the original value, not the stringified one [Thanks Mark Needham]
- Updated all the examples (especially the backend example to work with latest sammy. [Thanks to SamDeLaGarza]
- SessionStorage in Firefox does not completely conform to the HTML5 Storage spec, added workaround for Sammy.Storage [Thanks dpree!]


== 0.5.0 [02/15/10]

New:

- Sammy.Haml is a plugin wrapper around haml-js that provides client side rendering of Haml templates (Thanks Tim Caswell!)
- Sammy.Mustache can now accept Mustache partials as a third argument or passed as {partials:} in data. (thanks dpree!)
- around filters with Sammy.Application#around(). Wraps an entire route execution path in a function()
- Sammy.Application#contextMatchesOptions() as a method for filtering which before() filters to process when running a route.
- test_server is a simple Sinatra/vegas app for running the tests on a local ruby server (allows for testing functionality that requires the http:// protocol)
- Sammy.Store#load(key, path) loads file at path into key
- partial() will now iterate over an array of data, calling the callback for each element, or appending the collected result.
- route() takes the psuedo-verb 'any' which appends the path/callback to all the verbs. Also, added the shortcut method any(). If only a path and callback are supplied to route(), the verb is assumed to be 'any'.
- Passing a string as the callback argument to route() looks up that method on the application.
- Sammy.Application#mapRoutes() takes an array of routes (as arrays of arguments) and adds them to the app.
- Sammy() is a function itself which provides an easy hook for looking up/creating/and extending applications with the element_selector as the unique identifier.
- The application level setting 'template_engine' lets you define a default template engine to fall back on for partial() rendering regardless of extension.
- All application modifying methods return the application instance allowing for jQuery-esque chaining for app creation.

Changed:

- the separate Sammy.Cache plugin is now deprecated in favor of one included/built-upon Sammy.Storage. It is still in the repository, but will be removed completely in 1.0
- Tests are now on top of qunit (http://github.com/jquery/qunit). jQunit has been unmaintained for a while. Also, removed dependency on external jqunit-spec repo.
- Updated to latest mustache.js (0.2.2) in Sammy.Mustache
- Removed .extend() and .clone() from Sammy.Object (unused)
- Sammy now requires jQuery >= 1.4.1
- Forms bound to post/put/delete routes no longer have to be manually re-bound with triggering('changed'). The application listens for 'submit' events on forms within the context of the element_selector instead. (Relies on the submit bubbling in jQuery 1.4.1)
- $.sammy is an alias for Sammy() instead of new Sammy.Application

Fixed:

- Only fire KVO once when setting a Sammy.Store key
- Ensure all keys are strings in Sammy.Store.
- refesh() with new location proxies (Thanks ZhangJinzhu!)


== 0.4.1 [01/11/10]

New:

- Add rake generate task that builds a simple (server-less) sammy app structure

Fixed:

- decode all parsed params (thanks jdknezek)
- Fix Sammy.JSON fails in IE6
- Fixed test suite in IE8
- Fixed console.log is not a real function in IE8

== 0.4.0 [01/04/10]

New:

- Sammy.Storage and Sammy.Session are wrappers around a new prototype Sammy.Store, which is an class that abstracts access to the various types of in browser storage, including HTML5 DOM Storage and Cookies. This allows for a unified way of accessing and storing data locally for a Sammy app.
- Sammy.Mustache is a plugin that adds support for the Mustache template framework through @janl's Mustache.js.
- Sammy.JSON is simple plugin that includes the json2.js source and also provides a simple helper for doing JSON to/from conversion
- Sammy.Application#helper() is a shortcut for adding a single helper by name. This allows for more easily defined dynamically named helpers.

Changed:

- Sammy no longer depends exclusively on polling to determine changes in its location. The work of determining location change was pulled out of Sammy.Application entirely and into LocationProxy prototypes. The new default Sammy.HashLocationProxy will use the native 'onhashchange' event where available, and resort to a single global poller when not. The LocationProxy object can be set for each Sammy.Application. Location proxies can be defined added, and will work as long as they conform to the simple prototype laid out by the HashLocationProxy.

Fixed:

- URL query params are properly URL decoded. [Thanks  Lee Semel]

== 0.3.1 [12/09/09]

New:

- Sammy.NestedParams is a new plugin that handles form fields like Rails/Rack's nested params. See the docs for more info [thanks endor!]

Changed:

- Sammy.Application#_parseFormParams is now a single point of entry that takes a form and should return a set of params. NestedParams hooks into this.
  - The Sammy.Application constructor no longer requires an app function. This allows you to create multiple apps quickly and assign routes/etc. later.
  - Sammy.Template takes a second option which is the proxy/extension you want to associate it with.

Fixed:

- Fixed a bug in IE only where with two consecutive routes that contain params, the second set of params will not be filtered properly [thanks Scott McMillin!]


== 0.3.0 [09/28/09]

New:

- Sammy.Application#use() takes an app function and applies it to the current app. This is the entry point for Sammy Plugins. See docs at: http://code.quirkey.com/sammy/docs/plugins.html
  - New system for repository structure, minified files are placed in lib/min/ version numbers are appended to minified files
  - Sammy.EventContext#partial() is template engine agnostic and calls the template engine method based on the extension of the file you're trying to render.
  - New official Sammy.Cache plugin provides simple client side caching
  - Sammy.EventContext#redirect() can take any number of arguments that are all joined by '/'
  - Sammy.Application#refresh() will re-run the current route

Changes:

- Removed John Resig's Class() inheritance code/style in favor of doing prototypical inheritance and using $.extend()
- Sammy.Application bind() and trigger() now use jQuery's built in namespacing. This means that a Sammy application can now catch events like clicks and other events that bubble up or are triggered on the Sammy.Application#element()
- Sammy.log and Sammy.addLogger are top level access to logging and adding additional logging paths. Sammy.Application#bindToAllEvents() replaces the functionality for the former addLogger() method
- the app functions and route callbacks both take _this_ as the first argument
- $.srender and template() are no longer part of the sammy.js and are instead included in the Sammy.Template plugin lib/plugins/sammy.template.js
- Routes are saved and looked up in order of definition instead of shortest first (May break existing applications that use RegExp based routing)
- Made the parse query more uniform with the rest of the code base
- Sammy.Object#toString() wont include functions unless you explicitly want them

Fixes:
- Fixed redirect() handling in post routes
- Fixed param parsing for form submission where there were multiple params with the same name

== 0.2.1 [08/28/09]

New:

- Query string parameters: You can now pass extra parameters to a route using the traditional Query string params scheme. e.g #/my/route?var1=blah will give you params['var1'] #=> 'blah' inside an Event context. (Thanks to Jesse Hallet [halletj]) See the commit (cb309b91c0ab80d4e8d6ef9bc97314607cc0da76) for more info.

Fixed:

- Redirection in POST routes wasnt working properly. (Thanks Russel Jones [CodeOfficer])
- Dont cache partial templates in debug mode. (Thanks Jonathan Vaught [gravelpup])
- Spelling and grammar fixes to README/Docs (Thanks Jason Davies [jasondavies])


== 0.2.0 [06/01/09]

New:

- Location Overrides: All location methods refer to two Sammy.Application methods: getLocation() and setLocation() which return and take a string, respectively. The default behavior is to pull the location from window.location.hash, but these methods can be overridden to provide alternate location strategies. Theres an example in examples/location_override. (thanks to britg, CodeOfficer)
- Sammy.Object#toHash() returns a JS object with any functions stripped. Useful for using with params.
- Sammy.Application#swap() is the method called within partial() for changing the content of $element(). The default behavior is just to use $.fn.html(), but can be overridden to provide some fancy animations.

Fixed:

- The 'changed' event is only fired at run() and after a partial's callback. This is the event to bind to, to check the DOM after a partial() call. (thanks to hpoydar).
- template() (aka $.srender) handles single quoted attributes now (aka generated HAML)
- When the app booted up, run() would redirect to the start_url even if another location was present.
- the _checkLocation() method now sets last_location properly (which fixes continual checking if route isnt found)
