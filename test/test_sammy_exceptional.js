(function($) {

    // a mock Exceptional
    // @see https://github.com/contrast/exceptional-js/blob/master/public/exceptional.js for the real deal
    window.Exceptional = {
      errors: [],
      handle: function(msg, url, line) {
        this.errors.push({
          message: msg,
          url:     url,
          line:    line
        });
      }
    };

    with(QUnit) {

      function newAppWithExceptional() {
        return new Sammy.Application(function() {
          this.element_selector = '#form_params';
          this.raise_errors = false;
          this.use(Sammy.Exceptional);
          this.get('#/', function() {
            // do nothing
          });
        });
      }

      context('Sammy.Exceptional', 'app.exceptional', {
        before: function() {
          window.Exceptional.errors = [];
          this.app = newAppWithExceptional();
          this.app.run('#/');
        },
        after: function() {
          this.app.unload();
        }
      })
      .should('not send an error to Exceptional when none is thrown', function() {
        this.app.post('#/test_nested_params', function() {
          this.redirect('#/');
        });
        $('#nested_params_test_form').submit();
        soon(function() {
          equal(window.Exceptional.errors.length, 0);
        }, this, 1, 1);
      })
      .should('send a error to Exceptional when one is thrown', function() {
        this.app.post('#/test_nested_params', function() {
          throw new Error('Communications error.');
        });
        $('#nested_params_test_form').submit();
        soon(function() {
          equal(window.Exceptional.errors.length, 1);
          ok(/Communications error/.test((window.Exceptional.errors[0] || {}).message));
          equal((window.Exceptional.errors[0] || {}).url, window.location.href);
        }, this, 1, 3);
      });
    };
}(jQuery));
