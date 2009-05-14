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

    $.sammy(function() { with(this) {
      
      get('#/', function() { with(this) {
        $('#main').text('Welcome!');
      }});
      
    }});

Inside of the 'app' function() `this` is the Application. This is where you can configure the application and add routes.

Above, we defined a `get()` route. When the browser is pointed to `#/` the function passed to that route will be run. Inside of the route function, `this` is a Sammy.EventContext. EventContext has a bunch of special methods and properties including a params hash, the ability to redirect, render partials, and more.

Once you've defined an application the only thing left to do is run it. The best practice behavior is to encapulate `run()` in a document.ready block:

    var app = $.sammy(...)
    
    $(function() {
      app.run();
    });

This will guaruntee that the DOM is loaded before we try to apply functionality to it.

## Dependencies

Sammy requires jQuery > 1.3.2
Get it from: [http://jquery.com](http://jquery.com)

## More Information

Please see the website at [http://code.quirkey.com/sammy](http://code.quirkey.com/sammy) for more detailed documentation. 

Also the [examples/](http://github.com/quirkey/sammy/tree/master/examples/) folder has a number of working examples, each with thier own README.

Sammy also has a full test suite. Check test/sammy.html.

## License

Sammy is covered by the MIT License. See LICENSE for more information.

Sammy includes code originaly created by John Resig ([Class implementation](http://ejohn.org/blog/simple-javascript-inheritance/)) and Greg Borenstien ([srender](http://github.com/atduskgreg/srender/tree/master)).

