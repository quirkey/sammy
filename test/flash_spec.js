describe('Flash', function() {
  var app, nowApp, context, output,
      createAppsWithFlash, unloadAppsWithFlash;

  createAppsWithFlash = function() {
    app = Sammy(function() {
      this.use(Sammy.Flash);
      this.element_selector = '#main';

      this.get('#/', function() {
        this.flash('welcome info', 'Welcome!');
      });
      this.post('#/test', function() {
        this.flash('info', "Successfully POSTed nested params");
        this.redirect('#/');
      });
    });

    nowApp = Sammy(function() {
      this.use(Sammy.Flash);
      this.element_selector = '#main2';

      this.get('#/', function() {
        this.flashNow('info', '您好');
      });
      this.post('#/test', function() {
        this.flashNow('warn', 'Uh-oh?');
        this.redirect('#/doNothing');
      });
      this.get('#/doNothing', function() {});
    });
  };

  unloadApps = function() {
    app.unload();
    nowApp.unload();
    window.location.href = '#/';
  };

  describe('app.flash', function() {
    beforeEach(createAppsWithFlash);
    afterEach(unloadApps);

    it('exists', function() {
      expect(app.flash).to.be.an(Object);
    });

    it('retains entries after a non-redirect', function() {
      app.run('#/');
      expect(app.flash['welcome info']).to.eql('Welcome!');
    });

    it('retains entries after a redirect', function() {
      $('#main').html('<form id="test_form" action="#/test" method="post">' +
        '<input type="hidden" name="test_input" value="TEST" />' +
      '</form>');

      app.run('#/');
      $('#test_form').submit();
      expect(app.flash['info']).to.eql("Successfully POSTed nested params");
    });

    it('loses all entries after being rendered', function() {
      app.run('#/');
      app.flash.toHTML();
      expect(app.flash['welcome info']).to.be(undefined);
    });

    it('retains entries after a redirect in another app', function() {
      $('#main2').html('<form id="test_form" action="#/test" method="post">' +
        '<input type="hidden" name="test_input" value="TEST" />' +
      '</form>');

      app.run('#/');
      nowApp.run('#/');
      $('#test_form').submit();
      expect(app.flash['welcome info']).to.eql('Welcome!');
    });
  });

  describe('app.flash.now', function() {
    beforeEach(createAppsWithFlash);
    afterEach(unloadApps);

    it('exists', function() {
      expect(nowApp.flash).to.be.an(Object);
    });

    it('retains entries after a non-redirect', function() {
      nowApp.run('#/');
      window.location.hash = '#/';
      expect(nowApp.flash.now.info).to.eql('您好');
    });

    it('loses all entries after a redirect', function() {
      $('#main').html('');
      $('#main2').html('<form id="test_form" action="#/test" method="post">' +
        '<input type="hidden" name="test_input" value="TEST" />' +
      '</form>');

      nowApp.run('#/');
      $('#test_form').submit();
      expect(nowApp.flash.now.warn).to.be(undefined);
    });

    it('loses all entries after being rendered', function() {
      nowApp.run('#/');
      nowApp.flash.toHTML();
      expect(nowApp.flash.now.info).to.be(undefined);
    });

    it('retains entries after a redirect in another app', function() {
      $('#main2').html('');
      $('#main').html('<form id="test_form" action="#/test" method="post">' +
        '<input type="hidden" name="test_input" value="TEST" />' +
      '</form>');

      app.run('#/');
      nowApp.run('#/');
      $('#test_form').submit();
      expect(nowApp.flash.now.info).to.eql('您好');
    });
  });

  describe('#flash()', function() {
    beforeEach(function() {
      createAppsWithFlash();
      context = new app.context_prototype(app, 'get', '#/', {});
    });

    it('returns the Flash object when passed no arguments', function() {
      expect(context.flash()).to.eql(app.flash);
    });

    it('returns the value of the given key when passed one argument', function() {
      app.flash.foo = 'bar';
      expect(context.flash('foo')).to.eql('bar');
    });

    it('sets a flash value when passed two arguments', function() {
      context.flash('foo2', 'bar2');
      expect(context.flash('foo2')).to.eql('bar2');
    });
  });

  describe('#flashNow()', function() {
    beforeEach(function() {
      createAppsWithFlash();
      context = new app.context_prototype(app, 'get', '#/', {});
    });

    it('returns the Flash-Now object when passed no arguments', function() {
      expect(context.flashNow()).to.eql(app.flash.now);
    });

    it('returns the value of the given key when passed one argument', function() {
      app.flash.now.foo = 'bar';
      expect(context.flashNow('foo')).to.eql('bar');
    });

    it('sets a flash value when passed two arguments', function() {
      context.flashNow('foo2', 'bar2');
      expect(context.flashNow('foo2')).to.eql('bar2');
    });
  });

  describe('#app.flash.toHTML()', function() {
    beforeEach(function() {
      createAppsWithFlash();
      app.flash.clear();
      nowApp.flash.clear();

      app.flash.error = 'Boom!';
      app.flash.warn  = 'Beep!';
      app.flash.now.info = 'Info!';
      nowApp.flash.debug = 'Debug!';

      output = $('<div id="flash_output" />')
        .append(app.flash.toHTML())
        .appendTo($('body'));
    });

    afterEach(function() {
      output.remove();
    });

    it('renders a ul.flash', function() {
      expect($('ul.flash', this.output)).to.have.length(1);
    });

    it('includes entries from both flash and flash.now, with keys as classes', function() {
      expect($('ul.flash li.error', this.output).text()).to.eql('Boom!');
      expect($('ul.flash li.warn', this.output).text()).to.eql('Beep!');
      expect($('ul.flash li.info', this.output).text()).to.eql('Info!');
    });

    it("does not include entries from another app's flash", function() {
      expect($('.debug', output)).to.have.length(0);
    });
  });
});
