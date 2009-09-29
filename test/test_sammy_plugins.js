(function($) {
    with(jqUnit) {
      context('Sammy.Cache', 'cache', {
         before: function() {
           this.app = new Sammy.Application(function() {
             this.use(Sammy.Cache, 'memory');
             this.cache('mycache', 'my value');
             this.cache('mynumcache', 3);
           });
           this.other_app = new Sammy.Application(function() {
             this.use(Sammy.Cache, 'data');
             this.cache('mycache', 'not my value');
             this.cache('mynumcache', 7);
           });
         }
       })
       .should('retrieve values by passing name', function() {
         equals(this.app.cache('mycache'), 'my value');
         equals(this.other_app.cache('mycache'), 'not my value');
         equals(this.app.cache('mynumcache'), 3);
         equals(this.other_app.cache('mynumcache'), 7);
       })
       .should('set values by passing value', function() {
         this.app.cache('mycache', 'my new value');
         equals(this.app.cache('mycache'), 'my new value');
       })
       .should('run callback only if value is not set', function() {
         var context = null;
         var run     = false;
         this.app.cache('mycache', function() {
           run = true;
           context = this;
           return 'new value';
         });
         equals(run, false);
         equals(context, null);
         this.app.cache('mynewcache', function() {
           run = true;
           context = this;
           return 'new value';
         });
         equals(run, true);
         equals(context, this.app);
         equals(this.app.cache('mynewcache'), 'new value');
       })
       .should('clear specific cache value', function() {
         this.app.clearCache('mycache');
         equals(typeof this.app.cache('mycache'), 'undefined')
       });
       
      
       context('Sammy', 'Template', {
         before: function() {
           this.app = new Sammy.Application(function() {
             this.use(Sammy.Template);
           });
           this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
         }
       })
       .should('add template helper to event context', function() {
         ok($.isFunction(this.context.template));
       })
       .should('interpolate content', function() {
         var rendered = this.context.template('<div class="test_class"><%= text %></div>', {text: 'TEXT!'});
         equals(rendered, '<div class="test_class">TEXT!</div>');
       })
       .should('set the context of the template to the test_context', function() {
         this.context.blurgh = 'boosh';
         var rendered = this.context.template('<div class="test_class"><%= text %> <%= blurgh %></div>', {text: 'TEXT!'});
         equals(rendered, '<div class="test_class">TEXT! boosh</div>');
       })
       .should('render templates with a lot of single quotes', function() {
         var rendered = this.context.template("<div class='test_class' id='test'>I'm <%= text %></div>", {text: 'TEXT!'});
         equals(rendered, "<div class='test_class' id='test'>I'm TEXT!</div>");
       });
    
    };
})(jQuery);
