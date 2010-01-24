(function($) {
  // $(function() {
    with(jqUnit) {
      context('Sammy','apps')
      .should('return a new application if no arguments passed', function() {
        var app = Sammy();
        defined(app, 'route');
      })
      .should('save the application to Sammy.apps', function() {
        var app = Sammy();
        ok(Sammy.apps['body']);
        equals(Sammy.apps['body'], app);
      })
      .should('create a new app and set the element selector', function() {
        var app = Sammy('#main');
        equals(app.element_selector, '#main');
        ok(Sammy.apps['#main']);
        equals(Sammy.apps['#main'], app);
      })
      .should('return the app at selector', function() {
        Sammy('#main');
        var app = Sammy('#main')
        equals(app.element_selector, '#main');
        ok(Sammy.apps['#main']);
        equals(Sammy.apps['#main'], app);
      })
      .should('extend the app at selector', function() {
        var app = Sammy('#main', function() {
          this.extended = true;
        });
        equals(app.element_selector, '#main');
        ok(Sammy.apps['#main']);
        equals(Sammy.apps['#main'], app);
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
        equals(this.app.random_setting, 1);
      })
      .should('set namespace as random UUID', function() {
        matches(/^(\d+)-(\d{1,3})$/, this.app.namespace);
      })
      .should('initialize empty routes object', function() {
        isType(this.app.routes, Object);
      })
      .should('yield the app as a argument', function() {
        equals(this.yielded_app, this.app)
      })
      .should('set the location proxy to the default hash location proxy', function() {
        ok(this.app.location_proxy);
        defined(this.app.location_proxy, 'getLocation');
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
            
            this.route('any', '/any', function() {});
            
          });
        }
      })
      .should('return the sammy application instance', function() {
        equals(this.returned, this.app);
      })
      .should('turn a string path into a regular expression', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][1];
        isType(route.path, RegExp);
      })
      .should('turn a string path with a named param into a regex and save to param_names', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][2];
        isType(route.path, RegExp);
        isObj(route.path, /\/boosh\/([^\/]+)\/([^\/]+)$/);
        isSet(route.param_names, ['boosh1', 'boosh2']);
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
      })
      .should('append late and short route to application.routes object', function() {
        var app = this.app;
        ok(app.routes['get']);
        equals(app.routes['get'].length, 6)
        var route = app.routes['get'][4];
        isType(route.path, RegExp);
        equals(route.verb, 'get');
        defined(route, 'callback');
        equals(route.path.toString(), new RegExp("#/$").toString());
      })
      .should('lookup callback as a string', function() {
        var app = this.app;
        ok(app.routes['post'], "post routes defined");
        var route = app.routes['post'][0];
        ok(route, "route exists");
        equals(route.callback, app.mycallback);
      })
      .should('add an "any" route to every route verb', function() {
        var app = this.app;
        $.each(app.ROUTE_VERBS, function(i, verb) {
          ok(app.routes[verb], verb + "is set on routes");
          var route = app.routes[verb].pop();
          ok(route, "route exists on " + verb);
          equals(route.path.toString(), "/\/any$/");
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
            
            this.mapRoutes(context.routes);
          });
        }
      })
      .should('add routes to the app', function() {
        var app = this.app;
        ok(app.routes, "should have routes");
        ok(app.routes['get'], "should have get routes");
        equals(app.routes['get'][0].path.toString(), "^/#\/get$/")
      })
      .should('lookup callbacks as strings', function() {
        var app = this.app, route = app.route['get'].pop();
        ok(route);
        equals(route.path, "^/#\/string$/")
        equals(route.callback, this.empty_callback);
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
        equals(this.returned, this.app);
      })
      .should('add callback to the listeners collection', function() {
        equals(this.app.listeners['boosh'].length, 1);
      })
      .should('not be able to trigger before run', function() {
        var app = this.app;
        var context = this;
        app.trigger('boosh');
        soon(function() {
          equals(context.triggered, false);
        });
      })
      .should('actually bind/be able to trigger to element after run', function() {
        var app = this.app;
        var context = this;
        app.run();
        app.trigger('blurgh');
        soon(function() {
          equals(context.triggered, 'blurgh');
          app.unload();
        });
      })
      .should('catch events on the bound element', function() {
        var app = this.app;
        var context = this;
        app.run();
        app.$element().trigger('boosh');
        soon(function() {
          equals(context.triggered, 'boosh');
          equals(context.inner_context.verb, 'bind');
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
          isObj(event_context.app, app);
          equals(event_context.verb, 'bind');
          equals(event_context.path, 'serious-boosh');
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
          
            this.route('get', '#/', function() {
              $('.get_area').text('');
            });
          
            this.route('get', '#/test', function() {
              $('.get_area').text('test success');
            });
          
            this.route('post', /test/, function() {
              this.app.form_was_run = 'YES';
              this.app.form_params = this.params;
              return false;
            });
          
            this.route('get', '#/yield', function(c) {
              context.yielded_context = c;
            });
          
            this.bind('blurgh', function () {
              $('.get_area').text('event fired');
            });
          });
        }
      })
      .should('attach application instance to element', function() {
        this.app.run();
        isObj($('#main').data('sammy-app'), this.app);
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
        $('#main form').submit();
        matches(/sammy-app/, $('#main form')[0].className);
        soon(function() {
          equals(app.form_was_run, 'YES');
          app.unload();
        }, this, 1, 2);
      })
      .should('trigger routes on URL change', function() {
        var app = this.app;
        app.run();
        window.location.hash = '#/test';
        soon(function() {
          equals($('.get_area').text(), 'test success');
          app.unload();
        });
      })
      .should('yield the event context to the route', function() {
        var app = this.app;
        window.location.hash = '#';
        app.run('#/yield');
        soon(function() {
          equals(this.yielded_context.path, '#/yield');
          app.unload();
        }, this);
      })
      .should('trigger events using the apps trigger method', function() {
        var app = this.app;
        app.run();
        app.trigger('blurgh');
        soon(function() {
          equals($('.get_area').text(), 'event fired');
          app.unload();
        });
      })
      .should('die silently if route is not found and 404s are off', function() {
        var app = this.app;
        app.silence_404 = true;
        app.run();
        notRaised(function() {
          window.location.hash = '#/no-route-for-me'
          soon(function() { app.unload(); });
        });
      });
    
      context('Sammy.Application','lookupRoute', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              $('#main').trigger('click');
            });

            this.route('get', '/boo', function() {
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
      })
      .should('ignore any hash query string when looking up a route', function() {
        var app = this.app;
        var route = app.lookupRoute('get', '#/boo?ohdontmindeme');
        isType(route, Object);
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
            
            this.route('get', '#/message/:message', function() {
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
      .should('set additional params from a query string after the hash', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?with=some&nifty=params');
        equals(this.params['with'], 'some');
        equals(this.params['nifty'], 'params');
      })
      .should('exclude the query string from named param values', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?with=some&nifty=params');
        equals(this.params['test'], 'farg');
        equals(this.params['test2'], 'wow');
      })
      .should('exclude the query string from unnamed param values', function() {
        this.app.runRoute('get', '#/blah/could/be/anything?except=aquerystring');
        equals(this.params['splat'], 'could/be/anything');
      })
      .should('decode the query string values', function() {
        this.app.runRoute('get', '#/boosh/farg/wow?encoded=this%20should%20be%20decoded%24%25%5E');
        equals(this.params['encoded'], "this should be decoded$%^")
      })
      .should('decode param values', function() {
        this.app.runRoute('get', '#/message/hello%20there');
        equals(this.params['message'], 'hello there');
        this.app.runRoute('get', '#/message/hello there');
        equals(this.params['message'], 'hello there');
      })
      .should('raise error when route can not be found', function() {
        var app = this.app;
        app.silence_404 = false;
        raised(/404/, function() {
          app.runRoute('get','/blurgh');
        });
      });
    
      context('Sammy.Application','before', {
        before: function() {
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
          });
        }
      })
      .should('run before route', function() {
        var context = this;
        window.location.hash = '#';
        this.app.run('#/');
        soon(function() {
          equals(context.route.params['belch'], 'burp');
          context.app.unload();
        });
      })
      .should('set context to event context', function() {
        var context = this;
        context.app.run('#/');
        soon(function() {
          isObj(context.route, context.before);
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
          isObj(context.before.app, context.app);
          isObj(context.route, {});
          context.app.unload();
        }, this, 1, 2);
      });      
    
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
        soon(function() {
          equals(context.after.params['belch'], 'burp');
          context.app.unload();
        });
      })
      .should('set context to event context', function() {
        var context = this;
        context.app.run('#/');
        soon(function() {
          isObj(context.route, context.after);
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
          isType(context.event_context.helpme, Function);
          this.app.unload();
        }, this, 2, 2);
      })
      .should('extend event context for bind', function() {
        var context = this;
        this.app.run('#/');
        this.app.trigger('blurgh');
        soon(function() {
          ok(context['event_context']);
          isType(context.event_context.helpme, Function);
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
          isType(context.event_context.helpme, Function);
          this.app.unload();
        }, this, 2, 2);
      })
      .should('extend event context for bind', function() {
        var context = this;
        this.app.run('#/');
        this.app.trigger('blurgh');
        soon(function() {
          ok(context['event_context']);
          isType(context.event_context.helpme, Function);
          this.app.unload();
        }, this, 2, 2);
      });
   
      context('Sammy.Application', 'getLocation', {
        before: function() {
          this.app = new Sammy.Application;        
        }
      })
      .should('return the browsers hash by default', function() {
        window.location.hash = '#/boosh';
        soon(function() {
          equals(this.app.getLocation(), "#/boosh");
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
          equals(window.location.hash, '#/blurgh');
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
            isObj(context.visited, ['blah', 'boosh', 'post', 'boosh'], "was: " + context.visited);
            equals(context.location, 'boosh');
            context.app.unload();
            start();
          }, 1000);
        }, 1000);
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
        raised(/plugin/, function() {
          app.use(Sammy.Boosh);
        });
      })
      .should('raise error if the plugin is not a function', function() {
        var app = this.app;
        var blah = 'whu';
        raised(/function/, function() {
          app.use(blah);
        });
      })
      .should('evaluate the function within the context of the app', function() {
        equals(this.plugin_this, this.app);
      })
      .should('add defined routes to the applications routes', function() {
        equals(this.app.routes['get'].length, 2);
      })
      .should('add defined methods to the application', function() {
        isType(this.app.isAuthenticated, Function);
      })
      .should('override event context methods with helpers()', function() {
        $('.get_area').text('');
        var app = this.app;
        window.location.hash = "";
        app.run('#/login');
        soon(function() {
          equals($('.get_area').text(), 'MY USELESS PARTIAL');
          app.unload();
        });
      })
      .should('not override the global EventContext prototype methods', function() {
        matches(/swap\(/, new Sammy.EventContext().partial.toString());
      })
      .should('yield additional arguments as arguments to the plugin', function() {
        equals(this.app.a, 1);
        equals(this.app.b, 2);
        equals(this.app.c, 3);
      });
      
     
    }
  // });
})(jQuery);
