(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'sammy', 'ejs'], factory);
  } else {
    (window.Sammy = window.Sammy || {}).EJS = factory(window.jQuery, window.Sammy, window.EJS);
  }
}(function ($, Sammy, EJS) {

  // `Sammy.EJS` is a thin wrapper around the EJS templating engine which can be donwloaded
  // at http://embeddedjs.com/
  //
  // Note: As of Sammy 0.7, Sammy.EJS does not include the actual templating engine in the source.
  // Include ejs.js before including sammy.ejs.js
  Sammy.EJS = function(app, method_alias) {

    // *Helper:* Uses simple templating to parse ERB like templates.
    //
    // ### Arguments
    //
    // * `template` A String template. '<% %>' tags are evaluated as Javascript and replaced with the elements in data.
    // * `data` An Object containing the replacement values for the template.
    //data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // * `name` An optional String name to cache the template.
    //
    var template = function(template, data, name) {
      // use name for caching
      if (typeof name == 'undefined') { name = template; }
      return new EJS({text: template, name: name}).render(data);
    };

    // set the default method name/extension
    if (!method_alias) { method_alias = 'ejs'; }

    // create the helper at the method alias
    app.helper(method_alias, template);

   };

  return Sammy.EJS;

}));
