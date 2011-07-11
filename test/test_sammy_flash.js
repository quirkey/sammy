(function($) {
    with(QUnit) {

      var createAppsWithFlash = function() {
        this.app = Sammy('#form_params', function() {
          this.use(Sammy.Flash);
          this.get('#/', function() {
            this.flash('welcome info', 'Welcome!');
          });
          this.post('#/test_nested_params', function() {
            this.flash('nested params info', "Successfully POSTed nested params");
            this.redirect('#/');
          });
        });

        this.nowApp = Sammy('#main', function() {
          this.use(Sammy.Flash);
          this.get('#/', function() {
            this.flashNow('info', '您好');
          });
          this.post('#/test', function() {
            this.flashNow('warn', 'Uh-oh?');
            this.redirect('#/doNothing');
          });
          this.get('#/doNothing', function() {
          });
        });

        this.app.run('#/');
        this.nowApp.run('#/');
      };

      var unloadAppsWithFlash = function() {
        this.app.unload();
        this.nowApp.unload();
      };

      context('Sammy.Flash', 'app.flash', {
        before: createAppsWithFlash,
        after: unloadAppsWithFlash
      })
      .should('exist', function() {
        ok(this.app.flash);
        ok(this.nowApp.flash);
      })
      .should('retain entries after a non-redirect', function() {
        equal(this.app.flash['welcome info'], "Welcome!");
      })
      .should('retain entries after a redirect', function() {
        $('#nested_params_test_form').submit();
        equal(this.app.flash['nested params info'], "Successfully POSTed nested params");
      })
      .should('lose all entries after being rendered', function() {
        this.app.flash.toHTML();
        equal(this.app.flash['nested params info'], null);
        equal(this.app.flash['welcome info'], null);
      })
      .should('retain entries after a redirect in another app', function() {
        $('#test_form').submit();
        soon(function() {
          equal(this.app.flash['welcome info'], "Welcome!");
        }, this, 1, 1);
      });

      context('Sammy.Flash', 'app.flash.now', {
        before: createAppsWithFlash
      })
      .should('exist', function() {
        ok(this.app.flash.now);
        ok(this.nowApp.flash.now);
      })
      .should('retain entries after a non-redirect', function() {
        window.location.hash = '#/';
        equal(this.nowApp.flash.now.info, '您好');
      })
      .should('lose all entries after a redirect', function() {
        $('#test_form').submit();
        soon(function() {
          equal(this.nowApp.flash.now.info, null);
          equal(this.nowApp.flash.now.warn, null);
        }, this, 2, 2);
      })
      .should('lose all entries after being rendered', function() {
        this.nowApp.flash.toHTML();
        equal(this.nowApp.flash.now.info, null);
        equal(this.nowApp.flash.now.warn, null);
      })
      .should('retain entries after a redirect in another app', function() {
        $('#nested_params_test_form').submit();
        soon(function() {
          equal(this.nowApp.flash.now.info, '您好');
        }, this, 1, 1);
      });

      context('Sammy.Flash', 'context.flash()', {
        before: function() {
          createAppsWithFlash.apply(this);
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
        }
      })
      .should('return the Flash object when passed no arguments', function() {
        ok(this.context.flash() == this.app.flash, 'Expected context.flash() to return app.flash');
      })
      .should('return the value of the given key when passed one argument', function() {
        this.app.flash.foo = 'bar';
        equal(this.context.flash('foo'), 'bar');
      })
      .should('set a flash value when passed two arguments', function() {
        this.context.flash('foo', 'bar');
        equal(this.app.flash.foo, 'bar');
      });

      context('Sammy.Flash', 'context.flashNow()', {
        before: function() {
          createAppsWithFlash.apply(this);
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
        }
      })
      .should('return the Flash-Now object when passed no arguments', function() {
        ok(this.context.flashNow() == this.app.flash.now, 'Expected context.flashNow() to return app.flash.now');
      })
      .should('return the value of the given key when passed one argument', function() {
        this.app.flash.now.foo = 'bar';
        equal(this.context.flashNow('foo'), 'bar');
      })
      .should('set a flash value when passed two arguments', function() {
        this.context.flashNow('foo', 'bar');
        equal(this.app.flash.now.foo, 'bar');
      });

      context('Sammy.Flash', 'app.flash#toHTML', {
        before: function() {
          createAppsWithFlash.apply(this);
          this.app.flash.clear();
          this.nowApp.flash.clear();

          this.app.flash.error    = 'Boom! Crash! Bang!';
          this.app.flash.warn     = 'Beep Beep Beep';
          this.app.flash.now.info = 'A nice informational message';
          this.nowApp.flash.debug = 'Debugging info on other app';

          this.output = $('<div id="flash_output" />')
                          .append(this.app.flash.toHTML())
                          .appendTo($('body'));
        },
        after: function() {
          this.output.remove();
          unloadAppsWithFlash.apply(this);
        }
      })
      .should('render a ul.flash', function() {
        equal($('ul.flash', this.output).length, 1);
      })
      .should('include entries from both flash and flash.now, with keys as classes', function() {
        equal($('ul.flash li.error', this.output).text(), 'Boom! Crash! Bang!');
        equal($('ul.flash li.warn', this.output).text(),  'Beep Beep Beep');
        equal($('ul.flash li.info', this.output).text(),  'A nice informational message');
      })
      .should("not include entries from another app's flash", function() {
        equal($('.debug', this.output).length, 0);
      });

    };
})(jQuery);
