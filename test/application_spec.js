describe('Application', function() {
  describe('AMD module', function() {
    it('should register as an AMD module', function() {
      expect(amdDefined).to.eql(Sammy);
    });
  });

  describe('apps', function() {
    it('returns a new application if no arguments are passed', function() {
      var app = Sammy();
      expect(app.route).to.be.a(Function);
    });

    it('saves the application to Sammy.apps', function() {
      var app = Sammy();
      expect(Sammy.apps['body']).to.eql(app);
    });

    it('creates a new app and sets the element selector', function() {
      var app = Sammy('#main');
      expect(app.element_selector).to.eql('#main');
      expect(Sammy.apps['#main']).to.eql(app);
    });

    it('returns the app at selector', function() {
      Sammy('#main');
      var app = Sammy('#main');
      expect(app.element_selector).to.eql('#main');
      expect(Sammy.apps['#main']).to.eql(app);
    });

    it('extends the app at selector', function() {
      var app = Sammy('#main', function() {
        this.extended = true;
      });
      expect(app.element_selector).to.eql('#main');
      expect(Sammy.apps['#main']).to.eql(app);
      expect(app.extended).to.be(true);
    });
  });

  describe('Sammy.Application', function() {
    var app,
        context,
        callback;

    describe('#init()', function() {
      beforeEach(function() {
        context = this;
        app = new Sammy.Application(function(app) {
          this.random_setting = 1;
          context.yielded_app = app;
        });
      });

      it('creates a sammy object', function() {
        expect(app.route).to.be.a(Function);
      });

      it('sets arbitrary settings in the app', function() {
        expect(app.random_setting).to.eql(1);
      });

      it('sets the namespace to a random UUID', function() {
        expect(app.namespace).to.match(/^(\d+)-(\d{1,3})$/);
      });

      it('initializes an empty routes object', function() {
        expect(app.routes).to.be.an(Object);
      });

      it('yields the app as an argument', function() {
        expect(context.yielded_app).to.eql(app);
      });

      it('sets the location proxy to the default hash location proxy', function() {
        expect(app._location_proxy.getLocation).to.be.a(Function);
      });
    });

    describe('#route()', function() {
      beforeEach(function() {
        context = this;
        app = new Sammy.Application(function() {
          context.returned = this.route('get', /testing/, function() {
            $('#main').trigger('click');
          });
        });
      });

      it('returns the sammy application instance', function() {
        expect(context.returned).to.eql(app);
      });

      it('turns a string path into a regular expression', function() {
        app.route('get', '/blah', function() {
          $('#testarea').show();
        });

        expect(app.routes['get'][1].path).to.be.a(RegExp);
      });

      it('turns a string path with a named param into a regexp and saves it to param_names', function() {
        app.route('get', '/boosh/:boosh1/:boosh2', function() {
          $('#testarea').show();
        });

        var route = app.routes['get'][1];
        expect(route.path).to.be.a(RegExp);
        expect(route.param_names).to.eql(['boosh1', 'boosh2']);
      });

      it('appends the route to application.routes', function() {
        app.route('get', '/blah', function() {
          $('#testarea').show();
        });

        var route = app.routes['get'][1];
        expect(route.path).to.be.a(RegExp);
        expect(route.verb).to.eql('get');
        expect(route.callback).to.be.a(Array);
        expect(route.callback[0]).to.be.a(Function);
      });

      it('allows shortcuts for defining routes', function() {
        app.get(/blurgh/, function() {
          alert('blurgh');
        });

        var route = app.routes['get'][1];
        expect(route.path).to.be.a(RegExp);
        expect(route.verb).to.eql('get');
        expect(route.callback).to.be.a(Array);
        expect(route.callback[0]).to.be.a(Function);
      });

      it('appends late and short route', function() {
        app.get('#/', function() {
          alert('home');
        });

        var route = app.routes['get'][1];
        expect(route.path).to.be.a(RegExp);
        expect(route.verb).to.eql('get');
        expect(route.callback).to.be.a(Array);
        expect(route.callback[0]).to.be.a(Function);
        expect(route.path.toString()).to.eql(new RegExp("#/$").toString());
      });

      it('assumes the verb is any if only path and callback are passed as parameters', function() {
        app.route('/blah', function() {
          $('#testarea').show();
        });

        var route = app.routes['get'][1];
        expect(route.callback[0]).to.be.a(Function);
        expect(route.path.toString()).to.eql(new RegExp("/blah$").toString());
        route = app.routes['post'][0];
        expect(route.callback[0]).to.be.a(Function);
        expect(route.path.toString()).to.eql(new RegExp("/blah$").toString());
      });

      it('looks up the callback as a string', function() {
        app.mycallback = function() { this.redirect('#/'); };
        app.post('#/post', 'mycallback');

        expect(app.routes['post'][0].callback[0]).to.eql(app.mycallback);
      });

      it('adds an "any" route to every route verb', function() {
        app.route('any', '/any', function() {});

        var route;

        $.each(app.ROUTE_VERBS, function(i, verb) {
          expect(app.routes[verb]).to.be.an('array');
          route = app.routes[verb].pop();
          expect(route.path.toString()).to.eql(new RegExp("/any$").toString());
        });
      });
    });

    describe('#mapRoutes()', function() {
      beforeEach(function() {
        context = this;
        context.empty_callback = function() {};
        context.routes = [
          ['get', '#/get', context.empty_callback],
          ['post', '#/post', context.empty_callback],
          ['any', '#/any', context.empty_callback],
          ['get', '#/string', 'empty']
        ];
        app = new Sammy.Application(function() {
          this.empty = context.empty_callback;
          context.returned = this.mapRoutes(context.routes);
        });
      });

      it('returns the app', function() {
        expect(context.returned).to.eql(app);
      });

      it('adds routes to the app', function() {
        expect(app.routes['get'][0].path.toString()).to.eql(new RegExp("#/get$").toString());
      });

      it('look up callbacks as strings', function() {
        var route = app.routes['get'].pop();
        expect(route.path.toString()).to.eql(new RegExp("#/string$").toString());
        expect(route.callback[0]).to.eql(context.empty_callback);
      });
    });

    describe('#bind()', function() {
      beforeEach(function() {
         context = this;
         context.triggered = false;

         app = new Sammy.Application(function() {
           context.returned = this.bind('boosh', function() {
             context.triggered = 'boosh';
             context.inner_context = this;
           });

           this.bind('blurgh', function() {
             context.triggered = 'blurgh';
             context.inner_context = this;
           });
         });
      });

      it('returns the sammy application instance', function() {
        expect(context.returned).to.eql(app);
      });

      it('adds the callback to the listeners collection', function() {
        expect(app.listeners['boosh']).to.have.length(1);
      });

      it('cannot trigger before run', function(done) {
        app.trigger('boosh');
        setTimeout(function() {
          expect(context.triggered).to.be(false);
          done();
        }, 100);
      });

      it('can trigger after run', function(done) {
        app.get('/', function() {});
        app.run();
        app.bind('blurgh', function() {
          expect(context.triggered).to.eql('blurgh');
          app.unload();
          done();
        });
        app.trigger('blurgh');
      });

      it('catches events on the bound element', function(done) {
        app.get('/', function() {});
        app.run();
        app.bind('boosh', function() {
          expect(context.triggered).to.eql('boosh');
          expect(context.inner_context.verb).to.eql('bind');
          app.unload();
          done();
        });
        app.$element().trigger('boosh');
      });

      it('sets the context of the bound events to an EventContext', function(done) {
        app.get('/', function() {});
        app.run();
        app.bind('serious-boosh', function() {
          expect(this.app).to.eql(app);
          expect(this.verb).to.eql('bind');
          expect(this.path).to.eql('serious-boosh');
          app.unload();
          done();
        });
        app.$element().trigger('serious-boosh');
      });
    });

    describe('#run()', function() {
      beforeEach(function() {
        context = this;

        window.location.hash = '';
        $('#main').html('');

        app = new Sammy.Application(function() {
          this.element_selector = '#main';
          this.debug = true;
          this.form_params = {};
        });
      });
      afterEach(function(){
        app.unload();
      });

      it('sets the location to the start url', function(done) {
        app.get('#/', function() {
          callback();
        });

        callback = function() {
          expect(window.location.hash).to.eql('#/');
          app.unload();
          done();
        };

        app.run('#/');
      });

      it('ignores links that target other windows', function() {
        var captured = false;
        app.get('#/', function() {});
        app.get('#/some/route', function() { captured = true; });

        $('#main').append('<a href="#/some/route" target="another-window">Open in new window</a>');
        app.run('#/');
        $('#main a').click();

        expect(captured).to.eql(false);
      });

      it('ignores links with contents that target other windows', function() {
        var captured = false;
        app.get('#/', function() {});
        app.get('#/some/route', function() { captured = true; });

        $('#main').append('<a href="#/some/route" target="another-window"><span>Open in new window</span></a>');
        app.run('#/');
        $('#main a span').click();

        expect(captured).to.eql(false);
      });

      it('binds events to all forms', function(done) {
        app.get('#/', function() {});

        app.post('#/test', function() {
          expect(this.params).to.be.an(Object);
          expect(this.target.getAttribute('id')).to.eql($('#main form').attr('id'));
          app.unload();
          done();
          return false;
        });

        $('#main').append('<form id="test_form" action="#/test" method="post">' +
          '<input type="hidden" name="test_input" value="TEST" />' +
          '<input type="checkbox" name="check[]" value="TEST 1" checked="checked" />' +
          '<input type="checkbox" name="check[]" value="TEST 2" checked="checked" />' +
          '</form>'
        );

        app.run('#/');
        $('#main form').submit();
      });

      it('ignores forms that target other windows', function() {
        var captured = false;
        app.get('#/', function() {});
        app.get('#/a/route', function() { captured = true; });

        $('#main').append('<form action="#/a/route" method="get" target="foo">' +
          '<input type="submit" /></form>');
        app.run('#/');
        $('#main form').submit();

        expect(captured).to.eql(false);
      });

      it('binds events to all future forms', function(done) {
        app.get('#/', function() {});

        app.post('#/live', function() {
          expect(this.target.getAttribute('id')).to.eql('live_form');
          app.unload();
          done();
          return false;
        });

        app.run('#/');
        $('#main').append('<form id="live_form" action="#/live" method="post">' +
           '<input name="live_test" type="text" />' +
           '<input type="submit" class="submit" />' +
           '</form>'
         );
        $('#live_form .submit').submit();
      });

      it('gets the form verb from the _method input', function(done) {
        app.get('#/', function() {});

        app.put('#/puttest', function() {
          expect(this.params).to.be.an(Object);
          expect(this.target.getAttribute('id')).to.eql('put_form');
          app.unload();
          done();
          return false;
        });

        $('#main').append('<form id="put_form" action="#/puttest" method="post">' +
          '<input name="_method" type="hidden" value="put" />' +
          '<input type="submit" class="submit" />' +
          '</form>'
        );
        app.run('#/');
        $('#put_form .submit').submit();
      });

      it('gets the form verb even if the browser has no support for the method', function(done) {
        app.get('#/', function() {});

        app.put('#/puttest', function() {
          expect(this.target.getAttribute('id')).to.eql('put_form2');
          app.unload();
          done();
          return false;
        });

        $('#main').append('<form id="put_form2" action="#/puttest" method="put">' +
          '<input type="submit" class="submit" />' +
          '</form>'
        );
        app.run('#/');
        $('#put_form2 .submit').submit();
      });

      it('changes the hash when submitting get forms', function(done) {
        app.get('#/', function() {});

        app.route('get', '#/live', function() {
          expect(window.location.hash).to.eql('#/live?live_test=live_value');
          app.unload();
          done();
        });

        app.run('#/');
        $('#main').append('<form id="live_form" action="#/live" method="get">' +
           '<input name="live_test" type="text" value="live_value"/>' +
           '<input type="submit" class="submit"/>' +
           '</form>'
         );
        $('#live_form .submit').submit();
      });

      it('url encodes the form values', function(done) {
        window.location.hash = '#/';

        app.get('#/', function() {});
        app.get('#/live', function() {
          var expected = '#/live?spaces=value with spaces&pluses=+++';
          expect(decodeURIComponent(window.location.hash)).to.eql(expected);
          app.unload();
          done();
        });

        app.run('#/');
        $('#main').append('<form id="live_form" action="#/live" method="get">' +
           '<input name="spaces" type="text" value="value with spaces"/>' +
           '<input name="pluses" type="text" value="+++"/>' +
           '<input type="submit" class="submit"/>' +
           '</form>'
         );

        $('#live_form .submit').submit();
      });

      it('triggers routes on URL change', function(done) {
        app.get('#/', function() {});

        app.get('#/test', function() {
          app.unload();
          done();
        });

        app.run('#/');
        window.location.hash = '#/test';
      });

      it('yields the event context to the route', function(done) {
        app.get('#/', function() {});

        app.get('#/yield', function(ctx) {
          expect(ctx.path).to.eql('/#/yield');
          app.unload();
          done();
        });

        app.run('#/yield');
      });

      it('triggers events using the trigger method of the app', function(done) {
        app.get('#/', function() {});

        app.bind('blurgh', function() {
          app.unload();
          done();
        });

        app.run('#/');
        app.trigger('blurgh');
      });

      it('dies silently if route is not found and 404s are off', function(done) {
        disableTrigger(app, function() {
          app.get('#/', function() {});
          app.run('#/');
          app.raise_errors = false;
          expect(function() {
            window.location.hash = '#/no-route-for-me';
          }).to.not.throwException();
        }, done);
      });

      it('redirects to the same path after form submit', function(done) {
        app.get('#/', function() {});

        app.get('#/postpost', function(ctx) {
          app.unload();
          done();
        });

        app.post('#/postpost', function(ctx) {
          this.redirect('#/postpost');
        });

        app.run('#/');
        $('#main').append('<form id="live_form" action="#/postpost" method="post">' +
          '<input type="submit" class="submit" />' +
          '</form>'
        );
        $('#live_form .submit').submit();
      });
    });

    describe('#lookupRoute()', function() {
      beforeEach(function() {
        app = new Sammy.Application(function() {});
      });

      it('finds a route by verb and route', function() {
        app.post('/blah', function() {
          $('#testarea').show();
        });
        var route = app.lookupRoute('post', '/blah');
        expect(route).to.be.an(Object);
        expect(route.verb).to.eql('post');
        expect(route.callback).to.be.a(Array);
        expect(route.callback[0]).to.be.a(Function);
      });

      it('finds a route by verb and partial route', function() {
        app.get(/\/blah\/(.+)/, function() {
          $('#main').trigger('click');
        });
        var route = app.lookupRoute('get','/blah/mess');
        expect(route).to.be.an(Object);
        expect(route.verb).to.eql('get');
        expect(route.callback).to.be.a(Array);
        expect(route.callback[0]).to.be.a(Function);
      });

      it('ignores any hash query string when looking up a route', function() {
        app.get('#/boo', function() {
          $('#main').trigger('click');
        });
        var route = app.lookupRoute('get', '#/boo?ohdontmindeme');
        expect(route).to.be.an(Object);
        expect(route.verb).to.eql('get');
        expect(route.callback).to.be.a(Array);
        expect(route.callback[0]).to.be.a(Function);
      });
    });

    describe('#runRoute()', function() {
      beforeEach(function() {
        context = this;
        app = new Sammy.Application(function() {});
      });

      it('sets named params from a string route', function(done) {
        app.get('#/boosh/:test/:test2', function() {
          expect(this.params.test).to.eql('blurgh');
          expect(this.params.test2).to.eql('kapow');
          done();
        });
        app.runRoute('get', '#/boosh/blurgh/kapow');
      });

      it('sets unnamed params from a regexp route in "splat"', function(done) {
        app.get(/\/blah\/(.+)/, function() {
          expect(this.params.splat[0]).to.eql('could/be/anything');
          done();
        });
        app.runRoute('get', '#/blah/could/be/anything');
      });

      it('forwards unnamed params to the callback as arguments', function(done) {
        app.get(/\/forward\/([^\/]+)\/([^\/]+)/, function(ctx, part1, part2) {
          expect(ctx).to.eql(this);
          expect(part1).to.eql('to');
          expect(part2).to.eql('route');
          done();
        });
        app.runRoute('get', '#/forward/to/route');
      });

      it('sets additional params from a query string after the hash', function(done) {
        app.get('#/boosh/:test/:test2', function() {
          expect(this.params.including).to.eql('some');
          expect(this.params.nifty).to.eql('params');
          done();
        });
        app.runRoute('get', '#/boosh/farg/wow?including=some&nifty=params');
      });

      it('sets value-less params to an empty string', function(done) {
        app.get('#/boosh/:test/:test2', function() {
          expect(this.params.empty).to.be.empty();
          expect(this.params.again).to.be.empty();
          expect(this.params['not-empty']).to.eql('blah');
          done();
        });
        app.runRoute('get', '#/boosh/farg/wow?empty&again=&not-empty=blah');
      });

      it('excludes the query string from named params values', function(done) {
        app.get('#/boosh/:test/:test2', function() {
          expect(this.params.test).to.eql('farg');
          expect(this.params.test2).to.eql('wow');
          done();
        });
        app.runRoute('get', '#/boosh/farg/wow?with=some&nifty=params');
      });

      it('excludes the query string from unnamed param values', function(done) {
        app.get(/\/blah\/(.+)/, function() {
          expect(this.params.splat[0]).to.eql('could/be/anything');
          done();
        });
        app.runRoute('get', '#/blah/could/be/anything?except=aquerystring');
      });

      it('decodes the query string values', function(done) {
        app.get('#/boosh/:test/:test2', function() {
          expect(this.params.encoded).to.eql('this should be decoded$%^');
          done();
        });
        app.runRoute('get', '#/boosh/farg/wow?encoded=this%20should%20be%20decoded%24%25%5E');
      });

      it('decodes the param values with special characters', function(done) {
        app.get('#/message/:message', function() {
          expect(this.params.message).to.eql('hello there');
          done();
        });
        app.runRoute('get', '#/message/hello%20there');
      });

      it('decodes the param values with spaces', function(done) {
        app.get('#/message/:message', function() {
          expect(this.params.message).to.eql('hello there');
          done();
        });
        app.runRoute('get', '#/message/hello there');
      });

      it('raises an error when route cannot be found', function(done) {
        disableTrigger(app, function() {
          app.raise_errors = true;
          expect(function() {
            app.runRoute('get','/blurgh');
          }).to.throwException(/404/);
        }, done);
      });
      it('passes to multiple chained callbacks',function(done) {
        var cb1 = function(ctx,next) {
          $.get('fixtures/partial', function() {
            flag = 10;
            next();
          });
        }, cb2 = function(ctx,next) {
          expect(flag).to.eql(10);
          next();
          done();
        }, flag = 12;
        app.get('#/chain',cb1,cb2);
        app.runRoute('get','#/chain');
      });
      it('runs onComplete',function(done) {
        var cb1 = function(ctx,next) {
          $.get('fixtures/partial',function(){
            flag1 = 10;
            next();
          });
        }, cb2 = function(ctx,next) {
          $.get('fixtures/partial.html',function(){
            flag2 = 20;
            next();
          });
        }, flag1 = 12, flag2 = 22;
        app.get('#/chain',cb1,cb2);
        app.onComplete(function() {
          expect(flag1).to.eql(10);
          expect(flag2).to.eql(20);
          done();
        });
        app.runRoute('get','#/chain');
      });
    });

    describe('#before()', function() {
      beforeEach(function() {
        window.location.hash = '';
        context = this;
        app = new Sammy.Application(function() {});
      });

      it('runs before a route', function(done) {
        app.before(function() {
          this.params['belch'] = 'burp';
        });

        app.get('#/', function() {
          expect(this.params.belch).to.eql('burp');
          app.unload();
          done();
        });

        app.run('#/');
      });

      it('sets the context to the event context', function(done) {
        var ctx = null;

        app.before(function() {
          ctx = this;
        });

        app.get('#/', function() {
          expect(ctx).to.eql(this);
          app.unload();
          done();
        });

        app.run('#/');
      });

      it('does not run the route if before returns false', function(done) {
        app.before(function() {
          setTimeout(function() {
            expect(context.landedHere).to.be(undefined);
            app.unload();
            done();
          }, 100);
          return false;
        });

        app.get('#/', function() {
          context.landedHere = true;
        });

        app.run('#/');
      });

      it('only runs if before matches options', function(done) {
        context.before_run = [];
        app.before({only: '#/boosh'}, function() {
          context.before_run.push('/boosh');
        });
        app.before({only: '#/'}, function() {
          context.before_run.push('/')
        });
        app.get('#/boosh', function() {
          expect(context.before_run).to.eql(['/', '/boosh']);
          app.unload();
          done();
        });
        app.get('#/', function() {
          expect(context.before_run).to.eql(['/']);
          window.location.hash = '#/boosh';
        });
        app.run('#/');
      });
    });

    describe('#after()', function() {
      beforeEach(function() {
        window.location.hash = '';
        context = this;
        app = new Sammy.Application(function() {});
      });

      it('runs after route', function(done) {
        app.after(function() {
          app.unload();
          done();
        });
        app.get('#/', function() {});
        app.run('#/');
      });

      it('sets the context to event context', function(done) {
        var ctx = null;

        app.after(function() {
          expect(ctx).to.eql(this);
          app.unload();
          done();
        });
        app.get('#/', function() {
          ctx = this;
        });
        app.run('#/');
      });
    });

    describe('#around()', function() {
      beforeEach(function() {
        window.location.hash = '';
        context = this;
        app = new Sammy.Application(function() {});
      });

      it('runs the route with the callback', function(done) {
        var str = '';

        app.get('#/', function() { str += " callback "; });

        app.around(function(callback) {
          str += "before";
          callback();
          str += "after";
          expect(str).to.eql("before callback after");
          app.unload();
          done();
        });

        app.run('#/');
      });

      it('does not run the route if callback is never called', function(done) {
        app.get('#/', function() {
          throw('never get here');
        });

        app.around(function(callback) {
          app.unload();
          done();
        });

        app.run('#/');
      });

      it('runs multiple around filters', function(done) {
        var str = '';

        app.get('#/', function() { str += 'callback '; });

        app.around(function(callback) {
          str += 'before1 ';

          callback();

          str += 'after1';

          expect(str).to.equal('before1 before2 callback after2 after1');
          app.unload();
          done();
        });

        app.around(function(callback) {
          str += 'before2 ';

          callback();

          str += 'after2 ';
        });

        app.run('#/');
      });

      it('runs before filters after around filters', function(done) {
        var str = '';

        app.get('#/', function() { str += 'callback'; });

        app.before(function() {
          str += 'before ';
        });

        app.around(function(callback) {
          str += 'around ';
          callback();
          expect(str).to.eql('around before callback');
          app.unload();
          done();
        });

        app.run('#/');
      });
    });

    describe('#helpers()', function() {
      beforeEach(function() {
        context = this;
        app = new Sammy.Application(function() {
          this.helpers({
            helpme: function() {
              return "halp!";
            }
          });
        });
      });

      it('extends the event context for routes', function(done) {
        app.get('#/', function() {
          expect(this.helpme).to.be.a(Function);
          expect(this.helpme()).to.eql('halp!');
          app.unload();
          done();
        });
        app.run('#/');
      });

      it('extends the event context for bind', function(done) {
        app.get('#/', function() {});

        app.bind('blurgh', function() {
          expect(this.helpme).to.be.a(Function);
          expect(this.helpme()).to.eql('halp!');
          app.unload();
          done();
        });

        app.run('#/');
        app.trigger('blurgh');
      });
    });

    describe('#helper()', function() {
      beforeEach(function() {
        context = this;
        app = new Sammy.Application(function() {
          this.helper(
            "helpme", function() {
              return "halp!";
            }
          );
        });
      });

      it('extends the event context for routes', function(done) {
        app.get('#/', function() {
          expect(this.helpme).to.be.a(Function);
          expect(this.helpme()).to.eql('halp!');
          app.unload();
          done();
        });
        app.run('#/');
      });

      it('extends the event context for bind', function(done) {
        app.get('#/', function() {});

        app.bind('blurgh', function() {
          expect(this.helpme).to.be.a(Function);
          expect(this.helpme()).to.eql('halp!');
          app.unload();
          done();
        });

        app.run('#/');
        app.trigger('blurgh');
      });
    });

    describe('#getLocation()', function() {
      it('returns the path and hash of the browser by default', function() {
        app = new Sammy.Application();
        window.location.hash = '#/boosh';
        expect(app.getLocation()).to.eql('/#/boosh');
      });
    });

    describe('#setLocation()', function() {
      it('sets the hash of the browser by default', function() {
        app = new Sammy.Application();
        app.setLocation('#/blurgh');
        expect(window.location.hash).to.eql('#/blurgh');
      });
    });

    describe('post routes', function() {
      it('redirects after a get', function(done) {
        window.location.hash = '';
        context = this;
        context.visited = [];

        $('#main').html('<form id="test_form" action="#/test" method="post">' +
          '<input type="hidden" name="test_input" value="TEST" />' +
        '</form>');

        app = new Sammy.Application(function() {
          this.get('#/', function() {});

          this.get('#/blah', function() {
            context.visited.push('blah');
            this.redirect('#/boosh');
          });

          this.get('#/boosh', function() {
            context.visited.push('boosh');
            $('#main form').submit();
          });

          this.post(/test/, function() {
            context.visited.push('post');
            expect(context.visited).to.eql(['blah', 'boosh', 'post']);
            app.unload();
            done();
          });
        });

        app.run('#/');
        window.location.hash = '/blah';
      });
    });

    describe('#contextMatchesOptions()', function() {
      var route = null;

      beforeEach(function() {
        app = $.sammy();
        route = {
          verb: 'get',
          path: '#/boosh',
          params: {
            blurgh: 'boosh'
          }
        };
      });

      it('matches against empty options', function() {
        expect(app.contextMatchesOptions(route, {})).to.be(true);
        expect(app.contextMatchesOptions(route)).to.be(true);
      });

      it('matches against only with path', function() {
        expect(app.contextMatchesOptions(route, {only: {path: '#/boosh'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {only: '#/boosh'})).to.be(true);
        expect(app.contextMatchesOptions(route, {only: {path: '#/'}})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: '#/'})).to.be(false);
      });

      it('matches against only with path and verb', function() {
        expect(app.contextMatchesOptions(route, {only: {path: '#/boosh', verb: 'get'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {only: {path: '#/boosh', verb: 'put'}})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: {path: '#/', verb: 'get'}})).to.be(false);
      });

      it('matches against only with verb', function() {
        expect(app.contextMatchesOptions(route, {only: {verb: 'get'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {only: {verb: 'put'}})).to.be(false);
      });

      it('matches against only with verb array', function() {
        expect(app.contextMatchesOptions(route, {only: {verb: ['get', 'post']}})).to.be(true);
        expect(app.contextMatchesOptions(route, {only: {verb: ['put', 'post']}})).to.be(false);
      });

      it('matches against except with path and verb', function() {
        expect(app.contextMatchesOptions(route, {except: {path: '#/', verb: 'get'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: '#/boosh', verb: 'get'}})).to.be(false);
        expect(app.contextMatchesOptions(route, {except: {path: '#/boosh', verb: 'put'}})).to.be(true);
      });

      it('matches against except with path', function() {
        expect(app.contextMatchesOptions(route, {except: {path: '#/'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: '#/'})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: '#/boosh'}})).to.be(false);
        expect(app.contextMatchesOptions(route, {except: '#/boosh'})).to.be(false);
      });

      it('matches against except with verb', function() {
        expect(app.contextMatchesOptions(route, {except: {verb: 'get'}})).to.be(false);
        expect(app.contextMatchesOptions(route, {except: {verb: 'put'}})).to.be(true);
      });

      it('matches against path array', function() {
        expect(app.contextMatchesOptions(route, {path: ['#/', '#/foo']})).to.be(false);
        expect(app.contextMatchesOptions(route, {path: ['#/', '#/boosh']})).to.be(true);
        expect(app.contextMatchesOptions(route, {only: {path: ['#/', '#/foo']}})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: {path: ['#/', '#/boosh']}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: ['#/', '#/foo']}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: ['#/', '#/boosh']}})).to.be(false);
      });

      it('matches against path array with verb', function() {
        expect(app.contextMatchesOptions(route, {path: ['#/', '#/boosh'], verb: 'get'})).to.be(true);
        expect(app.contextMatchesOptions(route, {path: ['#/', '#/boosh'], verb: 'put'})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: {path: ['#/', '#/boosh'], verb: 'put'}})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: {path: ['#/', '#/boosh'], verb: 'get'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: ['#/', '#/boosh'], verb: 'put'}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: ['#/', '#/boosh'], verb: 'get'}})).to.be(false);
      });

      it('matches against path array with verb array', function() {
        expect(app.contextMatchesOptions(route, {path: ['#/', '#/boosh'], verb: ['get', 'put']})).to.be(true);
        expect(app.contextMatchesOptions(route, {path: ['#/', '#/boosh'], verb: ['put', 'post']})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: {path: ['#/', '#/boosh'], verb: ['put', 'post']}})).to.be(false);
        expect(app.contextMatchesOptions(route, {only: {path: ['#/', '#/boosh'], verb: ['put', 'get']}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: ['#/', '#/boosh'], verb: ['put', 'post']}})).to.be(true);
        expect(app.contextMatchesOptions(route, {except: {path: ['#/', '#/boosh'], verb: ['put', 'get']}})).to.be(false);
      });

      it('matches against just path', function() {
        expect(app.contextMatchesOptions(route, '#/boosh'), 'should match exact string path').to.be(true);
        expect(app.contextMatchesOptions(route, '#/boo'), 'should not match partial string path').to.be(false);
        expect(app.contextMatchesOptions(route, /^\#\/boosh/), 'should match regex').to.be(true);
        expect(app.contextMatchesOptions(route, /^\#\/$/), 'should not match regex').to.be(false);
      });
    });

    describe('#use()', function() {
      beforeEach(function() {
        context = this;
        window.location.hash = '';
        app = new Sammy.Application(function() {
          this.element_selector = '#main';
          this.get('#/', function() {});
        });
      });

      it('raises an error if the plugin is not defined', function(done) {
        disableTrigger(app, function() {
          app.raise_errors = true;
          expect(function() {
            app.use(Sammy.Boosh);
          }).to.throwException(/plugin/);
        }, done);
      });

      it('raises an error if the plugin is not a function', function(done) {
        disableTrigger(app, function() {
          var blah = 'whu';
          app.raise_errors = true;
          expect(function() {
            app.use(blah);
          }).to.throwException(/whu/);
        }, done);
      });

      it('evaluates the function within the context of the app', function(done) {
        var TrivialLogin = function() {
          expect(this).to.eql(app);
          done();
        };
        app.use(TrivialLogin);
      });

      it('adds defined routes to the application routes', function() {
        var TrivialLogin = function() {
          this.get('#/login', function(e) {
            e.alert(e.partial("Please Login"));
          });
        };
        app.use(TrivialLogin);
        expect(app.routes['get']).to.have.length(2);
      });

      it('adds defined methods to the application', function() {
        var TrivialLogin = function() {
          this.isAuthenticated = function(username) {
            return true;
          }
        };
        app.use(TrivialLogin);
        expect(app.isAuthenticated).to.be.a(Function);
      });

      it('overrides event context methods with helpers', function(done) {
        var TrivialLogin = function() {
          this.helpers({
            partial: function(template, data) {
              app.unload();
              done();
            }
          });

          this.get('#/login', function(e) {
            e.partial("Please Login");
          });
        };

        app.use(TrivialLogin);
        app.run('#/login');
      });

      it('does not override the global EventContext prototype methods', function() {
        var TrivialLogin = function() {
          this.helpers({
            partial: function(template, data) {}
          });

          this.get('#/login', function(e) {
            e.partial("Please Login");
          });
        };

        app.use(TrivialLogin);
        expect(new Sammy.EventContext().partial.toString()).to.match(/RenderContext/);
      });

      it('yields additional arguments as arguments to the plugin', function() {
        var TrivialLogin = function(app, a, b, c) {
          this.a = a;
          app.b = b;
          this.c = c;
        };

        app.use(TrivialLogin, 1, 2, 3);

        expect(app.a).to.eql(1);
        expect(app.b).to.eql(2);
        expect(app.c).to.eql(3);
      });
    });

    describe('#$element()', function() {
      beforeEach(function() {
        app = $.sammy(function() {
          this.element_selector = '#main';
        });
      });

      it('accepts an element selector', function() {
        $('#main').html('<div class="abc">hello there</div>');
        expect(app.$element('.abc').html()).to.eql('hello there');
      });

      it('returns the app element if no selector is given', function() {
        expect(app.$element().attr('id')).to.eql('main');
      });
    });

    describe('#destroy()', function() {
      it('removes the app reference', function() {
        app = $.sammy('#main');
        app.get('#/', function() {});
        app.run('#/');

        expect(Sammy.apps['#main']).to.be.an(Object);
        app.destroy();
        expect(Sammy.apps['#main']).to.be(undefined);

        var  app2 = $.sammy('#main');
        expect(app2).not.to.be.eql(app);
      });
    });
  });
});
