(function($) {

  Sammy = Sammy || {};

  // `Sammy.Tmpl` is a small wrapper around the jquery.tmpl templating engine. You
  // can find more information and download the engine itself at
  // https://github.com/jquery/jquery-tmpl
  //
  // Note: This does not include jquery.tmpl in the source. Please include jquery.tmpl.js before
  // sammy.tmpl.js
  Sammy.Tmpl = function(app, method_alias) {

    // *Helper:* Uses jQuery-tmpl to parse a template and interpolate and work with the passed data
    //
    // ### Arguments
    //
    // * `template` A String template. '${ }' tags are evaluated as Javascript and replaced with the elements in data.
    // * `data` An Object containing the replacement values for the template.
    //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // * `name` An optional String name to cache the template.
    //
    var template = function(template, data, name) {
      // use name for caching
      if (typeof name == 'undefined') { name = template; }

      // check the cache
      if (!jQuery.template[name]) { jQuery.template(name, template); }

      // we could also pass along jQuery-tmpl options as a last param?
      return jQuery.tmpl(name, jQuery.extend({}, this, data));
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'tmpl'; }
    // create the helper at the method alias
    app.helper(method_alias, template);

  };
})( jQuery );
