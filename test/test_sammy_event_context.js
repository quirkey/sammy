(function($) {
  $(function() {
    with(jqUnit) {
      var test_app = new Sammy.Application(function() {});
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
      .should_eventually('set full location if url is provided', function() {

      })
      .should('only set hash if location is prefixed with #', function() {
        this.context.redirect('#/blah');
        equals('#/blah', window.location.hash);
      });

      context('Sammy', 'EventContext', 'raise')
      .should_eventually('throw error');

      context('Sammy', 'EventContext', 'not_found')
      .should_eventually('throw not found error')

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
          this.equals($('#test_area').html(), '<div class="test_partial">PARTIAL</div>');
        });
      });
      

    };
  });
})(jQuery);
