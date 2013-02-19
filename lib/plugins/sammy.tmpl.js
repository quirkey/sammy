(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy', 'jquery.tmpl'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).Tmpl = factory(window.jQuery, window.Sammy);
  }
}(function ($, Sammy) {

  // `Sammy.Tmpl` is a small wrapper around the $.tmpl templating engine. You
  // can find more information and download the engine itself at
  // https://github.com/jquery/jquery-tmpl
  //
  // Note: This does not include $.tmpl in the source. Please include $.tmpl.js before
  // sammy.tmpl.js
  Sammy.Tmpl = function(app, method_alias) {

    // *Helper:* Uses jQuery-tmpl to parse a template and interpolate and work with the passed data
    //
    // ### Arguments
    //
    // * `template` A String template. '${ }' tags are evaluated as Javascript and replaced with the elements in data.
    // * `data` An Object containing the replacement values for the template.
    //   data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // * `partials` An Object containing one or more partials (String templates
    //   that are called from the main template).
    //
    var template = function(template, data, partials) {
      // use name for caching
      var name = template

      // check the cache
      if (!$.template[name]) { $.template(name, template); }

      data     = $.extend({}, this, data);
      partials = $.extend({}, data.partials, partials);
      for (partial in partials) {
        if (!$.template[partial]) { $.template(partial, partials[partial]); }
      }

      // we could also pass along jQuery-tmpl options as a last param?
      return $.tmpl(name, $.extend({}, this, data));
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'tmpl'; }
    // create the helper at the method alias
    app.helper(method_alias, template);

  };

  return Sammy.Tmpl;

}));
