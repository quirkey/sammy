;(function($) {

  Sammy = Sammy || {};

  // `Sammy.Eco` is a thin wrapper around the Eco templating engine which can be downloaded
  // at https://github.com/sstephenson/eco
  //
  // Eco lets you embed CoffeeScript logic in your markup.
  // It's like EJS and ERB, but with CoffeeScript inside the <% ... %>.
  // Use it from Node.js to render your application's views on the server side,
  // or compile your templates to JavaScript with the eco command-line utility and use them to dynamically
  // render views in the browser.
  // 
  // Here's how an Eco template looks:
  // 
  // <% if @projects.length: %>
  //   <% for project in @projects: %>
  //     <a href="<%= project.url %>"><%= project.name %></a>
  //     <p><%= project.description %></p>
  //   <% end %>
  // <% else: %>
  //   No projects
  // <% end %>
  // 
  // By default using Sammy.Eco in your app adds the <tt>eco()</tt> method to the EventContext
  // prototype. However, just like <tt>Sammy.Template</tt> you can change the default name of the method
  // by passing a second argument.
  // The third argument allows you to specify the object which holds the compiled templates functions.
  // If not specified, it will defaults to window.ecoTemplates, which is the default namespace Eco uses.
  // 
  // Note: Templates must be compiled to JavaScript with the `eco` command, and loaded into the document.
  Sammy.Eco = function(app, method_alias, eco_templates) {
    
    eco_templates = eco_templates || window.ecoTemplates;
    
    if(typeof eco_templates !== 'object') {
      eco_templates = {};
    }
    
    // *Helper:* Render Eco templates.
    //
    // ### Arguments
    //
    // * `name`     The name of the template to render. See https://github.com/sstephenson/eco for more informations.
    // * `context`  The context object which contains your view state and any helper methods you want to call.
    //              It is extended with <tt>EventContext</tt> allowing you to call its methods within the template.
    var render = function(name, context) {
      if(typeof eco_templates[ name ] === 'undefined') {
        if(typeof console !== "undefined" && console.error) {
          console.error('Sammy.Eco: Cannot find template "' + name + '".');
        }
        return '';
      }
      
      return eco_templates[ name ]( $.extend({}, this, context) );
    };
    
    // Set the default method name/extension
    method_alias = method_alias || 'eco';
    
    // create the helper at the method alias
    app.helper(method_alias, render);
   };

})(jQuery);
