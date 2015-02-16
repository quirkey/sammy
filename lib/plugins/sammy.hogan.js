(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy', 'hogan'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Hogan = factory(window.jQuery, window.Sammy, window.Hogan);
  }
}(function ($, Sammy) {

  // <tt>Sammy.Hogan</tt> provides a quick way of using hogan.js style templates in your app.
  // The plugin wraps the awesome hogan.js lib created and maintained by Twitter
  // at http://twitter.github.com/hogan.js/
  //
  // Note: As of Sammy 0.7 the Hogan.js lib is not included in the templates source. Please download
  // hogan.js and include it before Sammy.Hogan.
  //
  // Hogan.js is a clever templating system that relys on double brackets {{}} for interpolation.
  // For full details on syntax check out the documentation at
  // http://twitter.github.com/hogan.js/
  //
  // By default using Sammy.Hogan in your app adds the <tt>hogan()</tt> method to the EventContext
  // prototype. However, just like <tt>Sammy.Hogan</tt> you can change the default name of the method
  // by passing a second argument (e.g. you could use the hg() as the method alias so that all the template
  // files could be in the form file.hg instead of file.hogan)
  //
  // ### Example #1
  //
  // The template (mytemplate.hg):
  //
  //       <h1>{{title}}<h1>
  //
  //       Hey, {{name}}! Welcome to Mustache!
  //
  // The app:
  //
  //       var app = $.sammy(function() {
  //         // include the plugin and alias hogan() to hg()
  //         this.use('Hogan', 'hg');
  //
  //         this.get('#/hello/:name', function() {
  //           // set local vars
  //           this.title = 'Hello!'
  //           this.name = this.params.name;
  //           // render the template and pass it through hogan
  //           this.partial('mytemplate.hg');
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
  //       Hey, AQ! Welcome to Mustache!
  //
  //
  // ### Example #2 - Hogan partials
  //
  // The template (mytemplate.hg)
  //
  //       Hey, {{name}}! {{>hello_friend}}
  //
  //
  // The partial (mypartial.hg)
  //
  //       Say hello to your friend {{friend}}!
  //
  // The app:
  //
  //       var app = $.sammy(function() {
  //         // include the plugin and alias hogan() to hg()
  //         this.use('Hogan', 'hg');
  //
  //         this.get('#/hello/:name/to/:friend', function(context) {
  //           // fetch hogan-partial first
  //           this.load('mypartial.hg')
  //               .then(function(partial) {
  //                 // set local vars
  //                 context.partials = {hello_friend: partial};
  //                 context.name = context.params.name;
  //                 context.friend = context.params.friend;
  //
  //                 // render the template and pass it through hogan
  //                 context.partial('mytemplate.hg');
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
  // Note: You dont have to include the hogan.js file on top of the plugin as the plugin
  // includes the full source.
  //
  Sammy.Hogan = function(app, method_alias) {
    var cached_templates = {};

    // *Helper* Uses Hogan.js to parse a template and interpolate and work with the passed data
    //
    // ### Arguments
    //
    // * `template` A String template. {{}} Tags are evaluated and interpolated by Hogan.js
    // * `data` An Object containing the replacement values for the template.
    //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // * `partials` An Object containing one or more partials (String templates
    //   that are called from the main template).
    //
    var hogan = function(template, data, partials) {
      var compiled_template = cached_templates[compiled_template];
      if (!compiled_template){
        compiled_template = Hogan.compile(template);
      }
      data     = $.extend({}, this, data);
      partials = $.extend({}, data.partials, partials);
      return compiled_template.render(data, partials);
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'hogan'; }
    app.helper(method_alias, hogan);
  };

  return Sammy.Hogan;

}));
