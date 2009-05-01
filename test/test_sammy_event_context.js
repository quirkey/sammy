(function($) {
  $(function() {
    with(jqUnit) {
      var test_app = new Sammy.Application(function() {
        this.silence_404 = false;
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

      context('Sammy', 'EventContext', 'render', 'text', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('put text in selector', function() {
        this.context.render('text', '#test_area', 'test it')
        equals($('#test_area').text(), 'test it');
      });

      context('Sammy', 'EventContext', 'render', 'html', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('put html in selector', function() {
        this.context.render('html', '#test_area', '<div class="test_class">TEST!</div>')
        equals($('#test_area').html(), '<div class="test_class">TEST!</div>');
      });
      
      context('Sammy', 'EventContext', 'render', 'partial', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('put html in selector', function() {
        this.context.render('partial', '#test_area', 'fixtures/partial.html')
        soon(function () {
          equals($('#test_area').html(), '<div class="test_partial">PARTIAL</div>');
        });
      });
      
      context('Sammy', 'EventContext', 'trigger', {
        before: function() {
          this.context = test_context;
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
          isObj(event_context, test_context);
        });
      });
      
    };
  });
})(jQuery);
