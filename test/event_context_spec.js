describe('EventContext', function() {
  var app,
      context;

  beforeEach(function() {
    app = new Sammy.Application(function() {
      this.element_selector = '#main';
    });
    app.raise_errors = false;
    context = new Sammy.EventContext(app, 'get', '#/test/:test', {test: 'hooray'});
  });

  describe('#init()', function() {
    it('sets the app', function() {
      expect(context.app).to.eql(app);
    });
    it('sets the verb', function() {
      expect(context.verb).to.eql('get');
    });
    it('sets the path', function() {
      expect(context.path).to.eql('#/test/:test');
    });
    it('sets the params', function() {
      expect(context.params).to.eql(new Sammy.Object({test: 'hooray'}));
    });
  });

  describe('#redirect()', function() {
    after(function() {
      window.location.hash = '#';
    });

    it('sets the full location if url is provided', function() {
      context.redirect('#/boosh');
      expect(window.location.hash).to.eql('#/boosh');
    });

    it('only sets the hash if location is prefixed with #', function() {
      context.redirect('#/blah');
      expect(window.location.hash).to.eql('#/blah');
    });

    it('joins the arguments with / if more than one argument is provided', function() {
      var boosh = 'boosh';
      context.redirect('#', 'blah', boosh);
      expect(window.location.hash).to.eql('#/blah/boosh');
    });

    it('appends to the query string if an argument is an object', function() {
      context.redirect('#', 'blah', 'boosh', {x: 'y'}, {a: 'b'});
      expect(window.location.hash).to.eql('#/blah/boosh?x=y&a=b');
    });
  });

  describe('#notFound()', function() {
    it('throws a 404 error', function(done) {
      disableTrigger(context.app, function() {
        context.app.raise_errors = true;
        expect(bind(context.notFound, context)).to.throwException(/404/);
      }, done);
    });
  });

  describe('#partial()', function() {
    it('passes the contents to the callback', function(done) {
      this.timeout(4000);
      context.partial('fixtures/partial.html').then(function(data) {
        expect($.trim(data)).to.eql('<div class="test_partial">PARTIAL</div>');
        done();
      });
    });

    it('does not run through template() if Sammy.Template is not present', function(done) {
      context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
        expect(data).to.eql('<div class="<%= class_name %>"><%= name %></div>');
        done();
      });
    });

    it('runs through template() if Sammy.Template is present', function(done) {
      app.use(Sammy.Template);
      context = new app.context_prototype(app);
      context.partial('./fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
        expect(data).to.eql('<div class="test_template">TEMPLATE!</div>');
        done();
      });
    });

    it('runs through template() if Sammy.Template _is_ present _and_ path starts with a dot', function(done) {
      app.use(Sammy.Template);
      context = new app.context_prototype(app);
      context.partial('./fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
        expect(data).to.eql('<div class="test_template">TEMPLATE!</div>');
        done();
      });
    });

    it('runs through template() if Sammy.Template _is_ present _and_ GET parameters appended', function(done) {
      app.use(Sammy.Template);
      context = new app.context_prototype(app);
      context.partial('./fixtures/../fixtures/partial.template?var1=09&var2=abc', {name: 'TEMPLATE!', class_name: 'test_template'}).then(function(data) {
        expect(data).to.eql('<div class="test_template">TEMPLATE!</div>');
        done();
      });
    });

    it('replaces the default app element if no callback is passed', function(done) {
      listenToChanged(app, {
        setup: function() {
          app.use(Sammy.Template);
          var context = new app.context_prototype(app);
          context.partial('fixtures/partial.template', {name: 'TEMPLATE!', class_name: 'test_template'});
        },
        onChange: function() {
          expect(app.$element().text()).to.eql('TEMPLATE!');
          expect(app.$element().children('.test_template').length).to.eql(1);
          app.unload();
          done();
        }
      });
    });

    it('uses the default engine if provided and template does not match an engine', function(done) {
      listenToChanged(app, {
        setup: function() {
          app.template_engine = 'template';
          app.helper('template', function(template, data) {
            return "!!!" + template.toString() + "!!!";
          });
          context = new app.context_prototype(app);
          context.partial('fixtures/partial');
        },
        onChange: function() {
          expect(app.$element().text()).to.eql('!!!NOENGINE!!!');
          app.unload();
          done();
        }
      });
    });

    it('uses the default engine as a method if template does not match an engine', function(done) {
      listenToChanged(app, {
        setup: function() {
          app.template_engine = function(template, data) {
            return "!!!" + template.toString() + "!!!";
          };
          context = new app.context_prototype(app);
          context.partial('fixtures/partial.noengine');
        },
        onChange: function() {
          expect(app.$element().text()).to.eql('!!!NOENGINE!!!');
          app.unload();
          done();
        }
      });
    });

    describe('rendering with partials', function() {
      it('renders partials with callback and data', function(done) {
        var contents = '';

        listenToChanged(app, {
          setup: function() {
            app.use(Sammy.Mustache);
            context = new app.context_prototype(app);
            context.partial('fixtures/partial.mustache', {name: 'TEMPLATE!', class_name: 'test_template'}, function(data) {
              contents = data;
            }, {item: 'fixtures/item.mustache'});
          },
          onChange: function() {
            expect(contents).to.eql('<div class="test_template"><span>TEMPLATE!</span></div>');
            expect(app.$element()).to.have.sameHTMLAs('<div id="main"><div class="test_template"><span>TEMPLATE!</span></div></div>');
            app.unload();
            done();
          }
        });
      })

      it('renders partials without callback but with data', function(done) {
        listenToChanged(app, {
          setup: function() {
            app.use(Sammy.Mustache);
            context = new app.context_prototype(app);
            context.partial('fixtures/partial.mustache', {name: 'TEMPLATE!', class_name: 'test_template'}, {item: 'fixtures/item.mustache'});
          },
          onChange: function() {
            expect(app.$element()).to.have.sameHTMLAs('<div id="main"><div class="test_template"><span>TEMPLATE!</span></div></div>');
            app.unload();
            done();
          }
        });
      });

      it('renders partials with callback but without data', function(done) {
        var contents = '';

        listenToChanged(app, {
          setup: function() {
            app.use(Sammy.Mustache);
            context = new app.context_prototype(app);
            context.partial('fixtures/partial2.mustache', function(data) {
              contents = data;
            }, {item: 'fixtures/item2.mustache'});
          },
          onChange: function() {
            expect(contents).to.eql('<div class="blah"><span>my name</span></div>');
            expect(app.$element()).to.have.sameHTMLAs('<div id="main"><div class="blah"><span>my name</span></div></div>');
            app.unload();
            done();
          }
        });
      });
    });
  });

  describe('#trigger()', function() {
    beforeEach(function() {
      app.get('/', function() {});
      app.run();
    });

    afterEach(function() {
      app.unload();
    });

    it('triggers custom events on the application', function(done) {
      app.bind('custom', function() {
        done();
      });
      context.trigger('custom');
    });

    it('sets the context of the event to the Sammy.EventContext', function(done) {
      app.bind('other.custom', function() {
        expect(this.toString()).to.eql(context.toString());
        done();
      });
      context.trigger('other.custom');
    });

    it('passes data as an argument to the bound method', function(done) {
      app.bind('custom-with-data', function(e, data) {
        expect(data).to.eql({boosh: 'blurgh'});
        done();
      });
      context.trigger('custom-with-data', {boosh: 'blurgh'});
    });
  });
});
