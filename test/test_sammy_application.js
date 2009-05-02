(function($) {
  // $(function() {
    with(jqUnit) {
      context('Sammy.Application', 'init', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.random_setting = 1;
          });
        }
      })
      .should('create a sammy object', function() {
        defined(this.app, 'route');
      })
      .should('set arbitrary settings in the app', function() {
        equals(this.app.random_setting, 1);
      })
      .should('set namespace as random UUID', function() {
        matches(/^(\d+)-(\d{1,3})$/, this.app.namespace);
      })
      .should('initialize empty routes object', function() {
        isType(this.app.routes, Object);
      });


      context('Sammy.Application', 'route', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.route('get', /test/, function() {
              $('#main').trigger('click');
            });

            this.route('get', '/blah', function() {
              $('#testarea').show();
            });

            this.route('get', '/boosh/:boosh1/:boosh2', function() {
              $('#testarea').show();
            });

            this.get(/blurgh/, function() {
              alert('blurgh');
            });
          });
        }
      })
      .should('turn a string path into a regular expression', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][2];
        isType(route.path, RegExp);
      })
      .should('turn a string path with a named param into a regex and save to param_names', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][0];
        isType(route.path, RegExp);
        isObj(route.path, /\/boosh\/([^\/]+)\/([^\/]+)/);
        isSet(['boosh1', 'boosh2'], route.param_names);
      })
      .should('append route to application.routes object', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][1]
        isType(route.path, RegExp);
        equals(route.verb, 'get');
        defined(route, 'callback');
      })
      .should('allow shortcuts for defining routes', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][3];
        isType(route.path, RegExp);
        equals(route.verb, 'get');
        defined(route, 'callback');
      });
      //

      context('Sammy.Application','run', {
        before: function () {
          $('.get_area').text('');
          this.app = new Sammy.Application(function() {
            this.element_selector = '#main';
            
            this.route('get', '#/', function() {
              $('.get_area').text('');
            });
            
            this.route('get', '#/test', function() {
              $('.get_area').text('test success');
            });
            
            this.route('post', /test/, function() {
              this.app.form_was_run = 'YES';
              return false;
            });
            
            this.bind('blurgh', function () {
              $('.get_area').text('event fired');
            });
          });
        }
      })
      .should('attach application instance to element', function() {
        this.app.run();
        isObj($('#main').data('sammy.app'), this.app);
        this.app.unload();
      })
      .should('set the location to the start url', function() {
        var app = this.app;
        app.run('#/');
        soon(function() {
          equals(window.location.hash, '#/');
          app.unload();
        });
      })
      .should('bind events to all forms', function() {
        var app = this.app;
        app.run('#/');
        $('form').submit();
        soon(function() {
          equals(app.form_was_run, 'YES');
          app.unload();
        });
      })
      .should('trigger events on URL change', function() {
        var app = this.app;
        app.run();
        window.location.hash = '#/test';
        soon(function() {
          equals($('.get_area').text(), 'test success');
          app.unload();
        });
      })
      .should('bind events only to the sammy app namespace', function() {
        var app = this.app;
        app.run('#/');
        $('#main').trigger('blurgh');
        soon(function() {
          equals($('.get_area').text(), '');
          app.unload();
        });
      })
      .should('set the context of the bound events to the app', function() {
        var app = this.app;
        var event_context = null;
        this.app.bind('serious-boosh', function() {
          event_context = this;
        });
        app.run();
        app.trigger('serious-boosh');
        soon(function() {
          isObj(event_context, app);
          app.unload();
        });
      })
      .should('trigger events using the apps trigger method', function() {
        var app = this.app;
        app.run();
        app.trigger('blurgh');
        soon(function() {
          equals($('.get_area').text(), 'event fired');
          app.unload();
        });
      });

      context('Sammy.Application','lookupRoute', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              $('#main').trigger('click');
            });

            this.route('post', '/blah', function() {
              $('#testarea').show();
            });
          });
        }
      })
      .should('find a route by verb and route', function() {
        var app = this.app;
        var route = app.lookupRoute('post','/blah');
        isType(route, Object)
        equals(route.verb, 'post');
        defined(route, 'callback');
      })
      .should('find a route by verb and partial route', function() {
        var app = this.app;
        var route = app.lookupRoute('get','/blah/mess');
        isType(route, Object)
        equals(route.verb, 'get');
        defined(route, 'callback');
      });
      
      context('Sammy.Application','runRoute', {
        before: function() {
          var context = this;
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              context.params = this.params;
            });

            this.route('get', '#/boosh/:test/:test2', function() {
              context.params = this.params;
            });
          });
        }
      })
      .should('set named params from a string route', function() {
        this.app.runRoute('get', '#/boosh/blurgh/kapow');
        equals(this.params['test'], 'blurgh');
        equals(this.params['test2'], 'kapow');
      })
      .should('set unnamed params from a regex route in "splat"', function() {
        this.app.runRoute('get', '#/blah/could/be/anything');
        equals(this.params['splat'], 'could/be/anything');
      })
      .should('raise error when route can not be found', function() {
        var app = this.app;
        app.silence_404 = false;
        raised(/404/, function() {
          app.runRoute('get','/blurgh');
        });
      })
      .should('die silently if route is not found and 404s are off', function() {
        var app = this.app;
        app.silence_404 = true;
        notRaised(function() {
          app.runRoute('get','/blurgh');
        });
      })

    }
  // });
})(jQuery);
