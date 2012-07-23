(function($) {

  Sammy = Sammy || {};

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
    // Helper for run Haml render
    // ### Arguments
    //  * `name` internal cache key, String
    //  * `template` haml text, String 
    //  * `data` An Object containing the replacement values for the template
    //
    var _execute = function(name, template, data) {
      var fn = haml_cache[name];
      if (!fn) {
        fn = haml_cache[name] = Haml(template);
      }
      return fn(data);
    }
    // *Helper* Uses haml-js to parse a template and interpolate and work with the passed data
    //
    // ### Arguments
    //
    // * `template` A String template.
    // * `data` An Object containing the replacement values for the template.
    //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // * `partials` An Object containing partials String templates. Partials use the same data as template use. 
    //   Keys of Object is used to access to partial in main template, example:
    //     partials argument: {link: 'a.menu{href: 'http://example.com'} = var_link_title', footer: 'Copyright asnow.dev'}
    //     haml: = render_partial_link
    //           = render_partial_footer
    // 
    var haml = function(template, data, partials, name) {
      // use name for caching
      if (typeof partials != 'object') { name = partials; }
      if (typeof name == 'undefined') { name = template; }
      // prepare data
      var merged_data = $.extend({}, this, data);
      // render partials
      if (typeof partials == 'object') {
        for (var partial_name in partials ) {
          var partial_cache_key = '_' + name + '_' + partial_name;
          merged_data['render_partial_' + partial_name] = _execute(partial_cache_key, partials[partial_name], merged_data);
        }
      }
      return _execute(name, template, merged_data);
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'haml'; }
    app.helper(method_alias, haml);

  };

})(jQuery);
