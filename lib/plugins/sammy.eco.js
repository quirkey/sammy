;(function($) {

  Sammy = Sammy || {};

  // `Sammy.Eco` is a thin wrapper around the **Eco** templating engine which can be downloaded
  // at https://github.com/sstephenson/eco
  //
  //
  // From the Eco documentation:
  // Eco lets you embed CoffeeScript logic in your markup.
  // It's like EJS and ERB, but with CoffeeScript inside the `<% ... %>`.
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
  // ### Example
  //
  // The template (home.eco):
  //
  //       <ul>
  //       <% for prefix in @prefixes: %>
  //         <li><%= prefix %> <%= @name %> !</li>
  //       <% end %>
  //       </ul>
  //
  //
  // Compile the template using the `eco` command:
  //       $ eco home.eco
  // 
  // This will generate a home.js file containing the compiled template. Include it in your HTML view.
  // 
  // The app:
  //
  //       var $.app = $.sammy('#main', function() {
  //         // include the plugin
  //         this.use(Sammy.Eco);
  //
  //         this.get('#/hi/:name', function() {
  //           var data = {
  //              prefixes: ['Hi', 'Hello', 'Hallo', 'Hola', 'Bonjour'],
  //              name: this.params.name
  //           };
  //           // render the template and pass it through Eco
  //           var html = this.eco('home', data);
  //           // update the view
  //           this.$element().html(html);
  //         });
  //
  //       });
  //
  // If I go to `#/hi/Jason` in the browser, Sammy will render this to `#main`:
  //
  //       <ul>
  //         <li>Hi Jason !</li>
  //         <li>Hello Jason !</li>
  //         <li>Hallo Jason !</li>
  //         <li>Hola Jason !</li>
  //         <li>Bonjour Jason !</li>
  //       </ul>
  // 
  // **Note:** Templates must be compiled to JavaScript with the `eco` command, and loaded into the document.
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
