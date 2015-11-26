(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy', 'haml'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Haml = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy) {

  // `Sammy.Haml` provides a quick way of using haml style templates in your app.
  // The plugin wraps haml-js library created by Tim Caswell at
  // at http://github.com/creationix/haml-js
  //
  // Note: As of Sammy 0.7, Sammy.Haml does not include the actual templating engine in the source.
  // Include haml.js before including sammy.haml.js
  //
  // Haml is an alternative HTML syntax that is really great for describing
  // the structure of HTML documents.
  //
  // By default using Sammy.Haml in your app adds the <tt>haml()</tt> method to the EventContext
  // prototype. However, just like `Sammy.Template` you can change the default name of the method
  // by passing a second argument (e.g. you could use the hml() as the method alias so that all the template
  // files could be in the form file.hml instead of file.haml)
  //
  // ### Example
  //
  // The template (mytemplate.haml):
  //
  //       %h1&= title
  //
  //       Hey, #{name}! Welcome to Haml!
  //
  // The app:
  //
  //       var app = $.sammy(function() {
  //         // include the plugin
  //         this.use(Sammy.Haml);
  //
  //         this.get('#/hello/:name', function() {
  //           // set local vars
  //           this.title = 'Hello!'
  //           this.name = this.params.name;
  //           // render the template and pass it through haml
  //           this.partial('mytemplate.haml');
  //         });
  //       });
  //
  //       $(function() {
  //         app.run()
  //       });
  //
  // If I go to `#/hello/AQ` in the browser, Sammy will render this to the `body`:
  //
  //       <h1>Hello!</h1>
  //
  //       Hey, AQ! Welcome to HAML!
  //
  // Note: You dont have to include the haml.js file on top of the plugin as the plugin
  // includes the full source.
  //
  Sammy.Haml = function(app, method_alias) {
    var haml_cache = {};
    // *Helper* Uses haml-js to parse a template and interpolate and work with the passed data
    //
    // ### Arguments
    //
    // * `template` A String template.
    // * `data` An Object containing the replacement values for the template.
    //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    //
    var haml = function(template, data, name) {
      // use name for caching
      if (typeof name == 'undefined') { name = template; }
      var fn = haml_cache[name];
      if (!fn) {
        fn = haml_cache[name] = Haml(template);
      }
      return fn($.extend({}, this, data));
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'haml'; }
    app.helper(method_alias, haml);

  };

  return Sammy.Haml;

}));
