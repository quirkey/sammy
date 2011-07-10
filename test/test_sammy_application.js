(function($) {
  // $(function() {
  with(QUnit) {
    context('Sammy','apps')
      .should('return a new application if no arguments passed', function() {
        var app = Sammy();
        defined(app, 'route');
      })
      .should('save the application to Sammy.apps', function() {
        var app = Sammy();
        ok(Sammy.apps['body']);
        equal(Sammy.apps['body'], app);
      })
      .should('create a new app and set the element selector', function() {
        var app = Sammy('#main');
        equal(app.element_selector, '#main');
        ok(Sammy.apps['#main']);
        equal(Sammy.apps['#main'], app);
      })
      .should('return the app at selector', function() {
        Sammy('#main');
        var app = Sammy('#main')
        equal(app.element_selector, '#main');
        ok(Sammy.apps['#main']);
        equal(Sammy.apps['#main'], app);
      })
      .should('extend the app at selector', function() {
        var app = Sammy('#main', function() {
          this.extended = true;
        });
        equal(app.element_selector, '#main');
        ok(Sammy.apps['#main']);
        equal(Sammy.apps['#main'], app);
        ok(app.extended);
      });

      context('Sammy.Application', 'init', {
        before: function() {
          var context = this;
          this.app = new Sammy.Application(function(app) {
            this.random_setting = 1;
            context.yielded_app = app;
          });
        }
      })
      .should('create a sammy object', function() {
        defined(this.app, 'route');
      })
      .should('set arbitrary settings in the app', function() {
        equal(this.app.random_setting, 1);
      })
      .should('set namespace as random UUID', function() {
        matches(/^(\d+)-(\d{1,3})$/, this.app.namespace);
      })
      .should('initialize empty routes object', function() {
        isType(this.app.routes, 'Object');
      })
      .should('yield the app as a argument', function() {
        equal(this.yielded_app, this.app)
      })
      .should('set the location proxy to the default hash location proxy', function() {
        ok(this.app._location_proxy);
        defined(this.app._location_proxy, 'getLocation');
      });

      context('Sammy.Application', 'route', {
        before: function() {
          var context = this;
          this.app = new Sammy.Application(function() {
            context.returned = this.route('get', /testing/, function() {
              $('#main').trigger('click');
            });

            this.mycallback = function() { this.redirect('#/'); };

            this.route('get', '/blah', function() {
              $('#testarea').show();
            });

            this.route('get', '/boosh/:boosh1/:boosh2', function() {
              $('#testarea').show();
            });

            this.get(/blurgh/, function() {
              alert('blurgh');
            });

            this.get('#/', function() {
              alert('home');
            });

            this.post('#/post', 'mycallback');

            this.route('#/verbless', function() {});

            this.route('any', '/any', function() {});

          });
        }
      })
      .should('return the sammy application instance', function() {
        equal(this.returned, this.app);
      })
      .should('turn a string path into a regular expression', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][1];
        isType(route.path, 'RegExp');
      })
      .should('turn a string path with a named param into a regex and save to param_names', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][2];
        isType(route.path, 'RegExp');
        // deepEqual(route.path.toString(), /^\/boosh\/([^\/]+)\/([^\/]+)$/.toString());
        deepEqual(route.param_names, ['boosh1', 'boosh2']);
      })
      .should('append route to application.routes object', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][1]
        isType(route.path, 'RegExp');
        equal(route.verb, 'get');
        defined(route, 'callback');
      })
      .should('allow shortcuts for defining routes', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][3];
        isType(route.path, 'RegExp');
        equal(route.verb, 'get');
        defined(route, 'callback');
      })
      .should('append late and short route to application.routes object', function() {
        var app = this.app;
        ok(app.routes['get']);
        equal(app.routes['get'].length, 7)
        var route = app.routes['get'][4];
        isType(route.path, 'RegExp');
        equal(route.verb, 'get');
        defined(route, 'callback');
        equal(route.path.toString(), new RegExp("#/$").toString());
      })
      .should('lookup callback as a string', function() {
        var app = this.app;
        ok(app.routes['post'], "post routes defined");
        var route = app.routes['post'][0];
        ok(route, "route exists");
        equal(route.callback, app.mycallback);
      })
      .should('add an "any" route to every route verb', function() {
        var app = this.app;
        $.each(app.ROUTE_VERBS, function(i, verb) {
          ok(app.routes[verb], verb + "is set on routes");
          var route = app.routes[verb].pop();
          ok(route, "route exists on " + verb);
          equal(route.path.toString(), new RegExp("/any$").toString());
        });
      });

      context('Sammy.Application', 'mapRoutes', {
        before: function() {
          var context = this;
          context.empty_callback = function() {};
          context.routes = [
            ['get', '#/get', context.empty_callback],
            ['post', '#/post', context.empty_callback],
            ['any', '#/any', context.empty_callback],
            ['get', '#/string', 'empty']
          ]
          context.app = new Sammy.Application(function() {
            this.empty = context.empty_callback;

            context.returned = this.mapRoutes(context.routes);
          });
        }
      })
      .should('return the app', function() {
        equal(this.returned, this.app);
      })
      .should('add routes to the app', function() {
        var app = this.app;
        ok(app.routes, "should have routes");
        ok(app.routes['get'], "should have get routes");
        equal(app.routes['get'][0].path.toString(), new RegExp("#/get$").toString());
      })
      .should('lookup callbacks as strings', function() {
        var app = this.app, route = app.routes['get'].pop();
        ok(route);
        equal(route.path, new RegExp("#/string$").toString());
        equal(route.callback, this.empty_callback);
      });

      context('Sammy.Application', 'bind', {
        before: function() {
          var context = this;
          context.triggered = false;
          this.app = new Sammy.Application(function() {

            context.returned = this.bind('boosh', function() {
              context.triggered = 'boosh';
              context.inner_context = this;
            });

            this.bind('blurgh', function() {
              context.triggered = 'blurgh';
              context.inner_context = this;
            });

          });
        }
      })
      .should('return the sammy application instance', function() {
        equal(this.returned, this.app);
      })
      .should('add callback to the listeners collection', function() {
        equal(this.app.listeners['boosh'].length, 1);
      })
      .should('not be able to trigger before run', function() {
        var app = this.app;
        var context = this;
        app.trigger('boosh');
        soon(function() {
          equal(context.triggered, false);
        });
      })
      .should('actually bind/be able to trigger to element after run', function() {
        var app = this.app;
        var context = this;
        app.run();
        app.trigger('blurgh');
        soon(function() {
          equal(context.triggered, 'blurgh');
          app.unload();
        });
      })
      .should('catch events on the bound element', function() {
        var app = this.app;
        var context = this;
        app.run();
        app.$element().trigger('boosh');
        soon(function() {
          equal(context.triggered, 'boosh');
          equal(context.inner_context.verb, 'bind');
          app.unload();
        }, this, 2, 2);
      })
      .should('set the context of the bound events to an EventContext', function() {
        var app = this.app;
        var event_context = null;
        var yielded_context = null;
        this.app.bind('serious-boosh', function() {
          event_context = this;
        });
        app.run();
        app.trigger('serious-boosh');
        soon(function() {
          deepEqual(event_context.app, app);
          equal(event_context.verb, 'bind');
          equal(event_context.path, 'serious-boosh');
          app.unload();
        }, this, 1, 3);
      });

      context('Sammy.Application','run', {
        before: function () {
          window.location.hash = ''
          var context = this;
          context.yielded_context = "";
          $('.get_area').text('');
          this.app = new Sammy.Application(function() {
            this.element_selector = '#main';
            this.debug = true;
            this.form_params = {};

            this.route('get', '#/', function() {
              $('.get_area').text('');
            });

            this.route('get', '#/test', function() {
              $('.get_area').text('test success');
            });

            this.route('post', '#/test', function() {
              this.app.form_was_run = 'YES';
              this.app.form_params = this.params;
              this.app.form_target = this.target;
              return false;
            });

            this.route('post', '#/live', function() {
              this.app.form_was_run = 'LIVE';
              this.app.form_params = this.params;
              this.app.form_target = this.target;
              return false;
            });

            this.route('put', '#/puttest', function() {
              this.app.form_was_run = 'PUT';
              this.app.form_params = this.params;
              this.app.form_target = this.target;
              return false;
            });

            this.route('get', '#/yield', function(c) {
              context.yielded_context = c;
            });

            this.route('get', '#/postpost', function(c) {
              this.log('get', '#/postpost');
              this.app.get_after_form = 'YES';
            });

            this.route('post', '#/postpost', function(c) {
              this.app.form_was_run = 'POSTPOST';
              this.log('post', '#/postpost');
              this.redirect('#/postpost');
            });

            this.bind('blurgh', function () {
              $('.get_area').text('event fired');
            });
          });
        }
      })
      .should('set the location to the start url', function() {
        var app = this.app;
        app.run('#/');
        soon(function() {
          equal(window.location.hash, '#/');
          app.unload();
        });
      })
      .should('bind events to all forms', function() {
        var app = this.app;
        app.run('#/');
        $('#main form').submit();
        soon(function() {
          equal(app.form_was_run, 'YES');
          ok(app.form_params);
          equal(app.form_target, $('#main form').get(0));
          app.unload();
        }, this, 1, 3);
      })
     .should('bind events to all future forms', function () {
        var app = this.app;
        app.run('#/');
        // add a new form to the page
        $('#main').append('<form id="live_form" action="#/live" method="post">' +
           '<input name="live_test" type="text" />' +
           '<input type="submit" class="submit" />' +
           '</form>'
         );
        $('#live_form .submit').submit();
        soon(function() {
          equal(app.form_was_run, 'LIVE');
          equal(app.form_target, $('#live_form').get(0));
          app.unload();
        }, this, 1, 2);
      })
      .should('get form verb from _method input', function() {
        var app = this.app;
        // add a new form to the page
        $('#main').append('<form id="put_form" action="#/puttest" method="post">' +
           '<input name="_method" type="hidden" value="put" />' +
           '<input type="submit" class="submit" />' +
           '</form>'
         );
         app.run('#/');

        $('#put_form .submit').submit();
        soon(function() {
          equal(app.form_was_run, 'PUT');
          equal(app.form_target, $('#put_form').get(0));
          app.unload();
        }, this, 1, 2);
      })
      .should('get form verb even if the browser has no support for the method', function() {
        var app = this.app;
        // add a new form to the page
        $('#main').append('<form id="put_form2" action="#/puttest" method="put">' +
           '<input type="submit" class="submit" />' +
           '</form>'
         );
         app.run('#/');
        $('#put_form2 .submit').submit();
        soon(function() {
          equal(app.form_was_run, 'PUT');
          equal(app.form_target, $('#put_form2').get(0));
          app.unload();
        }, this, 1, 2);
      })
      .should('change the hash when submitting get forms', function() {
        var app = this.app;
        app.route('get', '#/live', function() {});
        app.run('#/');
        $('#main').append('<form id="live_form" action="#/live" method="get">' +
           '<input name="live_test" type="text" value="live_value"/>' +
           '<input type="submit" class="submit"/>' +
           '</form>'
         );
        $('#live_form .submit').submit();
        soon(function() {
          equal(window.location.hash, '#/live?live_test=live_value');
          app.unload();
        });
      })
      .should('URL encode form values', function() {
        var app = this.app;
        app.route('get', '#/live', function() {});
        app.run('#/');
        $('#main').append('<form id="live_form" action="#/live" method="get">' +
           '<input name="spaces" type="text" value="value with spaces"/>' +
           '<input name="pluses" type="text" value="+++"/>' +
           '<input type="submit" class="submit"/>' +
           '</form>'
         );
        $('#live_form .submit').submit();
        soon(function() {
          equal(window.location.hash, '#/live?spaces=value%20with%20spaces&pluses=%2B%2B%2B');
          app.unload();
        });
      })
      .should('trigger routes on URL change', function() {
        var app = this.app;
        app.run();
        window.location.hash = '#/test';
        soon(function() {
          equal($('.get_area').text(), 'test success');
          app.unload();
        });
      })
      .should('yield the event context to the route', function() {
        var app = this.app;
        window.location.hash = '#';
        app.run('#/yield');
        soon(function() {
          equal(this.yielded_context.path, '/#/yield');
          app.unload();
        }, this);
      })
      .should('trigger events using the apps trigger method', function() {
        var app = this.app;
        app.run();
        app.trigger('blurgh');
        soon(function() {
          equal($('.get_area').text(), 'event fired');
          app.unload();
        });
      })
      .should('die silently if route is not found and 404s are off', function() {
        var app = this.app;
        app.raise_errors = false;
        app.run();
        notRaised(function() {
          window.location.hash = '#/no-route-for-me'
          soon(function() { app.unload(); });
        });
      })
      .should('redirect to same path after form submit', function() {
        var app = this.app;
        app.run('#/');
        // add a new form to the page
        $('#main').append('<form id="live_form" action="#/postpost" method="post">' +
           '<input type="submit" class="submit" />' +
           '</form>'
         );
        $('#live_form .submit').submit();
        soon(function() {
          equal(app.form_was_run, 'POSTPOST');
          equal(app.get_after_form, 'YES');
          app.unload();
        }, this, 2, 2);
      });

      context('Sammy.Application','lookupRoute', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              $('#main').trigger('click');
            });

            this.route('get', '#/boo', function() {
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
        isType(route, 'Object')
        equal(route.verb, 'post');
        defined(route, 'callback');
      })
      .should('find a route by verb and partial route', function() {
        var app = this.app;
        var route = app.lookupRoute('get','/blah/mess');
        isType(route, 'Object')
        equal(route.verb, 'get');
        defined(route, 'callback');
      })
      .should('ignore any hash query string when looking up a route', function() {
        var app = this.app;
        var route = app.lookupRoute('get', '#/boo?ohdontmindeme');
        isType(route, 'Object');
        equal(route.verb, 'get');
        defined(route, 'callback');
      });

      context('Sammy.Application','runRoute', {
        before: function() {
          var context = this;
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              context.params = this.params;
            });

            this.route('get', /\/forward\/([^\/]+)\/([^\/]+)/, function(c, part1, part2) {
              context.inner_context = this;
              context.context_arg = c;
              context.part1 = part1;
              context.part2 = part2;
            });

            this.route('get', '#/boosh/:test/:test2', function() {
              context.params = this.params;
            });

            this.route('get', '#/message/:message', function() {
              context.params = this.params;
            });
          });
        }
      })
      .should('set named params from a string route', function() {
        this.app.runRoute('get', '#/boosh/blurgh/kapow');
        equal(this.params['test'], 'blurgh');
        equal(this.params['test2'], 'kapow');
      })
      .should('set unnamed params from a regex route in "splat"', function() {
        this.app.runRoute('get', '#/blah/could/be/anything');
        equal(this.params['splat'], 'could/be/anything');
      })
      .should('forward unnamed params to the callback as arguments', function() {
        this.app.runRoute('get', '#/forward/to/route');
        deepEqual(this.context_arg, this.inner_context);
        equal(this.part1, 'to');
        equal(this.part2, 'route');
      })
      .should('set additional params from a query string after the hash', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?with=some&nifty=params');
        equal(this.params['with'], 'some');
        equal(this.params['nifty'], 'params');
      })
      .should('set value-less params to an empty string', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?empty&again=&not-empty=blah');
        equal(this.params['empty'], '');
        equal(this.params['again'], '');
        equal(this.params['not-empty'], 'blah');
      })
      .should('exclude the query string from named param values', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?with=some&nifty=params');
        equal(this.params['test'], 'farg');
        equal(this.params['test2'], 'wow');
      })
      .should('exclude the query string from unnamed param values', function() {
        this.app.runRoute('get', '#/blah/could/be/anything?except=aquerystring');
        equal(this.params['splat'], 'could/be/anything');
      })
      .should('decode the query string values', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?encoded=this%20should%20be%20decoded%24%25%5E');
        equal(this.params['encoded'], "this should be decoded$%^")
      })
      .should('decode param values', function() {
        this.app.runRoute('get', '#/message/hello%20there');
        equal(this.params['message'], 'hello there');
        this.app.runRoute('get', '#/message/hello there');
        equal(this.params['message'], 'hello there');
      })
      .should('raise error when route can not be found', function() {
        var app = this.app;
        app.raise_errors = true;
        raised(/404/, function() {
          app.runRoute('get','/blurgh');
        });
      });

      context('Sammy.Application','before', {
        before: function() {
          window.location.hash = '';
          var context = this;
          context.before  = {};
          context.route   = {};
          this.app = new Sammy.Application(function() {
            this.before(function() {
              this.params['belch'] = 'burp';
              context.before = this;
            });

            this.get('#/', function() {
              context.route = this;
            });

            this.get('#/boosh', function() {
              context.route = this;
            });
          });
        }
      })
      .should('run before route', function() {
        var context = this;
        window.location.hash = '#';
        this.app.run('#/');
        soon(function() {
          equal(context.route.params['belch'], 'burp');
          context.app.unload();
        });
      })
      .should('set context to event context', function() {
        var context = this;
        context.app.run('#/');
        soon(function() {
          deepEqual(context.route, context.before);
          context.app.unload();
        });
      })
      .should('not run route if before returns false', function() {
        var context = this;
        context.app.before(function() {
          return false;
        });
        context.app.run('#/');
        soon(function() {
          deepEqual(context.before.app, context.app);
          deepEqual(context.route, {});
          context.app.unload();
        }, this, 1, 2);
      })
      .should('only run if before matches options', function() {
        var context = this;
        context.before_run = [];
        context.app.before({only: '#/boosh'}, function() {
          context.before_run.push('/boosh');
        });
        context.app.before({only: '#/'}, function() {
          context.before_run.push('/')
        });
        window.location.hash = '';
        context.app.run();
        context.app.setLocation('#/');
        expect(4);
        stop();
        setTimeout(function() {
          ok(context.route);
          equal(context.route.path, '/#/');
          deepEqual(context.before_run, ['/'], 'should match /')
          window.location = '#/boosh';
          setTimeout(function() {
            deepEqual(context.before_run, ['/', '/boosh'], "should match ['/', 'boosh']");
            context.app.unload();
            start();
          }, 100);
        }, 200);
      })

      context('Sammy.Application','after', {
        before: function() {
          var context = this;
          context.after  = {};
          context.route   = {};
          this.app = new Sammy.Application(function() {
            this.after(function() {
              this.params['belch'] = 'burp';
              context.after = this;
            });

            this.get('#/', function() {
              this.params['belch'] = 'boosh';
              context.route = this;
            });
          });
        }
      })
      .should('run after route', function() {
        var context = this;
        this.app.run('#/');
        window.location.hash = '#/';
        soon(function() {
          equal(context.after.params['belch'], 'burp');
          context.app.unload();
        }, this, 5, 1);
      })
      .should('set context to event context', function() {
        var context = this;
        context.app.run('#/');
        soon(function() {
          deepEqual(context.route, context.after);
          context.app.unload();
        });
      });

      context('Sammy.Application', 'around', {
        before: function() {
          window.location.hash = '';
          var context = this;
          context.path = [];
          context.run_route = true;
          this.app = new Sammy.Application(function() {

            this.around(function(callback) {
              context.path.push('around1 in');
              if (context.run_route) {
                callback();
              }
              context.path.push('around1 out');
            });

            this.get('#/', function() {
              context.path.push('route #/');
            });

          });
        }
      })
      .should('run route with callback()', function() {
        var context = this;
        context.app.run('#/');
        soon(function() {
          deepEqual(context.path, ['around1 in', 'route #/', 'around1 out']);
          context.app.unload();
        });
      })
      .should('not run route if callback is never called', function() {
        var context = this;
        context.run_route = false;
        context.app.run('#/');
        soon(function() {
          deepEqual(context.path, ['around1 in', 'around1 out']);
          context.app.unload();
        });
      })
      .should('run multiple around filters', function() {
        var context = this;
        context.app.around(function(callback) {
          context.path.push('around2 in');
          callback();
          context.path.push('around2 out');
        });
        context.app.run('#/');
        soon(function() {
          deepEqual(context.path, ['around1 in', 'around2 in', 'route #/', 'around2 out', 'around1 out']);
          context.app.unload();
        });
      })
      .should('run before filters after around filter', function() {
        var context = this;
        context.app.before(function() {
          context.path.push('before');
        });
        context.app.run('#/');
        soon(function() {
          deepEqual(context.path, ['around1 in', 'before', 'route #/', 'around1 out']);
          context.app.unload();
        });
      });

      context('Sammy.Application','helpers', {
        before: function() {
          var context = this;
          context.event_context = null;
          this.app = new Sammy.Application(function() {

            this.helpers({
              helpme: function() {
                return "halp!";
              }
            });

            this.get('#/', function() {
              this.params['belch'] = 'boosh';
              context.event_context = this;
            });

            this.bind('blurgh', function() {
              context.event_context = this;
            });
          });
        }
      })
      .should('extend event context for routes', function() {
        var context = this;
        this.app.run('#/');
        soon(function() {
          ok(context['event_context']);
          isType(context.event_context.helpme, 'Function');
          this.app.unload();
        }, this, 2, 2);
      })
      .should('extend event context for bind', function() {
        var context = this;
        this.app.run('#/');
        this.app.trigger('blurgh');
        soon(function() {
          ok(context['event_context']);
          isType(context.event_context.helpme, 'Function');
          this.app.unload();
        }, this, 2, 2);
      });

      context('Sammy.Application','helper', {
        before: function() {
          var context = this;
          context.event_context = null;
          this.app = new Sammy.Application(function() {

            this.helper(
              "helpme", function() {
                return "halp!";
              }
            );

            this.get('#/', function() {
              this.params['belch'] = 'boosh';
              context.event_context = this;
            });

            this.bind('blurgh', function() {
              context.event_context = this;
            });
          });
        }
      })
      .should('extend event context for routes', function() {
        var context = this;
        this.app.run('#/');
        soon(function() {
          ok(context['event_context']);
          isType(context.event_context.helpme, 'Function');
          this.app.unload();
        }, this, 2, 2);
      })
      .should('extend event context for bind', function() {
        var context = this;
        this.app.run('#/');
        this.app.trigger('blurgh');
        soon(function() {
          ok(context['event_context']);
          isType(context.event_context.helpme, 'Function');
          this.app.unload();
        }, this, 2, 2);
      });

      context('Sammy.Application', 'getLocation', {
        before: function() {
          this.app = new Sammy.Application;
        }
      })
      .should('return the browsers path and hash by default', function() {
        window.location.hash = '#/boosh';
        soon(function() {
          equal(this.app.getLocation(), "/#/boosh");
        }, this);
      });

      context('Sammy.Application', 'setLocation', {
        before: function() {
          this.app = new Sammy.Application;
        }
      })
      .should('set the browsers hash by default', function() {
        this.app.setLocation('#/blurgh');
        soon(function() {
          equal(window.location.hash, '#/blurgh');
        })
      });

      context('Sammy.Application', 'post routes', {
        before: function() {
          var context = this;
          context.visited = [];
          context.location = "";
          context.posted   = false;
          this.app = new Sammy.Application(function() {

            this.get('#/blah', function() {
              context.location = "blah";
              context.visited.push('blah');
              this.redirect('#/boosh');
            });

            this.get('#/boosh', function() {
              context.location = "boosh";
              context.visited.push('boosh');
            });

            this.post(/test/, function() {
              context.location = "post";
              context.posted   = true;
              context.visited.push('post');
              this.redirect('#/boosh');
            });
          });
        }
      })
      .should('redirect after a get', function() {
        window.location.hash = '';
        var context = this;
        context.app.run();
        window.location.hash = '/blah';
        expect(3)
        stop();
        setTimeout(function() {
          $('#main form').submit();
          setTimeout(function() {
            ok(context.posted);
            deepEqual(context.visited, ['blah', 'boosh', 'post', 'boosh'], "was: " + context.visited);
            equal(context.location, 'boosh');
            context.app.unload();
            start();
          }, 1000);
        }, 1000);
      });

      context('Sammy.Application', 'contextMatchesOptions', {
        before: function() {
          this.app = $.sammy();
          this.route = {
            verb: 'get',
            path: '#/boosh',
            params: {
              'blurgh': 'boosh'
            }
          };
        }
      })
      .should('match against empty options', function() {
        ok(this.app.contextMatchesOptions(this.route, {}));
      })
      .should('match against only with path', function() {
        ok(this.app.contextMatchesOptions(this.route, {only: {path: '#/boosh'}}));
        ok(this.app.contextMatchesOptions(this.route, {only: '#/boosh'}));
        ok(!this.app.contextMatchesOptions(this.route, {only: {path: '#/'}}));
        ok(!this.app.contextMatchesOptions(this.route, {only: '#/'}));
      })
      .should('match against only with path and verb', function() {
        ok(this.app.contextMatchesOptions(this.route, {only: {path: '#/boosh', verb: 'get'}}));
        ok(!this.app.contextMatchesOptions(this.route, {only: {path: '#/boosh', verb: 'put'}}));
        ok(!this.app.contextMatchesOptions(this.route, {only: {path: '#/', verb: 'get'}}));
      })
      .should('match against only with verb', function() {
        ok(this.app.contextMatchesOptions(this.route, {only: {verb: 'get'}}));
        ok(!this.app.contextMatchesOptions(this.route, {only: {verb: 'put'}}));
      })
      .should('match against only with verb array', function() {
        ok(this.app.contextMatchesOptions(this.route, {only: {verb: ['get', 'post']}}));
        ok(!this.app.contextMatchesOptions(this.route, {only: {verb: ['put', 'post']}}));
      })
      .should('match against except with path and verb', function() {
        ok(this.app.contextMatchesOptions(this.route, {except: {path: '#/', verb: 'get'}}));
        ok(!this.app.contextMatchesOptions(this.route, {except: {path: '#/boosh', verb: 'get'}}));
        ok(this.app.contextMatchesOptions(this.route, {except: {path: '#/boosh', verb: 'put'}}));
      })
      .should('match against except with path', function() {
        ok(this.app.contextMatchesOptions(this.route, {except: {path: '#/'}}));
        ok(this.app.contextMatchesOptions(this.route, {except: '#/'}));
        ok(!this.app.contextMatchesOptions(this.route, {except: {path: '#/boosh'}}));
        ok(!this.app.contextMatchesOptions(this.route, {except: '#/boosh'}));
      })
      .should('match against except with verb', function() {
        ok(!this.app.contextMatchesOptions(this.route, {except: {verb: 'get'}}));
        ok(this.app.contextMatchesOptions(this.route, {except: {verb: 'put'}}));
      })
      .should('match against just path', function() {
        ok(this.app.contextMatchesOptions(this.route, '#/boosh'), 'should match exact string path');
        ok(!this.app.contextMatchesOptions(this.route, '#/boo'), 'should not match partial string path');
        ok(this.app.contextMatchesOptions(this.route, /^\#\/boosh/), 'should match regex');
        ok(!this.app.contextMatchesOptions(this.route, /^\#\/$/), 'should not match regex');
      })
      .should('match empty options', function() {
        ok(this.app.contextMatchesOptions(this.route, {}));
      });

      context('Sammy.Application', 'use', {
        before: function() {
          var context = this;
          var TrivialLogin = function(app, a, b, c) {
            context.plugin_this = this;
            this.a = a;
            app.b = b;
            this.c = c;

            this.isAuthenticated = function(username) {
              return true;
            }

            this.helpers({
              alert: function(message) {
                this.$element().append(message);
              },
              partial: function(template, data) {
                return "MY USELESS PARTIAL";
              }
            });

            this.get('#/login', function(e) {
              e.alert(e.partial("Please Login"));
            });
          };

          this.app = new Sammy.Application(function() {
            this.use(TrivialLogin, 1, 2, 3);
            this.element_selector = '.get_area';

            this.get('#/', function() {
              this.alert('BOOSH');
            });

          });

        }
      })
      .should('raise error if the plugin is not defined', function() {
        var app = this.app;
        app.raise_errors = true;
        raised(/plugin/, function() {
          app.use(Sammy.Boosh);
        });
      })
      .should('raise error if the plugin is not a function', function() {
        var app = this.app;
        var blah = 'whu';
        app.raise_errors = true;
        raised(/whu/, function() {
          app.use(blah);
        });
      })
      .should('evaluate the function within the context of the app', function() {
        equal(this.plugin_this, this.app);
      })
      .should('add defined routes to the applications routes', function() {
        equal(this.app.routes['get'].length, 2);
      })
      .should('add defined methods to the application', function() {
        isType(this.app.isAuthenticated, 'Function');
      })
      .should('override event context methods with helpers()', function() {
        $('.get_area').text('');
        var app = this.app;
        window.location.hash = "";
        app.run('#/login');
        soon(function() {
          equal($('.get_area').text(), 'MY USELESS PARTIAL');
          app.unload();
        });
      })
      .should('not override the global EventContext prototype methods', function() {
        matches(/RenderContext/, new Sammy.EventContext().partial.toString());
      })
      .should('yield additional arguments as arguments to the plugin', function() {
        equal(this.app.a, 1);
        equal(this.app.b, 2);
        equal(this.app.c, 3);
      });

      context('Sammy.Application', '$element', {
        before: function() {
          this.app = $.sammy(function() {
            this.element_selector = '#main';
          });
        }
      })
      .should('accept an element selector', function() {
        sameHTML(this.app.$element('.inline-template-1'), '<div class="inline-template-1"><div class="name"></div></div>');
      })
      .should('return the app element if no selector is given', function() {
        equal(this.app.$element().attr('id'), 'main');
      });
    }
  // });
})(jQuery);
