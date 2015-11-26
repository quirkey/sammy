(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy', 'handlebars'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Handlebars = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy, Handlebars) {
    // version 1.0.0 has no support for AMD but upwards does, this way we support both.
    Handlebars = Handlebars || window.Handlebars;

    // <tt>Sammy.Handlebars</tt> provides a quick way of using Handlebars templates in your app.
    //
    // Note: As of Sammy 0.7 Handlebars itself is not included in the source. Please download and
    // include handlebars.js before Sammy.Handlebars.
    //
    // Handlebars.js is an extension to the Mustache templating language created by Chris Wanstrath. Handlebars.js
    // and Mustache are both logicless templating languages that keep the view and the code separated like
    // we all know they should be.
    //
    // By default using Sammy.Handlbars in your app adds the <tt>handlebars()</tt> method to the EventContext
    // prototype. However, just like <tt>Sammy.Template</tt> you can change the default name of the method
    // by passing a second argument (e.g. you could use the hbr() as the method alias so that all the template
    // files could be in the form file.hbr instead of file.handlebars)
    //
    // ### Example #1
    //
    // The template (mytemplate.hb):
    //
    //       <h1>{{title}}<h1>
    //
    //       Hey, {{name}}! Welcome to Handlebars!
    //
    // The app:
    //
    //       var app = $.sammy(function() {
    //         // include the plugin and alias handlebars() to hb()
    //         this.use('Handlebars', 'hb');
    //
    //         this.get('#/hello/:name', function() {
    //           // set local vars
    //           this.title = 'Hello!'
    //           this.name = this.params.name;
    //           // render the template and pass it through handlebars
    //           this.partial('mytemplate.hb');
    //         });
    //       });
    //
    //       $(function() {
    //         app.run()
    //       });
    //
    // If I go to #/hello/AQ in the browser, Sammy will render this to the <tt>body</tt>:
    //
    //       <h1>Hello!</h1>
    //
    //       Hey, AQ! Welcome to Handlebars!
    //
    //
    // ### Example #2 - Handlebars partials
    //
    // The template (mytemplate.hb)
    //
    //       Hey, {{name}}! {{>hello_friend}}
    //
    //
    // The partial (mypartial.hb)
    //
    //       Say hello to your friend {{friend}}!
    //
    // The app:
    //
    //       var app = $.sammy(function() {
    //         // include the plugin and alias handlebars() to hb()
    //         this.use('Handlebars', 'hb');
    //
    //         this.get('#/hello/:name/to/:friend', function(context) {
    //           // fetch handlebars-partial first
    //           this.load('mypartial.hb')
    //               .then(function(partial) {
    //                 // set local vars
    //                 context.partials = {hello_friend: partial};
    //                 context.name = context.params.name;
    //                 context.friend = context.params.friend;
    //
    //                 // render the template and pass it through handlebars
    //                 context.partial('mytemplate.hb');
    //               });
    //         });
    //       });
    //
    //       $(function() {
    //         app.run()
    //       });
    //
    // If I go to #/hello/AQ/to/dP in the browser, Sammy will render this to the <tt>body</tt>:
    //
    //       Hey, AQ! Say hello to your friend dP!
    //
    // Note: You dont have to include the handlebars.js file on top of the plugin as the plugin
    // includes the full source.
    //
    Sammy.Handlebars = function(app, method_alias) {
      var handlebars_cache = {};
      // *Helper* Uses handlebars.js to parse a template and interpolate and work with the passed data
      //
      // ### Arguments
      //
      // * `template` A String template.
      // * `data` An Object containing the replacement values for the template.
      //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
      //
      var handlebars = function(template, data, partials, name) {
          // use name for caching
          if (typeof name == 'undefined')  { name = template; }
          var fn = handlebars_cache[name];
          if (!fn) {
              fn = handlebars_cache[name] = Handlebars.compile(template);
          }

          data     = $.extend({}, this, data);
          partials = $.extend({}, data.partials, partials);

          return fn(data, {"partials":partials});
      };

      // set the default method name/extension
      if (!method_alias) { method_alias = 'handlebars'; }
      app.helper(method_alias, handlebars);
    };

  return Sammy.Handlebars;

}));
