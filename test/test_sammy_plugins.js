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
             this.use(Sammy.Cache);
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
    };
})(jQuery);
