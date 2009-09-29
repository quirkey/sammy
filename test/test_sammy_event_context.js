(function($) {
    with(jqUnit) {
      var test_app = new Sammy.Application(function() {
        this.silence_404 = true;
        this.element_selector = '#main';
      });
      var test_context = new Sammy.EventContext(test_app, 'get', '#/test/:test', {test: 'hooray'});

      context('Sammy', 'EventContext','init', {
        before: function() {
          this.app = test_app;
          this.context = test_context;
        }
      })
      .should('set app', function() {
        isObj(this.context.app, this.app);
      })
      .should('set verb', function() {
        equals(this.context.verb, 'get');
      })
      .should('set path', function() {
        equals(this.context.path, '#/test/:test');
      })
      .should('set params', function() {
        isObj(this.context.params, new Sammy.Object({test: 'hooray'}));
      });
      

      context('Sammy', 'EventContext', 'redirect', {
        before: function() {
          this.app = test_app;
          this.context = test_context;
        },
        after: function() {
          window.location.hash = '#';
        }
      })
      .should('set full location if url is provided', function() {
        this.context.redirect('sammy.html#/boosh');
        equals('#/boosh', window.location.hash);
      })
      .should('only set hash if location is prefixed with #', function() {
        this.context.redirect('#/blah');
        equals('#/blah', window.location.hash);
      })
      .should('join the arguments with / if more then one argument is provided', function() {
        var boosh = 'boosh';
        this.context.redirect('#', 'blah', boosh);
        equals('#/blah/boosh', window.location.hash);
      });


      context('Sammy', 'EventContext', 'notFound', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('throw 404 error', function() {
        var context = this.context;
        raised(/404/, function() {
          context.notFound();
        });
      });
      
      context('Sammy', 'EventContext', 'partial', {
        before: function() {
          this.app     = test_app;
          this.context = test_context;
        }
      })
      .should('pass contents to callback', function() {
        var contents = '';
        this.context.partial('fixtures/partial.html', function(data) { contents = data; });
        soon(function () {
          equals(contents, '<div class="test_partial">PARTIAL</div>');
        });
      })
      .should('not run through template() if Sammy.Template is not present', function() {
        var contents = '';
        this.context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}, function(data) { 
          contents = data; 
        });
        soon(function () {
          equals(contents, '<div class="<%= class_name %>"><%= name %></div>');
        });
      })
      .should('run through template() if Sammy.Template _is_ present', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}, function(data) { 
          contents = data; 
        });
        soon(function () {
          equals(contents, '<div class="test_template">TEMPLATE!</div>');
        });
      })
      .should('cache template if cache() is present', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        app.use(Sammy.Cache);
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.html', function(data) { 
          contents = data; 
        });
        soon(function () {
          equals(contents, '<div class="test_partial">PARTIAL</div>');
          equals(app.cache('partial:fixtures/partial.html'), '<div class="test_partial">PARTIAL</div>');
          this.context.partial('fixtures/partial.html', function(data) { 
            contents = data;
          });
          equals(contents, '<div class="test_partial">PARTIAL</div>');
        }, this, 1, 3);
      })
      .should('not cache template if cache is present and cache_partials: false', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        app.use(Sammy.Cache);
        app.cache_partials = false;
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.html', function(data) { 
          contents = data;
        });
        soon(function () {
          equals(contents, '<div class="test_partial">PARTIAL</div>');
          ok(!app.cache('partial:fixtures/partial.html'));
        }, this, 1, 2);
      })
      .should('replace default app element if no callback is passed', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'});
        soon(function () {
          equals(test_app.$element().html(), '<div class="test_template">TEMPLATE!</div>');
        });
      })
      .should('trigger changed after the partial callback', function() {
        var changed = false;
        test_app.bind('changed', function() {
          changed = true;
        });
        test_app.run();
        this.context.partial('fixtures/partial.html', function(data) { 
          changed = false;
        });
        soon(function() {
          ok(changed);
          test_app.unload();
        });
      });      
      
      context('Sammy', 'EventContext', 'trigger', {
        before: function() {
          this.context = test_context;
          test_app.run();
        },
        after: function() {
          test_app.unload();
        }
      })
      .should('trigger custom event on application', function() {
        var spec_context = this;
        spec_context.event_fired = false;
        test_app.bind('custom', function() {
          spec_context.event_fired = true;
        });
        this.context.trigger('custom');
        soon(function() {
          equals(spec_context.event_fired, true);
        });
      })
      .should('set the context of the event to the Sammy.EventContext', function() {
        var spec_context = this;
        var event_context = null;
        test_app.bind('other.custom', function() {
          event_context = this;
        });
        this.context.trigger('other.custom');
        soon(function() {
          equals(event_context.toString(), test_context.toString());
        });
      })
      .should('pass data as an argument to the bound method', function() {
        var passed_data = null;
        var test_data   = {boosh: 'blurgh'};
        test_app.bind('custom-with-data', function(e, data) {
          passed_data = data;
        });
        this.context.trigger('custom-with-data', test_data);
        soon(function() {
          isObj(passed_data, test_data);
        });
      });
      
    };
})(jQuery);