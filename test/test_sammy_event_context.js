(function($) {
    with(QUnit) {

      var test_app = new Sammy.Application(function() {
        this.raise_errors = false;
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
        deepEqual(this.context.app, this.app);
      })
      .should('set verb', function() {
        equal(this.context.verb, 'get');
      })
      .should('set path', function() {
        equal(this.context.path, '#/test/:test');
      })
      .should('set params', function() {
        deepEqual(this.context.params, new Sammy.Object({test: 'hooray'}));
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
        this.context.redirect('#/boosh');
        equal('#/boosh', window.location.hash);
      })
      .should('only set hash if location is prefixed with #', function() {
        this.context.redirect('#/blah');
        equal('#/blah', window.location.hash);
      })
      .should('join the arguments with / if more then one argument is provided', function() {
        var boosh = 'boosh';
        this.context.redirect('#', 'blah', boosh);
        equal('#/blah/boosh', window.location.hash);
      })
      .should('append to query string if an argument is an object', function() {
        this.context.redirect('#', 'blah', 'boosh', {x: 'y'}, {a: 'b'});
        equal(window.location.hash, '#/blah/boosh?x=y&a=b');
      });


      context('Sammy', 'EventContext', 'notFound', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('throw 404 error', function() {
        var context = this.context;
        context.app.raise_errors = true;
        raised(/404/, function() {
          context.notFound();
        });
      });

      context('Sammy', 'EventContext', 'partial', {
        before: function() {
          this.app     = test_app;
          this.app.raise_errors = false;
          this.context = test_context;
        }
      })
      .should('pass contents to callback', function() {
        var contents = '';
        this.context.partial('fixtures/partial.html').then(function(data) { contents = data; });
        soon(function () {
          sameHTML(contents, '<div class="test_partial">PARTIAL</div>');
        }, this, 2);
      })
      .should('not run through template() if Sammy.Template is not present', function() {
        var contents = '';
        this.context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
          contents = data;
        });
        soon(function () {
          sameHTML(contents, '<div class="<%= class_name %>"><%= name %></div>');
        }, this, 2);
      })
      .should('run through template() if Sammy.Template _is_ present', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
          contents = data;
        });
        soon(function () {
          sameHTML(contents, '<div class="test_template">TEMPLATE!</div>');
        }, this, 2);
      })
      .should('run through template() if Sammy.Template _is_ present _and_ path starts with a dot', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        this.context = new app.context_prototype(app);
        this.context.partial('./fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
          contents = data;
        });
        soon(function () {
          sameHTML(contents, '<div class="test_template">TEMPLATE!</div>');
        }, this, 2);
      })
      .should('allow rendering partials', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Mustache);
        this.context = new app.context_prototype(app);
        this.context.render('fixtures/partial.mustache', {name: 'TEMPLATE!', class_name: 'test_template'}, function(data) {
          contents = data;
        }, {item: 'fixtures/item.mustache'});
        soon(function () {
          sameHTML(contents, '<div class="test_template"><span>TEMPLATE!</span></div>');
        }, this, 2);        
      })
      .should('replace default app element if no callback is passed', function() {
        var contents = '';
        var app = new Sammy.Application(function() { this.element_selector = '#main'; });
        app.use(Sammy.Template);
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'});
        soon(function () {
          equal(app.$element().text(), 'TEMPLATE!');
          equal(app.$element().children('.test_template').length, 1);
        }, this, 2, 2);
      })
      .should('use default engine if provided and template doesnt match an engine', function() {
        var contents = '';
        var app = new Sammy.Application(function() {
          this.element_selector = '#main';
          this.template_engine  = 'template';

          this.helper('template',  function(template, data) {
            return "!!!" + template.toString() + "!!!";
          });
        });
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial');
        soon(function () {
          equal(app.$element().text(), '!!!NOENGINE!!!');
        });
      })
      .should('use default engine as a method if template doesnt match an engine', function() {
        var contents = '';
        var app = new Sammy.Application(function() {
          this.element_selector = '#main';
          this.template_engine  = function(template, data) {
            return "!!!" + template.toString() + "!!!";
          };
        });
        this.context = new app.context_prototype(app);
        this.context.partial('fixtures/partial.noengine');
        soon(function () {
          equal(app.$element().text(), '!!!NOENGINE!!!');
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
          equal(spec_context.event_fired, true);
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
          equal(event_context.toString(), test_context.toString());
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
          deepEqual(passed_data, test_data);
        });
      });

    };
})(jQuery);
