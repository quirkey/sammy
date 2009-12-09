# Sammy

[http://code.quirkey.com/sammy](http://code.quirkey.com/sammy)

## Description

Sammy is a tiny javascript framework built on top of jQuery inspired by Ruby's [Sinatra](http://sinatrarb.com).

## Installation

Download sammy.js and install it in your public javascripts directory.
Include it in your document AFTER jquery.

## Usage

Like Sinatra, a Sammy application revolves around 'routes'. Routes in Sammy are a little different, though. Not only can you define 'get' and 'post' routes, but you can also bind routes to custom events triggered by your application.

You set up a Sammy Application by passing a Function to the `$.sammy` (which is a shortcut for the Sammy.Application constructor).

    $.sammy(function() {
      
      this.get('#/', function() {
        $('#main').text('Welcome!');
      });
      
    });

Inside the 'app' function() `this` is the Application. This is where you can configure the application and add routes.

Above, we defined a `get()` route. When the browser is pointed to `#/` the function passed to that route will be run. Inside the route function, `this` is a Sammy.EventContext. EventContext has a bunch of special methods and properties including a params hash, the ability to redirect, render partials, and more.

Once you've defined an application the only thing left to do is run it. The best-practice behavior is to encapulate `run()` in a document.ready block:

    var app = $.sammy(...)
    
    $(function() {
      app.run();
    });

This will guarantee that the DOM is loaded before we try to apply functionality to it.

## Dependencies

Sammy requires jQuery >= 1.3.2
Get it from: [http://jquery.com](http://jquery.com)

## More!

### Learn!

* [Intro](http://code.quirkey.com/sammy)
* [Docs](http://code.quirkey.com/sammy/docs/)
* [Examples](http://github.com/quirkey/sammy/tree/master/examples/)
* [More Resources](http://code.quirkey.com/sammy/resources.html)

### Keep informed!

* [Follow @sammy_js](http://twitter.com/sammy_js)
* [Join the mailing list](http://groups.google.com/group/sammyjs)
* [Chat with us in #sammy](irc://irc.freenode.net/#sammy)

## Authors

Sammy.js was created and is maintained by Aaron Quint <aaron at quirkey.com> with additional features and fixes contributed by these talented individuals:

  endor <fp at notjusthosting.com>
  Scott McMillin <scott at lifesnapz.com>
  ZhangJinzhu <wosmvp at gmail.com>
  Jesse Hallett <hallettj at gmail.com>
  Jonathan Vaught <jonathan.vaught at gmail.com>
  Jesse Hallett <jesse.hallett at jivesoftware.com>
  Jason Davies <jason at jdd.local>
  Russell Jones <spam at codeofficer.com>
  Geoff Longman <glongman at overlay.tv>
  
## License

Sammy is covered by the MIT License. See LICENSE for more information.

Sammy includes code originally created by John Resig ([Class implementation](http://ejohn.org/blog/simple-javascript-inheritance/)) and Greg Borenstien ([srender](http://github.com/atduskgreg/srender/tree/master)).

