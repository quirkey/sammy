# Sammy

[http://sammyjs.org](http://sammyjs.org)

## Description

Sammy is a tiny javascript framework built on top of jQuery inspired by Ruby's [Sinatra](http://sinatrarb.com).

## Installation

Download Sammy.js and install it in your public javascripts directory.
Include it in your document AFTER jQuery.

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

In its coolness, Sammy can handle multiple chained asynchronous callbacks on a route.

    this.get('#/', function(context,next) {
      $('#main').text('Welcome!');
      $.get('/some/url',function(){
        // save the data somewhere
        next();
      });
    }, function(context,next) {
      $.get('/some/other/url',function(){
        // save this data too
        next();
      });
    });


Once you've defined an application the only thing left to do is run it. The best-practice behavior is to encapsulate `run()` in a document.ready block:

    var app = $.sammy(...)

    $(function() {
      app.run();
    });

This will guarantee that the DOM is loaded before we try to apply functionality to it.

## Dependencies

Sammy requires jQuery >= 1.4.1
Get it from: [http://jquery.com](http://jquery.com)

## More!

### Learn!

* [Intro](http://code.quirkey.com/sammy)
* [Docs](http://code.quirkey.com/sammy/docs/)
* [Examples](http://github.com/quirkey/sammy/tree/master/examples/)
* [More Resources on the Sammy Wiki](http://github.com/quirkey/sammy/wiki/)

### Keep informed!

* [Follow @sammy_js](http://twitter.com/sammy_js)
* [Join the mailing list](http://groups.google.com/group/sammyjs)
* [Chat with us in #sammy](irc://irc.freenode.net/#sammy)

## Authors

Sammy.js was created and is maintained by Aaron Quint <aaron at quirkey.com> with additional features and fixes contributed by these talented individuals:

* Frank Prößdorf / endor
* Alexander Lang / langalex
* Scott McMillin / scottymac
* ZhangJinzhu / jinzhu
* Jesse Hallett / hallettj
* Jonathan Vaught / gravelpup
* Jason Davies / jasondavies
* Russell Jones / CodeOfficer
* Geoff Longman
* Jens Bissinger / dpree
* Tim Caswell / creationix
* Mark Needham
* SamDeLaGarza
* Mickael Bailly / dready92
* Rich Manalang / manalang
* Brian Mitchell / binary42
* Assaf Arkin / assaf
* James Rosen / jamesrosen
* Chris Mytton
* kbuckler
* dvv
* Ben Vinegar / benvinegar
* Avi Deitcher / deitch

## Donate!

If you're using Sammy.js in production or just for fun, instead of gifting me a beer - please consider donating to the [Code for Other People Fund](http://pledgie.com/campaigns/15239). - you can probably spare a dollar or ten and it will be greatly appreciated.

## License

Sammy is covered by the MIT License. See LICENSE for more information.

