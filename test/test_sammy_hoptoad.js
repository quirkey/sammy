(function($) {

    // a mock Hoptoad
    // @see http://hoptoadapp.com/javascripts/notifier.js for the real deal
    window.Hoptoad = {
      errors: [],
      notify: function(error) {
        this.errors.push(error);
      }
    };

    with(QUnit) {

      function newAppWithHoptoad() {
        return new Sammy.Application(function() {
          this.element_selector = '#form_params';
          this.raise_errors = false;
          this.use(Sammy.Hoptoad);
          this.get('#/', function() {
            // do nothing
          });
        });
      }

      context('Sammy.Hoptoad', 'app.hoptoad', {
        before: function() {
          window.Hoptoad.errors = [];
          this.app = newAppWithHoptoad();
          this.app.run('#/');
        },
        after: function() {
          this.app.unload();
        }
      })
      .should('not send an error to Hoptoad when none is thrown', function() {
        this.app.post('#/test_nested_params', function() {
          this.redirect('#/');
        });
        $('#nested_params_test_form').submit();
        soon(function() {
          equal(window.Hoptoad.errors.length, 0);
        }, this, 1, 1);
      })
      .should('send a error to Hoptoad when one is thrown', function() {
        this.app.post('#/test_nested_params', function() {
          throw new Error('Communications error.');
        });
        $('#nested_params_test_form').submit();
        soon(function() {
          equal(window.Hoptoad.errors.length, 1);
          ok(/Communications error/.test((window.Hoptoad.errors[0] || {}).message));
        }, this, 1, 2);
      });
    };
}(jQuery));
