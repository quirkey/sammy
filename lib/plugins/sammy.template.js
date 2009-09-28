(function($) {
  
  // Simple JavaScript Templating
  // John Resig - http://ejohn.org/ - MIT Licensed
  // adapted from: http://ejohn.org/blog/javascript-micro-templating/
  // originally $.srender by Greg Borenstein http://ideasfordozens.com in Feb 2009
  // modified for Sammy by Aaron Quint for caching templates by name
  var srender_cache = {};
  var srender = function(name, template, data) {
    // target is an optional element; if provided, the result will be inserted into it
    // otherwise the result will simply be returned to the caller   
    if (srender_cache[name]) {
      fn = srender_cache[name];
    } else {
      if (typeof template == 'undefined') {
        // was a cache check, return false
        return false;
      }
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      fn = srender_cache[name] = new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      // Introduce the data as local variables using with(){}
      "with(obj){p.push(\"" +

      // Convert the template into pure JavaScript
      template
        .replace(/[\r\t\n]/g, " ")
        .replace(/\"/g, '\\"')
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "\",$1,\"")
        .split("\t").join("\");")
        .split("%>").join("p.push(\"")
        .split("\r").join("")
        + "\");}return p.join('');");
    }

    if (typeof data != 'undefined') {
      return fn(data);
    } else {
      return fn;
    }
  };
  
  Sammy = Sammy || {};

  // Sammy.Template
  // 
  // 
  Sammy.Template = function(app) {
  
    app.helpers({
      // *Helper:* Uses simple templating to parse ERB like templates.
      //
      // === Arguments
      // 
      // +template+:: A String template. '<% %>' tags are evaluated as Javascript and replaced with the elements in data.
      // +data+::     An Object containing the replacement values for the template. 
      //              data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
      // +name+::     An optional String name to cache the template. Is used in <tt>partial()</tt> to cache remote templates.
      //
      template: function(template, data, name) {
        // use name for caching
        if (typeof name == 'undefined') name = template;
        return srender(name, template, $.extend({}, data, this));
      }
    });
    
  };

})(jQuery);